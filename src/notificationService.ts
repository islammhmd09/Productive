import type { Task } from './types';
import { getSettings } from './settingsStorage';
import { taskRepo } from './taskStorage';
import { appliesTo, statusOn } from './taskUtils';
import { todayISO } from './utils';

let timerId: number | undefined;

/** Request browser notification permission. Returns 'granted' | 'denied' | 'default'. */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!('Notification' in window)) return 'unsupported';
  try {
    const res = await Notification.requestPermission();
    return res;
  } catch {
    return Notification.permission;
  }
}

/** Check current permission status */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/** Fetch today's uncompleted tasks */
export async function getUncompletedTasks(): Promise<Task[]> {
  try {
    const today = todayISO();
    const all = await taskRepo.list();
    return all.filter((t) => appliesTo(t, today) && statusOn(t, today) !== 'done');
  } catch {
    return [];
  }
}

/** Build the custom message required by the user */
export function buildReminderMessage(uncompleted: Task[]): { title: string; body: string } {
  const title = 'Productive – Task Reminder';

  if (uncompleted.length === 0) {
    return {
      title,
      body: 'Hi, What About Checking Your Tasks? All of your tasks for today are done! Wonderful work!',
    };
  }

  const taskList = uncompleted
    .slice(0, 5)
    .map((t) => `• ${t.title}${t.time ? ` (${t.time})` : ''}`)
    .join('\n');

  const more = uncompleted.length > 5 ? `\n...and ${uncompleted.length - 5} more` : '';
  const body = `Hi, What About Checking Your Tasks?\n\nUncompleted tasks:\n${taskList}${more}`;

  return { title, body };
}

/** Send notification immediately */
export async function sendNotificationNow(): Promise<{ success: boolean; message?: string }> {
  if (!('Notification' in window)) {
    return { success: false, message: 'Notifications are not supported in this browser.' };
  }

  if (Notification.permission !== 'granted') {
    const perm = await requestNotificationPermission();
    if (perm !== 'granted') {
      return { success: false, message: 'Notification permission was not granted.' };
    }
  }

  const uncompleted = await getUncompletedTasks();
  const { title, body } = buildReminderMessage(uncompleted);

  try {
    // Attempt standard Notification API
    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'task-reminder',
    });
    return { success: true };
  } catch {
    // In mobile / PWA contexts, fallback to ServiceWorkerRegistration
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, {
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: 'task-reminder',
        });
        return { success: true };
      } catch (err) {
        return { success: false, message: String(err) };
      }
    }
    return { success: false, message: 'Could not trigger notification.' };
  }
}

/** Start the scheduled interval (default every 2 hours or custom interval) */
export function startNotificationScheduler(): void {
  stopNotificationScheduler();
  const settings = getSettings();
  if (!settings.notificationsEnabled) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const hours = Math.max(0.25, settings.notificationIntervalHours || 2);
  const intervalMs = hours * 60 * 60 * 1000;

  timerId = window.setInterval(() => {
    void sendNotificationNow();
  }, intervalMs);
}

/** Stop scheduled notifications */
export function stopNotificationScheduler(): void {
  if (timerId !== undefined) {
    window.clearInterval(timerId);
    timerId = undefined;
  }
}

/** Reconfigure scheduler whenever settings change */
export function reconfigureNotifications(): void {
  const settings = getSettings();
  if (settings.notificationsEnabled) {
    startNotificationScheduler();
  } else {
    stopNotificationScheduler();
  }
}
