# MailPilot AI 🚀

**MailPilot AI** is a full-stack, AI-powered email management platform that connects to Gmail over OAuth and empowers users to summarize email threads, generate context-aware tone-adjusted replies with human-in-the-loop editing, organize inboxes, track full audit history of AI actions, and compose/send emails.

---

## 🌟 Features

- 🔐 **Isolated Dual-Auth Architecture**: Register and log in independently of Gmail. Gmail is connected securely as a secondary OAuth step.
- 🛡️ **AES-256-GCM Token Encryption**: All access and refresh tokens are encrypted at rest with an application-level key.
- ⚡ **Two-Stage AI Orchestration**:
  1. **Context Builder**: Cleans noisy reply headers, email quotes, and disclaimers.
  2. **Generation Stage**: Powered by **Google Gemini 1.5 Flash** with high-quality deterministic fallback for 100% offline demoability without API keys.
- ✍️ **Human-in-the-Loop Reply Panel**:
  - Tones: **Professional**, **Friendly**, **Formal**, **Concise**.
  - Optional custom prompt/guidance.
  - Editable textarea ensuring **no draft is ever sent automatically**.
- 📬 **Full Inbox Management**: Real-time search, categorization (Inbox, Starred, Sent, Archive, Trash), unread counters, star toggling, and delete actions.
- 📋 **Phase 6 Bonus Intelligence**:
  - **Action Items & Deadline Extraction**: Automatically finds tasks, meeting times, and assignees.
  - **AI Priority & Category Classification**: Tags threads as High/Medium/Low priority and categories (Work, Finance, Action Required, etc.).
  - **Daily Intelligence Digest**: Executive summary of top conversations and action items.
- 📊 **Complete Audit Logging**: Every AI action (`summarize`, `generate_reply`, `send`) is persisted with duration, input token estimate, and provider telemetry.
- 💾 **Dual-Mode Database**: Connects to MongoDB, or seamlessly activates an **In-Memory Store Fallback** if MongoDB is not running locally.

---

## 🏗️ Project Architecture

```
mailpilot-ai/
├── client/                      # Frontend (React 18 + Vite + TypeScript + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppShell/        # Sidebar, Header, Status Badges, Daily Digest Modal
│   │   │   ├── ThreadList/      # Search, filter, unread indicators, star toggling
│   │   │   ├── ThreadView/      # Conversation timeline & AI summary highlight
│   │   │   ├── ReplyPanel/      # Tone selector, custom prompt, editable textarea, send
│   │   │   └── ProtectedRoute/  # Route guard for JWT authentication
│   │   ├── pages/
│   │   │   ├── Landing.tsx      # High-conversion hero & interactive showcase
│   │   │   ├── Login.tsx        # Sign in & 1-Click Demo Login
│   │   │   ├── Register.tsx     # Registration with bcrypt validation
│   │   │   ├── Dashboard.tsx    # Responsive inbox console & AI audit log
│   │   │   ├── Thread.tsx       # Dedicated thread detail view
│   │   │   ├── Compose.tsx      # Email composer with AI auto-draft assistant
│   │   │   ├── Integrations.tsx # Gmail OAuth status & connect controls
│   │   │   └── Settings.tsx     # AI engine health & security profiles
│   │   ├── store/               # Zustand stores (authStore, emailStore)
│   │   └── services/            # Axios API client
│   └── package.json
├── server/                      # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/              # env.js & db.js (with in-memory fallback)
│   │   ├── routes/              # authRoutes, emailRoutes, aiRoutes, integrationRoutes
│   │   ├── controllers/         # Thin controllers (no direct DB or Gmail API calls)
│   │   ├── services/            # authService, emailService, aiService, activityService, tokenEncryptionService
│   │   ├── integrations/        # gmailIntegration.js (isolated googleapis wrapper)
│   │   ├── models/              # User, EmailAction, Draft, Integration
│   │   ├── middleware/          # authMiddleware, validateMiddleware, errorHandler
│   │   └── index.js             # Express app entry point
│   ├── test_suite.js            # 13-step automated end-to-end verification suite
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 🚀 How to Run Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher (tested on Node v24)
- **npm**: v9.0.0 or higher

---

### Step 1: Start the Backend Server

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - *Default settings allow full local execution with In-Memory fallback and Deterministic AI without needing MongoDB or API keys!*

4. Start the backend:
   ```bash
   npm start
   ```
   *The server will run on `http://localhost:5000`.*
   *Health endpoint: `http://localhost:5000/api/health`*

---

### Step 2: Start the Frontend Client

1. Open a second terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The web client will launch at `http://localhost:5173`.*

---

### Step 3: Open and Explore MailPilot AI

1. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```
2. Click **"1-Click Demo Sign In"** on the login page (or register a new user).
3. Experience all features:
   - 📬 **Browse & Search Inbox Threads**
   - ✨ **Click "Summarize Thread"** to generate an executive brief
   - ✍️ **Select a Tone** (Professional / Friendly / Formal / Concise), type an instruction, and click **"Generate Reply"**
   - ✏️ **Edit the draft** in the textarea and click **"Send Reply"**
   - 📊 **Check the AI Audit Stream** on the Dashboard
   - 📖 **Open "Daily Digest"** from the sidebar for an executive intelligence briefing
   - 🔗 **View Gmail OAuth settings** under `/integrations`

---

## 🔑 Optional: Configuring Live Google OAuth & Gemini AI

To connect your live Gmail account and Google Gemini Generative AI:

1. Open `server/.env`.
2. Add your **Google Generative AI (Gemini) API Key**:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Set up **Google OAuth 2.0 Credentials** in [Google Cloud Console](https://console.cloud.google.com/):
   - Create OAuth 2.0 Client ID (Web Application).
   - Authorized redirect URI: `http://localhost:5000/api/integrations/gmail/oauth/callback`
   - Add to `server/.env`:
     ```env
     GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your_client_secret
     ```
4. Restart the backend server (`npm start`).

---

## 🧪 Running the Automated Test Suite

MailPilot AI includes an automated 13-step verification test suite covering auth, token encryption, Gmail operations, AI summarization, reply generation, send dispatch, and audit logging:

```bash
cd server
node test_suite.js
```

**Expected Output:**
```
🧪 Starting MailPilot AI Full-Stack Verification Suite...
1️⃣ Testing Health Check... ✅
2️⃣ Testing User Registration... ✅
3️⃣ Testing User Login... ✅
4️⃣ Testing /auth/me with Bearer token... ✅
5️⃣ Testing Gmail Demo Connection... ✅
6️⃣ Testing Thread List... ✅
7️⃣ Testing Get Thread Detail... ✅
8️⃣ Testing Thread Actions (Star & Read)... ✅
9️⃣ Testing AI Summarize Pipeline... ✅
🔟 Testing AI Tone-Matched Reply Generation... ✅
1️⃣1️⃣ Testing Email Dispatch via Send API... ✅
1️⃣2️⃣ Testing Bonus AI Features (Action Items, Classification, Daily Digest)... ✅
1️⃣3️⃣ Testing AI Audit History Log... ✅

🎉 ALL 13 END-TO-END SUITE TESTS PASSED SUCCESSFULLY! 🚀
```

---

## 🔒 Security Specifications

- **Passwords**: Hashed with `bcryptjs` at cost factor 12.
- **Gmail Tokens**: Encrypted at rest using AES-256-GCM authenticated cipher with 16-byte random IV and auth tag.
- **API Security**: `helmet` security headers, strict CORS, `express-rate-limit` on auth endpoints, and input sanitization via `express-validator`.
- **Human-in-the-Loop**: Drafts generated by AI are always rendered in an editable textarea; auto-sending is prevented by design.

---

## 📜 License

MIT License. Built with ❤️ for productive email intelligence.
