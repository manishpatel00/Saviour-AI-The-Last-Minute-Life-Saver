import React from 'react';
import { motion } from 'motion/react';
import { Task, Goal, Badge, UserStats } from '../types';
import { Flame, ShieldAlert, Zap, Hourglass, Trophy } from 'lucide-react';

interface DashboardMetricsProps {
  tasks: Task[];
  goals: Goal[];
  badges: Badge[];
  stats: UserStats;
  onSelectPomodoro: () => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  tasks,
  goals,
  stats,
  onSelectPomodoro
}) => {
  const completedTodayCount = tasks.filter(t => t.status === 'completed').length;

  // Level up percentage helper
  const nextLevelXp = stats.level * 200;
  const xpPercentage = Math.min(100, Math.round((stats.xp / nextLevelXp) * 100));

  // Determine current active urgent task for a special glowing card
  const mostUrgentTask = tasks
    .filter(t => t.status !== 'completed')
    .reduce((prev, curr) => ((prev?.urgencyScore || 0) > (curr?.urgencyScore || 0) ? prev : curr), tasks[0]);

  const cardsContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  // Generate 7 days compliance dots based on streak count
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const complianceStreak = stats.streakDays;

  return (
    <div className="space-y-6">
      {/* Bento Layout Grid - 3 cards in a row on desktop */}
      <motion.div 
         variants={cardsContainerVariants}
         initial="hidden"
         animate="show"
         className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Card 1: Gamified Hero Profile (Level & XP) */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3, boxShadow: '0 0 20px rgba(0,255,65,0.25)', borderColor: 'var(--color-brand)' }}
          className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between transition-all duration-300 font-sans relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-brand/5 via-transparent to-transparent opacity-40 pointer-events-none" />
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand font-mono flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-brand rounded-full animate-ping" />
                LVL {stats.level} OPERATIVE
              </span>
              <div className="p-2 rounded-lg bg-brand/10 text-brand border border-brand/20 group-hover:scale-110 transition-transform">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-text font-display tracking-wide uppercase">PRODUCTIVITY_METRICS</h4>
            <p className="text-xs text-text-sub font-light">Your overall task mitigation and safeguard tier.</p>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-end">
              <span className="font-mono text-[9px] text-muted uppercase font-bold tracking-wider">Notched XP progress</span>
              <span className="font-mono text-xs text-brand font-bold">{stats.xp} / {nextLevelXp} XP</span>
            </div>
            
            {/* Cybernetic Segmented Progress Bar */}
            <div className="flex gap-1 h-3.5 items-center select-none">
              {Array.from({ length: 14 }).map((_, idx) => {
                const stepThreshold = (idx + 1) / 14 * 100;
                const isActive = xpPercentage >= stepThreshold;
                return (
                  <div
                    key={idx}
                    className={`h-full flex-1 border transition-all duration-500 rounded-sm ${
                      isActive 
                        ? 'bg-brand border-brand/40 shadow-[0_0_8px_rgba(0,255,65,0.3)]' 
                        : 'bg-zinc-950 border-border/60'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Card 2: Streak & Habits Monitor */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3, boxShadow: '0 0 20px rgba(0,255,65,0.25)', borderColor: 'var(--color-brand)' }}
          className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between transition-all duration-300 font-sans relative overflow-hidden group"
        >
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand font-mono flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-brand rounded-full" />
                STREAK: {complianceStreak} DAYS
              </span>
              <div className="p-2 rounded-lg bg-brand/10 text-brand border border-brand/20 group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-text font-display tracking-wide uppercase">ACTIVE_AUTOPILOT</h4>
            <p className="text-xs text-text-sub font-light">Consistent high-tempo scheduling operations.</p>
          </div>

          <div className="mt-4 space-y-4">
            {/* Row of Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-950 border border-border p-2 rounded text-center">
                <span className="block font-mono text-sm font-bold text-text">{stats.streakDays}d</span>
                <span className="text-[8px] uppercase tracking-wider text-muted font-bold font-mono">Streak</span>
              </div>
              <div className="bg-zinc-950 border border-border p-2 rounded text-center">
                <span className="block font-mono text-sm font-bold text-text">{stats.onTimeRate}%</span>
                <span className="text-[8px] uppercase tracking-wider text-muted font-bold font-mono">On-Time</span>
              </div>
              <div className="bg-zinc-950 border border-border p-2 rounded text-center">
                <span className="block font-mono text-sm font-bold text-text">{completedTodayCount}</span>
                <span className="text-[8px] uppercase tracking-wider text-muted font-bold font-mono">Done</span>
              </div>
            </div>

            {/* Weekly Active Compliance Grid Dots */}
            <div className="space-y-2 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-muted font-bold uppercase tracking-wider">Compliance Map:</span>
                <span className="text-[9px] text-brand/70 font-bold uppercase tracking-wider">Streak active</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-950/60 border border-border/40 p-2 rounded-lg">
                {daysOfWeek.map((day, idx) => {
                  // highlight day dots based on streak count
                  const isDayCompliant = complianceStreak > 0 && (idx < Math.min(7, complianceStreak));
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <span className="text-[8px] font-bold text-zinc-500">{day}</span>
                      <div 
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 relative ${
                          isDayCompliant 
                            ? 'bg-brand/20 border-brand text-brand shadow-[0_0_8px_rgba(0,255,65,0.4)]' 
                            : 'bg-zinc-900 border-border text-zinc-600'
                        }`}
                      >
                        {isDayCompliant && (
                          <span className="absolute inset-0 bg-brand rounded-full animate-ping opacity-25" />
                        )}
                        <span className="text-[7px] font-bold">{isDayCompliant ? '✓' : '·'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Priority Sentinel (Deep Work Invitation with waves visualization) */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3, boxShadow: '0 0 20px rgba(0,255,65,0.25)', borderColor: 'var(--color-brand)' }}
          onClick={onSelectPomodoro}
          className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between transition-all duration-300 font-sans cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent opacity-20 pointer-events-none" />
          {/* Terminal Corners */}
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand font-mono flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
                POMODORO_RESCUE
              </span>
              <div className="p-2 rounded-lg bg-brand/10 text-brand border border-brand/20 group-hover:scale-110 transition-transform">
                <Hourglass className="w-4 h-4 text-brand" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-text font-display tracking-wide uppercase">DEEP_FOCUS_ROOM</h4>
            <p className="text-xs text-text-sub font-light">Eradicate work procrastination in a distraction-free block.</p>
          </div>

          {/* Aesthetic Binaural Soundscape Equalizer Waves */}
          <div className="mt-4 flex items-center justify-between bg-zinc-950/80 border border-border/40 p-2.5 rounded-lg">
            <div className="flex items-center gap-2">
              {/* Equalizer lines */}
              <div className="flex items-end gap-0.5 h-4 select-none">
                <div className="w-0.5 h-2 bg-brand/60 animate-pulse" />
                <div className="w-0.5 h-3 bg-brand/80 animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-0.5 h-4 bg-brand animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-0.5 h-2.5 bg-brand/70 animate-bounce" style={{ animationDelay: '0.3s' }} />
                <div className="w-0.5 h-1 bg-brand/40 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
              <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider">Binaural Ambience</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono text-brand font-bold uppercase">[ACTIVATE]</span>
              <Zap className="w-3.5 h-3.5 text-brand group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Critical Sentinel Spotlight Alert (Only if there is an active urgent task) */}
      {mostUrgentTask && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className={`p-5 rounded-xl border border-crisis/40 bg-crisis/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden font-sans ${
            mostUrgentTask.urgencyScore >= 90 ? 'ring-pulse' : ''
          }`}
        >
          {/* Red Terminal Corners */}
          <div className="corner corner-tl !border-crisis" />
          <div className="corner corner-tr !border-crisis" />
          <div className="corner corner-bl !border-crisis" />
          <div className="corner corner-br !border-crisis" />

          <div className="flex items-start gap-4">
            <div className="p-3 rounded bg-crisis/10 text-crisis flex items-center justify-center animate-pulse border border-crisis/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap font-mono">
                <span className="text-[10px] uppercase font-bold text-crisis flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crisis opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-crisis"></span>
                  </span>
                  CRITICAL_ALERT
                </span>
                <span className="text-[10px] bg-crisis/10 text-crisis font-bold px-2 py-0.5 rounded border border-crisis/20">
                  URGENCY_SCORE: {mostUrgentTask.urgencyScore}
                </span>
              </div>
              <h4 className="font-display font-bold text-text text-base mt-2 tracking-wide uppercase">{mostUrgentTask.title}</h4>
              <p className="text-xs text-text-sub mt-1 max-w-xl leading-relaxed">
                DE Deadline: &lt; 04 HOURS. {mostUrgentTask.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 self-stretch sm:self-end md:self-center justify-between sm:justify-start font-mono">
            <span className="text-xs text-muted font-bold uppercase">Mitigation required</span>
            <button
              onClick={onSelectPomodoro}
              className="px-4 py-2 bg-crisis hover:shadow-[0_0_15px_#ff3e3e] text-black font-bold text-xs uppercase cursor-pointer transition-all rounded border border-crisis/30 w-full sm:w-auto text-center"
            >
              INITIATE_POMODORO
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
