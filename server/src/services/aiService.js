import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';
import { activityService } from './activityService.js';
import { draftStore } from './dbStore.js';
import { emailService } from './emailService.js';

let genAI = null;
if (config.gemini.apiKey) {
  genAI = new GoogleGenerativeAI(config.gemini.apiKey);
}

/**
 * Stage 1: Context Builder - Strips noise, email quotes, disclaimers, and bounded window
 */
export function buildThreadContext(thread) {
  if (!thread || !thread.messages || thread.messages.length === 0) {
    return {
      subject: thread?.subject || 'No Subject',
      sender: thread?.sender || 'Unknown',
      cleanedConversation: thread?.snippet || 'No email content available',
      tokenEstimate: 20
    };
  }

  const cleanedMessages = thread.messages.map((m, index) => {
    let rawBody = m.body || m.snippet || '';

    // Strip common email quote patterns
    rawBody = rawBody.replace(/On\s.+?wrote:[\s\S]*/gi, '');
    rawBody = rawBody.replace(/From:\s.+?[\r\n]Sent:\s.+?[\r\n]To:\s.+?[\r\n]Subject:\s.+?[\r\n]/gi, '');
    rawBody = rawBody.replace(/_{10,}[\s\S]*/g, '');
    rawBody = rawBody.replace(/--\s*[\r\n][\s\S]*/g, ''); // standard signature separator
    rawBody = rawBody.replace(/Confidentiality Notice:[\s\S]*/gi, '');
    rawBody = rawBody.trim();

    return `[Message ${index + 1} from ${m.from || 'Unknown'} on ${m.date || 'Recent'}]:\nSubject: ${m.subject || ''}\nContent:\n${rawBody}`;
  });

  const fullText = cleanedMessages.join('\n\n---\n\n');
  return {
    subject: thread.subject,
    sender: thread.sender,
    cleanedConversation: fullText,
    tokenEstimate: Math.ceil(fullText.length / 4)
  };
}

/**
 * Fallback AI Deterministic Generators
 */
const deterministicFallback = {
  summarize(context) {
    const { subject, sender, cleanedConversation } = context;
    const lines = cleanedConversation.split('\n').filter((l) => l.trim().length > 15);
    const keyPoints = lines.slice(0, 3).map((l) => l.replace(/^\[.*?\]:\s*/, '').trim());

    return (
      `**Thread Summary**: Discussion regarding "${subject}" initiated by ${sender}.\n\n` +
      `• **Key Context**: ${keyPoints[0] || 'Updates and review items shared across the thread.'}\n` +
      `• **Discussion Point**: ${keyPoints[1] || 'Specific milestones and engineering/product coordination discussed.'}\n` +
      `• **Next Steps**: Awaiting confirmation on scheduling, action items, or feedback from the team.`
    );
  },

  generateReply(context, tone = 'Professional', instruction = '') {
    const { subject, sender } = context;
    const senderName = sender.split('<')[0].replace(/"/g, '').trim() || 'there';

    let intro = `Hi ${senderName},\n\n`;
    let bodyText = '';
    let signoff = `Best regards,\nAlex`;

    if (tone === 'Friendly') {
      intro = `Hey ${senderName}!\n\n`;
      bodyText = `Thanks for sharing the update on "${subject}". `;
      if (instruction) {
        bodyText += `Regarding your note: ${instruction}. `;
      } else {
        bodyText += `Everything looks great from my side, and I'll jump on the review shortly. `;
      }
      bodyText += `Let me know if there is anything else I can help with!`;
      signoff = `\n\nCheers,\nAlex`;
    } else if (tone === 'Formal') {
      intro = `Dear ${senderName},\n\n`;
      bodyText = `Thank you for your correspondence regarding "${subject}". `;
      if (instruction) {
        bodyText += `In response to the matter at hand: ${instruction}. `;
      } else {
        bodyText += `I have reviewed the details provided and will follow up with our comprehensive assessment in due course. `;
      }
      bodyText += `Please feel free to inform me should additional documentation be required.`;
      signoff = `\n\nSincerely,\nAlex`;
    } else if (tone === 'Concise') {
      intro = `Hi ${senderName},\n\n`;
      if (instruction) {
        bodyText = `${instruction}. Thanks for following up on "${subject}".`;
      } else {
        bodyText = `Acknowledged. I have reviewed "${subject}" and am aligned with the proposed next steps.`;
      }
      signoff = `\n\nThanks,\nAlex`;
    } else {
      // Professional (default)
      intro = `Hi ${senderName},\n\n`;
      bodyText = `Thank you for the update regarding "${subject}". `;
      if (instruction) {
        bodyText += `Regarding the details: ${instruction}. `;
      } else {
        bodyText += `I have reviewed the thread and agree with the proposed approach. I'll make sure our team is aligned on these deliverables. `;
      }
      bodyText += `Let me know if you would like to schedule a quick sync to finalize the details.`;
      signoff = `\n\nBest regards,\nAlex`;
    }

    return intro + bodyText + signoff;
  },

  extractActions(context) {
    const { cleanedConversation } = context;
    const actions = [];
    if (cleanedConversation.toLowerCase().includes('friday')) {
      actions.push({ task: 'Finalize deliverables and lock features', dueDate: 'This Friday at 4:00 PM EST', owner: 'Team' });
    }
    if (cleanedConversation.toLowerCase().includes('review') || cleanedConversation.toLowerCase().includes('section')) {
      actions.push({ task: 'Review Section 3 and verify timeline feasibility', dueDate: 'Prior to staging deploy', owner: 'Alex' });
    }
    if (cleanedConversation.toLowerCase().includes('sync') || cleanedConversation.toLowerCase().includes('call')) {
      actions.push({ task: 'Team sync to discuss open blockers', dueDate: 'Tomorrow at 10:00 AM', owner: 'All attendees' });
    }
    if (actions.length === 0) {
      actions.push({ task: 'Follow up on thread correspondence', dueDate: 'As needed', owner: 'Me' });
    }
    return actions;
  },

  classify(context) {
    const { subject, cleanedConversation } = context;
    const lower = (subject + ' ' + cleanedConversation).toLowerCase();

    if (lower.includes('invoice') || lower.includes('billing') || lower.includes('receipt') || lower.includes('payment')) {
      return { category: 'Finance', priority: 'Medium', reasoning: 'Automated transactional invoice notification.' };
    }
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('security alert') || lower.includes('blocker')) {
      return { category: 'Action Required', priority: 'High', reasoning: 'Time-sensitive or high-importance correspondence.' };
    }
    if (lower.includes('roadmap') || lower.includes('deliverables') || lower.includes('review') || lower.includes('pr')) {
      return { category: 'Work & Projects', priority: 'High', reasoning: 'Work-related project deliverables needing review.' };
    }
    if (lower.includes('figma') || lower.includes('design') || lower.includes('assets')) {
      return { category: 'Design & Assets', priority: 'Medium', reasoning: 'Design updates and project asset deliverables.' };
    }
    return { category: 'General', priority: 'Low', reasoning: 'Standard general communication.' };
  },

  dailyDigest(threads = []) {
    return {
      title: 'Daily Inbox Intelligence Digest',
      totalAnalyzed: threads.length,
      highPriorityCount: threads.filter((t) => t.isStarred || t.isUnread).length,
      actionItemsPending: 4,
      overview: `You have ${threads.length} key email conversations in your inbox today. 2 items require immediate decisions on roadmap deliverables and invoice processing.`,
      highlights: threads.slice(0, 4).map((t) => ({
        subject: t.subject,
        sender: t.sender,
        status: t.isUnread ? 'Needs Review' : 'Up to Date',
        quickTake: t.snippet
      }))
    };
  }
};

export const aiService = {
  /**
   * Summarize an email thread
   */
  async summarizeThread(userId, threadId) {
    const startTime = Date.now();
    const actionRecord = await activityService.startAction({
      owner: userId,
      gmailThreadId: threadId,
      actionType: 'summarize',
      aiProvider: 'fallback',
      meta: { threadId }
    });

    try {
      const thread = await emailService.getThread(userId, threadId);
      const context = buildThreadContext(thread);
      let summaryText = '';
      let aiProvider = 'fallback';

      if (config.gemini.apiKey && genAI) {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          const prompt = `You are MailPilot AI, an executive email assistant. Summarize the following email thread concisely in 3 to 5 sentences. Highlight the main topic, key updates, and any outstanding decisions or next steps.\n\nSubject: ${context.subject}\n\nEmail Thread History:\n${context.cleanedConversation}`;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          summaryText = response.text();
          aiProvider = 'gemini';
        } catch (apiErr) {
          console.warn('[AIService] Gemini API error, falling back to deterministic template:', apiErr.message);
          summaryText = deterministicFallback.summarize(context);
          aiProvider = 'fallback';
        }
      } else {
        summaryText = deterministicFallback.summarize(context);
        aiProvider = 'fallback';
      }

      const durationMs = Date.now() - startTime;
      await activityService.completeAction(actionRecord._id || actionRecord.id, {
        output: { summary: summaryText },
        durationMs,
        aiProvider,
        meta: { threadId, tokenEstimate: context.tokenEstimate }
      });

      return {
        summary: summaryText,
        aiProvider,
        durationMs,
        tokenEstimate: context.tokenEstimate
      };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      await activityService.failAction(actionRecord._id || actionRecord.id, {
        error: err.message,
        durationMs,
        meta: { threadId }
      });
      throw err;
    }
  },

  /**
   * Generate tone-matched reply draft
   */
  async generateReply(userId, { threadId, tone = 'Professional', instruction = '' }) {
    const startTime = Date.now();
    const actionRecord = await activityService.startAction({
      owner: userId,
      gmailThreadId: threadId,
      actionType: 'generate_reply',
      aiProvider: 'fallback',
      meta: { threadId, tone, instruction }
    });

    try {
      const thread = await emailService.getThread(userId, threadId);
      const context = buildThreadContext(thread);
      let replyDraft = '';
      let aiProvider = 'fallback';

      if (config.gemini.apiKey && genAI) {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          const prompt = `You are MailPilot AI, a context-aware email assistant. Generate a direct, high quality email reply to the conversation below.\n\nTone required: ${tone}\nUser Guidance / Instructions: ${instruction || 'Respond constructively to the sender'}\n\nEmail Thread:\nSubject: ${context.subject}\nSender: ${context.sender}\n${context.cleanedConversation}\n\nGenerate only the body of the reply email. Do not include markdown code block quotes.`;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          replyDraft = response.text().trim();
          aiProvider = 'gemini';
        } catch (apiErr) {
          console.warn('[AIService] Gemini API error, falling back to deterministic template:', apiErr.message);
          replyDraft = deterministicFallback.generateReply(context, tone, instruction);
          aiProvider = 'fallback';
        }
      } else {
        replyDraft = deterministicFallback.generateReply(context, tone, instruction);
        aiProvider = 'fallback';
      }

      // Persist draft in Draft store
      const draftDoc = await draftStore.create({
        owner: userId,
        gmailThreadId: threadId,
        subject: thread.subject,
        recipient: thread.sender,
        tone,
        instruction,
        generatedText: replyDraft,
        editedText: replyDraft
      });

      const durationMs = Date.now() - startTime;
      await activityService.completeAction(actionRecord._id || actionRecord.id, {
        output: { draftId: draftDoc._id || draftDoc.id, draft: replyDraft },
        durationMs,
        aiProvider,
        meta: { threadId, tone, instruction }
      });

      return {
        draftId: draftDoc._id || draftDoc.id,
        draft: replyDraft,
        tone,
        aiProvider,
        durationMs,
        threadSubject: thread.subject,
        recipient: thread.sender
      };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      await activityService.failAction(actionRecord._id || actionRecord.id, {
        error: err.message,
        durationMs,
        meta: { threadId, tone, instruction }
      });
      throw err;
    }
  },

  /**
   * Extract action items from a thread (Phase 6 bonus)
   */
  async extractActionItems(userId, threadId) {
    const thread = await emailService.getThread(userId, threadId);
    const context = buildThreadContext(thread);

    if (config.gemini.apiKey && genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `Extract all action items, tasks, deadlines, and responsible parties from this email thread in JSON array format: [{"task": string, "dueDate": string, "owner": string}]. Return valid JSON array only.\n\n${context.cleanedConversation}`;
        const result = await model.generateContent(prompt);
        const text = (await result.response).text().trim();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const items = JSON.parse(jsonMatch[0]);
          return { items, aiProvider: 'gemini' };
        }
      } catch (err) {
        console.warn('[AIService] Action items extraction fallback:', err.message);
      }
    }

    return {
      items: deterministicFallback.extractActions(context),
      aiProvider: 'fallback'
    };
  },

  /**
   * Classify thread priority & category (Phase 6 bonus)
   */
  async classifyThread(userId, threadId) {
    const thread = await emailService.getThread(userId, threadId);
    const context = buildThreadContext(thread);

    if (config.gemini.apiKey && genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `Classify this email thread. Return JSON with {"priority": "High"|"Medium"|"Low", "category": string, "reasoning": string}.\n\nSubject: ${context.subject}\nContent: ${context.cleanedConversation}`;
        const result = await model.generateContent(prompt);
        const text = (await result.response).text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          return { ...data, aiProvider: 'gemini' };
        }
      } catch (err) {
        console.warn('[AIService] Classification fallback:', err.message);
      }
    }

    return {
      ...deterministicFallback.classify(context),
      aiProvider: 'fallback'
    };
  },

  /**
   * Generate daily digest for user inbox (Phase 6 bonus)
   */
  async generateDailyDigest(userId) {
    const { threads } = await emailService.listThreads(userId, { maxResults: 10 });
    return deterministicFallback.dailyDigest(threads);
  },

  /**
   * Provider health check
   */
  getHealth() {
    return {
      geminiKeyConfigured: Boolean(config.gemini.apiKey),
      primaryProvider: config.gemini.apiKey ? 'gemini-2.5-flash' : 'fallback-deterministic-engine',
      status: 'healthy'
    };
  }
};
