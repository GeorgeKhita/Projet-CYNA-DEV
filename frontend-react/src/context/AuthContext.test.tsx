import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Composant helper pour exposer le contexte dans les tests
function AuthInspector() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="admin">{String(isAdmin)}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="email">{user?.email ?? 'null'}</span>
      <span data-testid="role">{user?.role ?? 'null'}</span>
    </div>
  );
}

function LoginButton() {
  const { login } = useAuth();
  return (
    <button onClick={() => login('tok123', {
      id: 1, first_name: 'Nouh', last_name: 'M', email: 'nouh@cyna.fr', role: 'user',
    })}>
      Login
    </button>
  );
}

function LogoutButton() {
  const { logout } = useAuth();
  return <button onClick={logout}>Logout</button>;
}

beforeEach(() => {
  localStorage.clear();
});

// ── État initial ──────────────────────────────────────────────────────────

describe('état initial', () => {
  it("n'est pas authentifié par défaut", async () => {
    render(<AuthProvider><AuthInspector /></AuthProvider>);
    expect(await screen.findByTestId('authenticated')).toHaveTextContent('false');
  });

  it("user est null sans données en localStorage", async () => {
    render(<AuthProvider><AuthInspector /></AuthProvider>);
    expect(await screen.findByTestId('email')).toHaveTextContent('null');
  });

  it("loading passe à false après l'initialisation", async () => {
    render(<AuthProvider><AuthInspector /></AuthProvider>);
    expect(await screen.findByTestId('loading')).toHaveTextContent('false');
  });
});

// ── Hydratation depuis localStorage ──────────────────────────────────────

describe('hydratation depuis localStorage', () => {
  it('restaure la session si token + user sont stockés', async () => {
    localStorage.setItem('cyna_token', 'tok-abc');
    localStorage.setItem('cyna_user', JSON.stringify({
      id: 2, first_name: 'Admin', last_name: 'Test',
      email: 'admin@cyna.fr', role: 'admin',
    }));

    render(<AuthProvider><AuthInspector /></AuthProvider>);

    expect(await screen.findByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('email')).toHaveTextContent('admin@cyna.fr');
  });

  it("ne restaure pas si cyna_user JSON est corrompu", async () => {
    localStorage.setItem('cyna_token', 'tok-abc');
    localStorage.setItem('cyna_user', 'INVALID{{');

    render(<AuthProvider><AuthInspector /></AuthProvider>);

    expect(await screen.findByTestId('authenticated')).toHaveTextContent('false');
  });
});

// ── login() ───────────────────────────────────────────────────────────────

describe('login()', () => {
  it('authentifie et expose les données user', async () => {
    const { getByRole, findByTestId } = render(
      <AuthProvider>
        <AuthInspector />
        <LoginButton />
      </AuthProvider>
    );

    await act(async () => {
      getByRole('button', { name: 'Login' }).click();
    });

    expect(await findByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('email')).toHaveTextContent('nouh@cyna.fr');
  });

  it('stocke le token dans localStorage', async () => {
    const { getByRole } = render(
      <AuthProvider><LoginButton /></AuthProvider>
    );

    await act(async () => {
      getByRole('button', { name: 'Login' }).click();
    });

    expect(localStorage.getItem('cyna_token')).toBe('tok123');
  });

  it('stocke les données user dans localStorage', async () => {
    const { getByRole } = render(
      <AuthProvider><LoginButton /></AuthProvider>
    );

    await act(async () => {
      getByRole('button', { name: 'Login' }).click();
    });

    const stored = JSON.parse(localStorage.getItem('cyna_user') ?? '{}');
    expect(stored.email).toBe('nouh@cyna.fr');
  });
});

// ── logout() ─────────────────────────────────────────────────────────────

describe('logout()', () => {
  it("désauthentifie l'utilisateur", async () => {
    localStorage.setItem('cyna_token', 'tok-abc');
    localStorage.setItem('cyna_user', JSON.stringify({
      id: 1, first_name: 'N', last_name: 'M', email: 'n@c.fr', role: 'user',
    }));

    const { findByTestId, getByRole } = render(
      <AuthProvider>
        <AuthInspector />
        <LogoutButton />
      </AuthProvider>
    );

    await findByTestId('authenticated'); // attendre hydratation

    await act(async () => {
      getByRole('button', { name: 'Logout' }).click();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('email')).toHaveTextContent('null');
  });

  it('efface le token du localStorage', async () => {
    localStorage.setItem('cyna_token', 'tok-abc');
    localStorage.setItem('cyna_user', JSON.stringify({
      id: 1, first_name: 'N', last_name: 'M', email: 'n@c.fr', role: 'user',
    }));

    const { getByRole, findByTestId } = render(
      <AuthProvider><AuthInspector /><LogoutButton /></AuthProvider>
    );

    await findByTestId('authenticated');

    await act(async () => {
      getByRole('button', { name: 'Logout' }).click();
    });

    expect(localStorage.getItem('cyna_token')).toBeNull();
  });
});

// ── isAdmin ───────────────────────────────────────────────────────────────

describe('isAdmin', () => {
  it('est true pour un utilisateur admin', async () => {
    localStorage.setItem('cyna_token', 'tok');
    localStorage.setItem('cyna_user', JSON.stringify({
      id: 1, first_name: 'A', last_name: 'B', email: 'a@b.fr', role: 'admin',
    }));

    render(<AuthProvider><AuthInspector /></AuthProvider>);

    expect(await screen.findByTestId('admin')).toHaveTextContent('true');
  });

  it('est false pour un utilisateur normal', async () => {
    localStorage.setItem('cyna_token', 'tok');
    localStorage.setItem('cyna_user', JSON.stringify({
      id: 2, first_name: 'U', last_name: 'S', email: 'u@s.fr', role: 'user',
    }));

    render(<AuthProvider><AuthInspector /></AuthProvider>);

    expect(await screen.findByTestId('admin')).toHaveTextContent('false');
  });

  it('est false si non authentifié', async () => {
    render(<AuthProvider><AuthInspector /></AuthProvider>);
    expect(await screen.findByTestId('admin')).toHaveTextContent('false');
  });
});

// ── useAuth hors AuthProvider ─────────────────────────────────────────────

describe('useAuth hors provider', () => {
  it('lève une erreur si utilisé sans AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AuthInspector />)).toThrow();
    spy.mockRestore();
  });
});
