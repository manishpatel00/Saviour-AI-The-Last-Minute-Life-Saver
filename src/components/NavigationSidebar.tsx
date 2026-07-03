import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, CheckSquare, Calendar, BarChart3, Flame, Award, Bot, 
  Menu, X, ChevronLeft, ChevronRight, Settings, LogOut, Sparkles, Zap
} from 'lucide-react';
import { UserStats, Task, Goal } from '../types';

export type NavigationSection = 'console' | 'deadlines' | 'timeline' | 'habits' | 'pomodoro' | 'analytics' | 'chat';

interface NavigationSidebarProps {
  activeSection: NavigationSection;
  onSectionChange: (section: NavigationSection) => void;
  stats: UserStats;
  tasks: Task[];
  goals: Goal[];
  user: any;
  accessToken: string | null;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeSection,
  onSectionChange,
  stats,
  tasks,
  goals,
  user,
  accessToken,
  onLogout,
  onOpenSettings
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Status Metrics for Navigation Items
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const criticalTasksCount = pendingTasks.filter(t => t.priority === 'critical').length;
  const overdueTasksCount = pendingTasks.filter(t => new Date(t.dueDate).getTime() < Date.now()).length;
  const activeHabitsCount = goals.length;

  const navItems = [
    {
      id: 'console' as NavigationSection,
      label: 'Master Console',
      sublabel: 'Cockpit & Command',
      icon: Terminal,
      color: 'text-brand',
      glowColor: 'rgba(0, 255, 65, 0.15)',
      statusDot: accessToken ? 'bg-brand' : 'bg-zinc-700',
      statusText: accessToken ? 'CONNECTED' : 'STANDALONE',
    },
    {
      id: 'deadlines' as NavigationSection,
      label: 'Deadlines Checklist',
      sublabel: 'Triage & Mitigation',
      icon: CheckSquare,
      color: 'text-white',
      badge: criticalTasksCount > 0 ? `${criticalTasksCount} CRIT` : undefined,
      badgeColor: 'bg-crisis/25 border-crisis/40 text-crisis',
      statusDot: overdueTasksCount > 0 ? 'bg-crisis animate-pulse' : 'bg-zinc-700',
    },
    {
      id: 'timeline' as NavigationSection,
      label: 'Autopilot Timeline',
      sublabel: 'Conflicts & Calendar',
      icon: Calendar,
      color: 'text-amber-400',
      glowColor: 'rgba(245, 158, 11, 0.15)',
      statusDot: pendingTasks.length > 0 ? 'bg-amber-400 animate-pulse' : 'bg-zinc-700',
      statusText: `${pendingTasks.length} Scheduled`,
    },
    {
      id: 'pomodoro' as NavigationSection,
      label: 'Pomodoro Focus',
      sublabel: 'Friction Solver',
      icon: Flame,
      color: 'text-red-500',
      glowColor: 'rgba(239, 68, 68, 0.15)',
    },
    {
      id: 'habits' as NavigationSection,
      label: 'Habit Recurrence',
      sublabel: 'Streaks & Multipliers',
      icon: Award,
      color: 'text-emerald-400',
      glowColor: 'rgba(52, 211, 153, 0.15)',
      badge: activeHabitsCount > 0 ? `${activeHabitsCount}` : undefined,
      badgeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      id: 'analytics' as NavigationSection,
      label: 'Operations Stats',
      sublabel: 'Efficiency Analytics',
      icon: BarChart3,
      color: 'text-indigo-400',
      glowColor: 'rgba(129, 140, 248, 0.15)',
    },
    {
      id: 'chat' as NavigationSection,
      label: 'Sentinel AI Chat',
      sublabel: 'Mitigation Dispatch',
      icon: Bot,
      color: 'text-purple-400',
      glowColor: 'rgba(192, 132, 252, 0.15)',
      statusDot: 'bg-purple-400 animate-pulse',
    }
  ];

  const currentXpMax = stats.level * 200;
  const xpPercent = Math.min(100, Math.max(0, (stats.xp / currentXpMax) * 100));

  const handleItemClick = (sectionId: NavigationSection) => {
    onSectionChange(sectionId);
    setIsMobileOpen(false);
    
    // Smooth scroll down slightly if switching tabs to give immediate context
    setTimeout(() => {
      const el = document.getElementById('saviour-workspace-view');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <>
      {/* Mobile Top Navigation Sticky bar with drawer trigger */}
      <div className="lg:hidden w-full bg-black border-b border-border h-14 px-4 flex items-center justify-between sticky top-[56px] sm:top-[64px] z-30 backdrop-blur-md bg-opacity-90">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 text-brand font-mono text-xs font-bold uppercase tracking-wider"
          id="mobile-sidebar-toggle"
        >
          <Menu className="w-5 h-5" />
          SYSTEM_NAV
        </button>

        {/* Level and XP view in mobile header bar */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-zinc-500 font-bold">LVL</span>
          <span className="text-brand font-bold">{stats.level}</span>
          <div className="w-16 h-2 bg-zinc-900 border border-border rounded-full overflow-hidden">
            <div className="h-full bg-brand" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar container */}
      <div 
        className={`hidden lg:flex flex-col bg-black border-r-2 border-border h-[calc(100vh-64px)] sticky top-16 z-20 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-[280px]'
        }`}
      >
        {/* Expand/Collapse Toggle Handle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-4 w-6 h-6 rounded-md bg-zinc-950 border border-border text-muted hover:text-white flex items-center justify-center cursor-pointer z-30 shadow-md"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Sidebar Header: System diagnostics block */}
        <div className={`p-4.5 border-b border-border/80 flex flex-col justify-center overflow-hidden ${
          isCollapsed ? 'items-center' : ''
        }`}>
          {!isCollapsed ? (
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase text-brand tracking-widest font-bold flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand"></span>
                </span>
                SYS_OPERATIONAL
              </span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                CORE SECURED CHANNELS
              </span>
            </div>
          ) : (
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand"></span>
            </div>
          )}
        </div>

        {/* Primary Interactive Sidebar Menu items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full group rounded-xl border flex items-center transition-all relative cursor-pointer ${
                  isActive 
                    ? 'bg-zinc-950/90 border-brand/40 text-white shadow-[0_0_15px_rgba(0,255,65,0.05)]' 
                    : 'bg-transparent border-transparent text-muted hover:text-white hover:bg-zinc-900/40 hover:border-border/40'
                } ${isCollapsed ? 'p-3.5 justify-center' : 'p-3 gap-3.5'}`}
                title={isCollapsed ? item.label : undefined}
                id={`sidebar-link-${item.id}`}
              >
                {/* Active Indicator Slide-Bar */}
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute left-0 top-3 bottom-3 w-1 rounded-r-md bg-brand"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                <div className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                  isActive 
                    ? 'bg-brand/10 border-brand/20' 
                    : 'bg-zinc-950/40 border-border/30 group-hover:border-border/60'
                }`}>
                  <IconComponent className={`w-4 h-4 ${isActive ? 'text-brand' : item.color}`} />
                </div>

                {!isCollapsed && (
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider truncate block">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border uppercase shrink-0 font-bold ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-sans text-zinc-500 truncate block uppercase tracking-wide">
                      {item.sublabel}
                    </span>
                  </div>
                )}

                {/* Compact icon status dot indicator */}
                {isCollapsed && item.statusDot && (
                  <span className={`absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full ${item.statusDot}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Experience levels widget */}
        <div className="p-4 border-t border-border/80 space-y-4 bg-zinc-950/30">
          {!isCollapsed ? (
            <div className="space-y-3 font-mono">
              <div className="space-y-1.5">
                <div className="flex justify-between items-end text-[10px] font-bold">
                  <span className="text-zinc-500 uppercase">SYS_INTEGRITY_LVL</span>
                  <span className="text-brand text-xs uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand animate-pulse" />
                    LVL {stats.level}
                  </span>
                </div>
                
                {/* Visual progression bar */}
                <div className="relative w-full h-2.5 bg-black border border-border rounded-full overflow-hidden p-[1px]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-brand rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.15)_50%,transparent_100%)] animate-pulse" />
                  </motion.div>
                </div>

                <div className="flex justify-between text-[8px] text-zinc-500">
                  <span>{stats.xp} XP</span>
                  <span>{currentXpMax} XP</span>
                </div>
              </div>

              {/* Logged in User state footer */}
              <div className="pt-2 border-t border-border/30 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded bg-brand/10 border border-brand/30 flex items-center justify-center font-bold text-[10px] text-brand shrink-0">
                    {user.email?.[0].toUpperCase() || 'S'}
                  </div>
                  <div className="truncate text-left">
                    <span className="text-[10px] font-bold text-slate-300 truncate block">
                      {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[8px] text-zinc-500 block truncate">
                      {accessToken ? 'GOOGLE_LINKED' : 'DEMO_SANDBOX'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={onLogout}
                  className="text-muted hover:text-crisis transition-colors p-1"
                  title="Disconnect & Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-brand/10 border border-brand/30 text-brand flex items-center justify-center font-bold text-[11px] animate-pulse">
                {stats.level}
              </div>
              <button 
                onClick={onOpenSettings}
                className="text-muted hover:text-white transition-colors"
                title="Integrations & settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Navigation slide-out drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop cover filter */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Panel Slide */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute top-0 bottom-0 left-0 w-4/5 max-w-sm bg-[#09090b] border-r border-border p-6 flex flex-col justify-between font-mono"
            >
              <div className="space-y-6">
                {/* Header title */}
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-brand" />
                    <span className="font-display font-bold tracking-widest text-brand uppercase text-sm">
                      SAVIOUR_NAV
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsMobileOpen(false)}
                    className="p-1 text-muted hover:text-white border border-border/50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Subsystem diagnostics link items */}
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const isActive = activeSection === item.id;
                    const IconComponent = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full p-3.5 rounded-xl border flex items-center gap-3.5 transition-all text-left relative cursor-pointer ${
                          isActive 
                            ? 'bg-zinc-950 border-brand text-white' 
                            : 'bg-transparent border-transparent text-muted hover:text-white'
                        }`}
                      >
                        <div className={`p-2 rounded-lg border shrink-0 ${isActive ? 'bg-brand/10 border-brand/20 text-brand' : 'bg-zinc-950/50 border-border/40 text-slate-400'}`}>
                          <IconComponent className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider block">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className={`text-[8px] px-1.5 py-0.5 rounded border uppercase shrink-0 font-bold ${item.badgeColor}`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-zinc-500 block uppercase tracking-wide">
                            {item.sublabel}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Experience level status footer widget */}
              <div className="pt-6 border-t border-border space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-end text-[10px] font-bold">
                    <span className="text-zinc-500 uppercase">INTEGRITY_LEVEL</span>
                    <span className="text-brand uppercase">LVL {stats.level}</span>
                  </div>
                  <div className="relative w-full h-2.5 bg-black border border-border rounded-full overflow-hidden p-[1px]">
                    <div className="h-full bg-brand rounded-full" style={{ width: `${xpPercent}%` }} />
                  </div>
                  <div className="flex justify-between text-[8px] text-zinc-500">
                    <span>{stats.xp} XP</span>
                    <span>{currentXpMax} XP</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-zinc-950 p-3.5 border border-border rounded-xl">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-6 h-6 rounded bg-brand/10 border border-brand/30 flex items-center justify-center font-bold text-[10px] text-brand shrink-0">
                      {user.email?.[0].toUpperCase() || 'S'}
                    </div>
                    <div className="truncate text-left font-mono">
                      <span className="text-[10px] font-bold text-slate-300 truncate block">
                        {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                      </span>
                      <span className="text-[8px] text-zinc-500 block">
                        {accessToken ? 'GOOGLE_LINKED' : 'DEMO_SANDBOX'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button 
                      onClick={() => {
                        setIsMobileOpen(false);
                        onOpenSettings();
                      }}
                      className="text-muted hover:text-white p-1"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => {
                        setIsMobileOpen(false);
                        onLogout();
                      }}
                      className="text-muted hover:text-crisis p-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
