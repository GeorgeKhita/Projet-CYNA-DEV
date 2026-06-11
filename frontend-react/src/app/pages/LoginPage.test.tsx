import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '../../context/AuthContext';
import * as clientModule from '../../api/client';

// Wrapper minimal pour la page
function renderLoginPage(initialPath = '/connexion') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ── Rendu initial ─────────────────────────────────────────────────────────

describe('rendu initial', () => {
  it('affiche le titre Connexion', () => {
    renderLoginPage();
    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument();
  });

  it('affiche le champ email', () => {
    renderLoginPage();
    expect(screen.getByPlaceholderText(/votre.email/i)).toBeInTheDocument();
  });

  it('affiche le champ mot de passe', () => {
    renderLoginPage();
    const pwdInput = screen.getByPlaceholderText('••••••••');
    expect(pwdInput).toBeInTheDocument();
    expect(pwdInput).toHaveAttribute('type', 'password');
  });

  it('affiche le bouton Se connecter', () => {
    renderLoginPage();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('affiche le lien Mot de passe oublié', () => {
    renderLoginPage();
    expect(screen.getByText(/mot de passe oublié/i)).toBeInTheDocument();
  });

  it('affiche le lien Créer un compte', () => {
    renderLoginPage();
    expect(screen.getByText(/créer un compte/i)).toBeInTheDocument();
  });

  it("n'affiche pas de message d'erreur au départ", () => {
    renderLoginPage();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

// ── Saisie dans le formulaire ─────────────────────────────────────────────

describe('saisie formulaire', () => {
  it("met à jour le champ email", () => {
    renderLoginPage();
    const input = screen.getByPlaceholderText(/votre.email/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test@cyna.fr' } });
    expect(input.value).toBe('test@cyna.fr');
  });

  it("met à jour le champ mot de passe", () => {
    renderLoginPage();
    const input = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'secret123' } });
    expect(input.value).toBe('secret123');
  });
});

// ── Soumission réussie ────────────────────────────────────────────────────

describe('soumission réussie', () => {
  it('appelle api.post avec les bons paramètres', async () => {
    const postSpy = vi.spyOn(clientModule.api, 'post').mockResolvedValue({
      token: 'tok123',
      user: { id: 1, first_name: 'Nouh', last_name: 'M', email: 'nouh@cyna.fr', role: 'user' },
    });

    renderLoginPage();
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'nouh@cyna.fr' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'Pass123!' } });
    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form')!);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/auth/login', { email: 'nouh@cyna.fr', password: 'Pass123!' });
    });
  });

  it('affiche "Connexion..." pendant le chargement', async () => {
    vi.spyOn(clientModule.api, 'post').mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    renderLoginPage();
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'a@b.fr' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form')!);

    expect(await screen.findByText('Connexion...')).toBeInTheDocument();
  });

  it('désactive le bouton pendant le chargement', async () => {
    vi.spyOn(clientModule.api, 'post').mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    renderLoginPage();
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'a@b.fr' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form')!);

    const btn = await screen.findByText('Connexion...');
    expect(btn.closest('button')).toBeDisabled();
  });

  it('stocke le token dans localStorage après connexion', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({
      token: 'tok-abc',
      user: { id: 1, first_name: 'N', last_name: 'M', email: 'n@c.fr', role: 'user' },
    });

    renderLoginPage();
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'n@c.fr' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form')!);

    await waitFor(() => {
      expect(localStorage.getItem('cyna_token')).toBe('tok-abc');
    });
  });
});

// ── Flux 2FA ──────────────────────────────────────────────────────────────

describe('flux 2FA', () => {
  it('stocke le pending_token en sessionStorage si requires_2fa', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({
      requires_2fa:  true,
      pending_token: 'pend-token-xyz',
    });

    renderLoginPage();
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'admin@cyna.fr' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form')!);

    await waitFor(() => {
      expect(sessionStorage.getItem('2fa_pending_token')).toBe('pend-token-xyz');
    });
  });
});

// ── Gestion des erreurs ───────────────────────────────────────────────────

describe('gestion des erreurs', () => {
  it("affiche le message d'erreur retourné par l'API", async () => {
    vi.spyOn(clientModule.api, 'post').mockRejectedValue(new Error('Email ou mot de passe incorrect.'));

    renderLoginPage();
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'bad@cyna.fr' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } });
    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form')!);

    expect(await screen.findByText('Email ou mot de passe incorrect.')).toBeInTheDocument();
  });

  it('réactive le bouton après une erreur', async () => {
    vi.spyOn(clientModule.api, 'post').mockRejectedValue(new Error('Erreur'));

    renderLoginPage();
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'a@b.fr' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /se connecter/i })).not.toBeDisabled();
    });
  });
});
