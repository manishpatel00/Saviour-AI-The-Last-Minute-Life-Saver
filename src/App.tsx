import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Goal, Badge, ChatMessage, UserStats, SuggestedAction, SubTask, AppNotification } from './types';
import { INITIAL_TASKS, INITIAL_GOALS, INITIAL_BADGES } from './data';
import { PillBadge } from './components/ui/PillBadge';
import { CTAButton } from './components/ui/CTAButton';
import { DashboardMetrics } from './components/DashboardMetrics';
import { TaskBoard } from './components/TaskBoard';
import { PomodoroRescue } from './components/PomodoroRescue';
import { SchedulerView } from './components/SchedulerView';
import { AIAgentCompanion } from './components/AIAgentCompanion';
import { NotificationCenter } from './components/NotificationCenter';
import { OnboardingCarousel } from './components/OnboardingCarousel';
import { HabitGoalTracker } from './components/HabitGoalTracker';
import { WorkspaceConnector } from './components/WorkspaceConnector';
import { 
  Bot, Sparkles, Flame, CheckCircle, Shield, Award, Calendar, Timer, 
  Layers, Volume2, Info, BookOpen, LogOut, Check, Mail
} from 'lucide-react';
import { googleSignIn, logout, initAuth } from './lib/auth';
import { createGoogleCalendarEvent, createGmailDraft } from './lib/workspace';
import { saveUserDataToCloud, loadUserDataFromCloud } from './lib/sync';
import { User } from 'firebase/auth';

function sanitizeUniqueIds<T extends { id: string }>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  return items.map((item, index) => {
    let id = item.id;
    if (!id) {
      id = `gen_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`;
    }
    while (seen.has(id)) {
      id = `${id}_dup_${Math.random().toString(36).substring(2, 7)}`;
    }
    seen.add(id);
    return { ...item, id };
  });
}

export default function App() {
  // --- Local Storage Hydration States ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('last_minute_tasks');
    return sanitizeUniqueIds(saved ? JSON.parse(saved) : INITIAL_TASKS);
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('last_minute_goals');
    return sanitizeUniqueIds(saved ? JSON.parse(saved) : INITIAL_GOALS);
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('last_minute_badges');
    return sanitizeUniqueIds(saved ? JSON.parse(saved) : INITIAL_BADGES);
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('last_minute_stats');
    if (saved) return JSON.parse(saved);
    return {
      completedCount: 12,
      onTimeRate: 85,
      streakDays: 4,
      totalFocusMinutes: 120,
      level: 1,
      xp: 40
    };
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('last_minute_messages');
    return sanitizeUniqueIds(saved ? JSON.parse(saved) : [
      {
        id: 'welcome_m',
        sender: 'agent',
        text: "Greetings. I am your Saviour AI Agent. I have scanned your upcoming deadlines.\n\nYou have 1 critical deadline expiring in under 4 hours, and 1 credit card payment already overdue. Let's act before penalties strike. Type a command or select a quick option to begin.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          {
            id: 'sa1',
            label: '📋 Breakdown Critical Task',
            actionType: 'breakdown_task',
            payload: { taskId: 't1' }
          },
          {
            id: 'sa2',
            label: '✉️ Solve Overdue Bill',
            actionType: 'mitigate_task',
            payload: { taskId: 't2', type: 'extension_request' }
          }
        ]
      }
    ]);
  });

  const [activeTab, setActiveTab] = useState<'board' | 'pomodoro' | 'schedule' | 'habits'>('board');
  const [badgesExpanded, setBadgesExpanded] = useState<boolean>(true);
  const [chatGenerating, setChatGenerating] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('onboarding_completed') !== 'true';
  });

  // --- Core Habit & Recurring Goal Trackers ---
  const handleAddGoal = (newGoalData: Omit<Goal, 'id' | 'streak' | 'completedDates'>) => {
    const newGoal: Goal = {
      ...newGoalData,
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      streak: 0,
      completedDates: []
    };
    setGoals(prev => [newGoal, ...prev]);
    rewardXp(15, 'Created new habit tracking objective');
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    rewardXp(10, 'Updated habit record');
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // --- Google Auth States ---
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- Notifications State ---
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('last_minute_notifications');
    return sanitizeUniqueIds(saved ? JSON.parse(saved) : [
      {
        id: 'init_n1',
        title: '⚠️ CRITICAL DEADLINE RISK DETECTED',
        message: 'Your critical task "Prototype Hackathon Core" is expiring in under 4 hours. Act now.',
        type: 'alert',
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: 'init_n2',
        title: '🔔 PROACTIVE MITIGATION DISPATCHED',
        message: 'Credit Card Payment is overdue. Saviour AI has created an automated professional extension request draft.',
        type: 'warning',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false
      }
    ]);
  });

  // --- Persistence Side Effect ---
  useEffect(() => {
    localStorage.setItem('last_minute_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('last_minute_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('last_minute_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('last_minute_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('last_minute_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('last_minute_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const [isCloudLoading, setIsCloudLoading] = useState(false);

  // Initialize Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      async (firebaseUser, token) => {
        setUser(firebaseUser);
        setAccessToken(token);
        
        // Load cloud planning data for user
        setIsCloudLoading(true);
        try {
          const cloudData = await loadUserDataFromCloud(firebaseUser.uid);
          if (cloudData) {
            if (cloudData.tasks) setTasks(sanitizeUniqueIds(cloudData.tasks));
            if (cloudData.goals) setGoals(sanitizeUniqueIds(cloudData.goals));
            if (cloudData.badges) setBadges(sanitizeUniqueIds(cloudData.badges));
            if (cloudData.stats) setStats(cloudData.stats);
            if (cloudData.notifications) setNotifications(sanitizeUniqueIds(cloudData.notifications));
          }
        } catch (err) {
          console.error("Cloud hydration failed:", err);
        } finally {
          setIsCloudLoading(false);
        }
      },
      () => {
        const savedUser = localStorage.getItem('dev_bypass_user');
        const savedToken = localStorage.getItem('dev_bypass_token');
        if (savedUser && savedToken) {
          try {
            const parsed = JSON.parse(savedUser);
            const syntheticUser = {
              uid: 'dev_cached',
              displayName: parsed.displayName,
              email: parsed.email,
              photoURL: null
            } as unknown as User;
            setUser(syntheticUser);
            setAccessToken(savedToken);
          } catch (e) {
            setUser(null);
            setAccessToken(null);
          }
        } else {
          setUser(null);
          setAccessToken(null);
        }
      }
    );
    return () => unsubscribe();
  }, []);

  // Save to Cloud on updates
  useEffect(() => {
    if (user && !isCloudLoading) {
      saveUserDataToCloud(user.uid, {
        tasks,
        goals,
        badges,
        stats,
        notifications
      });
    }
  }, [user, tasks, goals, badges, stats, notifications, isCloudLoading]);


  // --- XP Reward engine ---
  const rewardXp = (amount: number, reason: string) => {
    setStats(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      const xpNeeded = newLevel * 200;
      let leveledUp = false;

      if (newXp >= xpNeeded) {
        newXp -= xpNeeded;
        newLevel += 1;
        leveledUp = true;
      }

      if (leveledUp) {
        const nextLevel = newLevel;
        setTimeout(() => {
          setMessages(m => {
            const id = `lvl_${nextLevel}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            // Check if level-up message for this level already exists to prevent duplicate renders
            if (m.some(msg => msg.id.startsWith(`lvl_${nextLevel}_`))) {
              return m;
            }
            return [
              ...m,
              {
                id,
                sender: 'agent',
                text: `🎉 LEVEL UP! You have advanced to Level ${nextLevel}! Your productivity threshold has increased. Continue the momentum to unlock exclusive badges!`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ];
          });
        }, 0);
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        completedCount: prev.completedCount + (amount > 20 ? 1 : 0)
      };
    });
  };

  // --- Badge checking logic ---
  const checkForBadgeUnlocks = (updatedTasks: Task[], completedTaskId: string) => {
    const task = updatedTasks.find(t => t.id === completedTaskId);
    if (!task) return;

    // Trigger Overdue Slayer Badge if completed overdue task
    if (task.dueDate && new Date(task.dueDate).getTime() < Date.now()) {
      unlockBadge('b2');
    }
  };

  const unlockBadge = (badgeId: string) => {
    setBadges(prev => 
      prev.map(badge => {
        if (badge.id === badgeId && !badge.unlockedAt) {
          const unlocked = { ...badge, unlockedAt: new Date().toISOString() };
          setUnlockedBadge(unlocked);
          rewardXp(100, `Unlocked Badge: ${badge.title}`);
          return unlocked;
        }
        return badge;
      })
    );
  };

  // --- Core Task Handlers ---
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'urgencyScore'>) => {
    // Generate simple urgency score 1 - 100 based on due date and priority
    const hrsLeft = (new Date(newTaskData.dueDate).getTime() - Date.now()) / (1000 * 60 * 60);
    let base = 50;
    if (newTaskData.priority === 'critical') base += 35;
    if (newTaskData.priority === 'high') base += 20;
    if (newTaskData.priority === 'low') base -= 20;
    
    // Add urgency if hours remaining is small
    if (hrsLeft > 0 && hrsLeft < 12) base += 15;
    if (hrsLeft < 0) base = 95; // Overdue

    const newTask: Task = {
      ...newTaskData,
      id: `task_${Date.now()}`,
      urgencyScore: Math.min(100, Math.max(5, Math.round(base)))
    };

    setTasks(prev => [newTask, ...prev]);
    rewardXp(15, 'Created new target deadline');
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => {
      const isNewlyCompleted = updatedTask.status === 'completed' && 
        prev.find(t => t.id === updatedTask.id)?.status !== 'completed';
      
      const newTasks = prev.map(t => t.id === updatedTask.id ? updatedTask : t);
      
      if (isNewlyCompleted) {
        rewardXp(50, `Completed task: ${updatedTask.title}`);
        checkForBadgeUnlocks(newTasks, updatedTask.id);
      }
      return newTasks;
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };


  // --- Procrastination-Busting AI Integrations (Full-Stack) ---
  const handleBreakdownTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const response = await fetch('/api/gemini/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: task.title, description: task.description })
      });
      const data = await response.json();
      
      if (data.breakdown) {
        const subtasks: SubTask[] = data.breakdown.map((title: string, idx: number) => ({
          id: `sub_${taskId}_${idx}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title,
          completed: false
        }));

        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks } : t));
        rewardXp(20, 'Autocut task milestones');
        
        // Push coach notification update to chat log
        setMessages(m => [
          ...m,
          {
            id: `sys_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            sender: 'agent',
            text: `🎯 Saviour AI Autocut Complete: I have broken down "${task.title}" into ${subtasks.length} actionable micro-milestones inside your checklist. Let's finish them!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error('Task breakdown error:', err);
    }
  };

  const handleMitigateTask = async (taskId: string, type: 'extension_request' | 'action_plan' | 'reschedule') => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const response = await fetch('/api/gemini/mitigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: task.title, dueDate: task.dueDate, type })
      });
      const data = await response.json();
      
      if (data.mitigationText) {
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { ...t, lastMitigation: { type, text: data.mitigationText } } 
            : t
        ));
        rewardXp(25, 'Generated proactive delay mitigation');
        
        // Push notification update
        setMessages(m => [
          ...m,
          {
            id: `sys_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            sender: 'agent',
            text: `📋 Saviour AI Mitigation Draft Ready! I have configured a highly optimized delay blueprint for "${task.title}". Expand the task details to view and copy it.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error('Task mitigation error:', err);
    }
  };

  const handleAutoSchedule = async () => {
    try {
      const response = await fetch('/api/gemini/auto-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentTasks: tasks })
      });
      const data = await response.json();
      
      if (data.message) {
        setMessages(m => [
          ...m,
          {
            id: `sched_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            sender: 'agent',
            text: `📅 AI Autopilot Timeline Optimization completed:\n\n${data.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        rewardXp(30, 'Optimized scheduling timeline');
      }
    } catch (err) {
      console.error('Auto schedule error:', err);
    }
  };

  // --- Pomodoro session completion reward ---
  const handleCompletePomodoroSession = (taskId: string, minutes: number) => {
    setStats(prev => ({
      ...prev,
      totalFocusMinutes: prev.totalFocusMinutes + minutes,
      streakDays: prev.streakDays + 1
    }));
    
    // Unlock focus badge if focused 5 times
    if (stats.totalFocusMinutes + minutes >= 150) {
      unlockBadge('b3');
    }

    rewardXp(40, 'Completed deep work Pomodoro session');
    setMessages(m => [
      ...m,
      {
        id: `pomo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        sender: 'agent',
        text: `🧘 Phenomenal Focus session complete! You focused on your selected task for 25 minutes. Added 40 XP to your level progression.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };


  // --- Chat companion controller ---
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setChatGenerating(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          currentTasks: tasks
        })
      });
      const data = await response.json();
      
      if (data.message) {
        setMessages(prev => [
          ...prev,
          {
            id: `agt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            sender: 'agent',
            text: data.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedActions: data.actions
          }
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setChatGenerating(false);
    }
  };

  const handleTriggerSuggestedAction = (action: SuggestedAction) => {
    switch (action.actionType) {
      case 'focus':
        setActiveTab('pomodoro');
        break;
      case 'breakdown_task':
        if (action.payload?.taskId) {
          handleBreakdownTask(action.payload.taskId);
        }
        break;
      case 'mitigate_task':
        if (action.payload?.taskId && action.payload?.type) {
          handleMitigateTask(action.payload.taskId, action.payload.type);
        }
        break;
      case 'add_task':
        if (action.payload?.title) {
          handleAddTask({
            title: action.payload.title,
            description: 'AI Generated Task Sentinel',
            priority: 'high',
            status: 'pending',
            category: 'AI Auto',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            estimatedMinutes: 45,
            actualMinutes: 0,
            subtasks: []
          });
        }
        break;
    }
  };

  // --- Google OAuth & Personalization Handlers ---
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      // Clear developer bypass cache when performing real login
      localStorage.removeItem('dev_bypass_user');
      localStorage.removeItem('dev_bypass_token');

      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        
        const newNotif: AppNotification = {
          id: `login_${Date.now()}`,
          title: '🔐 GOOGLE INTEGRATION ACTIVE',
          message: `Authenticated as ${result.user.email}. Planning data cloud synchronization is now secure and active.`,
          type: 'success',
          createdAt: new Date().toISOString(),
          read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    } catch (err: any) {
      console.error(err);
      alert('Login failed: ' + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleApplyDeveloperBypass = (displayName: string, email: string, token: string) => {
    const syntheticUser = {
      uid: `dev_${Date.now()}`,
      displayName,
      email,
      photoURL: null,
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      providerId: 'google.com',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({ authTime: '', expirationTime: '', issuedAtTime: '', signInProvider: '', signInSecondFactor: '', token: '', claims: {} }),
      reload: async () => {},
      toJSON: () => ({}),
      phoneNumber: null,
    } as unknown as User;

    setUser(syntheticUser);
    setAccessToken(token);

    // Cache the developer bypass details to withstand reload
    localStorage.setItem('dev_bypass_user', JSON.stringify({ displayName, email }));
    localStorage.setItem('dev_bypass_token', token);

    const newNotif: AppNotification = {
      id: `dev_bypass_${Date.now()}`,
      title: '🔌 DEV OVERRIDE ACTIVE',
      message: `Developer Bypass active. Authenticated as ${email} via manual access token override.`,
      type: 'success',
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    rewardXp(25, 'Configured Workspace Developer Override');
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out? Your session tokens will be cleared.')) {
      await logout();
      localStorage.removeItem('dev_bypass_user');
      localStorage.removeItem('dev_bypass_token');
      setUser(null);
      setAccessToken(null);
      
      setTasks(INITIAL_TASKS);
      setGoals(INITIAL_GOALS);
      setBadges(INITIAL_BADGES);
      setStats({
        completedCount: 12,
        onTimeRate: 85,
        streakDays: 4,
        totalFocusMinutes: 120,
        level: 1,
        xp: 40
      });
      setNotifications([]);
    }
  };

  // --- Google Calendar Events API Integration ---
  const handleSyncToCalendar = async (task: Task) => {
    if (!accessToken) {
      const wantLogin = window.confirm("Please sign in with Google to enable Google Calendar scheduling. Sign in now?");
      if (wantLogin) {
        handleGoogleLogin();
      }
      return;
    }

    const confirmed = window.confirm(
      `Schedule the task "${task.title}" to your Google Calendar? Saviour AI will configure the event with your deadline.`
    );
    if (!confirmed) return;

    try {
      await createGoogleCalendarEvent(
        accessToken,
        task.title,
        task.description,
        task.dueDate,
        task.estimatedMinutes || 60
      );

      const newNotif: AppNotification = {
        id: `cal_${Date.now()}`,
        title: '📅 CALENDAR EVENT SCHEDULED',
        message: `Task "${task.title}" has been successfully scheduled to your primary Google Calendar.`,
        type: 'success',
        createdAt: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
      rewardXp(15, 'Scheduled Calendar event');
    } catch (err: any) {
      console.error(err);
      alert('Google Calendar Sync Error: ' + err.message);
    }
  };

  // --- Gmail Draft API Integration ---
  const handleSaveGmailDraft = async (task: Task, bodyText: string) => {
    if (!accessToken) {
      const wantLogin = window.confirm("Please sign in with Google to enable Gmail draft integrations. Sign in now?");
      if (wantLogin) {
        handleGoogleLogin();
      }
      return;
    }

    const confirmed = window.confirm(
      `Save this professional AI extension request draft for "${task.title}" in your Gmail drafts folder?`
    );
    if (!confirmed) return;

    try {
      await createGmailDraft(
        accessToken,
        user?.email || 'manager@example.com',
        `Urgent Update / Extension Request: ${task.title}`,
        bodyText
      );

      const newNotif: AppNotification = {
        id: `gmail_${Date.now()}`,
        title: '✉️ GMAIL DRAFT SAVED',
        message: `Your professional delay mitigation email blueprint is saved to your Gmail drafts folder.`,
        type: 'success',
        createdAt: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
      rewardXp(15, 'Saved draft email');
    } catch (err: any) {
      console.error(err);
      alert('Gmail draft creation failed: ' + err.message);
    }
  };

  const handleSendEmailReminder = async (task: Task, checklistItems: string[]) => {
    const userEmail = user?.email || 'manishpatel953249@gmail.com';
    try {
      const response = await fetch('/api/email/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          title: task.title,
          dueDate: task.dueDate,
          checklist: checklistItems
        })
      });
      const data = await response.json();
      if (data.success) {
        const newNotif: AppNotification = {
          id: `email_rem_${Date.now()}`,
          title: '📬 EMAIL REMINDER DISPATCHED',
          message: data.message || `An automated checklist reminder for "${task.title}" has been dispatched to ${userEmail}.`,
          type: 'success',
          createdAt: new Date().toISOString(),
          read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
        rewardXp(10, 'Dispatched email checklist reminder');
        alert(data.message || 'Checklist reminder sent successfully!');
      } else {
        alert(data.error || 'Failed to dispatch email reminder.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send email reminder. Please ensure the backend is connected.');
    }
  };

  // --- Notification Center Event Handlers ---
  const handleTriggerNotificationEmail = async (notification: AppNotification) => {
    if (!accessToken || !user?.email) return;
    try {
      await createGmailDraft(
        accessToken,
        user.email,
        `Saviour AI Sentinel: ${notification.title}`,
        `${notification.message}\n\nGenerated automatically via Saviour AI Live Sentinel on ${new Date(notification.createdAt).toLocaleString()}.`
      );

      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, emailSent: true } : n)
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col relative selection:bg-brand/30 selection:text-white antialiased overflow-x-hidden font-sans scanlines flicker">
      
      {/* Background Pattern: Terminal Grid and digital elements */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-dot-grid" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-crisis/5 blur-[120px] rounded-full" />
      </div>

      {/* Retro CRT System Terminal Header */}
      <nav className="h-[56px] sm:h-[64px] border-b-2 border-border bg-black sticky top-0 z-40 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand/10 border border-brand/30 rounded flex items-center justify-center animate-pulse">
              <Shield className="w-4.5 h-4.5 text-brand" />
            </div>
            <div>
              <span className="font-display font-bold text-base tracking-widest text-brand block uppercase glow-accent">SAVIOUR.OS // PROTOCOL-v2.6</span>
              <span className="text-[9px] uppercase font-mono text-muted tracking-widest hidden sm:block font-bold">Autonomous Life Sentinel Active</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* System Info Indicators - Desktop Only */}
            <div className="hidden md:flex items-center gap-6 text-[11px] font-mono border-l border-border pl-6 text-text-sub font-bold">
              <div>
                USER: <span className="text-text">{user?.email ? user.email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 15) : 'OPERATIVE_742'}</span>
              </div>
              <div>
                STATUS: <span className={user ? "text-brand animate-pulse" : "text-urgent animate-pulse"}>
                  {user ? 'ACTIVE_MITIGATION' : 'AWAITING_AUTH'}
                </span>
              </div>
              <div>
                XP: <span className="text-white">{String(stats.xp).padStart(5, '0')}/{String(stats.level * 200).padStart(5, '0')}</span>
              </div>
            </div>

            {/* Notification Center Bell dropdown */}
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onClear={handleClearNotification}
              onSaveToDraft={handleTriggerNotificationEmail}
              accessToken={accessToken}
            />

            {/* Google Authentication Section */}
            {user ? (
              <div className="flex items-center gap-2 bg-zinc-950 border border-border pl-2 pr-3 py-1 rounded backdrop-blur-md max-w-[120px] sm:max-w-none">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Profile'}
                    className="w-5 h-5 rounded border border-brand/30"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5 h-5 rounded bg-brand/10 border border-brand/30 text-brand flex items-center justify-center font-bold text-[10px]">
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}
                <span className="text-[11px] font-bold font-mono text-slate-300 truncate hidden sm:inline-block max-w-[90px]">
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-muted hover:text-crisis p-0.5 rounded transition-colors cursor-pointer flex-shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <CTAButton
                variant="primary"
                size="sm"
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="font-mono text-xs max-w-[120px] sm:max-w-none truncate"
              >
                {isLoggingIn ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
              </CTAButton>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Headings Section (High-Contrast System Terminal Cover Layout) */}
      <header className="max-w-5xl mx-auto px-6 text-center pt-16 pb-12 space-y-4 relative z-10 flex flex-col items-center border-b border-dashed border-border mb-12 w-full">
        <div className="text-brand font-mono text-xs uppercase font-bold tracking-widest glow-accent">[SYSTEM.OVERRIDE_ENABLED]</div>
        <h1 className="font-display tracking-tight leading-[0.95] max-w-5xl mx-auto mb-4 flex flex-col text-center">
          <span className="text-white font-bold text-[40px] sm:text-[72px] xl:text-[84px] block uppercase">DEFEAT DEADLINES</span>
          <span className="text-brand font-bold text-[44px] sm:text-[76px] xl:text-[90px] block uppercase tracking-tight glow-accent">BEFORE THEY DEFEAT YOU.</span>
        </h1>
        
        <p className="font-mono text-xs text-muted uppercase tracking-wider font-bold max-w-xl mx-auto leading-relaxed">
          DEPLOYING 5 AUTONOMOUS AGENTS TO GUARD PROJECT INTEGRITY.
        </p>

        {/* Hero CTA row */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full sm:w-auto px-4 justify-center font-mono">
          <CTAButton
            variant="primary"
            size="lg"
            onClick={() => {
              const element = document.getElementById('active-feature-tab');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto font-display font-bold uppercase tracking-wider text-xs"
          >
            Start protecting deadlines →
          </CTAButton>
          <CTAButton
            variant="ghost"
            size="lg"
            onClick={() => setShowOnboarding(true)}
            className="w-full sm:w-auto text-muted hover:text-brand font-display font-bold uppercase tracking-wider text-xs"
          >
            See how agents work
          </CTAButton>
        </div>
      </header>

      {/* Main split dashboard stage */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel (Bento, active tab features, checklists) - Takes 8 columns */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Bento statistics panel */}
            <DashboardMetrics 
              tasks={tasks}
              goals={goals}
              badges={badges}
              stats={stats}
              onSelectPomodoro={() => {
                setActiveTab('pomodoro');
                const element = document.getElementById('active-feature-tab');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Google Workspace Integration Center */}
            <WorkspaceConnector
              user={user}
              accessToken={accessToken}
              isLoggingIn={isLoggingIn}
              onConnectGoogle={handleGoogleLogin}
              onApplyDeveloperBypass={handleApplyDeveloperBypass}
              onDisconnect={handleLogout}
            />

            {/* Feature tab switcher buttons */}
            <div id="active-feature-tab" className="tab-strip-scroll sm:flex sm:overflow-visible sm:snap-none bg-zinc-950 border border-border p-1 rounded-2xl">
              <button
                onClick={() => setActiveTab('board')}
                className={`relative flex-1 max-w-[160px] py-2.5 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  activeTab === 'board' 
                    ? 'bg-zinc-900 text-text border border-border shadow-lg font-bold' 
                    : 'text-text-sub hover:text-text hover:bg-zinc-900/50'
                }`}
              >
                <Layers className="w-4 h-4" />
                Deadlines Checklist
                {activeTab === 'board' && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-4 right-4 h-[2px] bg-brand rounded-full"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('pomodoro')}
                className={`relative flex-1 max-w-[160px] py-2.5 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  activeTab === 'pomodoro' 
                    ? 'bg-zinc-900 text-text border border-border shadow-lg font-bold' 
                    : 'text-text-sub hover:text-text hover:bg-zinc-900/50'
                }`}
              >
                <Timer className="w-4 h-4" />
                Pomodoro Rescue
                {activeTab === 'pomodoro' && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-4 right-4 h-[2px] bg-brand rounded-full"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`relative flex-1 max-w-[160px] py-2.5 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  activeTab === 'schedule' 
                    ? 'bg-zinc-900 text-text border border-border shadow-lg font-bold' 
                    : 'text-text-sub hover:text-text hover:bg-zinc-900/50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                AI Autopilot Timeline
                {activeTab === 'schedule' && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-4 right-4 h-[2px] bg-brand rounded-full"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('habits')}
                className={`relative flex-1 max-w-[160px] py-2.5 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  activeTab === 'habits' 
                    ? 'bg-zinc-900 text-text border border-border shadow-lg font-bold' 
                    : 'text-text-sub hover:text-text hover:bg-zinc-900/50'
                }`}
              >
                <Flame className="w-4 h-4" />
                Habits & Recurrence
                {activeTab === 'habits' && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-4 right-4 h-[2px] bg-brand rounded-full"
                  />
                )}
              </button>
            </div>

            {/* Render selected workspace tabs */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === 'board' && (
                  <TaskBoard
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                    onBreakdownTask={handleBreakdownTask}
                    onMitigateTask={handleMitigateTask}
                    accessToken={accessToken}
                    onSyncToCalendar={handleSyncToCalendar}
                    onSaveGmailDraft={handleSaveGmailDraft}
                    onShowOnboarding={() => setShowOnboarding(true)}
                    onSendEmailReminder={handleSendEmailReminder}
                  />
                )}

                {activeTab === 'pomodoro' && (
                  <PomodoroRescue
                    tasks={tasks}
                    onCompleteSession={handleCompletePomodoroSession}
                  />
                )}

                {activeTab === 'schedule' && (
                  <SchedulerView
                    tasks={tasks}
                    onUpdateTask={handleUpdateTask}
                    onAutoSchedule={handleAutoSchedule}
                  />
                )}

                {activeTab === 'habits' && (
                  <HabitGoalTracker
                    goals={goals}
                    onUpdateGoal={handleUpdateGoal}
                    onAddGoal={handleAddGoal}
                    onDeleteGoal={handleDeleteGoal}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Unlocked Badges Drawer row (Collapsible) */}
            <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 font-sans">
              <button
                onClick={() => setBadgesExpanded(!badgesExpanded)}
                className="w-full text-left text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between gap-2 cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400" />
                  Achieved Badges & Trophies
                </span>
                <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  {badgesExpanded ? 'Collapse ▲' : 'Expand ▼'}
                </span>
              </button>
              
              <AnimatePresence initial={false}>
                {badgesExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {badges.map((badge) => {
                        const isUnlocked = badge.unlockedAt !== null;
                        return (
                          <div
                            key={badge.id}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 ${
                              isUnlocked
                                ? 'bg-indigo-950/10 border-indigo-500/25 shadow-md badge-shine'
                                : 'bg-zinc-950/50 border-zinc-800/50 opacity-45 grayscale'
                            }`}
                          >
                            <div className={`p-2 rounded-xl flex items-center justify-center ${
                              isUnlocked ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-slate-500'
                            }`}>
                              <Award className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="block font-medium text-xs text-slate-200">{badge.title}</span>
                              <span className="text-[9px] text-slate-500 block mt-0.5 max-w-[100px] leading-tight mx-auto">{badge.description}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right panel (AI Chat Companion) - Takes 4 columns */}
          <div id="ai-agent-panel" className="lg:col-span-4 lg:sticky lg:top-24 h-[420px] lg:h-[650px]">
            <AIAgentCompanion
              messages={messages}
              onSendMessage={handleSendMessage}
              onTriggerSuggestedAction={handleTriggerSuggestedAction}
              isGenerating={chatGenerating}
            />
          </div>

        </div>
      </main>

      {/* Badge unlocked celebration modal pop-up */}
      <AnimatePresence>
        {unlockedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-purple-500/30 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 relative overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute -top-16 -left-16 w-36 h-36 bg-purple-500/20 blur-2xl rounded-full" />
              
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl mx-auto flex items-center justify-center text-purple-400">
                <Award className="w-8 h-8 animate-bounce" />
              </div>
              
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">Badge Unlocked</span>
                <h4 className="font-sans font-bold text-lg text-white">{unlockedBadge.title}</h4>
                <p className="text-xs text-slate-400 pr-2 pl-2">
                  {unlockedBadge.description}
                </p>
              </div>

              <div className="bg-purple-500/5 border border-purple-500/10 p-2 rounded-xl text-purple-300 font-mono text-xs">
                +100 Streak XP Added
              </div>

              <CTAButton
                onClick={() => setUnlockedBadge(null)}
                variant="primary"
                size="sm"
                className="w-full"
              >
                Claim Reward & Continue
              </CTAButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile FAB for AI Agent Companion smooth-scroll access */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
        onClick={() => {
          document.getElementById('ai-agent-panel')?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="fixed bottom-6 right-6 z-50 w-[52px] h-[52px] rounded-full bg-brand hover:bg-indigo-500 text-white flex items-center justify-center shadow-[0_8px_32px_rgba(99,102,241,0.45)] lg:hidden cursor-pointer"
        aria-label="Open AI Agent"
      >
        <Bot className="w-[22px] h-[22px]" />
      </motion.button>

      {/* Symmetrical simple Footer */}
      <footer className="border-t border-white/5 py-8 bg-zinc-950/20 text-center text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 Saviour AI Workspace. Dedicated to Zero Missed Deadlines.</span>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Security ABAC rules active</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Sourced from magicui.design</span>
          </div>
        </div>
      </footer>

      {/* Onboarding Assistant Carousel (First-Time User Experience Modal Overlay) */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingCarousel
            onClose={() => {
              setShowOnboarding(false);
              localStorage.setItem('onboarding_completed', 'true');
            }}
            onConnectGoogle={handleGoogleLogin}
            isLoggedIn={!!accessToken}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
