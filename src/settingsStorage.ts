import type { AppSettings } from './types';

const SETTINGS_KEY = 'app-settings-v2';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'en',
  todoAccentColor: '#22c55e',
  notificationsEnabled: false,
  notificationIntervalHours: 2,
  customReminderTime: '',
};

export const COLOR_PALETTES = [
  { name: 'Emerald', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Sky Blue', value: '#0ea5e9' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Coral', value: '#fb923c' },
];

let cachedSettings: AppSettings | null = null;
const listeners = new Set<(settings: AppSettings) => void>();

export function getSettings(): AppSettings {
  if (cachedSettings) return cachedSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      cachedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      return cachedSettings!;
    }
  } catch { /* ignore */ }
  cachedSettings = { ...DEFAULT_SETTINGS };
  return cachedSettings;
}

export function saveSettings(settings: AppSettings): void {
  cachedSettings = { ...settings };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
  applySettingsToDOM(settings);
  listeners.forEach((l) => l(settings));
}

export function subscribeSettings(fn: (settings: AppSettings) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Apply Theme & Custom To-Do Colors to document root */
export function applySettingsToDOM(settings: AppSettings = getSettings()): void {
  const root = document.documentElement;

  // Theme attribute
  root.setAttribute('data-theme', settings.theme);

  // Apply custom To-Do Accent color
  if (settings.todoAccentColor) {
    root.style.setProperty('--todo-accent', settings.todoAccentColor);
  }
}
