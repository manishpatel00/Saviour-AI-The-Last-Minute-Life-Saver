import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types';
import { CTAButton } from './ui/CTAButton';
import { 
  Play, Pause, RotateCcw, Hourglass, Zap, Sparkles, Volume2, VolumeX, ShieldAlert 
} from 'lucide-react';

interface PomodoroRescueProps {
  tasks: Task[];
  onCompleteSession: (taskId: string, minutes: number) => void;
}

const COACH_QUOTES = [
  "Take a deep breath. Procrastination is just fear of starting. We are breaking this task down together.",
  "Let's focus strictly on the first 5 minutes. Do not worry about finishing the whole project right now.",
  "Your mind is silent, your goals are clear. You are building momentum with every ticking second.",
  "You've taken the hardest step — deciding to act. Keep pushing through the resistance.",
  "Perfect. Just you, your screen, and this simple workflow. You are completely secure.",
  "Excellent pacing. Let's finish this interval strong and claim your Streak XP!"
];

export const PomodoroRescue: React.FC<PomodoroRescueProps> = ({ tasks, onCompleteSession }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 minutes default
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [coachIndex, setCoachIndex] = useState<number>(0);
  const [coachMessage, setCoachMessage] = useState<string>(COACH_QUOTES[0]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeTask = tasks.find(t => t.id === selectedTaskId);

  // Set default active task on load
  useEffect(() => {
    const uncompletedTasks = tasks.filter(t => t.status !== 'completed');
    if (uncompletedTasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(uncompletedTasks[0].id);
    }
  }, [tasks, selectedTaskId]);

  // Audio Context Chime synthesizer (Ensuring non-blocking, lazy, clean setup)
  const playSynthesizerBell = (frequency: number, duration: number) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Beautiful retro FM/Sine bell chime shape
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context blocked by browser permission policy", e);
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer expired!
            handleTimerComplete();
            return 0;
          }
          
          // Random coach prompt every 5 minutes (or 300 seconds)
          if (prev % 180 === 0) {
            const nextIdx = (coachIndex + 1) % COACH_QUOTES.length;
            setCoachIndex(nextIdx);
            setCoachMessage(COACH_QUOTES[nextIdx]);
            playSynthesizerBell(587.33, 0.4); // soft D5 ping for coach alert
          }
          
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, coachIndex]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (sessionType === 'work') {
      playSynthesizerBell(880, 1.2); // high A5 chime
      playSynthesizerBell(1318.51, 1.5); // high E6 double harmony
      
      if (selectedTaskId) {
        onCompleteSession(selectedTaskId, 25);
      }
      
      // Transition to break
      setSessionType('break');
      setTimeLeft(5 * 60); // 5 minute break
      setCoachMessage("Phenomenal job. You've busted the delay loop. Relax your eyes and breathe deeply for 5 minutes.");
    } else {
      playSynthesizerBell(523.25, 1.0); // middle C5
      setSessionType('work');
      setTimeLeft(25 * 60);
      setCoachMessage("Focus interval initiated. Choose your task and take action.");
    }
  };

  const handleStartStop = () => {
    // Play warm tactile click sound on press
    playSynthesizerBell(isRunning ? 330 : 440, 0.08);
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    playSynthesizerBell(220, 0.1);
    setIsRunning(false);
    setTimeLeft(sessionType === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Radial progress calculations
  const totalDuration = sessionType === 'work' ? 25 * 60 : 5 * 60;
  const progressPercentage = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden font-sans">
      {/* Background radial gradient decoration */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none -z-10" />

      {/* Left side: Circular Timer Stage */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Outer Ring Circle */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="84"
              className="stroke-border fill-none"
              strokeWidth="6"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="84"
              className={`fill-none ${
                sessionType === 'work' ? 'stroke-brand' : 'stroke-success'
              }`}
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 84}
              strokeDashoffset={2 * Math.PI * 84 * (1 - progressPercentage / 100)}
              strokeLinecap="round"
              animate={{ strokeDashoffset: 2 * Math.PI * 84 * (1 - progressPercentage / 100) }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </svg>

          {/* Time digits & Mode */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-mono text-4xl font-extrabold tracking-tighter text-text">
              {formatTime(timeLeft)}
            </span>
            <span className={`text-[10px] uppercase font-bold tracking-widest mt-1.5 ${
              sessionType === 'work' ? 'text-brand' : 'text-success'
            }`}>
              {sessionType === 'work' ? '⚡ RESCUE MODE' : '🧘 BREAK MODE'}
            </span>
          </div>
        </div>

        {/* Tactile Timer Controllers */}
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl border border-border bg-zinc-900/50 text-text-sub hover:text-text transition-colors cursor-pointer"
            title={soundEnabled ? "Mute chimes" : "Unmute chimes"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <CTAButton
            onClick={handleStartStop}
            variant={isRunning ? 'secondary' : 'primary'}
            size="sm"
            icon={isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          >
            {isRunning ? 'Pause' : 'Start Rescue'}
          </CTAButton>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl border border-border bg-zinc-900/50 text-text-sub hover:text-text transition-colors cursor-pointer"
            title="Reset interval"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right side: Selected Task Focus and Coach */}
      <div className="flex-1 w-full space-y-4">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5 font-bold font-mono">Target Focus Lock</label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            disabled={isRunning}
            className="w-full bg-zinc-950 border border-border rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-brand/40 transition-colors disabled:opacity-60"
          >
            {tasks.filter(t => t.status !== 'completed').length === 0 ? (
              <option value="">No pending tasks available</option>
            ) : (
              tasks
                .filter(t => t.status !== 'completed')
                .map(t => (
                  <option key={t.id} value={t.id}>
                    [{t.category.toUpperCase()}] {t.title} (Urgency: {t.urgencyScore})
                  </option>
                ))
            )}
          </select>
        </div>

        {/* Locked task details indicator */}
        {activeTask && (
          <div className="bg-zinc-950 border border-border p-3.5 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-brand/10 rounded-lg text-brand">
              <Hourglass className="w-4 h-4 animate-spin" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-text truncate">{activeTask.title}</p>
              <p className="text-[10px] text-muted truncate mt-0.5">{activeTask.description || 'No description provided.'}</p>
            </div>
          </div>
        )}

        {/* Real-time Voice Coach Dialog Box */}
        <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-xl space-y-2 relative">
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-brand/10 px-1.5 py-0.5 rounded border border-brand/20">
            <Sparkles className="w-3 h-3 text-brand animate-pulse" />
            <span className="text-[9px] font-mono font-bold text-brand uppercase tracking-wider">AI COACH</span>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-full bg-brand/10 text-brand flex-shrink-0 mt-0.5">
              <Volume2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs text-text-sub leading-relaxed italic pr-12 font-medium">
                "{coachMessage}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
