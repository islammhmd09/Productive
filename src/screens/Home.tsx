import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import { journalRepo } from '../storage';
import { habitRepo } from '../habitStorage';
import { taskRepo } from '../taskStorage';
import { useSyncState } from '../sync';
import { fill, todayISO } from '../utils';
import { appliesTo, statusOn } from '../taskUtils';
import { isHabitDone } from '../habitUtils';
import {
  AppLogo,
  BookIcon,
  CheckIcon,
  ChecklistIcon,
  CloudIcon,
  FlameIcon,
  GearIcon,
  PencilIcon,
  TargetIcon,
} from '../icons';

export function Home() {
  const { t } = useI18n();
  const sync = useSyncState();
  const [journalCount, setJournalCount] = useState<number | null>(null);
  const [hasJournaledToday, setHasJournaledToday] = useState<boolean>(false);
  const [tasksTotal, setTasksTotal] = useState<number>(0);
  const [tasksDone, setTasksDone] = useState<number>(0);
  const [habitsCount, setHabitsCount] = useState<number>(0);
  const [habitsDoneToday, setHabitsDoneToday] = useState<number>(0);

  useEffect(() => {
    const today = todayISO();

    // 1. Check journals & today's entry
    journalRepo.list().then((list) => {
      setJournalCount(list.length);
      setHasJournaledToday(list.some((e) => e.date === today));
    }).catch(() => undefined);

    // 2. Load today's tasks
    taskRepo.list().then((tasks) => {
      const todayTasks = tasks.filter((t) => appliesTo(t, today));
      setTasksTotal(todayTasks.length);
      const done = todayTasks.filter((t) => statusOn(t, today) === 'done').length;
      setTasksDone(done);
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

  // Productivity Score Calculation
  const productivityScore = useMemo(() => {
    let pointsEarned = 0;
    let pointsPossible = 0;

    if (tasksTotal > 0) {
      pointsPossible += tasksTotal;
      pointsEarned += tasksDone;
    }
    if (habitsCount > 0) {
      pointsPossible += habitsCount;
      pointsEarned += habitsDoneToday;
    }
    if (pointsPossible === 0) return hasJournaledToday ? 100 : 0;
    return Math.round((pointsEarned / pointsPossible) * 100);
  }, [tasksTotal, tasksDone, habitsCount, habitsDoneToday, hasJournaledToday]);

  return (
    <section className="hero-productivity">
      {/* 1. Animated Logo with Ambient Pulse Aura */}
      <div className="hero-logo-box">
        <div className="hero-glow-ring" />
        <AppLogo size={94} className="hero-logo-floating" />
      </div>

      {/* 2. Brand Name & Productivity Tagline */}
      <div className="hero-branding">
        <h1 className="hero-title">{t.appName}</h1>
        <p className="hero-tagline">{t.appTagline}</p>
        <div className="hero-greeting-chip">
          <span className="dot on" style={{ position: 'static', display: 'inline-block' }} />
          <span>{greet}</span>
        </div>
      </div>

      {/* 3. Productivity Pulse Dashboard (Visuals & Motion) */}
      <div className="productivity-pulse-card">
        <div className="pulse-score-side">
          <div className="score-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle-fill"
                strokeDasharray={`${productivityScore}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="score-number">
              <span className="val">{productivityScore}%</span>
            </div>
          </div>
          <span className="score-label">{t.todayProductivity}</span>
        </div>

        <div className="pulse-metrics-side">
          {/* Tasks metric */}
          <div className="metric-item">
            <div className="metric-header">
              <span className="metric-title">
                <ChecklistIcon width={16} height={16} />
                {t.navTasks}
              </span>
              <span className="metric-val">{tasksDone} / {tasksTotal}</span>
            </div>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{ width: `${tasksTotal > 0 ? (tasksDone / tasksTotal) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Habits metric */}
          <div className="metric-item">
            <div className="metric-header">
              <span className="metric-title">
                <FlameIcon width={16} height={16} />
                {t.navHabits}
              </span>
              <span className="metric-val">{habitsDoneToday} / {habitsCount}</span>
            </div>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{ width: `${habitsCount > 0 ? (habitsDoneToday / habitsCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Reflection metric */}
          <div className="metric-item">
            <div className="metric-header">
              <span className="metric-title">
                <BookIcon width={16} height={16} />
                {t.dailyReflection}
              </span>
              <span className={`metric-badge ${hasJournaledToday ? 'done' : ''}`}>
                {hasJournaledToday ? (
                  <><CheckIcon width={12} height={12} /> {t.statusDone}</>
                ) : (
                  t.statusTodo
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Action Buttons with Motion */}
      <div className="action-buttons-strip">
        <a className="btn action-btn" href="#/tasks">
          <ChecklistIcon width={18} height={18} />
          {t.startTasks}
        </a>
        <a className="btn action-btn ghost" href="#/habits">
          <TargetIcon width={18} height={18} />
          {t.logHabit}
        </a>
        <a className="btn action-btn ghost" href="#/write">
          <PencilIcon width={18} height={18} />
          {t.newJournal}
        </a>
      </div>

      {/* 5. Daily Wisdom Quote */}
      <blockquote className="productivity-quote">
        <span className="quote-mark">“</span>
        {phrase}
      </blockquote>

      {/* 6. Navigation Hub Grid */}
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
            <small>{tasksTotal > 0 ? `${tasksDone}/${tasksTotal} done` : t.tasksTitle}</small>
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
              {habitsCount > 0
                ? `${habitsDoneToday}/${habitsCount} ${t.todayStatus.toLowerCase()}`
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
            <small>{sync.email ? sync.email : t.syncTitle}</small>
          </div>
        </a>
      </div>

      {/* 7. Settings Footer Link */}
      <div style={{ marginTop: 16 }}>
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
