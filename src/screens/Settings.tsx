import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { COLOR_PALETTES, getSettings, saveSettings } from '../settingsStorage';
import { journalRepo } from '../storage';
import { exportJournalsToPDF } from '../pdfExport';
import {
  getNotificationPermissionStatus,
  reconfigureNotifications,
  requestNotificationPermission,
  sendNotificationNow,
} from '../notificationService';
import {
  BellIcon,
  CheckIcon,
  GearIcon,
} from '../icons';
import type { AppSettings, Lang, Theme } from '../types';

export function Settings() {
  const { t, lang, setLang } = useI18n();
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [permission, setPermission] = useState<string>(getNotificationPermissionStatus());
  const [testStatus, setTestStatus] = useState<string>('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [journalCount, setJournalCount] = useState<number>(0);

  useEffect(() => {
    journalRepo.list().then((list) => setJournalCount(list.length)).catch(() => undefined);
  }, []);

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);

    if (key === 'notificationsEnabled' || key === 'notificationIntervalHours') {
      reconfigureNotifications();
    }
  }

  function handleLangChange(newLang: Lang) {
    setLang(newLang);
    update('language', newLang);
  }

  function handleThemeChange(newTheme: Theme) {
    update('theme', newTheme);
  }

  async function handleRequestPermission() {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      update('notificationsEnabled', true);
    }
  }

  async function handleSendTest() {
    setTestStatus('sending');
    const res = await sendNotificationNow();
    if (res.success) {
      setTestStatus(t.testNotificationSent);
    } else {
      setTestStatus(res.message || 'Failed to send notification');
    }
    setTimeout(() => setTestStatus(''), 5000);
  }

  async function handleExportPDF() {
    setPdfLoading(true);
    try {
      const entries = await journalRepo.list();
      exportJournalsToPDF(entries, lang, t);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <GearIcon width={28} height={28} color="var(--g3)" />
        <h1 style={{ margin: 0 }}>{t.settingsTitle}</h1>
      </div>
      <p className="muted" style={{ marginBottom: 20 }}>{t.settingsSubtitle}</p>

      {/* 1. Language Setting */}
      <div className="card settings-section">
        <div className="settings-section-head">
          <h2>{t.languageSection}</h2>
          <p>{t.languageDesc}</p>
        </div>
        <div className="choice-group">
          <button
            type="button"
            className="choice-btn"
            aria-pressed={lang === 'en'}
            onClick={() => handleLangChange('en')}
          >
            {lang === 'en' && <CheckIcon width={16} height={16} />}
            {t.langEnglish}
          </button>
          <button
            type="button"
            className="choice-btn"
            aria-pressed={lang === 'ar'}
            onClick={() => handleLangChange('ar')}
          >
            {lang === 'ar' && <CheckIcon width={16} height={16} />}
            {t.langArabic}
          </button>
        </div>
      </div>

      {/* 2. Appearance (Dark / Light Mode) */}
      <div className="card settings-section">
        <div className="settings-section-head">
          <h2>{t.appearanceSection}</h2>
          <p>{t.appearanceDesc}</p>
        </div>
        <div className="choice-group">
          <button
            type="button"
            className="choice-btn"
            aria-pressed={settings.theme === 'dark'}
            onClick={() => handleThemeChange('dark')}
          >
            🌙 {t.themeDark}
          </button>
          <button
            type="button"
            className="choice-btn"
            aria-pressed={settings.theme === 'light'}
            onClick={() => handleThemeChange('light')}
          >
            ☀️ {t.themeLight}
          </button>
        </div>
      </div>

      {/* 3. Customize To-Do Colors */}
      <div className="card settings-section">
        <div className="settings-section-head">
          <h2>{t.customizationSection}</h2>
          <p>{t.customizationDesc}</p>
        </div>
        <div className="preset-grid" style={{ marginTop: 10 }}>
          {COLOR_PALETTES.map((p) => {
            const isSelected = settings.todoAccentColor === p.value;
            return (
              <button
                key={p.value}
                type="button"
                className={`color-bubble ${isSelected ? 'active' : ''}`}
                style={{ backgroundColor: p.value }}
                title={p.name}
                aria-label={p.name}
                onClick={() => update('todoAccentColor', p.value)}
              />
            );
          })}
        </div>
      </div>

      {/* 4. Notification Settings */}
      <div className="card settings-section">
        <div className="settings-section-head">
          <h2>
            <BellIcon width={20} height={20} />
            {t.notificationsSection}
          </h2>
          <p>{t.notificationsDesc}</p>
        </div>

        <label className="switch" style={{ marginTop: 14 }}>
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={(e) => {
              const enabled = e.target.checked;
              if (enabled && permission !== 'granted') {
                void handleRequestPermission();
              } else {
                update('notificationsEnabled', enabled);
              }
            }}
          />
          <strong>{t.enableNotifications}</strong>
        </label>

        {/* Permission Badge */}
        <div style={{ marginBottom: 14 }}>
          {permission === 'granted' ? (
            <span className="status-badge ok">✓ {t.permissionGranted}</span>
          ) : permission === 'denied' ? (
            <span className="status-badge err">✗ {t.permissionDenied}</span>
          ) : (
            <div>
              <span className="status-badge warn">! {t.notificationPermission}</span>
              <button
                type="button"
                className="btn small ghost"
                style={{ marginInlineStart: 8 }}
                onClick={() => void handleRequestPermission()}
              >
                {t.grantPermission}
              </button>
            </div>
          )}
        </div>

        {/* Interval dropdown */}
        <div className="field" style={{ marginTop: 12 }}>
          <span>{t.notificationInterval}</span>
          <select
            value={settings.notificationIntervalHours}
            onChange={(e) => update('notificationIntervalHours', parseFloat(e.target.value))}
          >
            <option value="0.25">Every 15 minutes (Testing)</option>
            <option value="0.5">Every 30 minutes</option>
            <option value="1">Every 1 hour</option>
            <option value="2">Every 2 hours (Recommended Default)</option>
            <option value="3">Every 3 hours</option>
            <option value="4">Every 4 hours</option>
            <option value="6">Every 6 hours</option>
            <option value="12">Every 12 hours</option>
          </select>
          <small className="muted" style={{ display: 'block', marginTop: 4 }}>
            {t.notificationIntervalDesc}
          </small>
        </div>

        {/* Test Notification Button */}
        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            className="btn ghost small"
            onClick={() => void handleSendTest()}
          >
            <BellIcon width={16} height={16} />
            {t.sendTestNotification}
          </button>
          {testStatus && (
            <p className="msg saved" style={{ marginTop: 6 }}>
              {testStatus}
            </p>
          )}
        </div>
      </div>

      {/* 5. PDF Export Feature */}
      <div className="card settings-section">
        <div className="pdf-export-card">
          <div className="pdf-export-info">
            <strong>{t.pdfSection}</strong>
            <p>{t.pdfDesc}</p>
            <small className="muted">
              {journalCount > 0
                ? `${journalCount} journals ready for export`
                : t.noJournalsToExport}
            </small>
          </div>
          <button
            type="button"
            className="btn"
            disabled={pdfLoading || journalCount === 0}
            onClick={() => void handleExportPDF()}
          >
            📄 {pdfLoading ? t.loading : t.exportPdfBtn}
          </button>
        </div>
      </div>
    </section>
  );
}
