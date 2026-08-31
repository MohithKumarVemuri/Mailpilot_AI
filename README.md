# MailPilot AI 🚀

[![Live Website](https://img.shields.io/badge/Live%20Website-mailpilot--ai--frontend.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://mailpilot-ai-frontend.vercel.app/)
[![Live API](https://img.shields.io/badge/Live%20API-mailpilot--ai--backend.vercel.app-10b981?style=for-the-badge&logo=fastapi&logoColor=white)](https://mailpilot-ai-backend.vercel.app/api/health)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 18](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

> **MailPilot AI** is a privacy-first intelligent email client that solves inbox overload and slow response times by turning lengthy message chains into instant 3-sentence executive summaries, auto-extracting actionable tasks, and generating tone-calibrated draft replies with Google Gemini. Connected directly to Gmail via secure OAuth 2.0 with AES-256 encrypted tokens and designed with a modern light tonal and deep dark theme.

---

## 🌐 Live Deployments

- 🖥️ **Production Web Application**: **[https://mailpilot-ai-frontend.vercel.app/](https://mailpilot-ai-frontend.vercel.app/)**
- ⚡ **Production Serverless API**: **[https://mailpilot-ai-backend.vercel.app/](https://mailpilot-ai-backend.vercel.app/)**
- 🩺 **API Health Check**: **[https://mailpilot-ai-backend.vercel.app/api/health](https://mailpilot-ai-backend.vercel.app/api/health)**

---

## 🌟 Key Features

- 🌓 **Dual Theme Engine (Light Tonal & Deep Obsidian)**:
  - **Light Tonal Palette**: Warm slate backgrounds, elevated crisp white cards, refined borders, and signature Indigo accents.
  - **Deep Obsidian Palette**: Luxurious dark slate with glowing contrast.
  - **Interactive Theme Switcher**: 1-click toggles across headers, landing page, and visual selector in Settings. Anti-FOUC script prevents theme flickering on page load.
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
- 📋 **Executive Intelligence**:
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
│   │   │   ├── ThemeToggle/     # Animated Sun/Moon Light-Dark Switcher
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
│   │   │   └── Settings.tsx     # Appearance Theme Chooser & AI engine health
│   │   ├── store/               # Zustand stores (authStore, emailStore, themeStore)
│   │   └── services/            # Axios API client (auto production fallback)
│   ├── vercel.json              # SPA routing rewrite configuration
│   └── package.json
├── server/                      # Backend (Node.js + Express + Vercel Serverless)
│   ├── api/
│   │   └── index.js             # Vercel Serverless Function entrypoint
│   ├── src/
│   │   ├── config/              # env.js & db.js (with serverless connection pool)
│   │   ├── routes/              # authRoutes, emailRoutes, aiRoutes, integrationRoutes
│   │   ├── controllers/         # Thin controllers (no direct DB or Gmail API calls)
│   │   ├── services/            # authService, emailService, aiService, activityService, tokenEncryptionService
│   │   ├── integrations/        # gmailIntegration.js (isolated googleapis wrapper)
│   │   ├── models/              # User, EmailAction, Draft, Integration
│   │   ├── middleware/          # authMiddleware, validateMiddleware, errorHandler
│   │   └── index.js             # Express app entry point
│   ├── test_suite.js            # 13-step automated end-to-end verification suite
│   ├── vercel.json              # Serverless routing configuration
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 🚀 How to Run Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

---

### Step 1: Start the Backend Server

1. Open a terminal and navigate to `server`:
   ```bash
   cd server
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - *Default settings allow full local execution with in-memory database and deterministic AI fallback!*

3. Start the backend:
   ```bash
   npm start
   ```
   *The server will run on `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).*

---

### Step 2: Start the Frontend Client

1. Open a second terminal and navigate to `client`:
   ```bash
   cd client
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The web client will launch at `http://localhost:5173`.*

---

### Step 3: Open and Explore MailPilot AI

1. Open your browser at `http://localhost:5173` (or live at **[https://mailpilot-ai-frontend.vercel.app/](https://mailpilot-ai-frontend.vercel.app/)**).
2. Click **"1-Click Demo Sign In"** on the login page.
3. Experience all features:
   - 🌓 **Toggle between Light Tonal and Dark modes** from the top header or Settings.
   - 📬 **Browse & Search Inbox Threads**.
   - ✨ **Click "AI Summary"** to generate an instant 3-sentence brief.
   - ✍️ **Select a Tone** (Professional / Friendly / Formal / Concise), type an instruction, and click **"Generate Draft"**.
   - ✏️ **Edit the draft** in the textarea and click **"Send Reply"**.
   - 📊 **Check the AI Audit Stream** on the Dashboard.
   - 📖 **Open "Daily Digest"** from the sidebar for an executive intelligence briefing.
   - 🔗 **View Gmail OAuth settings** under `/integrations`.

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
