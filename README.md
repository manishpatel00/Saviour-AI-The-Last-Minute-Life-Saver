# 🎯 Saviour AI — The Last-Minute Life Saver

Saviour AI is an advanced, full-stack proactive productivity assistant and damage control dashboard designed to prevent missed deadlines, handle crisis triage, and automate administrative overhead. Powered by server-side Gemini AI models and real-time Google Workspace integrations, Saviour AI acts as a dedicated operational companion for high-performance builders, developers, and product teams.

---

## 🛠️ Core Engineering Architecture

Saviour AI is architected as a high-fidelity, dual-persistence, full-stack application. It leverages modern, responsive frontend patterns alongside secure backend integrations to ensure data is protected and always in sync.

```
┌─────────────────────────────────────────────────────────────┐
│                       Saviour AI App                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌────────────────────────┐            ┌───────────────────────┐
│     Google Workspace   │            │   Firebase Platform   │
│   (Calendar & Gmail)   │            │  (Firestore & Auth)   │
└────────────────────────┘            └───────────────────────┘
```

### 1. The Technology Stack
*   **Client & Viewport**: Built on **React 18** and **Vite** for zero HMR latency during local development, styled with custom, premium-crafted **Tailwind CSS** guidelines.
*   **Motion Mechanics**: Orchestrated with **Motion** (from `motion/react`) to enable elegant bento transitions, micro-interactions, modal overlays, and progress trackers.
*   **Durable Data Engine**: Integrated with **Firebase Firestore** for persistent data synchronization under secure, authenticated user profiles.
*   **Workspace Connectors**: Implements direct REST interfaces to the **Google Calendar API** (for timeline synchronization) and **Gmail API** (for automatic inbox mitigation drafts).

---

## 🔐 Google Workspace Integration Center

Saviour AI offers a hybrid, developer-friendly authentication system supporting two modes of secure integration:

### Mode A: Standard Google OAuth
Standard OAuth uses secure Firebase client credential flows to register and authorize your personal Google account.
*   **Capabilities**: Automatically prompts and guides you through standard Google consent screens.
*   **Authorized Scopes**:
    *   `openid`, `profile`, `email` — Safe identity verification.
    *   `https://www.googleapis.com/auth/calendar.events` — For scheduling calendar mitigation sessions.
    *   `https://www.googleapis.com/auth/gmail.compose` — For drafting automated crisis update emails.
*   **Ideal For**: Production deployments, local developer sessions with registered redirect URIs, and standard end-user workflows.

### Mode B: Developer Bypass (Access Token Override)
When running within sandboxed or cloud environments (like remote development containers or restricted virtual frames), standard OAuth popup redirects may be blocked or fail due to origin restrictions. 
Saviour AI provides an advanced **Developer Bypass** mode. By providing an active, temporary Google Access Token, developers can bypass OAuth registration and execute Calendar and Gmail APIs instantly.

#### Step-by-Step Activation:
1.  Navigate to the **Google OAuth Playground** ([developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)).
2.  In **Step 1**, select or type the following scopes:
    *   `https://www.googleapis.com/auth/calendar.events`
    *   `https://www.googleapis.com/auth/gmail.compose`
3.  Click **Authorize APIs** and authenticate with your workspace/Google account.
4.  In **Step 2**, click **Exchange authorization code for tokens**.
5.  Copy the generated **Access Token** string (typically starts with `ya29.`).
6.  Open **Saviour AI**, expand the **Developer Bypass** form, fill in:
    *   **Display Name**: e.g., `Workspace Tester`
    *   **Google Email**: e.g., `workspace@gmail.com`
    *   **Access Token Value**: Paste your `ya29.` token value.
7.  Click **Apply Developer Override Token**. The system instantly constructs a synthetic Firebase User profile and activates all Workspace capabilities.

---

## 🚀 Local Development and Compilation

Follow these simple procedures to execute, compile, and audit the application locally:

### 1. Environment Configurations
Ensure your `.env` or development variables are declared in the root directory. Copy the sample file to start:
```bash
cp .env.example .env
```

### 2. Dependency Installation
Populate the local node module cache:
```bash
npm install
```

### 3. Launch Development Server
Boot up the local full-stack server on the pre-allocated port:
```bash
npm run dev
```

### 4. Build and Compile for Production
Compile static single-page assets and bundle server entry points for Cloud or Container deployments:
```bash
npm run build
```

---

## 📐 Usability Patterns & Customization

*   **Pristine Light & Dark Elements**: Visual blocks feature a custom midnight slate theme with ambient glassmorphism backdrops, glow indicators, and typography utilizing space tracking pairings.
*   **Touch Sizing**: All interactive touch-points maintain a minimum sizing of `44px` on smaller screen frames to maximize ergonomics.
*   **No Telemetry Clutter**: Free of artificial diagnostic strings or status logs. Simple, human, and direct interfaces only.

***

**Saviour AI Workspace** — *Crafted to protect your momentum, handle your admin, and defeat your deadlines.*
