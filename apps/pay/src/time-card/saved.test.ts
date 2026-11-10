import { encode } from '@maestro-calc/core';
import { timeCard } from '@maestro-calc/pay-core/time-card';
import { describe, expect, it } from 'vitest';
import {
  clearWeek,
  readWeek,
  SAVED_KEY,
  startOf,
  storeOf,
  writeWeek,
  type Store,
} from './saved.ts';

/** A storage in memory, as `localStorage` behaves. */
const memory = (entries: Record<string, string> = {}) => {
  const map = new Map(Object.entries(entries));
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
};

/** A storage whose every call throws, as a blocked or full one does. */
const broken: Store = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
  removeItem: () => {
    throw new Error('SecurityError');
  },
};

const validated = timeCard.validate({ monOut: '5:30 pm' });
if (!validated.ok) throw new Error('the edited week must validate');
const edited = encode(timeCard, validated.value);

describe('storeOf', () => {
  it('returns the localStorage of the window when it can write and remove', () => {
    const store = memory();
    expect(storeOf({ localStorage: store })).toBe(store);
    expect(store.map.size).toBe(0);
  });

  it('returns null where reading localStorage throws (blocked site data)', () => {
    const scope = {
      get localStorage(): Store {
        throw new Error('SecurityError');
      },
    };
    expect(storeOf(scope)).toBeNull();
  });

  it('returns null where writing throws (a full or read-only storage) or there is none', () => {
    expect(storeOf({ localStorage: broken })).toBeNull();
    expect(storeOf({})).toBeNull();
    expect(storeOf({ localStorage: null })).toBeNull();
  });
});

describe('writeWeek and readWeek', () => {
  it('keeps the edited week as its query and reads it back', () => {
    const store = memory();
    expect(writeWeek(store, edited)).toBe(true);
    expect(store.map.get(SAVED_KEY)).toBe(edited);
    expect(readWeek(store)).toBe(edited);
  });

  it('keeps nothing for the example week, so a visitor who changed nothing has nothing saved', () => {
    const store = memory({ [SAVED_KEY]: edited });
    expect(writeWeek(store, 'v=1')).toBe(true);
    expect(store.map.has(SAVED_KEY)).toBe(false);
    expect(readWeek(store)).toBeNull();
  });

  it('reads nothing from an empty storage, no storage or a storage that throws', () => {
    expect(readWeek(memory())).toBeNull();
    expect(readWeek(null)).toBeNull();
    expect(readWeek(broken)).toBeNull();
  });

  it('reads nothing that the card did not write: no version, a fragment, or too long', () => {
    for (const value of ['', 'mon=9', 'v=1#x', `v=1&${'a'.repeat(2048)}`, '<script>']) {
      expect(readWeek(memory({ [SAVED_KEY]: value }))).toBeNull();
    }
  });

  it('reports a write it could not make, and never throws', () => {
    expect(writeWeek(broken, edited)).toBe(false);
    expect(writeWeek(null, edited)).toBe(false);
  });
});

describe('clearWeek', () => {
  it('removes the saved week', () => {
    const store = memory({ [SAVED_KEY]: edited, other: 'kept' });
    expect(clearWeek(store)).toBe(true);
    expect(store.map.has(SAVED_KEY)).toBe(false);
    expect(store.map.get('other')).toBe('kept');
  });

  it('reports a storage it could not clear, and never throws', () => {
    expect(clearWeek(broken)).toBe(false);
    expect(clearWeek(null)).toBe(false);
  });
});

describe('startOf', () => {
  it('opens a shared link on its own week, never on the saved one', () => {
    expect(startOf(`?${edited}`, 'v=1&rate=30')).toEqual({ query: edited, restored: false });
  });

  it('restores the saved week on the clean address', () => {
    expect(startOf('', edited)).toEqual({ query: edited, restored: true });
  });

  it('opens the example week when nothing is saved', () => {
    expect(startOf('', null)).toEqual({ query: '', restored: false });
  });
});
