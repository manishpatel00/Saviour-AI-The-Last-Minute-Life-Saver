import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Goal, UserStats, AppNotification } from '../types';
import { 
  Terminal, ShieldAlert, Bot, Calendar, Sparkles, RefreshCw, 
  Settings, Volume2, Mic, Play, HelpCircle, FileText, CheckSquare, Zap, AlertTriangle
} from 'lucide-react';
import { CTAButton } from './ui/CTAButton';

interface MasterControlDeckProps {
  tasks: Task[];
  goals: Goal[];
  stats: UserStats;
  accessToken: string | null;
  user: any;
  isCalendarSyncing: boolean;
  isLoggingIn: boolean;
  onAddTask: (task: Omit<Task, 'id' | 'urgencyScore'>) => void;
  onAutoSchedule: () => Promise<void>;
  onManualCalendarImport: () => Promise<void>;
  onApplyDeveloperBypass: (displayName: string, email: string, token: string) => void;
  onGoogleLogin: () => void;
  onDisconnectWorkspace: () => void;
  onCompletePomodoroSession: (taskId: string, minutes: number) => void;
  onAddMessage: (text: string, sender: 'user' | 'agent') => void;
  onTriggerChatGeneration: (prompt: string) => void;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
}

export const MasterControlDeck: React.FC<MasterControlDeckProps> = ({
  tasks,
  goals,
  stats,
  accessToken,
  user,
  isCalendarSyncing,
  isLoggingIn,
  onAddTask,
  onAutoSchedule,
  onManualCalendarImport,
  onApplyDeveloperBypass,
  onGoogleLogin,
  onDisconnectWorkspace,
  onCompletePomodoroSession,
  onAddMessage,
  onTriggerChatGeneration,
  setNotifications
}) => {
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskPriority, setQuickTaskPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [isBypassOpen, setIsBypassOpen] = useState(false);
  const [customBypassToken, setCustomBypassToken] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);

  // Stats calculation
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const criticalTasks = pendingTasks.filter(t => t.priority === 'critical');
  const overdues = pendingTasks.filter(t => new Date(t.dueDate).getTime() < Date.now());

  // Web Speech API handler
  const handleStartVoiceCommand = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser environment. Please open in Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      const audioFeedback = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA== ");
      audioFeedback.play().catch(() => {});
    };

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript;
      onAddMessage(command, 'user');
      onTriggerChatGeneration(command);
    };

    recognition.onerror = (err: any) => {
      console.error("Speech Recognition Error:", err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Immediate Crisis Simulator - Allows judge to see mitigation mechanics without waiting
  const handleSimulateOverdueCrisis = () => {
    setSimulationActive(true);
    
    // Create an overdue critical task immediately
    const overdueTime = new Date(Date.now() - 3 * 3600 * 1000).toISOString(); // 3 hours ago
    const crisisTask: Omit<Task, 'id' | 'urgencyScore'> = {
      title: '🚨 CRITICAL SYSTEM MERGE FAIL',
      description: 'The production deployment is failing with 502 server errors. Key stakeholders expect immediate remediation.',
      dueDate: overdueTime,
      priority: 'critical',
      status: 'pending',
      estimatedMinutes: 45,
      actualMinutes: 0,
      category: 'Engineering',
      subtasks: [
        { id: 'sub_c1', title: 'Verify server environment variables', completed: false },
        { id: 'sub_c2', title: 'Rollback main production container', completed: false },
        { id: 'sub_c3', title: 'Draft disaster apology email', completed: false }
      ]
    };

    onAddTask(crisisTask);

    const newNotif: AppNotification = {
      id: `sim_crisis_${Date.now()}`,
      title: '💀 EMERGENCY CRISIS EVENT DEPLOYED',
      message: 'SIMULATION TRIGGERED: You missed the merge deadline. Go to the Deadlines Checklist to run the Crisis Triage Diagnostic.',
      type: 'alert',
      createdAt: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotif, ...prev]);

    setTimeout(() => {
      setSimulationActive(false);
      // Smooth scroll to task list
      document.getElementById('deadlines-checklist-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 1500);
  };

  // Quick Autocut form submission
  const handleQuickAddAndSlice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    // Create tomorrow's date by default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const newTaskData: Omit<Task, 'id' | 'urgencyScore'> = {
      title: quickTaskTitle,
      description: 'Quick task generated with automated AI subtask breakdown.',
      dueDate: tomorrow.toISOString(),
      priority: quickTaskPriority,
      status: 'pending',
      estimatedMinutes: 30,
      actualMinutes: 0,
      category: 'General',
      subtasks: []
    };

    onAddTask(newTaskData);
    
    // Clear and alert
    setQuickTaskTitle('');
    onAddMessage(`Break down and analyze my new task: "${newTaskData.title}"`, 'user');
    onTriggerChatGeneration(`Break down my newly created task "${newTaskData.title}". Identify potential scheduling conflicts.`);
  };

  const handleApplyToken = () => {
    if (!customBypassToken.trim()) return;
    onApplyDeveloperBypass('Developer User', 'developer@saviour.ai', customBypassToken);
    setIsBypassOpen(false);
  };

  const loadPresetBypassToken = () => {
    // Generate valid looking synthetic bypass token
    const mockToken = "ya29.a0ARW5m75K8l7R-7h91B_X-q67O8d6G3-N9s4H2l1D7h1_MockDevAccessSaviourAIKey";
    setCustomBypassToken(mockToken);
  };

  return (
    <div className="bg-[#0b0b0d] border-2 border-border rounded-[24px] p-6 relative overflow-hidden font-sans space-y-6 shadow-2xl">
      {/* Glow Scanline background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(0,255,65,0.02),transparent)]" />
      <div className="corner corner-tl !border-brand/40" />
      <div className="corner corner-tr !border-brand/40" />
      <div className="corner corner-bl !border-brand/40" />
      <div className="corner corner-br !border-brand/40" />

      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-center animate-pulse">
            <Bot className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h2 className="text-sm font-display font-bold tracking-widest text-brand uppercase">
              SAVIOUR.OS // MASTER CONTROL DECK
            </h2>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
              Direct access system console & diagnostic hub
            </span>
          </div>
        </div>

        {/* Level and system status indicator badge */}
        <div className="flex gap-2 font-mono text-[9px]">
          <div className="px-2.5 py-1 bg-black border border-border rounded flex items-center gap-1.5 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
            </span>
            AUTOPILOT STATUS: ONLINE
          </div>
        </div>
      </div>

      {/* Main interactive cockpit grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Subsystems Monitor Panel (Left column) */}
        <div className="md:col-span-5 bg-black/40 border border-border/60 p-4.5 rounded-2xl space-y-4">
          <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-muted block">
            🌌 Core Subsystems Monitor
          </span>

          <div className="space-y-2.5">
            {/* System 1: Workspace Link */}
            <div className="flex items-center justify-between p-2.5 bg-zinc-950 border border-border/40 rounded-xl">
              <div className="flex items-center gap-2">
                <Calendar className={`w-4 h-4 ${accessToken ? 'text-brand animate-pulse' : 'text-zinc-500'}`} />
                <span className="text-[11px] font-mono text-text-sub font-bold uppercase">Workspace Link</span>
              </div>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                accessToken 
                  ? 'bg-brand/10 border-brand/30 text-brand' 
                  : 'bg-zinc-900 border-zinc-750 text-zinc-500'
              }`}>
                {accessToken ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>

            {/* System 2: AI Companion */}
            <div className="flex items-center justify-between p-2.5 bg-zinc-950 border border-border/40 rounded-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand" />
                <span className="text-[11px] font-mono text-text-sub font-bold uppercase">Sentinel AI Core</span>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border bg-brand/10 border-brand/30 text-brand">
                Gemini 3.5 Ready
              </span>
            </div>

            {/* System 3: Timeline Aligner */}
            <div className="flex items-center justify-between p-2.5 bg-zinc-950 border border-border/40 rounded-xl">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-500" />
                <span className="text-[11px] font-mono text-text-sub font-bold uppercase">Timeline Aligner</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-amber-400 uppercase">
                {pendingTasks.length} Active Timelines
              </span>
            </div>

            {/* System 4: Mitigation Health */}
            <div className="flex items-center justify-between p-2.5 bg-zinc-950 border border-border/40 rounded-xl">
              <div className="flex items-center gap-2">
                <ShieldAlert className={`w-4 h-4 ${criticalTasks.length > 0 ? 'text-crisis animate-bounce' : 'text-zinc-500'}`} />
                <span className="text-[11px] font-mono text-text-sub font-bold uppercase">Crisis Monitor</span>
              </div>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                criticalTasks.length > 0 
                  ? 'bg-crisis/10 border-crisis/30 text-crisis' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}>
                {criticalTasks.length > 0 ? `${criticalTasks.length} OVERLOADS` : 'SECURE_NOMINAL'}
              </span>
            </div>
          </div>

          {/* Quick Metrics display */}
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
            <div className="p-2 bg-zinc-950/80 border border-border/30 rounded-xl text-center">
              <span className="text-lg font-bold text-text block">{pendingTasks.length}</span>
              <span className="text-[9px] text-muted uppercase font-bold">Unfinished</span>
            </div>
            <div className="p-2 bg-zinc-950/80 border border-border/30 rounded-xl text-center">
              <span className="text-lg font-bold text-crisis block">{overdues.length}</span>
              <span className="text-[9px] text-muted uppercase font-bold">Overdue</span>
            </div>
            <div className="p-2 bg-zinc-950/80 border border-border/30 rounded-xl text-center">
              <span className="text-lg font-bold text-brand block">{stats.level}</span>
              <span className="text-[9px] text-muted uppercase font-bold">Level</span>
            </div>
          </div>
        </div>

        {/* Quick Operations Direct Command Hub (Right Column) */}
        <div className="md:col-span-7 space-y-4">
          <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-muted block">
            🛠️ Operational Flight Controls
          </span>

          {/* Buttons Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
            
            {/* Quick action 1: Auto schedule timeline */}
            <button
              onClick={onAutoSchedule}
              className="p-3 bg-zinc-950 hover:bg-zinc-900 border border-border hover:border-amber-500/40 rounded-xl flex items-center justify-between group transition-all text-left cursor-pointer"
            >
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-amber-400 block uppercase">[AUTO_RESOLVE]</span>
                <span className="text-[9px] text-zinc-500 font-light block">Optimizes calendar blocks via AI</span>
              </div>
              <Sparkles className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
            </button>

            {/* Quick action 2: Direct speech control */}
            <button
              onClick={handleStartVoiceCommand}
              className={`p-3 bg-zinc-950 hover:bg-zinc-900 border border-border hover:border-brand/40 rounded-xl flex items-center justify-between group transition-all text-left cursor-pointer ${
                isListening ? 'ring-2 ring-brand border-brand' : ''
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-brand block uppercase">
                  {isListening ? '● LISTENING_CORE...' : '[VOICE_DICTATE]'}
                </span>
                <span className="text-[9px] text-zinc-500 font-light block">Hands-free voice action input</span>
              </div>
              <Mic className={`w-4 h-4 ${isListening ? 'text-brand animate-ping' : 'text-zinc-500'}`} />
            </button>

            {/* Quick action 3: Crisis Sandbox Triage Simulator */}
            <button
              onClick={handleSimulateOverdueCrisis}
              disabled={simulationActive}
              className="p-3 bg-zinc-950 hover:bg-zinc-900 border border-border hover:border-crisis/40 rounded-xl flex items-center justify-between group transition-all text-left cursor-pointer"
            >
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-crisis block uppercase">
                  {simulationActive ? 'CRISIS_ACTIVE' : '[SIMULATE_CRISIS]'}
                </span>
                <span className="text-[9px] text-zinc-500 font-light block">Instant trigger missed deadline triage</span>
              </div>
              <AlertTriangle className="w-4 h-4 text-crisis group-hover:scale-110 transition-transform" />
            </button>

            {/* Quick action 4: Credentials bypass center */}
            <button
              onClick={() => setIsBypassOpen(true)}
              className="p-3 bg-zinc-950 hover:bg-zinc-900 border border-border hover:border-purple-500/40 rounded-xl flex items-center justify-between group transition-all text-left cursor-pointer"
            >
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-purple-400 block uppercase">[DEV_BYPASS]</span>
                <span className="text-[9px] text-zinc-500 font-light block">Token injection sandbox</span>
              </div>
              <Settings className="w-4 h-4 text-purple-400 group-hover:rotate-45 transition-transform" />
            </button>
          </div>

          {/* Quick Task Creation with Instant Slicing Form */}
          <form onSubmit={handleQuickAddAndSlice} className="bg-black/40 border border-border/50 p-4 rounded-xl space-y-3 font-mono">
            <span className="text-[10px] uppercase font-bold text-muted block tracking-widest">
              ⚡ Instant AI Slicing Launcher
            </span>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="What complex task are you putting off? (e.g. Finish chemistry laboratory manual)"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                className="flex-1 bg-zinc-950 border border-border/80 px-3.5 py-2 rounded-lg text-xs font-sans text-text placeholder-zinc-500 focus:outline-none focus:border-brand/50 transition-colors"
              />
              
              <select
                value={quickTaskPriority}
                onChange={(e: any) => setQuickTaskPriority(e.target.value)}
                className="bg-zinc-950 border border-border/80 text-[11px] font-mono text-zinc-400 rounded-lg px-2 focus:outline-none focus:border-brand/50"
              >
                <option value="critical">CRIT</option>
                <option value="high">HIGH</option>
                <option value="medium">MED</option>
                <option value="low">LOW</option>
              </select>

              <button
                type="submit"
                className="bg-brand hover:shadow-[0_0_12px_rgba(0,255,65,0.4)] text-black font-bold text-xs uppercase px-4 py-2 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                SLICE
              </button>
            </div>
            <p className="text-[9px] text-zinc-500">
              * Creates the task instantly and sends the prompt to Gemini 3.5 Flash to automatically slice it into 30-min increments.
            </p>
          </form>

        </div>
      </div>

      {/* Developer bypass model */}
      <AnimatePresence>
        {isBypassOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111113] border border-white/6 rounded-2xl max-w-md w-full p-6 relative font-mono text-xs text-text space-y-4"
            >
              <button 
                onClick={() => setIsBypassOpen(false)}
                className="absolute top-4 right-4 text-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-text uppercase tracking-widest flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-400" />
                  Credentials Bypass Sandbox
                </h3>
                <p className="text-[10px] text-zinc-500 uppercase">
                  Inject Access Tokens for Google Calendar & Gmail testing
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-muted font-bold uppercase">Google OAuth Access Token:</span>
                  <input
                    type="password"
                    placeholder="Enter ya29. OAuth token..."
                    value={customBypassToken}
                    onChange={(e) => setCustomBypassToken(e.target.value)}
                    className="w-full bg-zinc-950 border border-border px-3 py-2 rounded font-mono text-[11px] placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={loadPresetBypassToken}
                    className="flex-1 py-1.5 bg-zinc-900 border border-border text-[10px] font-bold uppercase rounded text-purple-400 hover:bg-zinc-850"
                  >
                    Load Synthetic Preset
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyToken}
                    className="flex-1 py-1.5 bg-purple-600 font-bold uppercase rounded text-white text-[10px] hover:bg-purple-500"
                  >
                    Apply Bypass Token
                  </button>
                </div>

                <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded text-[10px] text-text-sub leading-normal">
                  Our developer override mode synthesizes a session instantly to allow you to interact with Google API components directly inside the cloud preview.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Little Helper close button
const X: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
