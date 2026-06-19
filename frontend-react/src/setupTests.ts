import '@testing-library/jest-dom';
import { vi } from 'vitest';
import fr from './locales/fr/common.json';

function resolveKey(key: string, params?: Record<string, unknown>): string {
  const parts = key.split('.');
  let val: unknown = fr;
  for (const part of parts) {
    val = (val as Record<string, unknown>)?.[part];
  }
  if (typeof val !== 'string') return key;
  if (!params) return val;
  return val.replace(/\{\{(\w+)\}\}/g, (_, k) => String(params[k] ?? k));
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => resolveKey(key, params),
    i18n: { changeLanguage: vi.fn(), language: 'fr' },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

// Node.js 25 adds its own localStorage global that doesn't implement .clear().
// We stub both storages with a proper in-memory implementation.
class StorageMock implements Storage {
  private store: Record<string, string> = {};

  get length() { return Object.keys(this.store).length; }

  clear()                              { this.store = {}; }
  getItem(key: string)                 { return this.store[key] ?? null; }
  setItem(key: string, value: string)  { this.store[key] = String(value); }
  removeItem(key: string)              { delete this.store[key]; }
  key(index: number)                   { return Object.keys(this.store)[index] ?? null; }
  [name: string]: unknown;
}

vi.stubGlobal('localStorage',   new StorageMock());
vi.stubGlobal('sessionStorage', new StorageMock());
