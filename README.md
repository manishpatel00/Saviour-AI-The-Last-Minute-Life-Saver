# 🎯 Saviour AI — Proactive Damage Control & Deadline Rescue OS

[![Engine](https://img.shields.io/badge/Engine-Gemini%203.5%20Flash-blueviolet?style=flat-square)](https://ai.google.dev/)
[![Stack](https://img.shields.io/badge/Stack-React%2019%20%2B%20Express-blue?style=flat-square)](https://react.dev/)
[![Storage](https://img.shields.io/badge/Storage-Firebase%20Firestore-orange?style=flat-square)](https://firebase.google.com/)
[![OAuth](https://img.shields.io/badge/Integration-Google%20Workspace-crimson?style=flat-square)](https://developers.google.com/workspace)

**Saviour AI** (SAVIOUR.OS) is an elite, full-stack proactive productivity assistant, automated life sentinel, and crisis triage dashboard. It is engineered specifically to prevent missed deadlines, handle severe calendar conflicts, automate stakeholder communications during slip-ups, and dismantle procrastination blocks.

By integrating server-side **Gemini 3.5 Flash** models with live **Google Workspace APIs** (Calendar & Gmail) and dynamic **Firebase** state persistence, Saviour AI acts as an autonomous operational command center for high-velocity software engineers, builders, and distributed squads.

---

## 🏗️ Systems Architecture & Topology

Saviour AI is structured on a full-stack, secure, decoupled model that separates untrusted browser clients from sensitive third-party APIs. All Gemini LLM invocations and transactional mail protocols are executed via high-throughput Express.js backend proxies.

```
                   ┌───────────────────────────────────┐
                   │        React 19 Client UI         │
                   │ (Glow Glassmorphism, Motion, D3)  │
                   └─────────────────┬─────────────────┘
                                     │
                        Secure API   │   Persistent App State
                        Proxy Calls  │   (Auth & Collections)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Express.js Backend Server                       │
│                     (Vite HMR Mode / Bundled ESM CJS)                  │
├──────────────────────┬────────────────────────┬────────────────────────┤
│                      │                        │                        │
│                      ▼                        ▼                        ▼
│         ┌─────────────────────────┐ ┌────────────────────┐ ┌──────────────────────┐
│         │     Google GenAI SDK    │ │  Nodemailer SMTP   │ │   Google Workspace   │
│         │   (Gemini 3.5 Flash)    │ │   (Direct/Sim)     │ │  (Calendar & Gmail)  │
│         └─────────────────────────┘ └────────────────────┘ └──────────────────────┘
└────────────────────────────────────────────────────────────────────────┘
```

### Core Architecture Components

1. **Client Layer (Vite + React 19)**: Orchestrates real-time state, renders motion curves via `@motion/react`, charts metrics with `recharts`, and coordinates view states (Dashboard, Calendar, Tasks, Analytics, Focus Mode).
2. **Backend Proxy Layer (Express.js)**: Hosts secure endpoints. In production, `server.ts` is bundled into a single-file CommonJS asset (`dist/server.cjs`) using `esbuild` to bypass ES Module import friction and accelerate Cloud Run cold starts.
3. **Dual Persistence Matrix**: 
   * **Firebase Firestore**: Standard persistent collections (`tasks`, `goals`, `badges`, `notifications`) bound to authenticated user profiles.
   * **Workspace Live APIs**: Real-time integration with Google Calendar and Gmail pipelines, guarded by secure credential filters.

---

## ⚡ Real-Time Operational Features

*   **⚡ Task Board with Subtask Generator**: Standard Kanban workspace paired with an on-demand Gemini-powered task slice agent. It breaks overwhelming milestones into manageable 30-minute checkpoints to bypass procrastination.
*   **⏱️ Pomodoro Emergency Rescue**: Includes a lockdown visual timer coupled with cognitive breathing loops. Activating Focus Mode applies strict layout boundaries to prevent notification noise.
*   **📅 Crisis Triage Diagnostic**: In the event of a critical schedule conflict or missed milestone, Saviour AI executes a crisis protocol that analyzes impact severity, creates a 3-step action recovery list, and writes a professional stakeholder apology draft.
*   **🔥 Multi-Frequency Habit Tracker**: Tracks daily, weekly, and monthly targets using custom interactive grid calendars. It calculates real-time streaks and stores completion histories in Firestore.
*   **🤖 Sentinel AI Agent Companion**: A terminal-themed sidebar assistant that interprets user messages, outputs authoritative operational logs, and returns actionable JSON payloads to trigger immediate client-side operations (e.g., auto-scheduling, focusing).

---

## 🔌 Google Workspace Integration & Dual-Auth Security

Workspace integration operates on a secure dual-mode schema to maintain flexibility across localhost, development sandboxes, and production deployments:

### Mode A: Standard Google OAuth Client
Utilizes standard browser authentication flows. 
* **Scopes Requested**:
  * `openid profile email`: Fundamental profile identification.
  * `https://www.googleapis.com/auth/calendar.events`: Scheduling calendar recovery sessions.
  * `https://www.googleapis.com/auth/gmail.compose`: Generating pre-composed crisis update emails.
* **Flow**: Initiates popup authorizations, handles verification codes, and attaches valid tokens to Firebase credentials.

### Mode B: Developer Bypass (OAuth Token Override)
Designed for cloud sandboxes or remote development frames where OAuth redirects are restricted by strict sandbox frame policies.

#### Bypass Integration Setup:
1. Navigate to the [Google OAuth Playground](https://developers.google.com/oauthplayground).
2. Under **Step 1 (Select & authorize APIs)**, input the required scopes:
   * `https://www.googleapis.com/auth/calendar.events`
   * `https://www.googleapis.com/auth/gmail.compose`
3. Click **Authorize APIs** and authenticate with your workspace developer account.
4. Under **Step 2**, click **Exchange authorization code for tokens**.
5. Locate and copy the generated **Access Token** string (prefixed with `ya29.`).
6. Within Saviour AI, expand the **Developer Bypass** console, input your target developer email, and paste the Access Token.
7. Click **Apply Developer Override Token**. The client instantly synthesizes a secure workspace credentials channel and unlocks live calendar/mail actions.

---

## 📡 Advanced Backend API Reference

Saviour AI maps developer controls to the following structured endpoints:

| Endpoint | Method | Payload Interface | Operational Purpose / System Instruction |
| :--- | :---: | :--- | :--- |
| `/api/gemini/breakdown` | `POST` | `{ title: string, description?: string }` | Analyzes complex milestones and outputs 3–5 subtask items utilizing a strict JSON schema. |
| `/api/gemini/mitigate` | `POST` | `{ title: string, dueDate: string, type: 'extension_request' \| 'action_plan' }` | Generates a structured corporate/academic timeline extension request or immediate timeboxed checklist. |
| `/api/gemini/chat` | `POST` | `{ messages: Array<Message>, currentTasks: Array<Task> }` | Actives `SAVIOUR.OS` protocol. Instructs the LLM to output elite, authoritative responses alongside trigger actions. |
| `/api/gemini/auto-schedule`| `POST` | `{ currentTasks: Array<Task> }` | Inspects current task priorities, detects overloads, and resolves schedule overlaps. |
| `/api/gemini/triage` | `POST` | `{ title: string, description?: string, category?: string, dueDate?: string }` | Analyzes missed deadlines, classifies impact severity, and generates communication drafts. |
| `/api/email/reminder` | `POST` | `{ email: string, title: string, dueDate: string, checklist: Array<string> }` | Formats and delivers a styled HTML newsletter reminder. Uses `nodemailer` SMTP or simulates delivery on stdout. |

---

## 🛠️ Installation & Compilation Runbook

### 1. Configure the Environment
Ensure standard variables are registered inside `.env`. Create a copy from the available example:
```bash
cp .env.example .env
```

Define the essential environment keys:
```env
# Server Secret Keys (Kept secure in backend container memory)
GEMINI_API_KEY=your_gemini_api_key_here

# Outbound Mail Notification SMTP (Optional - falls back to simulation mode if empty)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here

# Base App Host Url
APP_URL=http://localhost:3000
```

### 2. Install Project Dependencies
Restore standard developer cache packages:
```bash
npm install
```

### 3. Launch Development Server
Starts the full-stack portal with integrated Vite dev-middleware:
```bash
npm run dev
```
The server binds to `0.0.0.0:3000` for seamless network container ingress routing.

### 4. Code Quality & Formatting
Run TypeScript compiler check to verify absolute type-safety:
```bash
npm run lint
```

### 5. Compile & Bundle for Production
Prepares the workspace for deployment to Cloud Run, Vercel, or traditional containers:
```bash
npm run build
```
This multi-step build script:
1. Invokes the `vite build` client-compiler, generating optimized static assets in `/dist`.
2. Employs `esbuild` to bundle `server.ts` into `/dist/server.cjs`, wrapping all custom ESM routes into a production-hardened CommonJS module while keeping standard node packages external.

### 6. Production Boot Command
Launches the standalone compiled backend:
```bash
npm run start
```

---

## 📐 Design & Ergonomics Guideline

*   **Midnight Slate Aesthetic**: Saviour AI employs a custom dark slate theme with glowing brand borders, semi-transparent overlays, and highly scannable grid modules.
*   **Frictionless Typography**: We pair **Inter** for clean, legible body text with **JetBrains Mono** for developer diagnostic displays, timestamps, and priority badges.
*   **Tactile Hitboxes**: Every button, input toggle, and list trigger conforms to a minimum click target size of `44px` on compact screens to maintain optimal mobile accessibility.
*   **Zero Telemetry Clutter**: Free of low-value, simulated system-credit indicators or superficial logs in borders. All text on screen is clean, intentional, and strictly functional.

---

**Saviour AI** — *Dismantling procrastination, coordinating mitigations, and protecting developer momentum.*
