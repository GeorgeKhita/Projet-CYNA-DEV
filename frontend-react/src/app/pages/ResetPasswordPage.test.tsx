import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { ResetPasswordPage } from './ResetPasswordPage';
import * as clientModule from '../../api/client';

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

function renderWithToken(token = 'abc123', email = 'user@cyna.fr') {
  return renderWithProviders(<ResetPasswordPage />, {
    initialPath: `/reset-password?token=${token}&email=${encodeURIComponent(email)}`,
  });
}

// ── Lien invalide ─────────────────────────────────────────────────────────

describe('lien invalide', () => {
  it('affiche lien invalide si pas de token/email', () => {
    renderWithProviders(<ResetPasswordPage />, { initialPath: '/reset-password' });
    expect(screen.getByText(/lien invalide ou expiré/i)).toBeInTheDocument();
  });

  it('affiche le lien pour demander un nouveau lien', () => {
    renderWithProviders(<ResetPasswordPage />, { initialPath: '/reset-password' });
    expect(screen.getByRole('link', { name: /demander un nouveau lien/i })).toBeInTheDocument();
  });
});

// ── Rendu avec token valide ───────────────────────────────────────────────

describe('rendu avec token', () => {
  it('affiche le titre Nouveau mot de passe', () => {
    renderWithToken();
    expect(screen.getByRole('heading', { name: /nouveau mot de passe/i })).toBeInTheDocument();
  });

  it('affiche deux champs mot de passe', () => {
    renderWithToken();
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
  });

  it('affiche le bouton Réinitialiser le mot de passe', () => {
    renderWithToken();
    expect(screen.getByRole('button', { name: /réinitialiser le mot de passe/i })).toBeInTheDocument();
  });
});

// ── Validation ────────────────────────────────────────────────────────────

describe('validation', () => {
  it('affiche erreur si mots de passe différents', async () => {
    renderWithToken();
    const [pwd, confirm] = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(pwd,     { target: { value: 'Pass123!' } });
    fireEvent.change(confirm, { target: { value: 'Autre456!' } });
    fireEvent.submit(screen.getByRole('button', { name: /réinitialiser/i }).closest('form')!);
    expect(await screen.findByText(/ne correspondent pas/i)).toBeInTheDocument();
  });
});

// ── Soumission réussie ────────────────────────────────────────────────────

describe('soumission réussie', () => {
  it('affiche le message de succès', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({});

    renderWithToken();
    const [pwd, confirm] = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(pwd,     { target: { value: 'NewPass123!' } });
    fireEvent.change(confirm, { target: { value: 'NewPass123!' } });
    fireEvent.submit(screen.getByRole('button', { name: /réinitialiser/i }).closest('form')!);

    expect(await screen.findByText(/mot de passe modifié/i)).toBeInTheDocument();
  });

  it('appelle api.post avec token, email et passwords', async () => {
    const postSpy = vi.spyOn(clientModule.api, 'post').mockResolvedValue({});

    renderWithToken('tok-xyz', 'u@c.fr');
    const [pwd, confirm] = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(pwd,     { target: { value: 'NewPass123!' } });
    fireEvent.change(confirm, { target: { value: 'NewPass123!' } });
    fireEvent.submit(screen.getByRole('button', { name: /réinitialiser/i }).closest('form')!);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/auth/reset-password', expect.objectContaining({
        token:    'tok-xyz',
        email:    'u@c.fr',
        password: 'NewPass123!',
      }));
    });
  });
});

// ── Erreur API ────────────────────────────────────────────────────────────

describe('erreur API', () => {
  it('affiche le message d\'erreur retourné', async () => {
    vi.spyOn(clientModule.api, 'post').mockRejectedValue(new Error('Lien invalide ou expiré.'));

    renderWithToken();
    const [pwd, confirm] = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(pwd,     { target: { value: 'P1!' } });
    fireEvent.change(confirm, { target: { value: 'P1!' } });
    fireEvent.submit(screen.getByRole('button', { name: /réinitialiser/i }).closest('form')!);

    expect(await screen.findByText('Lien invalide ou expiré.')).toBeInTheDocument();
  });
});
