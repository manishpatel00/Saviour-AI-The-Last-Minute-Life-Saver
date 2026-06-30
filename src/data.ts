import { Task, Goal, Badge } from './types';

// Let's create dates relative to now to ensure deadlines always look urgent and fresh
const now = new Date();
const formatDateRelative = (daysOffset: number, hoursOffset: number = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() + daysOffset);
  d.setHours(d.getHours() + hoursOffset);
  return d.toISOString();
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Submit BlockseBlock Hackathon Project',
    description: 'Finalize full-stack React codebase, compile and deploy to Google Cloud, and submit presentation links.',
    dueDate: formatDateRelative(0, 4), // 4 hours from now - CRITICAL!
    priority: 'critical',
    status: 'in_progress',
    estimatedMinutes: 120,
    actualMinutes: 45,
    category: 'Hackathon',
    urgencyScore: 98,
    subtasks: [
      { id: 'st1', title: 'Implement Magic UI design system', completed: true },
      { id: 'st2', title: 'Configure server-side Gemini API endpoints', completed: true },
      { id: 'st3', title: 'Add full-stack interactive client dashboard', completed: false },
      { id: 'st4', title: 'Run final compiler and verify dev build', completed: false }
    ]
  },
  {
    id: 't2',
    title: 'Pay Credit Card Bill (Overdue)',
    description: 'Process payment of $420 to avoid interest charges and penalty fees.',
    dueDate: formatDateRelative(-1, 0), // 1 day ago - OVERDUE!
    priority: 'critical',
    status: 'pending',
    estimatedMinutes: 10,
    actualMinutes: 0,
    category: 'Bills',
    urgencyScore: 95,
    subtasks: [
      { id: 'st5', title: 'Log in to banking portal', completed: false },
      { id: 'st6', title: 'Authorize payment transfer', completed: false }
    ],
    lastMitigation: {
      type: 'action_plan',
      text: 'AI Mitigator alert: This bill is currently 24 hours overdue. We suggest paying it immediately. If funds are low, we can draft a notification request to support or schedule a lower minimum payment transfer.'
    }
  },
  {
    id: 't3',
    title: 'Technical Interview Preparation',
    description: 'Review system design architectures, database scaling patterns, and practice 3 advanced graph algorithms.',
    dueDate: formatDateRelative(1, 2), // 1 day and 2 hours from now
    priority: 'high',
    status: 'pending',
    estimatedMinutes: 180,
    actualMinutes: 0,
    category: 'Career',
    urgencyScore: 75,
    subtasks: [
      { id: 'st7', title: 'Practice graph questions on Leetcode', completed: false },
      { id: 'st8', title: 'Review Load Balancers and Caching systems', completed: false }
    ]
  },
  {
    id: 't4',
    title: 'Doctor Appointment Follow-up',
    description: 'Call the clinic to confirm next week\'s medical results and update health insurance details.',
    dueDate: formatDateRelative(3, 0), // 3 days from now
    priority: 'medium',
    status: 'pending',
    estimatedMinutes: 15,
    actualMinutes: 0,
    category: 'Personal',
    urgencyScore: 45,
    subtasks: []
  },
  {
    id: 't5',
    title: 'Refactor Auth Route Security',
    description: 'Update JSON web token validation logic and implement secure HTTP-only cookies in server endpoints.',
    dueDate: formatDateRelative(5, 0), // 5 days from now
    priority: 'low',
    status: 'completed',
    estimatedMinutes: 90,
    actualMinutes: 105,
    category: 'Work',
    urgencyScore: 12,
    subtasks: [
      { id: 'st9', title: 'Audit current middleware', completed: true },
      { id: 'st10', title: 'Write JWT verification tests', completed: true }
    ]
  }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'LeetCode Problem Daily',
    streak: 5,
    targetFrequency: 'daily',
    completedDates: [
      formatDateRelative(-1, 0).substring(0, 10),
      formatDateRelative(-2, 0).substring(0, 10),
      formatDateRelative(-3, 0).substring(0, 10),
      formatDateRelative(-4, 0).substring(0, 10),
      formatDateRelative(-5, 0).substring(0, 10),
    ],
    category: 'Career'
  },
  {
    id: 'g2',
    title: '30 Minutes Daily Deep Focus',
    streak: 12,
    targetFrequency: 'daily',
    completedDates: [
      formatDateRelative(-1, 0).substring(0, 10),
      formatDateRelative(-2, 0).substring(0, 10),
      formatDateRelative(-3, 0).substring(0, 10),
    ],
    category: 'Productivity'
  },
  {
    id: 'g3',
    title: 'Cardio Workout Weekly',
    streak: 3,
    targetFrequency: 'weekly',
    completedDates: [
      formatDateRelative(-4, 0).substring(0, 10)
    ],
    category: 'Health'
  }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'b1',
    title: 'First Rescue',
    description: 'Completed a critical task within 1 hour of its deadline.',
    icon: 'ShieldAlert',
    unlockedAt: formatDateRelative(-2, 0)
  },
  {
    id: 'b2',
    title: 'Overdue Slayer',
    description: 'Successfully cleared an overdue task.',
    icon: 'Zap',
    unlockedAt: null
  },
  {
    id: 'b3',
    title: 'Deep Focus Disciple',
    description: 'Completed 5 Pomodoro-focused deep sessions.',
    icon: 'Hourglass',
    unlockedAt: null
  },
  {
    id: 'b4',
    title: 'Streak Titan',
    description: 'Maintained a task streak of 7 days.',
    icon: 'Flame',
    unlockedAt: null
  }
];

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  type: 'meeting' | 'personal' | 'work';
}

export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Engineering Alignment Sync',
    start: formatDateRelative(0, -1), // 1 hour ago
    end: formatDateRelative(0, 0),    // Just ended
    type: 'meeting'
  },
  {
    id: 'e2',
    title: 'Lunch & Project Regroup',
    start: formatDateRelative(0, 1),  // 1 hour from now
    end: formatDateRelative(0, 2),    // 2 hours from now
    type: 'meeting'
  },
  {
    id: 'e3',
    title: 'Mock Interview Coaching Session',
    start: formatDateRelative(1, -2), // Tomorrow morning
    end: formatDateRelative(1, -1),
    type: 'work'
  },
  {
    id: 'e4',
    title: 'Evening Run & Meditate',
    start: formatDateRelative(0, 8),  // 8 hours from now
    end: formatDateRelative(0, 9),
    type: 'personal'
  }
];
