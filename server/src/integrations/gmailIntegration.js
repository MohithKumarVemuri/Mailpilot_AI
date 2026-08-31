import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/env.js';

// Simulated realistic demo inbox for fallback / demo evaluation
const demoThreads = [
  {
    id: 'thread-demo-101',
    historyId: '100101',
    messages: [
      {
        id: 'msg-101-1',
        threadId: 'thread-demo-101',
        from: 'Sarah Jenkins <sarah.jenkins@acmecorp.io>',
        to: 'me@mailpilot.ai',
        subject: 'Q3 Product Roadmap Review & Feature Prioritization',
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
        snippet: 'Hi team, attaching the draft for Q3 deliverables. We need to lock the AI features by Friday...',
        body: `Hi Alex,\n\nI hope your week is going well.\n\nAttached is the updated draft for our Q3 deliverables. We need to lock the AI features and finalize team allocations by this Friday at 4:00 PM EST.\n\nKey areas to review:\n1. The new Smart Triage Engine architecture\n2. Gmail OAuth quota limits\n3. Frontend delivery milestone on August 30\n\nCould you please review section 3 and let me know if the timelines look reasonable for your team?\n\nBest regards,\nSarah Jenkins\nVP of Product, Acme Corp`,
        labels: ['INBOX', 'IMPORTANT', 'STARRED']
      },
      {
        id: 'msg-101-2',
        threadId: 'thread-demo-101',
        from: 'David Chen <david.chen@acmecorp.io>',
        to: 'Sarah Jenkins <sarah.jenkins@acmecorp.io>, me@mailpilot.ai',
        subject: 'Re: Q3 Product Roadmap Review & Feature Prioritization',
        date: new Date(Date.now() - 3600000 * 1).toISOString(),
        snippet: 'I reviewed section 3. The backend microservices look solid, but we should make sure token encryption is completed before staging...',
        body: `Hi Sarah and Alex,\n\nI took a pass at section 3. The backend microservices look solid, but we should ensure token encryption and rate-limiting are fully implemented before pushing to staging.\n\nAlso, are we doing a team sync tomorrow at 10 AM to discuss open blockers?\n\nThanks,\nDavid Chen\nStaff Software Engineer`,
        labels: ['INBOX', 'IMPORTANT', 'STARRED']
      }
    ],
    snippet: 'I reviewed section 3. The backend microservices look solid, but we should ensure token encryption is completed...',
    subject: 'Q3 Product Roadmap Review & Feature Prioritization',
    sender: 'David Chen <david.chen@acmecorp.io>',
    date: new Date(Date.now() - 3600000 * 1).toISOString(),
    isUnread: true,
    isStarred: true,
    isImportant: true,
    labels: ['INBOX', 'IMPORTANT', 'STARRED']
  },
  {
    id: 'thread-demo-102',
    historyId: '100102',
    messages: [
      {
        id: 'msg-102-1',
        threadId: 'thread-demo-102',
        from: 'Stripe Billing <notifications@stripe.com>',
        to: 'me@mailpilot.ai',
        subject: 'Your monthly invoice for Cloud Services (#INV-2026-8812)',
        date: new Date(Date.now() - 3600000 * 8).toISOString(),
        snippet: 'Your invoice for $249.00 USD is now available. Payment was successfully processed...',
        body: `Hello,\n\nYour invoice for $249.00 USD is now available.\n\nInvoice ID: INV-2026-8812\nBilling Period: August 1 - August 27, 2026\nPayment Method: Visa ending in 4242\nStatus: Paid\n\nYou can download the PDF receipt from your customer billing portal at any time.\n\nThank you for choosing Stripe.`,
        labels: ['INBOX']
      }
    ],
    snippet: 'Your invoice for $249.00 USD is now available. Payment was successfully processed...',
    subject: 'Your monthly invoice for Cloud Services (#INV-2026-8812)',
    sender: 'Stripe Billing <notifications@stripe.com>',
    date: new Date(Date.now() - 3600000 * 8).toISOString(),
    isUnread: false,
    isStarred: false,
    isImportant: false,
    labels: ['INBOX']
  },
  {
    id: 'thread-demo-103',
    historyId: '100103',
    messages: [
      {
        id: 'msg-103-1',
        threadId: 'thread-demo-103',
        from: 'Elena Rostova <elena.rostova@designworks.co>',
        to: 'me@mailpilot.ai',
        subject: 'Design Assets & Figma Links for MailPilot AI Dark Console UI',
        date: new Date(Date.now() - 3600000 * 24).toISOString(),
        snippet: 'Hey! I just finished the minimalist dark theme tokens and responsive layout specs...',
        body: `Hi Alex,\n\nI just finished the minimalist dark theme tokens and responsive layout specs in Figma.\n\nKey highlights:\n- Sleek obsidian background (#09090b) with neutral zinc accents\n- High contrast typography for readability\n- Responsive sidebar with active status indicators\n- Quick tone pills for AI generation\n\nLet me know your thoughts when you have a moment!\n\nElena`,
        labels: ['INBOX', 'STARRED']
      }
    ],
    snippet: 'Hey! I just finished the minimalist dark theme tokens and responsive layout specs...',
    subject: 'Design Assets & Figma Links for MailPilot AI Dark Console UI',
    sender: 'Elena Rostova <elena.rostova@designworks.co>',
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
    isUnread: true,
    isStarred: true,
    isImportant: false,
    labels: ['INBOX', 'STARRED']
  },
  {
    id: 'thread-demo-104',
    historyId: '100104',
    messages: [
      {
        id: 'msg-104-1',
        threadId: 'thread-demo-104',
        from: 'me@mailpilot.ai',
        to: 'Alexandre Dumas <alex@literature.org>',
        subject: 'Proposal for Q4 AI Partnership Agreement',
        date: new Date(Date.now() - 3600000 * 30).toISOString(),
        snippet: 'Attached is the revised contract for our Q4 partnership...',
        body: `Hi Alexandre,\n\nAttached is the revised contract for our Q4 partnership.\n\nPlease let me know if you have any questions.\n\nBest regards,\nAlex Vance`,
        labels: ['SENT']
      }
    ],
    snippet: 'Attached is the revised contract for our Q4 partnership...',
    subject: 'Proposal for Q4 AI Partnership Agreement',
    sender: 'me@mailpilot.ai',
    date: new Date(Date.now() - 3600000 * 30).toISOString(),
    isUnread: false,
    isStarred: false,
    isImportant: false,
    labels: ['SENT']
  },
  {
    id: 'thread-demo-105',
    historyId: '100105',
    messages: [
      {
        id: 'msg-105-1',
        threadId: 'thread-demo-105',
        from: 'AWS Cloud Notifications <no-reply@amazon.com>',
        to: 'me@mailpilot.ai',
        subject: 'Archived: Monthly AWS Usage Summary & Resource Tagging',
        date: new Date(Date.now() - 3600000 * 60).toISOString(),
        snippet: 'Your July AWS resource utilization report is ready for download in the console...',
        body: `Hello Customer,\n\nYour July AWS resource utilization report is ready for download in the console.\n\nAWS CloudWatch Team`,
        labels: []
      }
    ],
    snippet: 'Your July AWS resource utilization report is ready for download in the console...',
    subject: 'Archived: Monthly AWS Usage Summary & Resource Tagging',
    sender: 'AWS Cloud Notifications <no-reply@amazon.com>',
    date: new Date(Date.now() - 3600000 * 60).toISOString(),
    isUnread: false,
    isStarred: false,
    isImportant: false,
    labels: []
  },
  {
    id: 'thread-demo-106',
    historyId: '100106',
    messages: [
      {
        id: 'msg-106-1',
        threadId: 'thread-demo-106',
        from: 'Old Newsletter <news@spammarketing.org>',
        to: 'me@mailpilot.ai',
        subject: 'Deleted Promo: 50% discount on office supplies',
        date: new Date(Date.now() - 3600000 * 90).toISOString(),
        snippet: 'Check out our massive office supplies sale ending tonight...',
        body: `Special promotion for office stationery.\n\nClick here to unsubscribe.`,
        labels: ['TRASH']
      }
    ],
    snippet: 'Check out our massive office supplies sale ending tonight...',
    subject: 'Deleted Promo: 50% discount on office supplies',
    sender: 'Old Newsletter <news@spammarketing.org>',
    date: new Date(Date.now() - 3600000 * 90).toISOString(),
    isUnread: false,
    isStarred: false,
    isImportant: false,
    labels: ['TRASH']
  }
];

let mutableDemoThreads = JSON.parse(JSON.stringify(demoThreads));

/**
 * Creates an OAuth2 client with system credentials
 */
export function createOAuth2Client() {
  const { clientId, clientSecret, redirectUri } = config.google;
  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

/**
 * Generates OAuth authentication URL for Gmail permissions
 */
export function getAuthUrl(state = '') {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: config.google.scopes,
    state
  });
}

/**
 * Exchanges authorization code for access and refresh tokens
 */
export async function exchangeCodeForTokens(code) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Fetch user profile email
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();

  return {
    tokens,
    email: userInfo.data.email,
    displayName: userInfo.data.name || userInfo.data.email
  };
}

/**
 * Helper to get authenticated Gmail API client from decrypted tokens
 */
export function getGmailClient(accessToken, refreshToken, onTokensRefreshed) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  if (onTokensRefreshed) {
    oauth2Client.on('tokens', (tokens) => {
      onTokensRefreshed(tokens);
    });
  }

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Helper to decode base64url string from Gmail API
 */
function decodeBase64Url(str) {
  if (!str) return '';
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Extract plain text body from a Gmail message payload
 */
function extractBodyFromPayload(payload) {
  if (!payload) return '';
  if (payload.body && payload.body.data) {
    return decodeBase64Url(payload.body.data);
  }
  if (payload.parts && payload.parts.length > 0) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        return decodeBase64Url(part.body.data);
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body && part.body.data) {
        const html = decodeBase64Url(part.body.data);
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      if (part.parts) {
        const nested = extractBodyFromPayload(part);
        if (nested) return nested;
      }
    }
  }
  return '';
}

/**
 * Extract header value by name
 */
function getHeader(headers, name) {
  if (!headers) return '';
  const h = headers.find((item) => item.name.toLowerCase() === name.toLowerCase());
  return h ? h.value : '';
}

/**
 * Clean up HTML entities in strings (e.g. &#39; -> ', &amp; -> &)
 */
function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));
}

/**
 * Builds Gmail API search query string based on filter and user search query
 */
function buildGmailQuery(filter, searchQuery) {
  let filterPart = 'in:inbox';

  if (filter === 'starred') {
    filterPart = 'is:starred';
  } else if (filter === 'important') {
    filterPart = 'is:important';
  } else if (filter === 'unread') {
    filterPart = 'is:unread';
  } else if (filter === 'sent') {
    filterPart = 'in:sent';
  } else if (filter === 'trash') {
    filterPart = 'in:trash';
  } else if (filter === 'archive') {
    filterPart = '-in:inbox -in:sent -in:draft -in:trash -in:spam';
  } else if (filter === 'all') {
    filterPart = '-in:trash -in:spam';
  } else {
    filterPart = 'in:inbox';
  }

  if (searchQuery && searchQuery.trim()) {
    return `${filterPart} (${searchQuery.trim()})`;
  }
  return filterPart;
}

/**
 * Lists email threads
 */
export async function listThreads(tokens, options = {}) {
  // If tokens are simulated or no live Google credentials, return demo threads
  if (!tokens || !tokens.accessToken || tokens.accessToken === 'demo_token' || !config.google.clientId) {
    let result = [...mutableDemoThreads];
    if (options.q) {
      const qLower = options.q.toLowerCase();
      result = result.filter(
        (t) =>
          t.subject.toLowerCase().includes(qLower) ||
          t.sender.toLowerCase().includes(qLower) ||
          t.snippet.toLowerCase().includes(qLower)
      );
    }
    if (options.filter === 'starred') {
      result = result.filter((t) => t.isStarred || t.labels.includes('STARRED'));
    } else if (options.filter === 'important') {
      result = result.filter((t) => t.isImportant || t.labels.includes('IMPORTANT'));
    } else if (options.filter === 'unread') {
      result = result.filter((t) => t.isUnread || t.labels.includes('UNREAD'));
    } else if (options.filter === 'trash') {
      result = result.filter((t) => t.labels.includes('TRASH'));
    } else if (options.filter === 'sent') {
      result = result.filter((t) => t.labels.includes('SENT'));
    } else if (options.filter === 'archive') {
      result = result.filter((t) => !t.labels.includes('INBOX') && !t.labels.includes('TRASH') && !t.labels.includes('SENT'));
    } else {
      result = result.filter((t) => t.labels.includes('INBOX') && !t.labels.includes('TRASH'));
    }
    return {
      threads: result,
      totalCount: result.length,
      nextPageToken: null
    };
  }

  const gmail = getGmailClient(tokens.accessToken, tokens.refreshToken, tokens.onRefresh);
  const q = buildGmailQuery(options.filter, options.q);

  const res = await gmail.users.threads.list({
    userId: 'me',
    q,
    includeSpamTrash: options.filter === 'trash' || options.filter === 'spam' || options.filter === 'all',
    maxResults: options.maxResults || 25,
    pageToken: options.pageToken
  });

  const rawThreads = res.data.threads || [];
  let detailedThreads = await Promise.all(
    rawThreads.map(async (t) => {
      try {
        const full = await gmail.users.threads.get({ userId: 'me', id: t.id, format: 'metadata' });
        const messages = full.data.messages || [];
        const lastMsg = messages[messages.length - 1] || {};
        const firstMsg = messages[0] || {};
        const lastHeaders = lastMsg.payload?.headers || [];
        const firstHeaders = firstMsg.payload?.headers || [];

        // Aggregate all unique labels across all messages in this thread
        const allLabels = Array.from(new Set(messages.flatMap((m) => m.labelIds || [])));

        const isUnread = allLabels.includes('UNREAD');
        const isStarred = allLabels.includes('STARRED');
        const isImportant = allLabels.includes('IMPORTANT');

        const subject = getHeader(firstHeaders, 'Subject') || getHeader(lastHeaders, 'Subject') || '(No Subject)';
        const sender = getHeader(lastHeaders, 'From') || getHeader(firstHeaders, 'From') || 'Unknown';
        
        let date = getHeader(lastHeaders, 'Date') || getHeader(firstHeaders, 'Date');
        if (!date && lastMsg.internalDate) {
          date = new Date(parseInt(lastMsg.internalDate, 10)).toISOString();
        }
        if (!date) {
          date = new Date().toISOString();
        }

        return {
          id: t.id,
          snippet: decodeEntities(t.snippet || lastMsg.snippet || ''),
          historyId: t.historyId,
          subject: decodeEntities(subject),
          sender: decodeEntities(sender),
          date,
          isUnread,
          isStarred,
          isImportant,
          labels: allLabels
        };
      } catch (err) {
        return {
          id: t.id,
          snippet: t.snippet || '',
          subject: '(Subject unavailable)',
          sender: 'Unknown',
          date: new Date().toISOString(),
          isUnread: false,
          isStarred: false,
          isImportant: false,
          labels: []
        };
      }
    })
  );

  // Strict post-fetch label filtering
  if (options.filter === 'starred') {
    detailedThreads = detailedThreads.filter((t) => t.isStarred || t.labels.includes('STARRED'));
  } else if (options.filter === 'important') {
    detailedThreads = detailedThreads.filter((t) => t.isImportant || t.labels.includes('IMPORTANT'));
  } else if (options.filter === 'unread') {
    detailedThreads = detailedThreads.filter((t) => t.isUnread || t.labels.includes('UNREAD'));
  } else if (options.filter === 'trash') {
    detailedThreads = detailedThreads.filter((t) => t.labels.includes('TRASH'));
  } else if (options.filter === 'sent') {
    detailedThreads = detailedThreads.filter((t) => t.labels.includes('SENT'));
  } else if (options.filter === 'archive') {
    detailedThreads = detailedThreads.filter((t) => !t.labels.includes('INBOX') && !t.labels.includes('TRASH') && !t.labels.includes('SPAM'));
  } else if (options.filter === 'inbox' || !options.filter) {
    detailedThreads = detailedThreads.filter((t) => t.labels.includes('INBOX') && !t.labels.includes('TRASH'));
  }

  return {
    threads: detailedThreads,
    nextPageToken: res.data.nextPageToken || null,
    resultSizeEstimate: res.data.resultSizeEstimate || detailedThreads.length
  };
}


/**
 * Fetches a single thread with all messages parsed
 */
export async function getThread(tokens, threadId) {
  if (!tokens || !tokens.accessToken || tokens.accessToken === 'demo_token' || !config.google.clientId) {
    const found = mutableDemoThreads.find((t) => t.id === threadId);
    if (!found) {
      throw new Error('Thread not found');
    }
    return found;
  }

  const gmail = getGmailClient(tokens.accessToken, tokens.refreshToken, tokens.onRefresh);
  const res = await gmail.users.threads.get({
    userId: 'me',
    id: threadId,
    format: 'full'
  });

  const thread = res.data;
  const messages = (thread.messages || []).map((m) => {
    const headers = m.payload?.headers || [];
    return {
      id: m.id,
      threadId: m.threadId,
      from: getHeader(headers, 'From'),
      to: getHeader(headers, 'To'),
      subject: getHeader(headers, 'Subject'),
      date: getHeader(headers, 'Date'),
      snippet: m.snippet,
      body: extractBodyFromPayload(m.payload),
      labels: m.labelIds || []
    };
  });

  const firstMsg = messages[0] || {};
  const lastMsg = messages[messages.length - 1] || {};
  const firstHeaders = firstMsg.headers || [];
  const lastHeaders = lastMsg.headers || [];

  const allLabels = Array.from(new Set(messages.flatMap((m) => m.labels || [])));

  return {
    id: thread.id,
    historyId: thread.historyId,
    subject: firstMsg.subject || lastMsg.subject || '(No Subject)',
    sender: lastMsg.from || firstMsg.from || 'Unknown',
    date: lastMsg.date || firstMsg.date || new Date().toISOString(),
    isUnread: allLabels.includes('UNREAD'),
    isStarred: allLabels.includes('STARRED'),
    isImportant: allLabels.includes('IMPORTANT'),
    labels: allLabels,
    snippet: thread.snippet,
    messages
  };
}

/**
 * Updates thread state (star, read/unread, archive, trash, restore)
 */
export async function updateThread(tokens, threadId, action) {
  if (!tokens || !tokens.accessToken || tokens.accessToken === 'demo_token' || !config.google.clientId) {
    const thread = mutableDemoThreads.find((t) => t.id === threadId);
    if (!thread) throw new Error('Thread not found');

    if (action === 'mark_read') {
      thread.isUnread = false;
      thread.labels = thread.labels.filter((l) => l !== 'UNREAD');
    } else if (action === 'mark_unread') {
      thread.isUnread = true;
      if (!thread.labels.includes('UNREAD')) thread.labels.push('UNREAD');
    } else if (action === 'star') {
      thread.isStarred = true;
      if (!thread.labels.includes('STARRED')) thread.labels.push('STARRED');
    } else if (action === 'unstar') {
      thread.isStarred = false;
      thread.labels = thread.labels.filter((l) => l !== 'STARRED');
    } else if (action === 'archive') {
      thread.labels = thread.labels.filter((l) => l !== 'INBOX');
    } else if (action === 'unarchive' || action === 'move_to_inbox' || action === 'restore') {
      if (!thread.labels.includes('INBOX')) thread.labels.push('INBOX');
      thread.labels = thread.labels.filter((l) => l !== 'TRASH');
    } else if (action === 'delete') {
      if (!thread.labels.includes('TRASH')) thread.labels.push('TRASH');
      thread.labels = thread.labels.filter((l) => l !== 'INBOX');
    }
    return thread;
  }

  const gmail = getGmailClient(tokens.accessToken, tokens.refreshToken, tokens.onRefresh);
  const addLabelIds = [];
  const removeLabelIds = [];

  if (action === 'mark_read') removeLabelIds.push('UNREAD');
  if (action === 'mark_unread') addLabelIds.push('UNREAD');
  if (action === 'star') addLabelIds.push('STARRED');
  if (action === 'unstar') removeLabelIds.push('STARRED');
  if (action === 'archive') removeLabelIds.push('INBOX');
  if (action === 'unarchive' || action === 'move_to_inbox') addLabelIds.push('INBOX');
  if (action === 'restore') {
    return await gmail.users.threads.untrash({ userId: 'me', id: threadId });
  }
  if (action === 'delete') {
    return await gmail.users.threads.trash({ userId: 'me', id: threadId });
  }

  const res = await gmail.users.threads.modify({
    userId: 'me',
    id: threadId,
    requestBody: {
      addLabelIds,
      removeLabelIds
    }
  });

  return res.data;
}


/**
 * Deletes a thread permanently or sends to trash
 */
export async function deleteThread(tokens, threadId) {
  if (!tokens || !tokens.accessToken || tokens.accessToken === 'demo_token' || !config.google.clientId) {
    mutableDemoThreads = mutableDemoThreads.filter((t) => t.id !== threadId);
    return { success: true };
  }

  const gmail = getGmailClient(tokens.accessToken, tokens.refreshToken, tokens.onRefresh);
  await gmail.users.threads.trash({ userId: 'me', id: threadId });
  return { success: true };
}

/**
 * Encodes an RFC 2822 email message in base64url format
 */
function createRawEmail({ to, from, subject, body, threadId, inReplyTo, references }) {
  const lines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit'
  ];

  if (from) lines.splice(1, 0, `From: ${from}`);
  if (inReplyTo) lines.push(`In-Reply-To: ${inReplyTo}`);
  if (references) lines.push(`References: ${references}`);

  lines.push('', body);
  const raw = lines.join('\r\n');

  return Buffer.from(raw)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends an email or reply via Gmail API
 */
export async function sendEmail(tokens, { to, subject, body, threadId, inReplyTo, references, userEmail }) {
  if (!tokens || !tokens.accessToken || tokens.accessToken === 'demo_token' || !config.google.clientId) {
    // If threadId is provided in demo mode, append message to demo thread
    if (threadId) {
      const thread = mutableDemoThreads.find((t) => t.id === threadId);
      if (thread) {
        const newMsg = {
          id: `msg-sent-${Date.now()}`,
          threadId,
          from: userEmail || 'me@mailpilot.ai',
          to,
          subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
          date: new Date().toISOString(),
          snippet: body.slice(0, 80) + '...',
          body,
          labels: ['SENT']
        };
        thread.messages.push(newMsg);
        thread.date = newMsg.date;
        thread.snippet = newMsg.snippet;
      }
    } else {
      // New thread
      const newThreadId = `thread-sent-${Date.now()}`;
      mutableDemoThreads.unshift({
        id: newThreadId,
        historyId: '100999',
        subject,
        sender: userEmail || 'me@mailpilot.ai',
        date: new Date().toISOString(),
        snippet: body.slice(0, 80) + '...',
        isUnread: false,
        isStarred: false,
        labels: ['SENT'],
        messages: [
          {
            id: `msg-${Date.now()}`,
            threadId: newThreadId,
            from: userEmail || 'me@mailpilot.ai',
            to,
            subject,
            date: new Date().toISOString(),
            snippet: body.slice(0, 80) + '...',
            body,
            labels: ['SENT']
          }
        ]
      });
    }

    return {
      id: `sent-${Date.now()}`,
      threadId: threadId || `thread-sent-${Date.now()}`,
      status: 'SENT'
    };
  }

  const gmail = getGmailClient(tokens.accessToken, tokens.refreshToken, tokens.onRefresh);
  const raw = createRawEmail({ to, from: userEmail, subject, body, threadId, inReplyTo, references });

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw,
      threadId: threadId || undefined
    }
  });

  return res.data;
}
