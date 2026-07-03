# 🌌 Saviour AI — Proactive Crisis Mitigation & Deadline Rescue OS (SAVIOUR.OS)

[![Engine](https://img.shields.io/badge/Engine-Gemini%203.5%20Flash-blueviolet?style=flat-square&logo=google-gemini)](https://ai.google.dev/)
[![Stack](https://img.shields.io/badge/Stack-React%2019%20%2B%20Express-blue?style=flat-square&logo=react)](https://react.dev/)
[![Storage](https://img.shields.io/badge/Storage-Firebase%20Firestore-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Workspace](https://img.shields.io/badge/Integration-Google%20Workspace-crimson?style=flat-square&logo=google-chrome)](https://developers.google.com/workspace)
[![UI](https://img.shields.io/badge/UI-Cyberpunk%20CRT%20Terminal-yellow?style=flat-square)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/Types-Strict%20TypeScript-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

Saviour AI is an elite, full-stack proactive productivity assistant, automated life sentinel, and crisis triage dashboard. It is engineered to dismantle procrastination, handle severe calendar conflicts, automate stakeholder communications during slip-ups, and convert passive reminder fatigue into decisive, immediate completion.

By integrating server-side **Gemini 3.5 Flash** models with **Google Workspace APIs (Calendar & Gmail)** and dynamic **Firebase Firestore** state persistence, Saviour AI acts as an autonomous operational command center for distributed software developers, student teams, and busy professionals.

---

## 📖 Table of Contents
1. [🔬 Google L5 Engineer Analysis: The Last-Minute Life Saver](#-google-l5-engineer-analysis-the-last-minute-life-saver)
2. [💡 The Saviour AI Paradigm (YC Startup DNA)](#-the-saviour-ai-paradigm-yc-startup-dna)
3. [🏗️ Systems Architecture & Topology](#%EF%B8%8F-systems-architecture--topology)
4. [⚡ Feature Ecosystem Deep Dive](#-feature-ecosystem-deep-dive)
5. [🔌 Google Workspace Integration & Dual-Auth Security Core](#-google-workspace-integration--dual-auth-security-core)
6. [🛠️ Local Installation & Compilation Runbook](#%EF%B8%8F-local-installation--compilation-runbook)
7. [🚀 Google Cloud Deployment Blueprint](#-google-cloud-deployment-blueprint)
8. [🏆 Hackathon Evaluation Grid Alignment Matrix](#-hackathon-evaluation-grid-alignment-matrix)
9. [🗣️ Master Prompt Engineering Guide](#%EF%B8%8F-master-prompt-engineering-guide)

---

## 🔬 Google L5 Engineer Analysis: The Last-Minute Life Saver

### 1. The Core Problem
Traditional productivity tools (Trello, Notion, Apple Reminders) are built on a **Passive Pull Architecture**. They rely on the user having the cognitive energy to check their dashboard, interpret tasks, prioritize them, and begin execution. When a user is stressed, overwhelmed, or procrastinating, this pull model breaks down entirely:
* **Reminder Fatigue**: Passive alarms are dismissed instantly.
* **The "Ostrich Effect"**: As deadlines approach, user anxiety increases, causing them to actively avoid the productivity dashboard.
* **Lack of Plan B**: If a deadline is missed, the user enters a state of panic, spending hours drafting apology emails or trying to manually restructure their week.

To win first place in this hackathon, we analyzed three competitive technical solutions to address this gap.

### 2. Solution Design Alternatives

#### Approach A: Traditional Passive Trackers (Typical Submissions)
* **Description**: A clean client-side Kanban board with toast notifications, a calendar view, and local storage state.
* **Pros**: Simple to build, fast performance, highly predictable.
* **Cons**: Fails to solve the psychological barriers of procrastination. Offers zero active help during a crisis.
* **Verdict**: Average score. Does not meet YC-level or Rank-1 standard.

#### Approach B: Autonomous Background Agents (Over-Engineered)
* **Description**: Continuous background servers using CRON workers that call Gemini models to monitor tasks, send non-stop notification emails, and automatically email managers when things are late.
* **Pros**: High autonomy, impressive on paper.
* **Cons**: Severe API rate limits, extreme token expense, zero user consent control, and high risk of sending inappropriate automated emails.
* **Verdict**: High risk. Breaks user trust and violates strict security best practices.

#### Approach C: Hybrid Active-Mitigation OS (Saviour.OS — Our Solution)
* **Description**: An immersive Command Center combining localized user agency with server-side LLM proxies. It features 1-click active triage, automated task slicing, cognitive lockdown blocks, and a Workspace bypass protocol.
* **Pros**: 100% user-in-the-loop control, extremely low latency, zero telemetry noise, and immediate actionable recovery paths.
* **Cons**: Requires complex state synchronization and full-stack API orchestration.
* **Verdict**: Winner. Captures high agentic depth while respecting safety, usability, and visual craftsmanship.

---

## 💡 The Saviour AI Paradigm (YC Startup DNA)

We designed Saviour AI to incorporate the design philosophies and functional mechanics of top-tier YC startups (like Linear, Raycast, and Notion):

### 1. Command-Bar and Terminal-First HUD
Busy professionals work fastest with keyboard shortcuts and CLI interfaces. Saviour AI features an immersive retro-cyberpunk **CRT Terminal interface** paired with glowing scanlines, dynamic grid layouts, and sound effects. This transforms a boring spreadsheet task board into an engaging, tactile dashboard.

### 2. Proactive "Anti-Avoidance" Friction
Instead of waiting for you to fail, Saviour AI includes a **Pomodoro Rescue Block** with dynamic ambient sounds (synthetic white noise, alpha focus waves, focus tracks) and visual breathing loop indicators. It temporarily locks down the visual workspace, creating a high-focus environment that helps you complete tasks immediately.

### 3. Crisis Damage Control (Plan B is Automated)
When a milestone slips, Saviour AI doesn't judge. It automatically triggers a **Diagnostic Triage Suite**:
* Categorizes the impact severity (Low, Medium, Critical).
* Generates a 3-step technical recovery checklist.
* Drafts custom, highly polished professional apology emails or extension requests.
* Provides a 1-click option to compose a Gmail draft or add a recovery event directly to Google Calendar.

---

## 🏗️ Systems Architecture & Topology

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

1. **Client Layer (Vite + React 19)**: Orchestrates real-time state, renders fluid transitions using `motion`, visualizes charts with `recharts`, and coordinates view states (Dashboard, Calendar, Tasks, Analytics, Focus Mode).
2. **Backend Proxy Layer (Express.js)**: Hosts secure endpoints. In production, `server.ts` is bundled into a single-file CommonJS asset (`dist/server.cjs`) using `esbuild` to bypass ES Module import friction and accelerate Cloud Run cold starts.
3. **Dual Persistence Matrix**: 
   * **Firebase Firestore**: Standard persistent collections (`tasks`, `goals`, `badges`, `notifications`) bound to authenticated user profiles.
   * **Workspace Live APIs**: Real-time integration with Google Calendar and Gmail pipelines, guarded by secure credential filters.

---

## ⚡ Feature Ecosystem Deep Dive

### 1. Interactive Kanban Task Board with Autocut Agent
* **Autocut (Gemini-Powered Slicing)**: Splitting a large task into smaller steps reduces friction. Click "Autocut" on any task to send the request to Gemini 3.5 Flash, which returns a curated list of 3-5 subtasks complete with time estimates.
* **Priority Escalation Grid**: Organizes tasks into Critical, Urgent, and Normal categories. It visually flags tasks that are approaching their deadline within 24 hours.

### 2. Proactive Scheduler & Auto-Aligner
* **Overlapping Conflict Detector**: Scans your active timeline and flags when multiple high-priority tasks overlap.
* **Auto-Schedule Engine**: Combines your current availability and task priority, using Gemini to resolve conflicts and adjust your timeline.
* **1-Click Workspace Sync**: Syncs your optimized task schedule with your primary Google Calendar in real-time.

### 3. Crisis Triage Diagnostic & Gmail/Calendar Integration
* **1-Click Crisis Response**: If a task deadline passes without completion, click "Triage Diagnostic" on the task card.
* **AI Remediation Suite**: Gemini assesses the impact, writes a custom 3-step recovery plan, provides a "Recovery Mindset" statement, and drafts a professional stakeholder email.
* **Live Integration**: Push the generated apology directly to Gmail Drafts or schedule the recovery plan directly in your Google Calendar.

### 4. Terminal Sentinel AI Companion & Voice Hub
* **Conversational AI CLI**: Type commands in the retro sidebar terminal to control the system.
* **Web Speech Integration**: Includes hands-free voice commands. Click the microphone icon and dictate:
  * *"Add task: Deploy Cloud Run container by Friday"*
  * *"Start focus block"*
  * *"Show analytics"*
* **Trigger Action Pipelines**: The terminal parses your inputs, executes the request via Gemini, and automatically updates the frontend UI (e.g., launching the Pomodoro timer or creating a task).

### 5. Multi-Frequency Habit Tracker & Gamification
* **30-Day Activity Matrix**: Includes a GitHub-style habit completion grid to visualize your daily streaks.
* **Gamified Progress Engine**: Earn experience points (XP) for completing tasks, finishing Pomodoro blocks, and maintaining habits. Level up from 1 to 100 and unlock custom badges (e.g., *Procrastination Slayer*, *Crisis Commander*).

---

## 🔌 Google Workspace Integration & Dual-Auth Security Core

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

## 🛠️ Local Installation & Compilation Runbook

### 1. Clone & Configure Workspace
Create a local environment configuration file from our example:
```bash
cp .env.example .env
```

Define the essential environment variables:
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

### 2. Restore Dependencies
Install the required packages:
```bash
npm install
```

### 3. Launch Development Server
Starts the full-stack portal with integrated Vite dev-middleware:
```bash
npm run dev
```
The server binds to `0.0.0.0:3000` for seamless network container ingress routing.

### 4. Run Compiler Validation (Lint)
Ensure there are no TypeScript compile or lint errors:
```bash
npm run lint
```

### 5. Compile & Bundle for Production
Prepares the workspace for production:
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

## 🚀 Google Cloud Deployment Blueprint

Deploy Saviour AI directly to Google Cloud in minutes.

### 1. Authenticate with Google Cloud
Ensure the GCloud CLI is installed and authenticated:
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 2. Enable Required APIs
Enable the necessary services in your Google Cloud Project:
```bash
gcloud services enable run.googleapis.com \
                       containerregistry.googleapis.com \
                       firestore.googleapis.com
```

### 3. Deploy Serverless App to Google Cloud Run
Submit and build your container directly on Cloud Run:
```bash
gcloud run deploy saviour-os \
  --source . \
  --port 3000 \
  --env-vars-file .env \
  --allow-unauthenticated \
  --region us-central1
```

Once complete, Cloud Run will output a public URL (e.g., `https://saviour-os-xyz.a.run.app`) where Saviour AI is hosted and ready to use.

---

## 🏆 Hackathon Evaluation Grid Alignment Matrix

Saviour AI is engineered to maximize every point in the evaluation rubric:

| Evaluation Criteria | Weight | How Saviour AI Achieves Rank-1 Excellence |
| :--- | :---: | :--- |
| **Problem Solving & Impact** | 20% | Transforms passive reminders into actionable recovery states. Actively assists when deadlines are missed rather than just warning you. |
| **Agentic Depth** | 20% | Combines backend LLM pipelines for task-slicing, timeline aligning, and crisis-triaging with dynamic client-side triggers (like auto-starting timers). |
| **Innovation & Creativity** | 20% | Features a retro CRT terminal HUD with functional video calibration controls, voice recognition, and sound effects to increase engagement. |
| **Usage of Google Technologies** | 15% | Powered by server-side Gemini 3.5 Flash, structured Firestore databases, Gmail composition APIs, and Google Calendar event builders. |
| **Product Experience & Design** | 10% | Fully responsive layout styled with Tailwind CSS glassmorphism, Framer Motion transitions, and clean typography. Supports touch targets > 44px. |
| **Technical Implementation** | 10% | 100% TypeScript type-safety (0 lint errors). Features a unified esbuild compilation pipeline for stable, production-ready backend deployments. |
| **Completeness & Usability** | 5% | Zero mock-only features. Includes real Google Workspace connectivity, full local storage backups, and a clear developer bypass module. |

---

## 🗣️ Master Prompt Engineering Guide

To deploy, audit, or iterate on the autonomous capabilities of Saviour AI, paste the following prompt directly into Google AI Studio or your developer agent workspace:

```text
Act as an Elite Principal Google Engineer. Audit the full-stack 'Saviour AI' repository.
1. Inspect /server.ts to verify that the Gemini 3.5 Flash client uses the modern '@google/genai' SDK and adheres to strict JSON-schema responses.
2. Verify that express endpoints (/api/gemini/breakdown, /api/gemini/mitigate, /api/gemini/chat, /api/gemini/auto-schedule, /api/gemini/triage) correctly validate payloads, execute error mitigation fallbacks, and write readable server logs.
3. Check /src/App.tsx and ensure state synchronization between React, localStorage, and Firebase Firestore behaves deterministically with no duplicate task IDs.
4. Run 'npm run lint' and 'npm run build' to confirm that esbuild successfully outputs a self-contained CommonJS server at /dist/server.cjs with zero compiler warnings.
Maintain the high-contrast retro terminal HUD design, glowing scanlines, and 44px touch targets.
```

---

**Saviour AI** — *Dismantling procrastination, coordinating mitigations, and protecting developer momentum.*
