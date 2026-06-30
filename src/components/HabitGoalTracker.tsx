import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Goal } from '../types';
import { 
  Flame, Calendar, Plus, Trash2, CheckCircle2, Circle, Sparkles, 
  Activity, ArrowRight, RefreshCw, BarChart2, Star 
} from 'lucide-react';
import { CTAButton } from './ui/CTAButton';

interface HabitGoalTrackerProps {
  goals: Goal[];
  onUpdateGoal: (goal: Goal) => void;
  onAddGoal: (goal: Omit<Goal, 'id' | 'streak' | 'completedDates'>) => void;
  onDeleteGoal: (id: string) => void;
}

export const HabitGoalTracker: React.FC<HabitGoalTrackerProps> = ({
  goals,
  onUpdateGoal,
  onAddGoal,
  onDeleteGoal
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Productivity');
  const [newFrequency, setNewFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddGoal({
      title: newTitle,
      category: newCategory,
      targetFrequency: newFrequency,
      isHabit: true
    });

    setNewTitle('');
    setNewCategory('Productivity');
    setNewFrequency('daily');
    setIsAdding(false);
  };

  const handleToggleHabitCompletion = (goal: Goal) => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const completedIndex = goal.completedDates.indexOf(todayStr);
    
    let updatedDates = [...goal.completedDates];
    let updatedStreak = goal.streak;

    if (completedIndex >= 0) {
      // Remove completion today
      updatedDates.splice(completedIndex, 1);
      updatedStreak = Math.max(0, updatedStreak - 1);
    } else {
      // Complete today
      updatedDates.push(todayStr);
      updatedStreak += 1;
    }

    onUpdateGoal({
      ...goal,
      completedDates: updatedDates,
      streak: updatedStreak
    });
  };

  const handleToggleHabitActive = (goal: Goal) => {
    onUpdateGoal({
      ...goal,
      isHabit: !goal.isHabit
    });
  };

  const handleFrequencyChange = (goal: Goal, freq: 'daily' | 'weekly' | 'monthly') => {
    onUpdateGoal({
      ...goal,
      targetFrequency: freq
    });
  };

  // Helper to generate the last 7 days of dates for calendar logging visual representation
  const getLast7Days = () => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      days.push({
        dateStr: d.toISOString().substring(0, 10),
        dayName: d.toLocaleDateString([], { weekday: 'short' }),
        dayNum: d.getDate()
      });
    }
    return days;
  };

  const last7Days = getLast7Days();

  return (
    <div className="space-y-6">
      {/* Tracker Hero Banner Header */}
      <div className="bg-zinc-950/40 p-5 rounded-3xl border border-white/5 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div className="text-left">
            <h3 className="font-sans font-bold text-slate-100 text-lg flex items-center gap-2">
              Habit & Recurring Goal Tracker
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </h3>
            <p className="text-xs text-slate-400 font-light max-w-xl leading-relaxed">
              Maintain planning resilience. Mark recurrent deadlines as habits to establish streak rhythms (Daily, Weekly, Monthly) and offset emergency backlogs.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/10 transition-all self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Cancel' : 'Create Custom Habit'}
        </button>
      </div>

      {/* Adding form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateHabit}
            className="bg-zinc-950/60 border border-white/10 rounded-2xl p-5 space-y-4 overflow-hidden backdrop-blur-md shadow-2xl"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Star className="w-4 h-4 text-indigo-400" />
              Configure Habits & Recurrence
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Habit Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 30 Minutes Deep Focus Block"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Frequency Schedule</label>
                <select
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="daily">🔄 Daily Schedule</option>
                  <option value="weekly">📅 Weekly Cycle</option>
                  <option value="monthly">📆 Monthly Milestone</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Health, Career, Learning"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <CTAButton type="submit" variant="primary" size="sm" className="!bg-indigo-600 hover:!bg-indigo-500">
                Deploy Habit Monitor
              </CTAButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Grid List of Habits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const todayStr = new Date().toISOString().substring(0, 10);
          const completedToday = goal.completedDates.includes(todayStr);

          return (
            <motion.div
              key={goal.id}
              className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between gap-5 text-left ${
                goal.isHabit
                  ? 'bg-zinc-950/30 border-white/10 shadow-lg hover:border-indigo-500/30'
                  : 'bg-zinc-950/10 border-white/5 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-slate-400 tracking-wider">
                      {goal.category}
                    </span>
                    <h4 className="text-slate-100 font-bold text-sm tracking-tight pt-1">
                      {goal.title}
                    </h4>
                  </div>

                  {/* Active Habit Toggle Switch */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500">HABIT TRACK</span>
                    <button
                      onClick={() => handleToggleHabitActive(goal)}
                      className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        goal.isHabit ? 'bg-indigo-600' : 'bg-white/10'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          goal.isHabit ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Recurrence Period Switcher */}
                <div className="flex gap-1.5 bg-zinc-950/50 p-0.5 rounded-lg border border-white/5 w-fit">
                  {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => handleFrequencyChange(goal, freq)}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                        goal.targetFrequency === freq
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>

                {/* Last 7 Days completion logs */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] uppercase font-mono text-slate-500">History Logging Logs:</span>
                  <div className="flex justify-between bg-zinc-950/40 p-3 rounded-2xl border border-white/5">
                    {last7Days.map((day) => {
                      const completedOnDay = goal.completedDates.includes(day.dateStr);
                      return (
                        <div key={day.dateStr} className="flex flex-col items-center gap-1">
                          <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">{day.dayName}</span>
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold border transition-all ${
                              completedOnDay
                                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                                : 'bg-white/5 border-white/5 text-slate-500'
                            }`}
                            title={completedOnDay ? `Completed on ${day.dateStr}` : 'Not completed'}
                          >
                            {day.dayNum}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer Controls */}
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span className="font-mono text-xs text-slate-300 font-bold">{goal.streak} Day Streak</span>
                </div>

                <div className="flex items-center gap-2">
                  {goal.isHabit && (
                    <button
                      onClick={() => handleToggleHabitCompletion(goal)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all border ${
                        completedToday
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                      }`}
                    >
                      {completedToday ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                      {completedToday ? 'Completed Today' : 'Mark Done'}
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-1.5 rounded-xl border border-white/5 bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Delete goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
