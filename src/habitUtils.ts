import type { Habit } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

export const HABIT_PRESET_ICONS = [
  '⭐', '💧', '🏃', '📚', '🧘', '🥗', '💤', '✍️',
  '🎯', '💊', '🌿', '🚶', '🚴', '💪', '🎨', '🎵',
];

export const HABIT_PRESET_COLORS = [
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#f97316', // Orange
  '#eab308', // Yellow
  '#06b6d4', // Cyan
  '#10b981', // Emerald
];

export function isHabitDone(habit: Habit, date: string): boolean {
  return Boolean(habit.log && habit.log[date]);
}

export function toggleHabitStatus(habit: Habit, date: string): Habit {
  const updatedLog = { ...(habit.log || {}) };
  if (updatedLog[date]) {
    delete updatedLog[date];
  } else {
    updatedLog[date] = true;
  }
  return {
    ...habit,
    log: updatedLog,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculates current streak and longest streak of consecutive days.
 */
export function calculateHabitStreaks(habit: Habit, today: string = todayISO()): { current: number; longest: number } {
  if (!habit.log || Object.keys(habit.log).length === 0) {
    return { current: 0, longest: 0 };
  }

  // Calculate current streak
  let current = 0;
  let checkDate = today;

  if (isHabitDone(habit, checkDate)) {
    while (isHabitDone(habit, checkDate)) {
      current++;
      checkDate = shiftDate(checkDate, -1);
    }
  } else {
    // If today is not done yet, check if yesterday was done
    const yesterday = shiftDate(checkDate, -1);
    if (isHabitDone(habit, yesterday)) {
      checkDate = yesterday;
      while (isHabitDone(habit, checkDate)) {
        current++;
        checkDate = shiftDate(checkDate, -1);
      }
    }
  }

  // Calculate longest streak across all recorded dates
  const dates = Object.keys(habit.log)
    .filter((d) => habit.log[d])
    .sort();

  if (dates.length === 0) {
    return { current: 0, longest: 0 };
  }

  let longest = 1;
  let run = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = dates[i - 1];
    const curr = dates[i];
    const expected = shiftDate(prev, 1);

    if (curr === expected) {
      run++;
      if (run > longest) longest = run;
    } else if (curr !== prev) {
      run = 1;
    }
  }

  return { current, longest: Math.max(longest, current) };
}

/**
 * Calculates completion rate percentage for the current month
 */
export function calculateMonthRate(habit: Habit, currentYearMonth?: string): number {
  const ym = currentYearMonth || todayISO().slice(0, 7);
  const [y, m] = ym.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();

  const today = todayISO();
  let daysToCount = daysInMonth;
  if (today.startsWith(ym)) {
    daysToCount = parseInt(today.split('-')[2], 10);
  }

  if (daysToCount <= 0) return 0;

  let completedDays = 0;
  for (let d = 1; d <= daysToCount; d++) {
    const dateStr = `${ym}-${pad(d)}`;
    if (habit.log && habit.log[dateStr]) {
      completedDays++;
    }
  }

  return Math.round((completedDays / daysToCount) * 100);
}

/**
 * Get array of last N days ending on specified date (default today)
 */
export function getRecentDays(daysCount: number = 7, refDate: string = todayISO()): string[] {
  const result: string[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    result.push(shiftDate(refDate, -i));
  }
  return result;
}
