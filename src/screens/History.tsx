import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import { journalRepo } from '../storage';
import { exportJournalsToPDF } from '../pdfExport';
import { MOODS, formatDate, formatMonth } from '../utils';
import type { JournalEntry } from '../types';

function Block({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <>
      <h3>{title}</h3>
      <p>{text}</p>
    </>
  );
}

export function History() {
  const { t, lang } = useI18n();
  const [entries, setEntries] = useState<JournalEntry[] | null>(null);
  const [query, setQuery] = useState('');

  const load = () => journalRepo.list().then(setEntries).catch(() => setEntries([]));
  useEffect(() => { void load(); }, []);

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const map = new Map<string, JournalEntry[]>();
    for (const e of entries ?? []) {
      const hay = [e.date, formatDate(e.date, lang), e.dayText, e.feelings, e.story, e.forgiveness].join(' ').toLowerCase();
      if (needle && !hay.includes(needle)) continue;
      const key = e.date.slice(0, 7);
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return Array.from(map);
  }, [entries, query, lang]);

  async function remove(date: string) {
    if (!window.confirm(t.confirmDelete)) return;
    await journalRepo.remove(date);
    await load();
  }

  function handleExportPDF() {
    if (!entries || entries.length === 0) return;
    exportJournalsToPDF(entries, lang, t);
  }

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <h1>{t.historyTitle}</h1>
        {entries && entries.length > 0 && (
          <button
            type="button"
            className="btn ghost small"
            onClick={handleExportPDF}
            title={t.exportPdfBtn}
          >
            📄 {t.exportPdfBtn}
          </button>
        )}
      </div>

      <input
        type="search"
        placeholder={t.search}
        aria-label={t.search}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {entries === null && <p className="muted">{t.loading}</p>}
      {entries?.length === 0 && (
        <p className="muted empty-state">{t.noEntries} <a className="link" href="#/write">{t.newJournal}</a></p>
      )}
      {entries && entries.length > 0 && groups.length === 0 && <p className="muted empty-state">{t.noResults}</p>}

      {groups.map(([key, list]) => (
        <div key={key}>
          <h2 className="month">{formatMonth(key, lang)}</h2>
          {list.map((e) => (
            <details className="card entry" key={e.id}>
              <summary>
                <span className="mood">{e.rating ? MOODS[e.rating - 1] : '📝'}</span>
                <span className="sum">
                  <strong>{formatDate(e.date, lang)}</strong>
                  <small>{(e.story || e.dayText || e.feelings || e.forgiveness).slice(0, 90)}</small>
                </span>
              </summary>
              <div className="body">
                {e.rating && <p>{MOODS[e.rating - 1]} {t.ratings[e.rating - 1]}</p>}
                <Block title={t.q1} text={e.dayText} />
                <Block title={t.q2} text={e.feelings} />
                <Block title={t.q3} text={e.story} />
                <Block title={t.forgiveTitle} text={e.forgiveness} />
                <div className="actions">
                  <a className="btn small" href={`#/write/${e.date}`}>{t.edit}</a>
                  <button className="btn small danger" onClick={() => void remove(e.date)}>{t.del}</button>
                </div>
              </div>
            </details>
          ))}
        </div>
      ))}
    </section>
  );
}
