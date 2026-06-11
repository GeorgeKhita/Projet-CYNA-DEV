import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getToken, setToken, clearToken, api } from './client';

// ── Helpers ───────────────────────────────────────────────────────────────

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok:     status >= 200 && status < 300,
    status,
    json:   () => Promise.resolve(body),
  });
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  // reset location
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: '' },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── getToken / setToken / clearToken ─────────────────────────────────────

describe('getToken', () => {
  it('retourne null quand aucun token', () => {
    expect(getToken()).toBeNull();
  });

  it('retourne le token stocké', () => {
    localStorage.setItem('cyna_token', 'mon-token');
    expect(getToken()).toBe('mon-token');
  });
});

describe('setToken', () => {
  it('stocke le token dans localStorage', () => {
    setToken('abc123');
    expect(localStorage.getItem('cyna_token')).toBe('abc123');
  });
});

describe('clearToken', () => {
  it('supprime le token du localStorage', () => {
    localStorage.setItem('cyna_token', 'abc123');
    clearToken();
    expect(localStorage.getItem('cyna_token')).toBeNull();
  });
});

// ── api.get ───────────────────────────────────────────────────────────────

describe('api.get', () => {
  it('appelle /api + endpoint', async () => {
    const mockFn = mockFetch(200, { data: 'ok' });
    vi.stubGlobal('fetch', mockFn);

    await api.get('/produits');

    expect(mockFn).toHaveBeenCalledWith(
      '/api/produits',
      expect.objectContaining({ headers: expect.any(Object) })
    );
  });

  it("ajoute le header Authorization si un token est présent", async () => {
    localStorage.setItem('cyna_token', 'mon-token');
    const mockFn = mockFetch(200, {});
    vi.stubGlobal('fetch', mockFn);

    await api.get('/me');

    const [, options] = mockFn.mock.calls[0];
    expect(options.headers['Authorization']).toBe('Bearer mon-token');
  });

  it("n'ajoute pas Authorization si pas de token", async () => {
    const mockFn = mockFetch(200, {});
    vi.stubGlobal('fetch', mockFn);

    await api.get('/produits');

    const [, options] = mockFn.mock.calls[0];
    expect(options.headers['Authorization']).toBeUndefined();
  });

  it('retourne les données JSON de la réponse', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { id: 1, name: 'SOC' }));
    const data = await api.get<{ id: number; name: string }>('/produits/1');
    expect(data).toEqual({ id: 1, name: 'SOC' });
  });

  it('retourne undefined pour une réponse 204', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, status: 204, json: () => Promise.resolve(null),
    }));
    const result = await api.get('/vide');
    expect(result).toBeUndefined();
  });
});

// ── api.post ──────────────────────────────────────────────────────────────

describe('api.post', () => {
  it('envoie une requête POST avec le body JSON', async () => {
    const mockFn = mockFetch(200, { token: 'abc' });
    vi.stubGlobal('fetch', mockFn);

    await api.post('/auth/login', { email: 'a@b.fr', password: 'pass' });

    const [, options] = mockFn.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body as string)).toEqual({ email: 'a@b.fr', password: 'pass' });
  });
});

// ── api.put ───────────────────────────────────────────────────────────────

describe('api.put', () => {
  it('envoie une requête PUT', async () => {
    const mockFn = mockFetch(200, {});
    vi.stubGlobal('fetch', mockFn);

    await api.put('/profil', { first_name: 'Nouh' });

    const [, options] = mockFn.mock.calls[0];
    expect(options.method).toBe('PUT');
  });
});

// ── api.delete ────────────────────────────────────────────────────────────

describe('api.delete', () => {
  it('envoie une requête DELETE', async () => {
    const mockFn = mockFetch(204, null);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, status: 204, json: () => Promise.resolve(null),
    }));

    await api.delete('/produits/1');

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      '/api/produits/1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

// ── Gestion des erreurs ───────────────────────────────────────────────────

describe('gestion des erreurs', () => {
  it('lève une erreur avec le message serveur', async () => {
    vi.stubGlobal('fetch', mockFetch(422, { message: 'Email invalide' }));

    await expect(api.post('/auth/login', {})).rejects.toThrow('Email invalide');
  });

  it('lève une erreur avec la première erreur de validation', async () => {
    vi.stubGlobal('fetch', mockFetch(422, {
      errors: { email: ['L\'email est requis'] },
    }));

    await expect(api.post('/auth/login', {})).rejects.toThrow("L'email est requis");
  });

  it('lève une erreur générique si pas de message', async () => {
    vi.stubGlobal('fetch', mockFetch(500, {}));

    await expect(api.get('/erreur')).rejects.toThrow('Erreur 500');
  });

  it('déconnecte automatiquement sur erreur 401', async () => {
    localStorage.setItem('cyna_token', 'expired');
    localStorage.setItem('cyna_user', '{}');
    vi.stubGlobal('fetch', mockFetch(401, { message: 'Unauthenticated' }));

    await expect(api.get('/me')).rejects.toThrow('Session expirée');
    expect(localStorage.getItem('cyna_token')).toBeNull();
    expect(localStorage.getItem('cyna_user')).toBeNull();
    expect(window.location.href).toBe('/connexion');
  });
});
