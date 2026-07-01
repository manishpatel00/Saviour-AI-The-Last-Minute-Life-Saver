import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { CTAButton } from './ui/CTAButton';
import { 
  AlertOctagon, CheckCircle2, Circle, Clock, Plus, Trash2, ChevronDown, 
  ChevronUp, Sparkles, RefreshCw, Layers, Calendar, Mail, Search, X, Check
} from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'urgencyScore'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onMitigateTask: (taskId: string, type: 'extension_request' | 'action_plan' | 'reschedule') => Promise<void>;
  onBreakdownTask: (taskId: string) => Promise<void>;
  accessToken: string | null;
  onSyncToCalendar: (task: Task) => Promise<void>;
  onSaveGmailDraft: (task: Task, bodyText: string) => Promise<void>;
  onShowOnboarding?: () => void;
  onSendEmailReminder: (task: Task, checklistItems: string[]) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onMitigateTask,
  onBreakdownTask,
  onSyncToCalendar,
  onSaveGmailDraft,
  onShowOnboarding,
  onSendEmailReminder
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State for creating a task
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newCategory, setNewCategory] = useState('Work');
  const [newDueDate, setNewDueDate] = useState('');
  const [newEstMin, setNewEstMin] = useState(30);

  // Dynamic status/loading states for AI actions
  const [aiLoadingTaskId, setAiLoadingTaskId] = useState<string | null>(null);
  const [triageModeActive, setTriageModeActive] = useState(false);
  const [triageLoadingTaskId, setTriageLoadingTaskId] = useState<string | null>(null);

  const handleTriageDiagnostic = async (task: Task) => {
    setTriageLoadingTaskId(task.id);
    try {
      const res = await fetch('/api/gemini/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          category: task.category,
          dueDate: task.dueDate
        })
      });
      const data = await res.json();
      if (data) {
        onUpdateTask({
          ...task,
          triageData: {
            severity: data.severity || 'critical',
            recoveryPlan: data.recoveryPlan || [],
            damageControlEmail: data.damageControlEmail || '',
            recoveryMindset: data.recoveryMindset || "Take a deep breath. Clear the noise."
          }
        });
      }
    } catch (err) {
      console.error(err);
      alert('Triage diagnostic failed. Please check that the server is active.');
    } finally {
      setTriageLoadingTaskId(null);
    }
  };

  // Sorting/Filtering logic
  const filteredTasks = tasks
    .filter(task => {
      const matchPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchPriority && matchStatus && matchSearch;
    })
    .sort((a, b) => b.urgencyScore - a.urgencyScore);

  const handleToggleSubtask = (task: Task, subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    
    let updatedStatus = task.status;
    if (updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed)) {
      updatedStatus = 'completed';
    }

    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks,
      status: updatedStatus
    });
  };

  const handleToggleTaskStatus = (task: Task) => {
    const nextStatusMap: Record<TaskStatus, TaskStatus> = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'pending'
    };
    const newStatus = nextStatusMap[task.status];
    
    onUpdateTask({
      ...task,
      status: newStatus,
      subtasks: task.subtasks.map(st => ({
        ...st,
        completed: newStatus === 'completed' ? true : st.completed
      }))
    });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDueDate) return;

    onAddTask({
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      status: 'pending',
      category: newCategory,
      dueDate: new Date(newDueDate).toISOString(),
      estimatedMinutes: Number(newEstMin) || 30,
      actualMinutes: 0,
      subtasks: []
    });

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewDueDate('');
    setNewPriority('medium');
    setNewCategory('Work');
    setNewEstMin(30);
    setIsAdding(false);
  };

  const handleAIAction = async (taskId: string, actionType: 'breakdown' | 'mitigate', mitigationType?: 'extension_request' | 'action_plan' | 'reschedule') => {
    setAiLoadingTaskId(taskId);
    try {
      if (actionType === 'breakdown') {
        await onBreakdownTask(taskId);
      } else if (actionType === 'mitigate' && mitigationType) {
        await onMitigateTask(taskId, mitigationType);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoadingTaskId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Onboarding Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface border border-border p-4 rounded-2xl font-sans">
        <span className="text-xs text-text-sub font-light flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse flex-shrink-0" />
          First time? Learn how your autonomous coordinator safeguards deliverables.
        </span>
        <button
          onClick={onShowOnboarding}
          className="px-4 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-indigo-300 hover:text-indigo-200 text-xs font-semibold rounded-full cursor-pointer transition-colors"
        >
          📖 Run Interactive Onboarding
        </button>
      </div>

      {/* Advanced Search & Filter Controls */}
      <div className="bg-surface p-5 rounded-2xl border border-border space-y-4 font-sans">
        {/* Search & Main Header Row */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search code bases, categories, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/55 border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-text placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Crisis Toggle Button */}
            <button
              type="button"
              onClick={() => setTriageModeActive(!triageModeActive)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide flex items-center gap-2 transition-all cursor-pointer border ${
                triageModeActive
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:bg-red-500/20'
                  : 'bg-zinc-900/50 border-border text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <AlertOctagon className={`w-3.5 h-3.5 ${triageModeActive ? 'animate-bounce text-red-400' : 'text-zinc-500'}`} />
              <span>Crisis Triage: {triageModeActive ? 'ON' : 'OFF'}</span>
            </button>

            <CTAButton
              onClick={() => setIsAdding(true)}
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
            >
              New Task
            </CTAButton>
          </div>
        </div>

        {/* Filter Chip Strips */}
        <div className="flex flex-col gap-3 pt-2 border-t border-border/50">
          {/* Priority Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 w-20">Priority:</span>
            <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['all', 'critical', 'high', 'medium', 'low'].map((p) => {
                const isActive = filterPriority === p;
                return (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors border ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-600/10'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 w-20">Status:</span>
            <div className="flex flex-wrap gap-1.5 overflow-x-auto">
              {[
                { key: 'all', label: 'All' },
                { key: 'pending', label: 'Pending' },
                { key: 'in_progress', label: 'In Progress' },
                { key: 'completed', label: 'Completed' }
              ].map((s) => {
                const isActive = filterStatus === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setFilterStatus(s.key)}
                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors border ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-600/10'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Crisis Mode Active Banner */}
      <AnimatePresence>
        {triageModeActive && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-red-500/5 border border-red-500/15 rounded-2xl p-4 flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.03)] font-sans text-left"
          >
            <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-red-400 uppercase tracking-widest">🚨 Emergency Crisis Triage Active</p>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                Expand any delayed, high-threat, or critical tasks below to trigger the <strong>Deep Crisis Diagnostic</strong>. Saviour AI will run impact assessments, formulate apologies, and generate dynamic recovery plans.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="border border-dashed border-border/80 bg-surface/30 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 font-sans"
          >
            <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400">
              <Layers className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-text">No deadlines found</h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                Add a task or clear filters to see your productivity timeline.
              </p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-semibold cursor-pointer transition-colors"
            >
              Add First Task
            </button>
          </motion.div>
        ) : (
          filteredTasks.map((task) => {
            const isExpanded = expandedTaskId === task.id;
            const subtaskCompletedCount = task.subtasks.filter(st => st.completed).length;
            const progressPct = task.subtasks.length > 0 
              ? Math.round((subtaskCompletedCount / task.subtasks.length) * 100)
              : task.status === 'completed' ? 100 : 0;

            const dueObj = new Date(task.dueDate);
            const isOverdue = dueObj.getTime() < Date.now() && task.status !== 'completed';
            const formattedDate = dueObj.toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            // Action: render specific task shimmer skeleton loader when background generating
            if (aiLoadingTaskId === task.id) {
              return (
                <div 
                  key={task.id} 
                  className="skeleton-shimmer h-[96px] w-full bg-zinc-900/60 rounded-2xl relative border border-border overflow-hidden" 
                />
              );
            }

            return (
              <div 
                key={task.id}
                className={`bg-surface border rounded-2xl overflow-hidden transition-all duration-300 font-sans text-left ${
                  task.priority === 'critical' && task.status !== 'completed'
                    ? 'border-red-500/25 shadow-md shadow-red-950/5'
                    : isExpanded
                      ? 'border-border shadow-lg shadow-black/10'
                      : 'border-border/60 hover:border-border'
                }`}
              >
                {/* Primary Card View (Row Clickable) */}
                <div 
                  onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Urgency/Priority Pulse Dot Indicator */}
                    <div className="mt-1 flex-shrink-0">
                      {task.priority === 'critical' && task.status !== 'completed' ? (
                        <div className="relative w-3.5 h-3.5 flex items-center justify-center">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 animate-ping opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </div>
                      ) : (
                        <span className={`block w-2.5 h-2.5 rounded-full ${
                          task.priority === 'high' 
                            ? 'bg-amber-500' 
                            : task.priority === 'medium' 
                              ? 'bg-indigo-500' 
                              : 'bg-zinc-600'
                        }`} />
                      )}
                    </div>

                    {/* Left Meta text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm font-semibold truncate ${task.status === 'completed' ? 'text-zinc-500 line-through font-normal' : 'text-text'}`}>
                          {task.title}
                        </h4>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1 max-w-xl font-light">
                          {task.description}
                        </p>
                      )}

                      {/* Info Chips list */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        <span className="bg-zinc-950/40 border border-border/40 text-[9px] font-bold uppercase tracking-widest text-zinc-400 px-2 py-0.5 rounded-lg">
                          {task.category}
                        </span>
                        
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-lg border uppercase ${
                          task.priority === 'critical' 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : task.priority === 'high' 
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                              : task.priority === 'medium'
                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-800'
                        }`}>
                          {task.priority}
                        </span>

                        <span className="bg-zinc-950/40 border border-border/40 text-[9px] font-mono text-zinc-400 px-2 py-0.5 rounded-lg">
                          Score: {task.urgencyScore}
                        </span>

                        {task.subtasks.length > 0 && (
                          <span className="bg-indigo-950/10 border border-indigo-500/20 text-[9px] font-mono text-indigo-400 px-2 py-0.5 rounded-lg">
                            {subtaskCompletedCount}/{task.subtasks.length} subtasks
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side info & Top Level buttons */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 w-full sm:w-auto border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0 self-stretch sm:self-auto">
                    {/* Status Badge in Corner */}
                    <span className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full uppercase border ${
                      task.status === 'completed'
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/20'
                        : task.status === 'in_progress'
                          ? 'bg-indigo-950/50 text-indigo-300 border-indigo-500/20'
                          : isOverdue
                            ? 'bg-red-950/50 text-red-300 border-red-500/20'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}>
                      {task.status === 'completed' 
                        ? 'Completed' 
                        : task.status === 'in_progress'
                          ? 'In Progress'
                          : isOverdue
                            ? 'Overdue'
                            : 'Pending'
                      }
                    </span>

                    {/* Minimal Inline Action Trigger buttons */}
                    <div className="flex items-center gap-1.5 mt-1">
                      {/* Check toggler */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTaskStatus(task);
                        }}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                          task.status === 'completed'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-zinc-900/50 border-border text-zinc-400 hover:bg-zinc-800'
                        }`}
                        title="Toggle task completion status"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Trigger */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(task.id);
                        }}
                        className="w-7 h-7 rounded-lg border border-border bg-zinc-900/50 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 hover:border-red-500/20 transition-colors cursor-pointer flex items-center justify-center"
                        title="Delete this deadline"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Collapse/Expand indicator */}
                      <div className="text-zinc-500 w-5 h-5 flex items-center justify-center ml-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtasks inline preview if collapsed */}
                {!isExpanded && task.subtasks.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden max-w-md">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                )}

                {/* Expanded Details Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-border/60 bg-zinc-950/20 p-5 space-y-5"
                    >
                      {/* Subtask milestones Checklist */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-zinc-500" />
                            Milestone Breakdowns
                          </span>
                          <span className="font-mono text-xs text-indigo-400 font-semibold">{progressPct}% Complete</span>
                        </div>

                        {task.subtasks.length === 0 ? (
                          <div className="text-xs text-zinc-500 italic py-2">
                            No milestone breakdowns available. Click "Autocut Milestones" to let AI split the workload!
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            {task.subtasks.map((st) => (
                              <div
                                key={st.id}
                                onClick={() => handleToggleSubtask(task, st.id)}
                                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                                  st.completed
                                    ? 'bg-emerald-950/10 border-emerald-500/25 text-zinc-400 line-through'
                                    : 'bg-zinc-900/40 border-border/80 hover:border-border text-zinc-200'
                                }`}
                              >
                                {st.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                                )}
                                <span className="truncate text-xs">{st.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Emergency Deep Crisis Module */}
                      {triageModeActive && (
                        <div className="border-t border-border/80 pt-4 space-y-4">
                          <div className="p-4 bg-red-950/5 border border-red-500/15 rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                                <AlertOctagon className="w-4 h-4 text-red-500 animate-pulse" />
                                Deep Crisis Triage Assessment
                              </span>
                              <span className="px-2 py-0.5 rounded bg-red-500/10 text-[9px] font-mono font-bold text-red-400 tracking-wider">
                                STAKEHOLDER SHIELD
                              </span>
                            </div>

                            <p className="text-xs text-zinc-400 leading-relaxed font-light">
                              Evaluate severity, establish immediate recovery strategies, generate apology messages, and reset emotional friction.
                            </p>

                            <button
                              type="button"
                              disabled={triageLoadingTaskId !== null}
                              onClick={() => handleTriageDiagnostic(task)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                              {triageLoadingTaskId === task.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                              ) : (
                                <AlertOctagon className="w-3.5 h-3.5 text-white" />
                              )}
                              <span>{triageLoadingTaskId === task.id ? 'Analyzing crisis...' : 'Run Crisis Triage'}</span>
                            </button>

                            {/* Render Triage Diagnostic Outputs */}
                            {task.triageData && (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4 pt-4 border-t border-red-500/15 text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] uppercase font-mono text-zinc-500">Threat Severity:</span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                    task.triageData.severity === 'critical'
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                                  }`}>
                                    ● {task.triageData.severity}
                                  </span>
                                </div>

                                <div className="p-3 bg-zinc-950 border border-border rounded-xl text-xs italic text-zinc-300 relative font-light font-serif">
                                  <span className="absolute top-1 left-2 text-xl text-zinc-600 leading-none">“</span>
                                  <p className="pl-4 pr-2">{task.triageData.recoveryMindset}</p>
                                </div>

                                <div className="space-y-2">
                                  <span className="text-[10px] uppercase font-mono text-zinc-500 block">Immediate Actions:</span>
                                  <div className="space-y-1.5">
                                    {task.triageData.recoveryPlan.slice(0, 3).map((step, idx) => (
                                      <div key={idx} className="flex gap-2.5 items-start p-2.5 rounded-xl bg-zinc-900/20 border border-border">
                                        <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center font-mono font-bold text-[10px] text-red-400 flex-shrink-0">
                                          {idx + 1}
                                        </div>
                                        <p className="text-xs text-zinc-300 font-light leading-relaxed">{step}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-mono text-zinc-500">Apology Message draft:</span>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => onSaveGmailDraft(task, task.triageData?.damageControlEmail || '')}
                                        className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer text-[9px]"
                                      >
                                        [Gmail Draft]
                                      </button>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(task.triageData?.damageControlEmail || '');
                                          alert('Apology draft copied!');
                                        }}
                                        className="text-zinc-400 hover:text-zinc-200 font-bold transition-colors cursor-pointer text-[9px]"
                                      >
                                        [Copy]
                                      </button>
                                    </div>
                                  </div>
                                  <div className="p-3 bg-zinc-950 border border-border rounded-xl text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto text-left">
                                    {task.triageData.damageControlEmail}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Autonomous Operations Actions Bar */}
                      <div className="border-t border-border/80 pt-4 space-y-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          Autonomous Safeguard Actions
                        </span>

                        {/* Action buttons list (mobile scrolls) */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                          <CTAButton
                            variant="secondary"
                            size="sm"
                            disabled={aiLoadingTaskId !== null}
                            onClick={() => handleAIAction(task.id, 'breakdown')}
                            icon={
                              aiLoadingTaskId === task.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                              ) : (
                                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                              )
                            }
                          >
                            Autocut Milestones
                          </CTAButton>

                          <CTAButton
                            variant="secondary"
                            size="sm"
                            disabled={aiLoadingTaskId !== null}
                            onClick={() => handleAIAction(task.id, 'mitigate', 'extension_request')}
                            icon={<Calendar className="w-3.5 h-3.5 text-indigo-400" />}
                          >
                            Extension Draft
                          </CTAButton>

                          <CTAButton
                            variant="secondary"
                            size="sm"
                            disabled={aiLoadingTaskId !== null}
                            onClick={() => handleAIAction(task.id, 'mitigate', 'action_plan')}
                            icon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                          >
                            Action Plan
                          </CTAButton>

                          <CTAButton
                            variant="secondary"
                            size="sm"
                            onClick={() => onSyncToCalendar(task)}
                            className="!border-emerald-500/20 text-emerald-300 hover:text-emerald-200"
                            icon={<Calendar className="w-3.5 h-3.5 text-emerald-400" />}
                          >
                            Calendar Sync
                          </CTAButton>

                          {task.subtasks.length > 0 && (
                            <CTAButton
                              variant="secondary"
                              size="sm"
                              onClick={() => onSendEmailReminder(task, task.subtasks.map(s => s.title))}
                              className="!border-indigo-500/20 text-indigo-300 hover:text-indigo-200"
                              icon={<Mail className="w-3.5 h-3.5 text-indigo-400" />}
                            >
                              Send Checklist
                            </CTAButton>
                          )}
                        </div>

                        {/* Render Active Mitigation Draft inline */}
                        {task.lastMitigation && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 mt-2 font-mono whitespace-pre-wrap text-left ${
                              task.lastMitigation.type === 'extension_request'
                                ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-200'
                                : 'bg-amber-950/20 border-amber-500/20 text-amber-200'
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-border/40 pb-1.5 mb-1 text-[10px] uppercase tracking-wider text-zinc-400">
                              <span>
                                {task.lastMitigation.type === 'extension_request' 
                                  ? '✉️ Extension Request Notification Draft' 
                                  : '📋 Proactive Action Recovery Blueprint'}
                              </span>
                              <div className="flex items-center gap-2">
                                {task.lastMitigation.type === 'extension_request' && (
                                  <button
                                    onClick={() => onSaveGmailDraft(task, task.lastMitigation?.text || '')}
                                    className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer text-[9px]"
                                  >
                                    [Save to Gmail]
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(task.lastMitigation?.text || '');
                                    alert('Draft copied to clipboard!');
                                  }}
                                  className="hover:text-white transition-colors cursor-pointer text-zinc-500 text-[9px]"
                                >
                                  [Copy Blueprint]
                                </button>
                              </div>
                            </div>
                            {task.lastMitigation.text}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Deploy New Task Modal Overlay */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="bg-surface border border-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col font-sans"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h3 className="text-base font-bold text-text flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  New Deadline Sentinel
                </h3>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateTask} className="p-6 space-y-4 text-left">
                {/* Title */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-400 mb-1.5">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Deliver critical Q3 product specs"
                    className="w-full bg-zinc-950/50 border border-border rounded-xl px-3.5 py-2.5 text-sm text-text placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-400 mb-1.5">Description</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe stakeholders, deliverables, or special constraints..."
                    rows={3}
                    className="w-full bg-zinc-950/50 border border-border rounded-xl px-3.5 py-2.5 text-sm text-text placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                {/* Priority Segmented Control */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-400 mb-2">Threat Priority</label>
                  <div className="grid grid-cols-4 gap-1.5 bg-zinc-950/60 p-1 rounded-xl border border-border">
                    {['low', 'medium', 'high', 'critical'].map((p) => {
                      const isSelected = newPriority === p;
                      const activeColors: Record<string, string> = {
                        low: 'bg-zinc-700 text-white',
                        medium: 'bg-indigo-600 text-white',
                        high: 'bg-amber-500 text-white',
                        critical: 'bg-red-600 text-white'
                      };
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewPriority(p as TaskPriority)}
                          className={`py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-all ${
                            isSelected 
                              ? activeColors[p] 
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-fields grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Due Date */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-400 mb-1.5">Due Date</label>
                    <input
                      type="datetime-local"
                      required
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full bg-zinc-950/50 border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Estimated Minutes */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-400 mb-1.5">Focus Budget (Min)</label>
                    <input
                      type="number"
                      required
                      value={newEstMin}
                      onChange={(e) => setNewEstMin(Number(e.target.value))}
                      min={5}
                      className="w-full bg-zinc-950/50 border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-400 mb-1.5">Category Tag</label>
                  <input
                    type="text"
                    required
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Work, Pitch, Tech, Personal"
                    className="w-full bg-zinc-950/50 border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 bg-zinc-900 border border-border hover:bg-zinc-800 text-xs text-zinc-300 font-bold rounded-full transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-bold rounded-full transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer"
                  >
                    Add to Deadlines →
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
