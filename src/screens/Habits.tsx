import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useI18n } from '../i18n';
import { habitRepo } from '../habitStorage';
import { useDataVersion } from '../sync';
import { calculateHabitStreaks, calculateMonthRate, getRecentDays, HABIT_PRESET_COLORS, HABIT_PRESET_ICONS, isHabitDone, toggleHabitStatus } from '../habitUtils';
import { fill, todayISO } from '../utils';
import { newId } from '../taskUtils';
import { CheckIcon, FlameIcon, PencilIcon, PlusIcon, TargetIcon, TrashIcon } from '../icons';
import type { Habit } from '../types';

interface HabitFormProps {
  initial?: Habit;
  onSave: (habit: Habit) => Promise<void>;
  onCancel: () => void;
}

function HabitForm({ initial, onSave, onCancel }: HabitFormProps) {
  const { t } = useI18n();
  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '⭐');
  const [color, setColor] = useState(initial?.color ?? '#22c55e');
  const [error, setError] = useState('');

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t.titleRequired || 'Please enter a habit name.');
      return;
    }

    const now = new Date().toISOString();
    const habit: Habit = {
      id: initial?.id ?? newId(),
      name: trimmed,
      icon,
      color,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
      log: initial?.log ?? {},
    };

    await onSave(habit);
  }

  return (
    <form className="card" onSubmit={(e) => void submit(e)}>
      <label className="field">
        <span>{t.habitName}</span>
        <input
          type="text"
          autoFocus
          value={name}
          placeholder={t.habitNamePh}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <div className="field">
        <span>{t.habitIcon}</span>
        <div className="preset-grid">
          {HABIT_PRESET_ICONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`preset-bubble ${icon === emoji ? 'active' : ''}`}
              onClick={() => setIcon(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span>{t.habitColor}</span>
        <div className="preset-grid">
          {HABIT_PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-bubble ${color === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      {error && <p className="msg error" role="alert">{error}</p>}

      <div className="actions">
        <button className="btn" type="submit">{t.saveHabit}</button>
        <button className="btn ghost" type="button" onClick={onCancel}>{t.cancel}</button>
      </div>
    </form>
  );
}

interface HabitRowProps {
  habit: Habit;
  days: string[];
  today: string;
  onToggleDay: (habit: Habit, date: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

function HabitRow({ habit, days, today, onToggleDay, onEdit, onDelete }: HabitRowProps) {
  const { t } = useI18n();
  const streaks = calculateHabitStreaks(habit, today);
  const monthRate = calculateMonthRate(habit);

  // Day label (e.g. M, T, W, or localized)
  const getDayInitial = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday
    const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
    const key = dayKeys[dayOfWeek];
    return (t as any)[key] || dateStr.slice(-2);
  };

  const getDayNumber = (dateStr: string) => {
    return parseInt(dateStr.slice(-2), 10);
  };

  return (
    <div className="habit-card">
      <div className="habit-top">
        <div
          className="habit-icon-bubble"
          style={{
            borderColor: habit.color,
            backgroundColor: `${habit.color}18`,
          }}
        >
          {habit.icon}
        </div>
        <div className="habit-info">
          <h3 className="habit-name">{habit.name}</h3>
          <div className="habit-badges">
            <span className="streak-pill">
              <FlameIcon width={14} height={14} />
              {fill(t.streakDays, { n: streaks.current })}
            </span>
            {streaks.longest > 0 && (
              <span className="rate-pill">
                {fill(t.bestStreak, { n: streaks.longest })}
              </span>
            )}
            <span className="rate-pill">
              {fill(t.completionRate, { n: monthRate })}
            </span>
          </div>
        </div>
        <div className="task-actions">
          <button
            type="button"
            className="icon-btn"
            aria-label={t.editHabit}
            title={t.editHabit}
            onClick={onEdit}
          >
            <PencilIcon width={18} height={18} />
          </button>
          <button
            type="button"
            className="icon-btn danger"
            aria-label={t.deleteHabit}
            title={t.deleteHabit}
            onClick={onDelete}
          >
            <TrashIcon width={18} height={18} />
          </button>
        </div>
      </div>

      <div className="habit-week-grid">
        {days.map((d) => {
          const done = isHabitDone(habit, d);
          const isToday = d === today;
          return (
            <div key={d} className="habit-day-col">
              <span className="habit-day-name">{getDayInitial(d)}</span>
              <button
                type="button"
                className={`habit-day-btn ${done ? 'done' : ''} ${isToday ? 'is-today' : ''}`}
                style={done ? { backgroundColor: habit.color } : undefined}
                title={`${habit.name} - ${d}: ${done ? t.habitCompleted : t.habitMissed}`}
                aria-label={`${habit.name} - ${d}`}
                onClick={() => onToggleDay(habit, d)}
              >
                {done ? <CheckIcon width={16} height={16} strokeWidth={3} /> : getDayNumber(d)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Habits() {
  const { t } = useI18n();
  const today = todayISO();
  const version = useDataVersion();
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [editing, setEditing] = useState<string | null>(null); // 'new' or habit id

  const recentDays = useMemo(() => getRecentDays(7, today), [today]);

  const reload = useCallback(() => {
    habitRepo.list().then(setHabits).catch(() => setHabits([]));
  }, []);

  useEffect(() => {
    void reload();
  }, [reload, version]);

  // Overall stats
  const stats = useMemo(() => {
    if (!habits || habits.length === 0) return { total: 0, doneToday: 0, percent: 0 };
    const total = habits.length;
    const doneToday = habits.filter((h) => isHabitDone(h, today)).length;
    const percent = Math.round((doneToday / total) * 100);
    return { total, doneToday, percent };
  }, [habits, today]);

  async function handleToggle(habit: Habit, date: string) {
    const updated = toggleHabitStatus(habit, date);
    await habitRepo.save(updated);
    await reload();
  }

  async function handleSave(habit: Habit) {
    await habitRepo.save(habit);
    setEditing(null);
    await reload();
  }

  async function handleDelete(habit: Habit) {
    if (!window.confirm(t.confirmDeleteHabit)) return;
    await habitRepo.remove(habit.id);
    await reload();
  }

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <TargetIcon width={28} height={28} color="var(--g3)" />
        <h1 style={{ margin: 0 }}>{t.habitsTitle}</h1>
      </div>
      <p className="muted" style={{ marginBottom: 16 }}>{t.habitsSubtitle}</p>

      {/* Summary stats */}
      {habits && habits.length > 0 && (
        <div className="habit-stats-row">
          <div className="stat-box">
            <div className="val">{stats.total}</div>
            <div className="lbl">{fill(t.totalHabits, { n: stats.total })}</div>
          </div>
          <div className="stat-box">
            <div className="val">{stats.doneToday} / {stats.total}</div>
            <div className="lbl">{t.todayStatus}</div>
          </div>
          <div className="stat-box">
            <div className="val">{stats.percent}%</div>
            <div className="lbl">{t.thisMonth}</div>
          </div>
        </div>
      )}

      {/* Add Habit Button or Form */}
      {editing === 'new' ? (
        <HabitForm onSave={handleSave} onCancel={() => setEditing(null)} />
      ) : (
        <button
          type="button"
          className="add-btn"
          onClick={() => setEditing('new')}
        >
          <PlusIcon width={20} height={20} />
          {t.addHabit}
        </button>
      )}

      {habits === null && <p className="muted">{t.loading}</p>}

      {habits !== null && habits.length === 0 && editing !== 'new' && (
        <div className="card empty-state" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <p className="muted" style={{ fontSize: '1.1rem', marginBottom: 16 }}>{t.noHabits}</p>
          <button className="btn" onClick={() => setEditing('new')}>
            <PlusIcon width={18} height={18} />
            {t.addHabit}
          </button>
        </div>
      )}

      {/* Habit List */}
      {habits && habits.map((habit) =>
        editing === habit.id ? (
          <HabitForm
            key={habit.id}
            initial={habit}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <HabitRow
            key={habit.id}
            habit={habit}
            days={recentDays}
            today={today}
            onToggleDay={handleToggle}
            onEdit={() => setEditing(habit.id)}
            onDelete={() => void handleDelete(habit)}
          />
        )
      )}
    </section>
  );
}
