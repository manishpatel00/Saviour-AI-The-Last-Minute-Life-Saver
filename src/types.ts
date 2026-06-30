export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO string
  priority: TaskPriority;
  status: TaskStatus;
  estimatedMinutes: number;
  actualMinutes: number;
  category: string;
  subtasks: SubTask[];
  urgencyScore: number; // Calculated dynamically: 1 - 100
  lastMitigation?: {
    type: 'extension_request' | 'action_plan' | 'reschedule';
    text: string;
  } | null;
  triageData?: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    recoveryPlan: string[];
    damageControlEmail: string;
    recoveryMindset: string;
  } | null;
}

export interface Goal {
  id: string;
  title: string;
  streak: number;
  targetFrequency: 'daily' | 'weekly' | 'monthly';
  completedDates: string[]; // ISO Date strings (YYYY-MM-DD)
  category: string;
  isHabit?: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  unlockedAt: string | null; // ISO string
}

export interface SuggestedAction {
  id: string;
  label: string;
  actionType: 'add_task' | 'breakdown_task' | 'mitigate_task' | 'reschedule' | 'focus';
  payload: any;
}

export interface AIResponse {
  message: string;
  suggestedTasks?: Partial<Task>[];
  actions?: SuggestedAction[];
  mitigationDraft?: string;
  breakdown?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  suggestedActions?: SuggestedAction[];
}

export interface UserStats {
  completedCount: number;
  onTimeRate: number; // percentage
  streakDays: number;
  totalFocusMinutes: number;
  level: number;
  xp: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  createdAt: string; // ISO string
  read: boolean;
  taskId?: string;
  emailSent?: boolean;
}

