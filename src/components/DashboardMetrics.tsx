import React from 'react';
import { motion } from 'motion/react';
import { Task, Goal, Badge, UserStats } from '../types';
import { Flame, ShieldAlert, Zap, Hourglass, Trophy, CheckCircle2 } from 'lucide-react';

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
  const criticalCount = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length;
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
          whileHover={{ y: -2, boxShadow: '0 0 15px rgba(0,255,65,0.3)', borderColor: 'var(--color-brand)' }}
          className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between transition-all duration-300 font-sans relative"
        >
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand font-mono">LEVEL {stats.level} OPERATIVE</span>
              <div className="p-2 rounded-lg bg-brand/10 text-brand border border-brand/20">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-text font-display tracking-wide uppercase">PRODUCTIVITY_METRICS</h4>
            <p className="text-xs text-text-sub font-light">Your overall task mitigation tier.</p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-end">
              <span className="font-mono text-[10px] text-muted uppercase font-bold">XP Progress</span>
              <span className="font-mono text-xs text-brand font-bold">{stats.xp} / {nextLevelXp} XP</span>
            </div>
            
            <div className="h-2.5 w-full bg-zinc-950 rounded-sm overflow-hidden relative border border-border p-[1px]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-brand"
              />
            </div>
          </div>
        </motion.div>

        {/* Card 2: Streak & Habits Monitor */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -2, boxShadow: '0 0 15px rgba(0,255,65,0.3)', borderColor: 'var(--color-brand)' }}
          className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between transition-all duration-300 font-sans relative"
        >
          {/* Terminal Corners */}
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand font-mono">STREAK: {stats.streakDays} DAYS</span>
              <div className="p-2 rounded-lg bg-brand/10 text-brand border border-brand/20">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-text font-display tracking-wide uppercase">ACTIVE_AUTOPILOT</h4>
            <p className="text-xs text-text-sub font-light">Consistent high-tempo operations.</p>
          </div>

          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-1.5 xs:gap-2">
              <div className="bg-zinc-950 border border-border p-2 rounded text-center">
                <span className="block font-mono text-base font-bold text-text">{stats.streakDays}d</span>
                <span className="text-[9px] uppercase tracking-wider text-muted font-bold font-mono">Streak</span>
              </div>
              <div className="bg-zinc-950 border border-border p-2 rounded text-center">
                <span className="block font-mono text-base font-bold text-text">{stats.onTimeRate}%</span>
                <span className="text-[9px] uppercase tracking-wider text-muted font-bold font-mono">On-Time</span>
              </div>
              <div className="bg-zinc-950 border border-border p-2 rounded text-center">
                <span className="block font-mono text-base font-bold text-text">{completedTodayCount}</span>
                <span className="text-[9px] uppercase tracking-wider text-muted font-bold font-mono">Done</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Priority Sentinel (Deep Work Invitation) */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -2, boxShadow: '0 0 15px rgba(0,255,65,0.3)', borderColor: 'var(--color-brand)' }}
          onClick={onSelectPomodoro}
          className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between transition-all duration-300 font-sans cursor-pointer group relative"
        >
          {/* Terminal Corners */}
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand font-mono">POMODORO_RESCUE</span>
              <div className="p-2 rounded-lg bg-brand/10 text-brand border border-brand/20">
                <Hourglass className="w-4 h-4" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-text font-display tracking-wide uppercase">DEEP_FOCUS_ROOM</h4>
            <p className="text-xs text-text-sub font-light">Procrastination-busting focus room.</p>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between bg-brand/5 hover:bg-brand/10 border border-brand/20 p-2.5 rounded transition-all">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand animate-pulse" />
                <span className="text-xs font-bold text-brand uppercase font-mono">[START_FOCUS_BLOCK]</span>
              </div>
              <span className="font-mono text-xs text-brand group-hover:translate-x-1 transition-transform font-bold">➔</span>
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
