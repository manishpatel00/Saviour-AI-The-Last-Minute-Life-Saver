import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize the secret-secure Google GenAI Client with Telemetry
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Falling back to simulated API answers.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || 'MOCK_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ==================== API ENDPOINTS ====================

// Endpoint 1: Task Breakdown Agent (Procrastination-Busting Subtasks)
app.post('/api/gemini/breakdown', async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Fallback Mock data for high usability in zero-config states
    return res.json({
      breakdown: [
        'Research core interface templates and outline the schema',
        'Build primary database/state integration routes',
        'Wire client action controls and run validation checks',
        'Optimize visual styles and finalize compiler'
      ]
    });
  }

  try {
    const ai = getAiClient();
    const prompt = `Break down the following task into 3-5 simple, actionable, small milestones to help a procrastinating user start immediately. Keep descriptions concise.\nTask: "${title}"\nDescription: "${description || 'No description'}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an advanced Productivity Coach. You take complex tasks and slice them into small, non-threatening milestones to combat delay.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            breakdown: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of 3-5 subtask titles'
            }
          },
          required: ['breakdown']
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error) {
    console.error('Error in /api/gemini/breakdown:', error);
    res.status(500).json({ error: 'AI generation failed', details: error instanceof Error ? error.message : String(error) });
  }
});

// Endpoint 2: AI Delay Mitigator (Draft extensions / rescheduling plans)
app.post('/api/gemini/mitigate', async (req, res) => {
  const { title, dueDate, type } = req.body; // type = 'extension_request' | 'action_plan'
  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      mitigationText: type === 'extension_request' 
        ? `Subject: Project Timeline & Extension Request - "${title}"\n\nDear Team,\n\nI am writing to request a brief timeline extension for completing "${title}". Due to unexpected technical bottle-necks, I require an additional 24 hours to ensure high-quality standards.\n\nThank you for your flexibility.\nBest regards,\nProductivity Pro`
        : `📋 AI Mitigation Action Plan:\n\n1. Lock down all interruptions for the next 45 minutes.\n2. Complete the primary layout module.\n3. Initiate subtask status checks.\n4. Close the open loop with the project team.`
    });
  }

  try {
    const ai = getAiClient();
    let prompt = '';
    let systemInstruction = '';

    if (type === 'extension_request') {
      prompt = `Draft a professional email requesting a respectful timeline extension for the following task.\nTask: "${title}"\nOriginal Deadline: "${dueDate}"`;
      systemInstruction = 'You are an elite communication assistant. Write short, extremely polished, and persuasive corporate/academic emails for timeline extensions.';
    } else {
      prompt = `Create a strict, timeboxed 4-step Action Rescue Plan to clear the following task immediately.\nTask: "${title}"\nDeadline: "${dueDate}"`;
      systemInstruction = 'You are a high-speed execution expert. Write immediate, crisp, atomic step lists to rescue overdue tasks.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mitigationText: {
              type: Type.STRING,
              description: 'The resulting email draft or action plan'
            }
          },
          required: ['mitigationText']
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error) {
    console.error('Error in /api/gemini/mitigate:', error);
    res.status(500).json({ error: 'AI mitigation generation failed' });
  }
});

// Endpoint 3: Autonomous Chat Companion (General assistant with structured triggers)
app.post('/api/gemini/chat', async (req, res) => {
  const { messages, currentTasks } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages history array is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    const lastUserMsg = messages[messages.length - 1]?.text || 'Hello';
    return res.json({
      message: `I received your command: "${lastUserMsg}". I suggest we immediately focus on completing your critical deadline task or auto-scheduling milestones to clear your calendar overlap!`,
      actions: [
        {
          id: 'act_suggested_focus',
          label: '🎯 Start focus block',
          actionType: 'focus',
          payload: {}
        }
      ]
    });
  }

  try {
    const ai = getAiClient();
    const formattedHistory = messages.map(m => `${m.sender === 'agent' ? 'AI' : 'User'}: ${m.text}`).join('\n');
    const taskContext = JSON.stringify(currentTasks);

    const prompt = `Current Tasks State: ${taskContext}\n\nConversation History:\n${formattedHistory}\n\nRespond to the user with actionable, highly empathetic, and commanding advice. If appropriate, return a structured list of "suggested actions" (such as starting focus on a task, creating a subtask, etc.) to trigger direct UI state updates for the user.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are the Saviour AI, a legendary proactive productivity guardian. Your job is to prevent users from missing deadlines. Speak with professional clarity, empathy, and absolute directness. 

Always offer suggested actions when talking about completing, scheduling, or mitigating tasks.
Actions can be of types:
- 'focus' (starts Pomodoro)
- 'breakdown_task' (breaks down a task with taskId in payload)
- 'add_task' (with title in payload)
- 'mitigate_task' (with taskId and type in payload)`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: {
              type: Type.STRING,
              description: 'The verbal conversational response from the AI companion'
            },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING, description: 'User-facing label for the suggestion pill' },
                  actionType: { type: Type.STRING, enum: ['focus', 'breakdown_task', 'add_task', 'mitigate_task'] },
                  payload: {
                    type: Type.OBJECT,
                    description: 'Custom parameters for actions (e.g. { taskId: "t1" })',
                    properties: {
                      taskId: { type: Type.STRING },
                      title: { type: Type.STRING },
                      type: { type: Type.STRING }
                    }
                  }
                },
                required: ['id', 'label', 'actionType']
              }
            }
          },
          required: ['message']
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error) {
    console.error('Error in /api/gemini/chat:', error);
    res.status(500).json({ error: 'AI chat response failed' });
  }
});

// Endpoint 4: AI Overlap Autoplanner / conflict resolver
app.post('/api/gemini/auto-schedule', async (req, res) => {
  const { currentTasks } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      message: 'AI Autopilot has automatically deferred your low-priority task "Doctor Appointment Follow-up" by 48 hours to vacate high-value morning focus slots for your critical hackathon delivery!'
    });
  }

  try {
    const ai = getAiClient();
    const taskContext = JSON.stringify(currentTasks);
    const prompt = `Review this task checklist and suggest a conflict resolution schedule to avoid deadline failure:\n${taskContext}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an advanced calendar scheduler. You automatically defer, delegate, or expedite task items to resolve bottlenecks.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: {
              type: Type.STRING,
              description: 'Explanatory schedule adjustment logs'
            }
          },
          required: ['message']
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error) {
    console.error('Error in /api/gemini/auto-schedule:', error);
    res.status(500).json({ error: 'AI scheduling failed' });
  }
});

// Endpoint 5: Crisis Triage Mode (Emergency Damage Control)
app.post('/api/gemini/triage', async (req, res) => {
  const { title, description, category, dueDate } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      severity: 'critical',
      recoveryPlan: [
        'Secure communication: Immediately alert key stakeholders that the milestone is being revised.',
        'Isolate blocked components: Focus only on the core MVP functionality, discarding secondary features.',
        'Establish 2-hour high-tempo lock: Dedicate 120 minutes with zero notifications to complete the main deliverable.'
      ],
      damageControlEmail: `Subject: Urgent Update & Recovered Timeline: ${title}\n\nDear Team,\n\nI want to apologize directly for the delay on completing the "${title}" milestone. We hit an unexpected technical integration hurdle that delayed our release.\n\nOur recovery plan is already active. I am personally driving the solution and will deliver the completed update to your inbox by end of day today.\n\nThank you for your patience while we resolve this.\n\nBest regards,\nProductivity Guardian`,
      recoveryMindset: "A missed deadline is not a permanent failure, but a course correction. Take a slow breath, clear the noise, and conquer the next milestone. You've got this."
    });
  }

  try {
    const ai = getAiClient();
    const prompt = `Perform an emergency crisis triage diagnostic on the following missed/delayed task:\nTitle: "${title}"\nDescription: "${description || 'No description'}"\nCategory: "${category || 'General'}"\nDeadline: "${dueDate || 'Missed'}"\n\nAnalyze impact severity, draft a 3-step recovery plan, write a high-empathy damage control apology email, and provide an inspiring recovery mindset coaching statement.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an Elite Crisis Triage Consultant and Executive Psychology Coach. Your goal is to help users manage damaged expectations and restore immediate control during deadline panics.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
            recoveryPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Exactly 3 direct, immediate action steps'
            },
            damageControlEmail: { type: Type.STRING, description: 'Copayble apology and revision email draft' },
            recoveryMindset: { type: Type.STRING, description: 'Motivational mindset coaching quote' }
          },
          required: ['severity', 'recoveryPlan', 'damageControlEmail', 'recoveryMindset']
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error) {
    console.error('Error in /api/gemini/triage:', error);
    res.status(500).json({ error: 'AI crisis triage failed' });
  }
});

// Endpoint 6: Automated Email Checklists & Reminders (Nodemailer proxy route)
app.post('/api/email/reminder', async (req, res) => {
  const { email, title, dueDate, checklist } = req.body;
  if (!email || !title) {
    return res.status(400).json({ error: 'Email and Task Title are required' });
  }

  const checklistItems = Array.isArray(checklist) ? checklist : [];
  
  // Format the list items to HTML
  const checklistHtml = checklistItems.length > 0
    ? `<ul style="list-style-type: none; padding-left: 0; margin-top: 15px;">
        ${checklistItems.map(item => `
          <li style="padding: 10px 14px; margin-bottom: 8px; background-color: #1c1c1e; border: 1px solid #2c2c2e; border-radius: 10px; color: #e5e5ea; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px;">
            <span style="color: #30d158; font-weight: bold; margin-right: 8px;">✓</span> ${item}
          </li>
        `).join('')}
       </ul>`
    : `<p style="color: #8e8e93; font-style: italic; font-size: 13px; margin-top: 10px;">No scheduled milestone checkpoints configured.</p>`;

  // Structured high-fidelity HTML email design (Saviour AI Premium dark visual theme)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Saviour AI Emergency Deadline Safeguard</title>
    </head>
    <body style="background-color: #000000; padding: 25px 15px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 580px; margin: 0 auto; background-color: #0a0a0c; border: 1px solid #222225; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #1e3a8a, #581c87); padding: 30px 20px; text-align: center; border-bottom: 1px solid #222225;">
          <div style="display: inline-block; padding: 8px 12px; background-color: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 50px; margin-bottom: 12px;">
            <span style="color: #60a5fa; font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; font-family: monospace;">Operational Safeguard</span>
          </div>
          <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            SAVIOUR AI DEADLINE RESCUE ACTIVE
          </h1>
        </div>

        <!-- Body Content -->
        <div style="padding: 25px 20px;">
          <p style="color: #8e8e93; font-size: 13px; line-height: 1.5; margin: 0 0 15px 0; font-weight: 300;">
            This is an automated operational alert from your autopilot coordinator. You have authorized and deployed an active recovery blueprint to secure your pending milestone.
          </p>

          <!-- Task Spotlight Card -->
          <div style="background-color: #121214; border: 1px solid #222225; border-radius: 15px; padding: 18px; margin-bottom: 20px;">
            <span style="color: #ff453a; font-size: 9px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Target Deadline</span>
            <h2 style="color: #ffffff; font-size: 16px; font-weight: 700; margin: 4px 0 8px 0; letter-spacing: -0.3px;">${title}</h2>
            <p style="color: #8e8e93; font-size: 12px; margin: 0;"><strong>Target Time limit:</strong> ${dueDate}</p>
          </div>

          <h3 style="color: #ffffff; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 25px 0 0 0; border-bottom: 1px solid #222225; padding-bottom: 8px;">
            Your Recovery Checklist Checklist
          </h3>
          
          ${checklistHtml}

          <!-- Call to Action -->
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.APP_URL || 'https://ai.studio/build'}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: bold; border-radius: 12px; box-shadow: 0 4px 12px rgba(59,130,246,0.3);">
              Return to Control Clearance Gate
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #070709; padding: 15px 20px; text-align: center; border-t: 1px solid #222225;">
          <p style="color: #48484a; font-size: 10px; margin: 0;">
            Saviour AI Autonomous Scheduler Agent &bull; Dual-Shield Safeguards Active
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Retrieve SMTP configs
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');

  if (!smtpUser || !smtpPass) {
    console.log(`[EMAIL SIMULATOR] Dispatched HTML Checklist Reminder to ${email}`);
    console.log(`[EMAIL SIMULATOR] Title: ${title}`);
    console.log(`[EMAIL SIMULATOR] Checklist Count: ${checklistItems.length}`);
    return res.json({
      success: true,
      simulated: true,
      message: `📬 [Simulation Active] Elegant HTML checklist reminder dispatched to ${email}! Check server terminal logs for details.`
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await transporter.sendMail({
      from: `"Saviour AI Companion" <${smtpUser}>`,
      to: email,
      subject: `🚨 Emergency Checkpoints: ${title}`,
      html: htmlContent
    });

    res.json({
      success: true,
      simulated: false,
      message: `📨 Saviour AI Reminder dispatched directly to your inbox: ${email}`
    });
  } catch (error) {
    console.error('Nodemailer send failed:', error);
    res.status(500).json({ error: 'Failed to send real email. Falling back to simulation.', details: error instanceof Error ? error.message : String(error) });
  }
});

// =======================================================

async function startServer() {
  // Vite Integration for Hot Reload during development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FULL-STACK PORTAL] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
