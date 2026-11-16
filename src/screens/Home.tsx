import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { journalRepo } from '../storage';
import { habitRepo } from '../habitStorage';
import { taskRepo } from '../taskStorage';
import { useSyncState } from '../sync';
import { fill, todayISO } from '../utils';
import { appliesTo, statusOn } from '../taskUtils';
import { isHabitDone } from '../habitUtils';
import { AppLogo, BookIcon, ChecklistIcon, CloudIcon, GearIcon, TargetIcon } from '../icons';

export function Home() {
  const { t } = useI18n();
  const sync = useSyncState();
  const [journalCount, setJournalCount] = useState<number | null>(null);
  const [pendingTasksCount, setPendingTasksCount] = useState<number | null>(null);
  const [habitsCount, setHabitsCount] = useState<number | null>(null);
  const [habitsDoneToday, setHabitsDoneToday] = useState<number | null>(null);

  useEffect(() => {
    const today = todayISO();

    // 1. Load journals count
    journalRepo.list().then((l) => setJournalCount(l.length)).catch(() => undefined);

    // 2. Load today's uncompleted tasks count
    taskRepo.list().then((tasks) => {
      const todayTasks = tasks.filter((t) => appliesTo(t, today));
      const pending = todayTasks.filter((t) => statusOn(t, today) !== 'done').length;
      setPendingTasksCount(pending);
    }).catch(() => undefined);

    // 3. Load habits stats
    habitRepo.list().then((habits) => {
      setHabitsCount(habits.length);
      const done = habits.filter((h) => isHabitDone(h, today)).length;
      setHabitsDoneToday(done);
    }).catch(() => undefined);
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? t.greetMorning : hour < 18 ? t.greetAfternoon : t.greetEvening;
  const dayNumber = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000);
  const phrase = t.phrases[dayNumber % t.phrases.length];

  return (
    <section className="hero">
      {/* Main Crescent Moon Logo */}
      <div style={{ marginBottom: 4 }}>
        <AppLogo size={68} />
      </div>

      <p className="greet">{greet}</p>
      <blockquote>{phrase}</blockquote>

      {/* Primary Call to Action */}
      <a className="btn big" href="#/write">
        {t.newJournal}
      </a>

      {/* Organized Navigation Hub Cards */}
      <div className="home-hub-grid">
        {/* Journals Card */}
        <a className="hub-card" href="#/history">
          <div className="hub-card-icon">
            <BookIcon width={22} height={22} />
          </div>
          <div className="hub-card-content">
            <strong>{t.history}</strong>
            <small>
              {journalCount !== null && journalCount > 0
                ? fill(t.savedCount, { n: journalCount })
                : t.historyTitle}
            </small>
          </div>
        </a>

        {/* To-Do List Card */}
        <a className="hub-card" href="#/tasks">
          <div className="hub-card-icon">
            <ChecklistIcon width={22} height={22} />
          </div>
          <div className="hub-card-content">
            <strong>{t.navTasks}</strong>
            <small>
              {pendingTasksCount !== null && pendingTasksCount > 0
                ? `${pendingTasksCount} pending for today`
                : t.tasksTitle}
            </small>
          </div>
        </a>

        {/* Habits Card */}
        <a className="hub-card" href="#/habits">
          <div className="hub-card-icon">
            <TargetIcon width={22} height={22} />
          </div>
          <div className="hub-card-content">
            <strong>{t.navHabits}</strong>
            <small>
              {habitsCount !== null && habitsCount > 0
                ? `${habitsDoneToday ?? 0}/${habitsCount} ${t.todayStatus.toLowerCase()}`
                : t.habitsTitle}
            </small>
          </div>
        </a>

        {/* Cloud Sync Card */}
        <a className="hub-card" href="#/sync">
          <div className="hub-card-icon">
            <CloudIcon width={22} height={22} />
          </div>
          <div className="hub-card-content">
            <strong>{t.navSync}</strong>
            <small>
              {sync.email ? sync.email : t.syncTitle}
            </small>
          </div>
        </a>
      </div>

      {/* Footer Controls & Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
        <a className="btn ghost small" href="#/settings">
          <GearIcon width={16} height={16} />
          {t.navSettings}
        </a>
      </div>

      <p className="muted" style={{ marginTop: 14 }}>
        {t.privacy}
      </p>
    </section>
  );
}
