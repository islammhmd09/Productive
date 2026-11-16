export type Lang = 'en' | 'ar';
export type Theme = 'dark' | 'light';
export type Rating = 1 | 2 | 3 | 4 | 5 | null;

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD, one journal per day
  rating: Rating;
  dayText: string;
  feelings: string;
  story: string;
  forgiveness: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'partial' | 'done';

export interface Task {
  id: string;
  title: string;
  notes: string;
  date: string;     // YYYY-MM-DD. Normal task: its day. Long-term task: the day it starts.
  time: string;     // 'HH:MM' start, or ''
  endTime: string;  // 'HH:MM' end, or ''
  group: string;    // project label, or '' for a single task
  pinned: boolean;  // long-term: shows every day from `date` until deleted
  status: TaskStatus;                 // used by normal tasks
  log: Record<string, TaskStatus>;    // used by long-term tasks: status per day
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  color: string;       // Hex or CSS color
  icon: string;        // Emoji / icon character
  description?: string;
  createdAt: string;
  updatedAt: string;
  log: Record<string, boolean>;  // YYYY-MM-DD -> completed
}

export interface AppSettings {
  theme: Theme;
  language: Lang;
  todoAccentColor: string;     // custom accent color for to-do items
  notificationsEnabled: boolean;
  notificationIntervalHours: number; // default 2 hours
  customReminderTime: string;  // optional daily specific reminder like "09:00" or ''
}
