import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { TwoFactorVerifyPage } from './TwoFactorVerifyPage';
import * as clientModule from '../../api/client';

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  vi.restoreAllMocks();
});

function fillCode(code = '123456') {
  const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
  inputs.forEach((input, i) => {
    fireEvent.change(input, { target: { value: code[i] ?? '' } });
  });
}

// ── Rendu avec pending_token ──────────────────────────────────────────────

describe('avec pending_token', () => {
  beforeEach(() => {
    sessionStorage.setItem('2fa_pending_token', 'pend-tok-123');
  });

  it('affiche le titre Vérification en 2 étapes', () => {
    renderWithProviders(<TwoFactorVerifyPage />);
    expect(screen.getByText(/vérification en 2 étapes/i)).toBeInTheDocument();
  });

  it('affiche 6 champs de saisie', () => {
    renderWithProviders(<TwoFactorVerifyPage />);
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
  });

  it('le bouton Vérifier le code est désactivé si code incomplet', () => {
    renderWithProviders(<TwoFactorVerifyPage />);
    expect(screen.getByRole('button', { name: /vérifier le code/i })).toBeDisabled();
  });

  it('le bouton est activé une fois les 6 chiffres saisis', async () => {
    renderWithProviders(<TwoFactorVerifyPage />);
    fillCode('123456');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /vérifier le code/i })).not.toBeDisabled();
    });
  });
});

// ── Vérification réussie ──────────────────────────────────────────────────

describe('vérification réussie', () => {
  beforeEach(() => {
    sessionStorage.setItem('2fa_pending_token', 'pend-tok-123');
  });

  it('appelle api.post avec pending_token et code', async () => {
    const postSpy = vi.spyOn(clientModule.api, 'post').mockResolvedValue({
      token: 'sanctum-tok',
      user: { id: 1, first_name: 'Admin', last_name: 'X', email: 'a@c.fr', role: 'admin' },
    });

    renderWithProviders(<TwoFactorVerifyPage />);
    fillCode('654321');
    fireEvent.submit(screen.getByRole('button', { name: /vérifier le code/i }).closest('form')!);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/auth/admin/verify-2fa', {
        pending_token: 'pend-tok-123',
        code: '654321',
      });
    });
  });

  it('supprime le pending_token du sessionStorage après succès', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({
      token: 'sanctum-tok',
      user: { id: 1, first_name: 'Admin', last_name: 'X', email: 'a@c.fr', role: 'admin' },
    });

    renderWithProviders(<TwoFactorVerifyPage />);
    fillCode('654321');
    fireEvent.submit(screen.getByRole('button', { name: /vérifier le code/i }).closest('form')!);

    await waitFor(() => {
      expect(sessionStorage.getItem('2fa_pending_token')).toBeNull();
    });
  });
});

// ── Erreur de code ────────────────────────────────────────────────────────

describe('code invalide', () => {
  beforeEach(() => {
    sessionStorage.setItem('2fa_pending_token', 'pend-tok-123');
  });

  it("affiche le message d'erreur si le code est invalide", async () => {
    vi.spyOn(clientModule.api, 'post').mockRejectedValue(new Error('Code invalide.'));

    renderWithProviders(<TwoFactorVerifyPage />);
    fillCode('000000');
    fireEvent.submit(screen.getByRole('button', { name: /vérifier le code/i }).closest('form')!);

    expect(await screen.findByText('Code invalide.')).toBeInTheDocument();
  });

  it('remet les champs à zéro après une erreur', async () => {
    vi.spyOn(clientModule.api, 'post').mockRejectedValue(new Error('Code invalide.'));

    renderWithProviders(<TwoFactorVerifyPage />);
    fillCode('000000');
    fireEvent.submit(screen.getByRole('button', { name: /vérifier le code/i }).closest('form')!);

    await screen.findByText('Code invalide.');
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    inputs.forEach(input => expect(input.value).toBe(''));
  });
});

// ── Code incomplet ────────────────────────────────────────────────────────

describe('code incomplet', () => {
  beforeEach(() => {
    sessionStorage.setItem('2fa_pending_token', 'pend-tok-123');
  });

  it('affiche une erreur si on soumet avec moins de 6 chiffres', async () => {
    renderWithProviders(<TwoFactorVerifyPage />);
    fillCode('123');
    fireEvent.submit(screen.getByRole('button', { name: /vérifier le code/i }).closest('form')!);
    expect(await screen.findByText(/entrez les 6 chiffres/i)).toBeInTheDocument();
  });
});
