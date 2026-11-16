import type { Habit } from './types';
import { markRemoved, markSaved, registerStore } from './sync';

export interface HabitRepository {
  list(): Promise<Habit[]>;
  save(habit: Habit): Promise<void>; // insert or update by id
  remove(id: string): Promise<void>;
  putMany(habits: Habit[]): Promise<void>;
}

const DB_NAME = 'daily-habits';
const STORE = 'habits';
let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE, { keyPath: 'id' }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
const db = () => (dbPromise ??= openDb());

function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return db().then(
    (d) =>
      new Promise<T>((resolve, reject) => {
        const tx = d.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        tx.oncomplete = () => resolve(req.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );
}

const local: HabitRepository = {
  list: () => run<Habit[]>('readonly', (s) => s.getAll()),
  save: (habit) => run('readwrite', (s) => s.put(habit)).then(() => undefined),
  remove: (id) => run('readwrite', (s) => s.delete(id)).then(() => undefined),
  putMany: (habits) =>
    db().then(
      (d) =>
        new Promise<void>((resolve, reject) => {
          const tx = d.transaction(STORE, 'readwrite');
          const store = tx.objectStore(STORE);
          habits.forEach((h) => store.put(h));
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        })
    ),
};

/** Same repository pattern as the journal: screens use this, sync hooks are added here. */
export const habitRepo: HabitRepository = {
  ...local,
  async save(habit) { await local.save(habit); markSaved('habit', habit.id); },
  async remove(id) { await local.remove(id); markRemoved('habit', id); },
  async putMany(habits) { await local.putMany(habits); habits.forEach((h) => markSaved('habit', h.id)); },
};

registerStore('habit', {
  all: () => local.list(),
  put: (items) => local.putMany(items as Habit[]),
  del: (id) => local.remove(id),
});
