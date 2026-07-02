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

  const getWeeks = () => {
    const weeks = [];
    const now = new Date();
    const currentDay = now.getDay();
    const startOfCurrentWeek = new Date(now);
    startOfCurrentWeek.setDate(now.getDate() - currentDay);
    
    for (let i = 3; i >= 0; i--) {
      const startOfWeek = new Date(startOfCurrentWeek);
      startOfWeek.setDate(startOfCurrentWeek.getDate() - i * 7);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const startStr = startOfWeek.toISOString().substring(0, 10);
      const endStr = endOfWeek.toISOString().substring(0, 10);
      
      weeks.push({
        label: i === 0 ? 'This Wk' : `Wk -${i}`,
        startStr,
        endStr,
        displayRange: `${startOfWeek.toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString([], { month: 'short', day: 'numeric' })}`
      });
    }
    return weeks;
  };

  const getMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: i === 0 ? 'This Mo' : d.toLocaleDateString([], { month: 'short' }),
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        displayLabel: d.toLocaleDateString([], { month: 'long', year: 'numeric' })
      });
    }
    return months;
  };

  const handleToggleHabitCompletion = (goal: Goal) => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const freq = goal.targetFrequency || 'daily';
    
    let updatedDates = [...goal.completedDates];
    let updatedStreak = goal.streak;

    if (freq === 'daily') {
      const completedIndex = goal.completedDates.indexOf(todayStr);
      if (completedIndex >= 0) {
        updatedDates.splice(completedIndex, 1);
        updatedStreak = Math.max(0, updatedStreak - 1);
      } else {
        updatedDates.push(todayStr);
        updatedStreak += 1;
      }
    } else if (freq === 'weekly') {
      const currentWeek = getWeeks().find(w => w.label === 'This Wk');
      const hasCompletedThisWeek = currentWeek ? goal.completedDates.some(d => d >= currentWeek.startStr && d <= currentWeek.endStr) : false;
      
      if (hasCompletedThisWeek) {
        if (currentWeek) {
          updatedDates = updatedDates.filter(d => !(d >= currentWeek.startStr && d <= currentWeek.endStr));
          updatedStreak = Math.max(0, updatedStreak - 1);
        }
      } else {
        updatedDates.push(todayStr);
        updatedStreak += 1;
      }
    } else if (freq === 'monthly') {
      const currentMonth = getMonths().find(m => m.monthNum === new Date().getMonth() && m.year === new Date().getFullYear());
      const hasCompletedThisMonth = currentMonth ? goal.completedDates.some(d => {
        const dateObj = new Date(d);
        return dateObj.getFullYear() === currentMonth.year && dateObj.getMonth() === currentMonth.monthNum;
      }) : false;
      
      if (hasCompletedThisMonth) {
        if (currentMonth) {
          updatedDates = updatedDates.filter(d => {
            const dateObj = new Date(d);
            return !(dateObj.getFullYear() === currentMonth.year && dateObj.getMonth() === currentMonth.monthNum);
          });
          updatedStreak = Math.max(0, updatedStreak - 1);
        }
      } else {
        updatedDates.push(todayStr);
        updatedStreak += 1;
      }
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
    <div className="space-y-6 font-sans">
      {/* Tracker Hero Banner Header */}
      <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full pointer-events-none" />
        
        <div className="flex items-start gap-3.5 z-10">
          <div className="p-3 bg-brand/10 rounded-2xl text-brand border border-brand/20 flex-shrink-0">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-bold text-text text-lg flex items-center gap-2">
              Habit & Recurring Goal Tracker
              <Sparkles className="w-4 h-4 text-brand animate-pulse" />
            </h3>
            <p className="text-xs text-text-sub font-light max-w-xl leading-relaxed mt-1">
              Maintain planning resilience. Mark recurrent deadlines as habits to establish streak rhythms (Daily, Weekly, Monthly) and offset emergency backlogs.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-brand hover:bg-indigo-500 text-black hover:text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/10 transition-all self-start md:self-center z-10"
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
            className="bg-surface border border-border rounded-2xl p-5 space-y-4 overflow-hidden shadow-2xl"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-2 font-mono">
              <Star className="w-4 h-4 text-brand" />
              Configure Habits & Recurrence
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-text-sub mb-1 font-mono font-bold">Habit Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 30 Minutes Deep Focus Block"
                  className="w-full bg-zinc-950 border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-brand/40"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-text-sub mb-1 font-mono font-bold">Frequency Schedule</label>
                <select
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-brand/40 cursor-pointer"
                >
                  <option value="daily">🔄 Daily Schedule</option>
                  <option value="weekly">📅 Weekly Cycle</option>
                  <option value="monthly">📆 Monthly Milestone</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-text-sub mb-1 font-mono font-bold">Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Health, Career, Learning"
                  className="w-full bg-zinc-950 border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-brand/40"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <CTAButton type="submit" variant="primary" size="sm">
                Deploy Habit Monitor
              </CTAButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Grid List of Habits */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const todayStr = new Date().toISOString().substring(0, 10);
          const freq = goal.targetFrequency || 'daily';
          
          let isCompletedForPeriod = false;
          if (freq === 'daily') {
            isCompletedForPeriod = goal.completedDates.includes(todayStr);
          } else if (freq === 'weekly') {
            const currentWeek = getWeeks().find(w => w.label === 'This Wk');
            isCompletedForPeriod = currentWeek ? goal.completedDates.some(d => d >= currentWeek.startStr && d <= currentWeek.endStr) : false;
          } else if (freq === 'monthly') {
            const currentMonth = getMonths().find(m => m.monthNum === new Date().getMonth() && m.year === new Date().getFullYear());
            isCompletedForPeriod = currentMonth ? goal.completedDates.some(d => {
              const dateObj = new Date(d);
              return dateObj.getFullYear() === currentMonth.year && dateObj.getMonth() === currentMonth.monthNum;
            }) : false;
          }

          return (
            <motion.div
              key={goal.id}
              className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between gap-5 text-left ${
                goal.isHabit
                  ? 'bg-surface border-border shadow-lg hover:border-brand/30'
                  : 'bg-surface/50 border-border/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded bg-zinc-900 border border-border text-[9px] font-mono text-text-sub tracking-wider font-bold">
                      {goal.category}
                    </span>
                    <h4 className="text-text font-bold text-sm tracking-tight pt-1">
                      {goal.title}
                    </h4>
                  </div>

                  {/* Active Habit Toggle Switch */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-muted font-mono">HABIT TRACK</span>
                    <button
                      onClick={() => handleToggleHabitActive(goal)}
                      className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        goal.isHabit ? 'bg-brand' : 'bg-zinc-800'
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
                <div className="flex gap-1.5 bg-zinc-950 p-0.5 rounded-lg border border-border w-fit">
                  {(['daily', 'weekly', 'monthly'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => handleFrequencyChange(goal, f)}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                        freq === f
                          ? 'bg-brand/20 text-brand'
                          : 'text-muted hover:text-text-sub'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Dynamic period completion logs */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] uppercase font-mono text-muted font-bold">
                    {freq === 'daily' ? 'Last 7 Days:' : freq === 'weekly' ? 'Last 4 Weeks:' : 'Last 4 Months:'}
                  </span>
                  
                  <div className="flex justify-between bg-zinc-950 p-3 rounded-2xl border border-border">
                    {freq === 'daily' && last7Days.map((day) => {
                      const completedOnDay = goal.completedDates.includes(day.dateStr);
                      return (
                        <div key={day.dateStr} className="flex flex-col items-center gap-1">
                          <span className="text-[9px] text-muted font-mono font-bold uppercase">{day.dayName}</span>
                          <button
                            type="button"
                            onClick={() => {
                              let updatedDates = [...goal.completedDates];
                              const idx = updatedDates.indexOf(day.dateStr);
                              let updatedStreak = goal.streak;
                              if (idx >= 0) {
                                updatedDates.splice(idx, 1);
                                updatedStreak = Math.max(0, updatedStreak - 1);
                              } else {
                                updatedDates.push(day.dateStr);
                                updatedStreak += 1;
                              }
                              onUpdateGoal({ ...goal, completedDates: updatedDates, streak: updatedStreak });
                            }}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold border transition-all cursor-pointer ${
                              completedOnDay
                                ? 'bg-brand/20 border-brand/40 text-brand hover:bg-brand/30'
                                : 'bg-zinc-900 border-border text-muted hover:border-zinc-700'
                            }`}
                            title={completedOnDay ? `Completed on ${day.dateStr}. Click to toggle.` : `Not completed. Click to toggle.`}
                          >
                            {day.dayNum}
                          </button>
                        </div>
                      );
                    })}

                    {freq === 'weekly' && getWeeks().map((wk) => {
                      const completedInWeek = goal.completedDates.some(d => d >= wk.startStr && d <= wk.endStr);
                      return (
                        <div key={wk.label} className="flex flex-col items-center gap-1 flex-1">
                          <span className="text-[9px] text-muted font-mono font-bold uppercase">{wk.label}</span>
                          <button
                            type="button"
                            onClick={() => {
                              let updatedDates = [...goal.completedDates];
                              let updatedStreak = goal.streak;
                              if (completedInWeek) {
                                updatedDates = updatedDates.filter(d => !(d >= wk.startStr && d <= wk.endStr));
                                updatedStreak = Math.max(0, updatedStreak - 1);
                              } else {
                                updatedDates.push(wk.startStr);
                                updatedStreak += 1;
                              }
                              onUpdateGoal({ ...goal, completedDates: updatedDates, streak: updatedStreak });
                            }}
                            className={`w-[90%] h-6 rounded-lg flex items-center justify-center font-mono text-[9px] font-bold border transition-all cursor-pointer ${
                              completedInWeek
                                ? 'bg-brand/20 border-brand/40 text-brand hover:bg-brand/30'
                                : 'bg-zinc-900 border-border text-muted hover:border-zinc-700'
                            }`}
                            title={`Range: ${wk.displayRange}. Click to toggle.`}
                          >
                            ✓
                          </button>
                        </div>
                      );
                    })}

                    {freq === 'monthly' && getMonths().map((mo) => {
                      const completedInMonth = goal.completedDates.some(d => {
                        const dateObj = new Date(d);
                        return dateObj.getFullYear() === mo.year && dateObj.getMonth() === mo.monthNum;
                      });
                      return (
                        <div key={mo.displayLabel} className="flex flex-col items-center gap-1 flex-1">
                          <span className="text-[9px] text-muted font-mono font-bold uppercase">{mo.label}</span>
                          <button
                            type="button"
                            onClick={() => {
                              let updatedDates = [...goal.completedDates];
                              let updatedStreak = goal.streak;
                              if (completedInMonth) {
                                updatedDates = updatedDates.filter(d => {
                                  const dateObj = new Date(d);
                                  return !(dateObj.getFullYear() === mo.year && dateObj.getMonth() === mo.monthNum);
                                });
                                updatedStreak = Math.max(0, updatedStreak - 1);
                              } else {
                                const placeholderDate = `${mo.year}-${String(mo.monthNum + 1).padStart(2, '0')}-01`;
                                updatedDates.push(placeholderDate);
                                updatedStreak += 1;
                              }
                              onUpdateGoal({ ...goal, completedDates: updatedDates, streak: updatedStreak });
                            }}
                            className={`w-[90%] h-6 rounded-lg flex items-center justify-center font-mono text-[9px] font-bold border transition-all cursor-pointer ${
                              completedInMonth
                                ? 'bg-brand/20 border-brand/40 text-brand hover:bg-brand/30'
                                : 'bg-zinc-900 border-border text-muted hover:border-zinc-700'
                            }`}
                            title={`Month: ${mo.displayLabel}. Click to toggle.`}
                          >
                            ✓
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer Controls */}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span className="font-mono text-xs text-text-sub font-bold">{goal.streak} Day Streak</span>
                </div>

                <div className="flex items-center gap-2">
                  {goal.isHabit && (
                    <button
                      onClick={() => handleToggleHabitCompletion(goal)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all border ${
                        isCompletedForPeriod
                          ? 'bg-success/10 border-success/20 text-success hover:bg-success/20'
                          : 'bg-brand hover:bg-indigo-500 text-black hover:text-white border-transparent'
                      }`}
                    >
                      {isCompletedForPeriod ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                      {isCompletedForPeriod ? 'Completed' : 'Mark Done'}
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-1.5 rounded-xl border border-border bg-zinc-900/50 text-muted hover:text-crisis hover:bg-crisis/10 transition-colors cursor-pointer"
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
