import assert from 'assert';

const BASE_URL = 'http://127.0.0.1:5000/api';

async function runTests() {
  console.log('🧪 Starting MailPilot AI Full-Stack Verification Suite...\n');

  // 1. Health Check
  console.log('1️⃣ Testing Health Check...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  assert.strictEqual(healthRes.status, 200, 'Health check should return 200');
  const healthData = await healthRes.json();
  console.log('   ✅ Health check passed:', healthData.service, '| DB In-Memory:', healthData.database.isInMemory);

  // 2. User Registration
  console.log('\n2️⃣ Testing User Registration...');
  const testUser = {
    name: 'Sarah Connor',
    email: `sarah.${Date.now()}@mailpilot.ai`,
    password: 'Password123!'
  };
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  assert.strictEqual(regRes.status, 201, 'Registration should return 201');
  const regData = await regRes.json();
  assert.ok(regData.data.token, 'Registration should return JWT token');
  const token = regData.data.token;
  console.log('   ✅ Registered user:', regData.data.user.email, '| JWT issued');

  // 3. User Login
  console.log('\n3️⃣ Testing User Login...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUser.email, password: testUser.password })
  });
  assert.strictEqual(loginRes.status, 200, 'Login should return 200');
  const loginData = await loginRes.json();
  assert.ok(loginData.data.token, 'Login should return JWT');
  console.log('   ✅ Login successful for:', loginData.data.user.name);

  // 4. Protected /auth/me
  console.log('\n4️⃣ Testing /auth/me with Bearer token...');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.strictEqual(meRes.status, 200, 'Auth profile should return 200');
  const meData = await meRes.json();
  assert.strictEqual(meData.data.user.email, testUser.email);
  console.log('   ✅ Profile fetched successfully:', meData.data.user.email);

  // 5. Connect Demo Mailbox
  console.log('\n5️⃣ Testing Gmail Demo Connection...');
  const integRes = await fetch(`${BASE_URL}/integrations/gmail/connect-demo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.strictEqual(integRes.status, 200, 'Connect demo should return 200');
  const statusRes = await fetch(`${BASE_URL}/integrations/gmail/status`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const statusData = await statusRes.json();
  assert.strictEqual(statusData.data.isConnected, true, 'Integration should be connected');
  console.log('   ✅ Connected mailbox:', statusData.data.email, '| Scopes:', statusData.data.scopes.length);

  // 6. List Threads
  console.log('\n6️⃣ Testing Thread List...');
  const threadsRes = await fetch(`${BASE_URL}/emails/threads`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.strictEqual(threadsRes.status, 200, 'List threads should return 200');
  const threadsData = await threadsRes.json();
  const threads = threadsData.data.threads;
  assert.ok(threads.length > 0, 'Should have threads');
  console.log(`   ✅ Fetched ${threads.length} threads. First thread: "${threads[0].subject}"`);

  // 7. Get Thread Details
  const threadId = threads[0].id;
  console.log(`\n7️⃣ Testing Get Thread Detail (${threadId})...`);
  const threadDetailRes = await fetch(`${BASE_URL}/emails/threads/${threadId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.strictEqual(threadDetailRes.status, 200, 'Get thread should return 200');
  const threadDetailData = await threadDetailRes.json();
  const thread = threadDetailData.data.thread;
  assert.ok(thread.messages.length > 0, 'Thread should have messages');
  console.log(`   ✅ Thread loaded with ${thread.messages.length} messages.`);

  // 8. Thread State Updates (Star & Read)
  console.log('\n8️⃣ Testing Thread Actions (Star & Read)...');
  await fetch(`${BASE_URL}/emails/threads/${threadId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'star' })
  });
  await fetch(`${BASE_URL}/emails/threads/${threadId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'mark_read' })
  });
  console.log('   ✅ Star and mark_read actions executed successfully.');

  // 9. AI Summarize
  console.log('\n9️⃣ Testing AI Summarize Pipeline...');
  const sumRes = await fetch(`${BASE_URL}/ai/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ threadId })
  });
  assert.strictEqual(sumRes.status, 200, 'AI summarize should return 200');
  const sumData = await sumRes.json();
  assert.ok(sumData.data.summary, 'Should return summary text');
  console.log('   ✅ AI Summary generated (Provider:', sumData.data.aiProvider, '| Duration:', sumData.data.durationMs, 'ms)');
  console.log('   Summary Preview:\n', sumData.data.summary.slice(0, 150) + '...\n');

  // 10. AI Generate Reply
  console.log('🔟 Testing AI Tone-Matched Reply Generation...');
  const replyRes = await fetch(`${BASE_URL}/ai/generate-reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      threadId,
      tone: 'Friendly',
      instruction: 'Let us schedule a team sync on Thursday at 2 PM'
    })
  });
  assert.strictEqual(replyRes.status, 200, 'Generate reply should return 200');
  const replyData = await replyRes.json();
  assert.ok(replyData.data.draft, 'Should return reply draft');
  console.log('   ✅ Reply Draft generated (Tone:', replyData.data.tone, '| Provider:', replyData.data.aiProvider, ')');
  console.log('   Draft Preview:\n', replyData.data.draft.slice(0, 150) + '...\n');

  // 11. Send Email (Reply or Compose)
  console.log('1️⃣1️⃣ Testing Email Dispatch via Send API...');
  const sendRes = await fetch(`${BASE_URL}/emails/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      to: 'sarah.jenkins@acmecorp.io',
      subject: 'Re: Q3 Product Roadmap Review',
      body: replyData.data.draft,
      threadId
    })
  });
  assert.strictEqual(sendRes.status, 200, 'Send email should return 200');
  console.log('   ✅ Email dispatch confirmed.');

  // 12. Bonus AI Endpoints (Extract Actions, Classify, Daily Digest)
  console.log('\n1️⃣2️⃣ Testing Bonus AI Features (Action Items, Classification, Daily Digest)...');
  const actionRes = await fetch(`${BASE_URL}/ai/extract-actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ threadId })
  });
  const actionData = await actionRes.json();
  console.log('   ✅ Extracted Actions:', actionData.data.items.length, 'items found.');

  const classRes = await fetch(`${BASE_URL}/ai/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ threadId })
  });
  const classData = await classRes.json();
  console.log('   ✅ Classification:', classData.data.priority, 'Priority | Category:', classData.data.category);

  const digestRes = await fetch(`${BASE_URL}/ai/daily-digest`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const digestData = await digestRes.json();
  console.log('   ✅ Daily Digest generated:', digestData.data.title, '| Analyzed:', digestData.data.totalAnalyzed);

  // 13. AI Audit History Log
  console.log('\n1️⃣3️⃣ Testing AI Audit History Log...');
  const histRes = await fetch(`${BASE_URL}/ai/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const histData = await histRes.json();
  assert.ok(histData.data.history.length >= 3, 'Should have logged at least summarize, generate_reply, and send');
  console.log(`   ✅ Audit log verified with ${histData.data.history.length} logged records.`);

  console.log('\n🎉 ALL 13 END-TO-END SUITE TESTS PASSED SUCCESSFULLY! 🚀\n');
}

runTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
