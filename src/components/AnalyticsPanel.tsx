import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { TrendingUp, Flame, Shield, Clock, BarChart3, AlertCircle } from 'lucide-react';

interface AnalyticsPanelProps {
  stats: {
    completedCount: number;
    onTimeRate: number;
    streakDays: number;
    totalFocusMinutes: number;
  };
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ stats }) => {
  // Mock trend data for Recharts (highly aesthetic, matches premium dark layout)
  const chartData = [
    { name: 'Mon', completed: 2, focusMin: 45 },
    { name: 'Tue', completed: 4, focusMin: 90 },
    { name: 'Wed', completed: 3, focusMin: 60 },
    { name: 'Thu', completed: 5, focusMin: 120 },
    { name: 'Fri', completed: 4, focusMin: 80 },
    { name: 'Sat', completed: 6, focusMin: 150 },
    { name: 'Sun', completed: stats.completedCount % 7 || 3, focusMin: stats.totalFocusMinutes % 180 || 75 },
  ];

  // Dynamic calculated scores based on user stats
  const rescueRate = stats.onTimeRate; // e.g. 85%
  const productivityScore = Math.min(100, Math.round(stats.onTimeRate * 1.05));
  const burnoutScore = Math.max(15, Math.min(95, Math.round((stats.totalFocusMinutes / 600) * 100)));
  const timeSavedHrs = (stats.completedCount * 0.4).toFixed(1); // 24 mins saved per task breakdown/email template

  return (
    <div className="bg-[#111113] border border-white/6 rounded-[20px] p-6 relative overflow-hidden shadow-sm font-sans space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-brand/10 rounded-xl text-brand border border-brand/20">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-sans font-medium text-text text-base flex items-center gap-2">
            Operations Analytics & Insights
          </h3>
          <p className="text-xs text-text-sub font-light leading-relaxed mt-0.5">
            Real-time biometric productivity indices & performance scores
          </p>
        </div>
      </div>

      {/* Bento Grid Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Rescue Rate */}
        <div className="p-4 bg-zinc-950/40 border border-white/6 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-text-sub">Rescue Rate</span>
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2.5">
            <span className="block text-2xl font-bold font-mono text-white">{rescueRate}%</span>
            <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">✓ High Safeguard</span>
          </div>
        </div>

        {/* Metric 2: Productivity Score */}
        <div className="p-4 bg-zinc-950/40 border border-white/6 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-brand">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-text-sub">Productivity</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2.5">
            <span className="block text-2xl font-bold font-mono text-white">{productivityScore}</span>
            <span className="text-[10px] text-brand font-mono mt-0.5 block">Excellent Tempo</span>
          </div>
        </div>

        {/* Metric 3: Burnout Score */}
        <div className="p-4 bg-zinc-950/40 border border-white/6 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-text-sub">Burnout Level</span>
            <Flame className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2.5">
            <span className="block text-2xl font-bold font-mono text-white">{burnoutScore}%</span>
            <span className="text-[10px] text-amber-400 font-mono mt-0.5 block">Safe Operations</span>
          </div>
        </div>

        {/* Metric 4: Time Saved */}
        <div className="p-4 bg-zinc-950/40 border border-white/6 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-text-sub">Time Saved</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2.5">
            <span className="block text-2xl font-bold font-mono text-white">{timeSavedHrs}h</span>
            <span className="text-[10px] text-indigo-400 font-mono mt-0.5 block">Via AI Autocuts</span>
          </div>
        </div>

        {/* Metric 5: Weekly Completion */}
        <div className="p-4 bg-zinc-950/40 border border-white/6 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-text-sub font-bold">Completed</span>
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2.5">
            <span className="block text-2xl font-bold font-mono text-white">{stats.completedCount}</span>
            <span className="text-[10px] text-sky-400 font-mono mt-0.5 block">Deadlines cleared</span>
          </div>
        </div>

        {/* Metric 6: Upcoming Risk */}
        <div className="p-4 bg-zinc-950/40 border border-white/6 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-text-sub">Schedule Risk</span>
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2.5">
            <span className="block text-2xl font-bold font-mono text-white">LOW</span>
            <span className="text-[10px] text-red-400 font-mono mt-0.5 block">0 overlaps active</span>
          </div>
        </div>
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Weekly Completion Rate Area Chart */}
        <div className="p-5 bg-zinc-950/50 border border-white/6 rounded-xl space-y-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text font-mono">Weekly Task Accomplishment Rate</h4>
            <p className="text-[11px] text-text-sub font-light mt-0.5">Tasks successfully guarded & finalized</p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111113', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: 'var(--color-brand)', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="completed" stroke="var(--color-brand)" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Deep Focus Minutes Bar Chart */}
        <div className="p-5 bg-zinc-950/50 border border-white/6 rounded-xl space-y-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text font-mono">Focus Intensity Distribution</h4>
            <p className="text-[11px] text-text-sub font-light mt-0.5">Timeblock focus minutes allotted per day</p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111113', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#6366f1', fontSize: '11px' }}
                />
                <Bar dataKey="focusMin" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
