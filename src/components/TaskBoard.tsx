import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, TaskPriority, TaskStatus, SubTask } from '../types';
import { ListRow } from './ui/ListRow';
import { CTAButton } from './ui/CTAButton';
import { 
  AlertOctagon, CheckCircle2, Circle, Clock, Plus, Trash2, ChevronDown, 
  ChevronUp, Sparkles, AlertCircle, RefreshCw, Layers, Calendar, Mail
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
  accessToken,
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
      alert('Triage diagnostic failed. Please make sure the backend is active.');
    } finally {
      setTriageLoadingTaskId(null);
    }
  };

  // Sorting: Critical/High priority first, then urgent due dates, then pending status
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
    
    // Auto complete task if all subtasks are finished (optional helper)
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
      // If completed, mark all subtasks completed
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

  const getPriorityBadge = (priority: TaskPriority) => {
    const colors = {
      critical: { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'CRITICAL' },
      high: { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'HIGH' },
      medium: { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'MEDIUM' },
      low: { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'LOW' }
    };
    return colors[priority];
  };

  return (
    <div className="space-y-4">
      {/* Help banner & Onboarding link */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-950/20 border border-white/5 p-3 rounded-2xl">
        <span className="text-xs text-slate-400 font-light flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          First time? Learn how the Autonomous Coordinator works.
        </span>
        <button
          onClick={onShowOnboarding}
          className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 hover:text-blue-200 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
        >
          📖 Run Interactive Onboarding
        </button>
      </div>

      {/* Search and Filters row */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-zinc-950/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tasks, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all font-sans"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Crisis Triage Switch Toggle */}
          <button
            type="button"
            onClick={() => setTriageModeActive(!triageModeActive)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer border ${
              triageModeActive
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)] hover:bg-rose-500/20'
                : 'bg-zinc-900 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
            title="Crisis Triage Mode diagnostics"
          >
            <AlertOctagon className={`w-3.5 h-3.5 ${triageModeActive ? 'animate-bounce text-rose-400' : 'text-slate-500'}`} />
            <span>Crisis Triage Mode: {triageModeActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="critical">🔴 Critical</option>
            <option value="high">🟡 High</option>
            <option value="medium">🔵 Medium</option>
            <option value="low">⚪ Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">⏳ Pending</option>
            <option value="in_progress">⚡ In Progress</option>
            <option value="completed">✅ Completed</option>
          </select>

          <CTAButton
            onClick={() => setIsAdding(!isAdding)}
            variant={isAdding ? 'secondary' : 'primary'}
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            {isAdding ? 'Cancel' : 'New Task'}
          </CTAButton>
        </div>
      </div>

      {/* Warning banner if Crisis Triage Mode active */}
      <AnimatePresence>
        {triageModeActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-[0_0_15px_rgba(244,63,94,0.05)]"
          >
            <AlertOctagon className="w-5 h-5 text-rose-500 animate-pulse flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-left">
              <p className="text-xs font-bold text-rose-400 uppercase tracking-wide">🚨 Emergency Crisis Triage Active</p>
              <p className="text-slate-400 text-xs font-light leading-relaxed">
                You have activated crisis triage mode. Expand any delayed, overdue, or critical tasks below and trigger the <strong>Deep Crisis Diagnostic</strong>. Gemini will analyze the damage severity, write structural stakeholder mitigation drafts, and reset your psychology.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Creation Form panel */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateTask}
            className="bg-zinc-950/60 border border-white/10 rounded-2xl p-5 space-y-4 overflow-hidden backdrop-blur-md shadow-2xl"
          >
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Deploy New Task Sentinel
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Submit Pitch Deck to Seed VCs"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Description</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Provide context, deliverables, links..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="critical">🔴 Critical</option>
                    <option value="high">🟡 High</option>
                    <option value="medium">🔵 Medium</option>
                    <option value="low">⚪ Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Work, Health, Bills..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Deadline Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500 text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Est. Effort (Mins)</label>
                  <input
                    type="number"
                    value={newEstMin}
                    onChange={(e) => setNewEstMin(Number(e.target.value))}
                    min={5}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <CTAButton type="submit" variant="primary" size="sm">
                Activate Safeguard Task
              </CTAButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Task List container */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-zinc-950/20 border border-white/5 rounded-2xl">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No tasks matching filters found.</p>
            <p className="text-slate-600 text-xs mt-1">Add a new task to secure your deadline schedule!</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isExpanded = expandedTaskId === task.id;
            const pb = getPriorityBadge(task.priority);
            const subtaskCompletedCount = task.subtasks.filter(st => st.completed).length;
            const progressPct = task.subtasks.length > 0 
              ? Math.round((subtaskCompletedCount / task.subtasks.length) * 100) 
              : task.status === 'completed' ? 100 : 0;

            // Formatted Date string
            const dueObj = new Date(task.dueDate);
            const isOverdue = dueObj.getTime() < Date.now() && task.status !== 'completed';
            const formattedDate = dueObj.toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div 
                key={task.id}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  task.priority === 'critical' && task.status !== 'completed'
                    ? 'border-rose-500/20 bg-rose-950/[0.03] hover:border-rose-500/40'
                    : isExpanded
                      ? 'border-white/15 bg-zinc-900/[0.1]'
                      : 'border-white/5 hover:border-white/15'
                }`}
              >
                {/* Primary Row Header */}
                <ListRow
                  id={task.id}
                  title={task.title}
                  subtitle={task.description}
                  timestamp={formattedDate}
                  tags={[task.category, pb.label, `Score: ${task.urgencyScore}`]}
                  isActive={isExpanded}
                  onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                  icon={
                    task.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : task.status === 'in_progress' ? (
                      <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
                    ) : isOverdue ? (
                      <AlertOctagon className="w-5 h-5 text-rose-500 animate-bounce" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400 group-hover:text-purple-400" />
                    )
                  }
                  iconBg={
                    task.status === 'completed' 
                      ? 'bg-emerald-500/10' 
                      : task.status === 'in_progress' 
                        ? 'bg-blue-500/10' 
                        : isOverdue 
                          ? 'bg-rose-500/10' 
                          : 'bg-white/5'
                  }
                  rightElement={
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTaskStatus(task);
                        }}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          task.status === 'completed'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                            : task.status === 'in_progress'
                              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        }`}
                        title="Change state status"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(task.id);
                        }}
                        className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-950/20 hover:border-red-500/20 transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <span className="text-slate-400 text-xs flex items-center">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </div>
                  }
                >
                  {/* Small progress bar inside Row if collapsed and has subtasks */}
                  {!isExpanded && task.subtasks.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 max-w-xs">
                      <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${progressPct}%` }} />
                      </div>
                      <span className="font-mono text-[9px] text-slate-500">{subtaskCompletedCount}/{task.subtasks.length} Subtasks</span>
                    </div>
                  )}
                </ListRow>

                {/* Expanded details section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/5 bg-zinc-950/40 p-5 space-y-4 font-sans text-sm"
                    >
                      {/* Subtask checklist section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            Subtask Milestones
                          </span>
                          <span className="font-mono text-xs text-purple-400 font-semibold">{progressPct}% Complete</span>
                        </div>

                        {task.subtasks.length === 0 ? (
                          <div className="text-xs text-slate-500 italic py-2">
                            No milestone breakdowns generated. Click "Autocut Milestones" to let AI split the task!
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                            {task.subtasks.map((st) => (
                              <div
                                key={st.id}
                                onClick={() => handleToggleSubtask(task, st.id)}
                                className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer select-none transition-all ${
                                  st.completed
                                    ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-400 line-through'
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10 text-slate-200'
                                }`}
                              >
                                {st.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                )}
                                <span className="truncate text-xs">{st.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Deep Crisis Triage Module */}
                      {triageModeActive && (
                        <div className="border-t border-rose-500/10 pt-4 space-y-4">
                          <div className="p-4 bg-rose-950/10 border border-rose-500/20 rounded-2xl space-y-4 shadow-lg text-left">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                                <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />
                                Deep Crisis Triage Diagnostic
                              </span>
                              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-[9px] font-mono font-bold text-rose-400 tracking-wider">
                                STAKEHOLDER DEFENDER
                              </span>
                            </div>

                            <p className="text-xs text-slate-400 leading-relaxed font-light">
                              Gemini will perform a diagnostic triage assessment: evaluate impact severity, draft immediate 3-step action recovery checklists, build professional damage control apology emails, and formulate a custom psychology-restoring mindset.
                            </p>

                            <CTAButton
                              variant="primary"
                              size="sm"
                              className="!bg-gradient-to-r !from-rose-600 !to-red-600 border border-white/10 text-xs !py-1.5 shadow-[0_0_15px_rgba(244,63,94,0.25)]"
                              disabled={triageLoadingTaskId !== null}
                              onClick={() => handleTriageDiagnostic(task)}
                              icon={
                                triageLoadingTaskId === task.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                                ) : (
                                  <AlertOctagon className="w-3.5 h-3.5 text-white" />
                                )
                              }
                            >
                              {triageLoadingTaskId === task.id ? 'Analyzing crisis severity...' : 'Execute Deep Crisis Triage'}
                            </CTAButton>

                            {/* Render Triage Diagnostic Outputs */}
                            {task.triageData && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4 pt-4 border-t border-rose-500/10"
                              >
                                {/* Impact Severity Chip */}
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] uppercase font-mono text-slate-500">Impact Severity:</span>
                                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                    task.triageData.severity === 'critical'
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse'
                                      : task.triageData.severity === 'high'
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                                  }`}>
                                    ● {task.triageData.severity} severity
                                  </span>
                                </div>

                                {/* Recovery Mindset */}
                                <div className="p-3 bg-zinc-950/40 border border-white/5 rounded-xl text-xs italic text-slate-300 relative font-light">
                                  <span className="absolute top-1 left-2 text-xl text-slate-600 leading-none font-serif">“</span>
                                  <p className="pl-4 pr-2 font-serif text-slate-300">{task.triageData.recoveryMindset}</p>
                                </div>

                                {/* 3-Step Recovery Plan */}
                                <div className="space-y-2">
                                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Immediate Triage Recovery Plan:</span>
                                  <div className="space-y-1.5">
                                    {task.triageData.recoveryPlan.slice(0, 3).map((step, idx) => (
                                      <div key={idx} className="flex gap-2.5 items-start p-2.5 rounded-xl bg-white/[0.01] border border-white/5">
                                        <div className="w-5 h-5 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-mono font-bold text-[10px] text-rose-400 flex-shrink-0 mt-0.5">
                                          {idx + 1}
                                        </div>
                                        <p className="text-xs text-slate-300 font-light leading-relaxed">{step}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Damage Control Draft Email */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-mono text-slate-500">Damage Control Apology Email:</span>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => onSaveGmailDraft(task, task.triageData?.damageControlEmail || '')}
                                        className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer text-[9px]"
                                      >
                                        [Save Draft to Gmail]
                                      </button>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(task.triageData?.damageControlEmail || '');
                                          alert('Apology email template copied to clipboard!');
                                        }}
                                        className="text-slate-400 hover:text-slate-200 font-bold transition-colors cursor-pointer text-[9px]"
                                      >
                                        [Copy to Clipboard]
                                      </button>
                                    </div>
                                  </div>
                                  <div className="p-3 bg-zinc-950 border border-white/5 rounded-xl text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                                    {task.triageData.damageControlEmail}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* AI Agentic Actions (The Proactive Safeguards) */}
                      <div className="border-t border-white/5 pt-4 space-y-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          Autonomous Rescue Operations
                        </span>

                        <div className="flex flex-wrap gap-2">
                          <CTAButton
                            variant="secondary"
                            size="sm"
                            disabled={aiLoadingTaskId !== null}
                            onClick={() => handleAIAction(task.id, 'breakdown')}
                            icon={
                              aiLoadingTaskId === task.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                              ) : (
                                <Layers className="w-3.5 h-3.5 text-purple-400" />
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
                            icon={<Calendar className="w-3.5 h-3.5 text-blue-400" />}
                          >
                            Draft Extension Email
                          </CTAButton>

                          <CTAButton
                            variant="secondary"
                            size="sm"
                            disabled={aiLoadingTaskId !== null}
                            onClick={() => handleAIAction(task.id, 'mitigate', 'action_plan')}
                            icon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                          >
                            Generate Action Plan
                          </CTAButton>

                          <CTAButton
                            variant="secondary"
                            size="sm"
                            onClick={() => onSyncToCalendar(task)}
                            className="!border-emerald-500/20 hover:!border-emerald-500/40 text-emerald-300 hover:text-emerald-200"
                            icon={<Calendar className="w-3.5 h-3.5 text-emerald-400" />}
                          >
                            Sync to Google Calendar
                          </CTAButton>

                          {task.subtasks.length > 0 && (
                            <CTAButton
                              variant="secondary"
                              size="sm"
                              onClick={() => onSendEmailReminder(task, task.subtasks.map(s => s.title))}
                              className="!border-blue-500/20 hover:!border-blue-500/40 text-blue-300 hover:text-blue-200"
                              icon={<Mail className="w-3.5 h-3.5 text-blue-400" />}
                            >
                              Email Checklist
                            </CTAButton>
                          )}
                        </div>

                        {/* Render Active Mitigation Draft if available */}
                        {task.lastMitigation && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-2 mt-2 font-mono whitespace-pre-wrap ${
                              task.lastMitigation.type === 'extension_request'
                                ? 'bg-blue-950/20 border-blue-500/20 text-blue-200'
                                : 'bg-amber-950/20 border-amber-500/20 text-amber-200'
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-1 text-[10px] uppercase tracking-wider text-slate-400">
                              <span>
                                {task.lastMitigation.type === 'extension_request' 
                                  ? '✉️ AI Draft: Professional Extension Notification' 
                                  : '📋 AI Proactive Mitigation Strategy'}
                              </span>
                              <div className="flex items-center gap-2">
                                {task.lastMitigation.type === 'extension_request' && (
                                  <button
                                    onClick={() => onSaveGmailDraft(task, task.lastMitigation?.text || '')}
                                    className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer text-[9px]"
                                  >
                                    [Save Draft to Gmail]
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(task.lastMitigation?.text || '');
                                  }}
                                  className="hover:text-white transition-colors cursor-pointer text-slate-500 text-[9px]"
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
    </div>
  );
};
