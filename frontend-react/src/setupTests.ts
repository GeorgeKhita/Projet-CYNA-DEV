import '@testing-library/jest-dom';
import { vi } from 'vitest';

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
