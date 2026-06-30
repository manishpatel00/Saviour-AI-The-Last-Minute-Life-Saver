import React from 'react';
import { motion } from 'motion/react';
import { BentoGrid, BentoCard } from './ui/BentoGrid';
import { Task, Goal, Badge, UserStats } from '../types';
import { Flame, ShieldAlert, Zap, Hourglass, Trophy, Activity, CheckCircle2 } from 'lucide-react';

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
  badges,
  stats,
  onSelectPomodoro
}) => {
  const criticalCount = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedTodayCount = tasks.filter(t => t.status === 'completed').length;

  // Level up percentage helper
  const nextLevelXp = stats.level * 200;
  const xpPercentage = Math.min(100, Math.round((stats.xp / nextLevelXp) * 100));

  // Determine current active urgent task for a special glowing card
  const mostUrgentTask = tasks
    .filter(t => t.status !== 'completed')
    .reduce((prev, curr) => (prev.urgencyScore > curr.urgencyScore ? prev : curr), tasks[0]);

  return (
    <div className="space-y-6">
      {/* Bento Layout Grid */}
      <BentoGrid>
        {/* Card 1: Gamified Hero Profile (Level & XP) */}
        <BentoCard
          title={`LEVEL ${stats.level} AGENT`}
          description="Your overall productivity ranking"
          icon={<Trophy className="w-5 h-5 text-amber-400" />}
          iconBgColor="bg-amber-500/10 text-amber-400 animate-pulse"
          badge="PROACTOR"
        >
          <div className="mt-2 space-y-3">
            <div className="flex justify-between items-end">
              <span className="font-mono text-xs text-slate-400">XP Progress</span>
              <span className="font-mono text-xs text-amber-400 font-semibold">{stats.xp} / {nextLevelXp} XP</span>
            </div>
            
            {/* Custom high-tech progress bar */}
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 rounded-full"
              />
            </div>
            
            <p className="text-[11px] text-slate-400/80 leading-relaxed italic">
              "Earn XP by completing critical deadlines before they turn overdue."
            </p>
          </div>
        </BentoCard>

        {/* Card 2: Streak & Habits Monitor */}
        <BentoCard
          title={`${stats.streakDays}-DAY ACTIVE STREAK`}
          description="Consistent action tracker"
          icon={<Flame className="w-5 h-5 text-orange-500 animate-bounce" />}
          iconBgColor="bg-orange-500/10 text-orange-400"
          badge="HOT"
        >
          <div className="mt-2 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/[0.03] border border-white/5 p-2 rounded-xl text-center">
                <span className="block font-mono text-lg font-bold text-slate-100">{stats.streakDays}d</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500">Streak</span>
              </div>
              <div className="bg-white/[0.03] border border-white/5 p-2 rounded-xl text-center">
                <span className="block font-mono text-lg font-bold text-slate-100">{stats.onTimeRate}%</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500">On-Time</span>
              </div>
              <div className="bg-white/[0.03] border border-white/5 p-2 rounded-xl text-center">
                <span className="block font-mono text-lg font-bold text-slate-100">{completedTodayCount}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500">Done Today</span>
              </div>
            </div>

            {/* Habit micro list */}
            <div className="text-[11px] text-slate-400 space-y-1">
              {goals.slice(0, 2).map((goal) => (
                <div key={goal.id} className="flex items-center justify-between">
                  <span className="truncate max-w-[130px]">{goal.title}</span>
                  <span className="font-mono text-emerald-400 font-medium">🔥 {goal.streak} days</span>
                </div>
              ))}
            </div>
          </div>
        </BentoCard>

        {/* Card 3: Priority Sentinel (Critical Alerts & Deep Work Invitation) */}
        <BentoCard
          title="DEEP FOCUS TIMER"
          description="Pomodoro procrastination-buster"
          icon={<Hourglass className="w-5 h-5 text-blue-400" />}
          iconBgColor="bg-blue-500/10 text-blue-400"
          className="cursor-pointer group hover:bg-zinc-800/[0.25]"
        >
          <div className="mt-2 space-y-3" onClick={onSelectPomodoro}>
            <div className="flex items-center justify-between bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 p-2.5 rounded-xl transition-all">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-xs font-medium text-blue-300">Start 25m Focus Block</span>
              </div>
              <span className="font-mono text-xs text-blue-400 group-hover:translate-x-1 transition-transform">➔</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
              <div className="flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>{criticalCount} Overdue/Critical</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{stats.totalFocusMinutes} Focus Mins</span>
              </div>
            </div>
          </div>
        </BentoCard>
      </BentoGrid>

      {/* Critical Sentinel Spotlight Alert (Only if there is an active urgent task) */}
      {mostUrgentTask && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border border-rose-500/30 bg-rose-950/20 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden"
        >
          {/* Subtle Ambient Red Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 blur-3xl rounded-full pointer-events-none -z-10" />

          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-rose-400">Critical Priority Spotlight</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-200 font-mono px-1.5 py-0.5 rounded border border-rose-500/20">
                  Urgency Score: {mostUrgentTask.urgencyScore}
                </span>
              </div>
              <h4 className="font-sans font-bold text-slate-100 text-base mt-1">{mostUrgentTask.title}</h4>
              <p className="text-xs text-slate-300/80 mt-1 max-w-xl font-light">
                {mostUrgentTask.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-center">
            <span className="text-xs font-mono text-slate-400">Deadline expiring soon</span>
            <button
              onClick={onSelectPomodoro}
              className="px-4 py-2 bg-rose-950/50 hover:bg-rose-950/80 text-rose-300 hover:text-rose-200 border border-rose-500/30 rounded-full text-xs font-medium cursor-pointer transition-colors"
            >
              Rescue with Pomodoro
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
