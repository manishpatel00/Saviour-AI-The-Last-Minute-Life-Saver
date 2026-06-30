import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Task } from '../types';
import { CalendarEvent, CALENDAR_EVENTS } from '../data';
import { Calendar, Clock, AlertTriangle, Check, RefreshCw, Zap } from 'lucide-react';
import { CTAButton } from './ui/CTAButton';

interface SchedulerViewProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onAutoSchedule: () => Promise<void>;
}

export const SchedulerView: React.FC<SchedulerViewProps> = ({
  tasks,
  onUpdateTask,
  onAutoSchedule
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(0); // 0 = Today, 1 = Tomorrow
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);

  // Generate date reference
  const getRefDate = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d;
  };

  const refDate = getRefDate(selectedDay);
  const dateString = refDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  // Filter events and tasks for the active date range
  const dailyEvents = CALENDAR_EVENTS.filter(event => {
    const startObj = new Date(event.start);
    return startObj.getDate() === refDate.getDate() && startObj.getMonth() === refDate.getMonth();
  });

  const dailyTasks = tasks.filter(task => {
    const dueObj = new Date(task.dueDate);
    return dueObj.getDate() === refDate.getDate() && dueObj.getMonth() === refDate.getMonth() && task.status !== 'completed';
  });

  // Simple overlap check helper (Static simulation for deep UX)
  // Check if a task's due date is near a meeting window
  const getConflicts = () => {
    const conflicts: Array<{ task: Task; event: CalendarEvent; description: string }> = [];
    
    dailyTasks.forEach(task => {
      const taskDueTime = new Date(task.dueDate).getTime();
      
      dailyEvents.forEach(event => {
        const eventStart = new Date(event.start).getTime();
        const eventEnd = new Date(event.end).getTime();
        
        // If task is due during the event, or within 1 hour before/after
        const isConflict = (taskDueTime >= eventStart - 1800000 && taskDueTime <= eventEnd + 1800000);
        
        if (isConflict) {
          conflicts.push({
            task,
            event,
            description: `❗ "${task.title}" is due right around your meeting "${event.title}". You will have no buffer to complete it!`
          });
        }
      });
    });
    
    return conflicts;
  };

  const conflicts = getConflicts();

  const handleResolveConflict = async () => {
    setIsRescheduling(true);
    await onAutoSchedule();
    setIsRescheduling(false);
  };

  return (
    <div className="bg-zinc-950/40 border border-white/5 backdrop-blur-md rounded-2xl p-5 space-y-5 relative overflow-hidden">
      {/* Top action header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-slate-100 text-sm tracking-tight">AI calendar & Timeblock</h3>
            <p className="text-xs text-slate-500 mt-0.5">Integrate tasks with core daily appointments</p>
          </div>
        </div>

        {/* Day switch sliders */}
        <div className="flex items-center gap-1.5 self-end md:self-center bg-white/5 border border-white/5 p-1 rounded-full">
          <button
            onClick={() => setSelectedDay(0)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
              selectedDay === 0 ? 'bg-zinc-950 text-purple-400 border border-purple-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDay(1)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
              selectedDay === 1 ? 'bg-zinc-950 text-purple-400 border border-purple-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tomorrow
          </button>
        </div>
      </div>

      {/* Conflicts warning alert banner */}
      {conflicts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/20 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-2 text-amber-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-bounce" />
            <div>
              <span className="font-bold uppercase tracking-wider block text-[10px]">Overlapping Deadline Threat Detected</span>
              <p className="mt-0.5 text-amber-200/90 font-light">{conflicts[0].description}</p>
            </div>
          </div>
          <button
            onClick={handleResolveConflict}
            disabled={isRescheduling}
            className="px-3.5 py-1.5 self-end md:self-center bg-amber-500 text-zinc-950 hover:bg-amber-400 rounded-full font-bold tracking-wide text-[10px] cursor-pointer transition-colors flex items-center gap-1.5"
          >
            {isRescheduling ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5" />
            )}
            {isRescheduling ? 'AI Rescheduling...' : 'Resolve with AI'}
          </button>
        </motion.div>
      )}

      {/* 24-Hour Timeline visualizer */}
      <div className="space-y-3">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">
          Timeline — {dateString}
        </span>

        <div className="border border-white/5 bg-zinc-950/20 rounded-xl divide-y divide-white/5">
          {/* Morning Row */}
          <div className="p-3.5 flex items-start gap-4">
            <span className="font-mono text-xs text-slate-500 w-12 pt-1 flex-shrink-0">09:00</span>
            <div className="flex-1 space-y-2">
              <div className="bg-blue-500/5 border border-blue-500/10 p-2 rounded-lg">
                <span className="font-mono text-[9px] text-blue-400 uppercase tracking-wider block">Meeting block</span>
                <span className="text-xs font-semibold text-slate-200">Daily Standup Alignment</span>
              </div>
            </div>
          </div>

          {/* Midday Row */}
          <div className="p-3.5 flex items-start gap-4">
            <span className="font-mono text-xs text-slate-500 w-12 pt-1 flex-shrink-0">12:00</span>
            <div className="flex-1 space-y-2">
              {dailyEvents.find(e => new Date(e.start).getHours() === 12) ? (
                <div className="bg-blue-500/5 border border-blue-500/10 p-2 rounded-lg">
                  <span className="font-mono text-[9px] text-blue-400 uppercase tracking-wider block">Meeting block</span>
                  <span className="text-xs font-semibold text-slate-200">Lunch & Project Regroup</span>
                </div>
              ) : (
                <span className="text-xs text-slate-600 italic block pt-1">No appointments</span>
              )}
            </div>
          </div>

          {/* Afternoon Row */}
          <div className="p-3.5 flex items-start gap-4">
            <span className="font-mono text-xs text-slate-500 w-12 pt-1 flex-shrink-0">15:00</span>
            <div className="flex-1 space-y-2">
              {dailyTasks.length > 0 ? (
                dailyTasks.map(task => (
                  <div key={task.id} className="bg-purple-500/5 border border-purple-500/15 p-2.5 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[9px] text-purple-400 uppercase tracking-wider block">Target deadline</span>
                      <span className="text-xs font-semibold text-slate-200">{task.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-rose-400 font-semibold bg-rose-500/10 px-1.5 py-0.5 rounded">
                      Exp. Score: {task.urgencyScore}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-600 italic block pt-1">No scheduled task deadlines</span>
              )}
            </div>
          </div>

          {/* Evening Row */}
          <div className="p-3.5 flex items-start gap-4">
            <span className="font-mono text-xs text-slate-500 w-12 pt-1 flex-shrink-0">18:00</span>
            <div className="flex-1 space-y-2">
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-lg">
                <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-wider block">Personal block</span>
                <span className="text-xs font-semibold text-slate-200">Gym workout & Decompress</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
