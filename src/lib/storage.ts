/**
 * Storage adapter — wraps localStorage in the same async interface
 * previously provided by chrome.storage.local. Swap this file to
 * target a different backend (IndexedDB, cloud sync, etc.) without
 * touching any hook or component.
 */

function serialize(value: unknown): string {
  return JSON.stringify(value);
}

function deserialize<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const storage = {
  get<T>(key: string, fallback: T): Promise<T> {
    return Promise.resolve(deserialize<T>(localStorage.getItem(key), fallback));
  },

  set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(key, serialize(value));
    } catch {
      // Storage quota exceeded — fail silently; data stays in memory.
    }
    return Promise.resolve();
  },

  remove(key: string): Promise<void> {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};
