import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, setAuthUser } from '../../test-utils';
import { CheckoutIdentificationPage } from './CheckoutIdentificationPage';
import * as clientModule from '../../api/client';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ── Rendu non authentifié ─────────────────────────────────────────────────

describe('rendu', () => {
  it('affiche le titre Identification', () => {
    renderWithProviders(<CheckoutIdentificationPage />);
    expect(screen.getByRole('heading', { name: /identification/i })).toBeInTheDocument();
  });

  it('affiche les étapes du tunnel (Identification / Paiement / Confirmation)', () => {
    renderWithProviders(<CheckoutIdentificationPage />);
    expect(screen.getByText('Identification')).toBeInTheDocument();
    expect(screen.getByText('Paiement')).toBeInTheDocument();
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
  });

  it('affiche le champ email et mot de passe', () => {
    renderWithProviders(<CheckoutIdentificationPage />);
    expect(screen.getByPlaceholderText(/votre.email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('affiche le bouton Continuer vers le paiement', () => {
    renderWithProviders(<CheckoutIdentificationPage />);
    expect(screen.getByRole('button', { name: /continuer vers le paiement/i })).toBeInTheDocument();
  });

  it('affiche le lien S\'inscrire', () => {
    renderWithProviders(<CheckoutIdentificationPage />);
    expect(screen.getByRole('link', { name: /s'inscrire/i })).toBeInTheDocument();
  });
});

// ── Déjà authentifié : redirection ────────────────────────────────────────

describe('déjà authentifié', () => {
  it('ne rend pas le formulaire d\'identification', async () => {
    setAuthUser();
    renderWithProviders(<CheckoutIdentificationPage />);
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /identification/i })).not.toBeInTheDocument();
    });
  });
});

// ── Soumission réussie ────────────────────────────────────────────────────

describe('soumission réussie', () => {
  it('appelle api.post /auth/login avec email et password', async () => {
    const postSpy = vi.spyOn(clientModule.api, 'post').mockResolvedValue({
      token: 'tok-123',
      user: { id: 1, first_name: 'Nouh', last_name: 'M', email: 'n@c.fr', role: 'user' },
    });

    renderWithProviders(<CheckoutIdentificationPage />);
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'n@c.fr' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'),      { target: { value: 'Pass123!' } });
    fireEvent.submit(screen.getByRole('button', { name: /continuer/i }).closest('form')!);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/auth/login', { email: 'n@c.fr', password: 'Pass123!' });
    });
  });

  it('affiche Connexion... pendant le chargement', async () => {
    vi.spyOn(clientModule.api, 'post').mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 200))
    );

    renderWithProviders(<CheckoutIdentificationPage />);
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'n@c.fr' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'),      { target: { value: 'Pass123!' } });
    fireEvent.submit(screen.getByRole('button', { name: /continuer/i }).closest('form')!);

    expect(await screen.findByText(/connexion\.\.\./i)).toBeInTheDocument();
  });
});

// ── Erreur ────────────────────────────────────────────────────────────────

describe('erreur de connexion', () => {
  it('affiche le message d\'erreur', async () => {
    vi.spyOn(clientModule.api, 'post').mockRejectedValue(new Error('Email ou mot de passe incorrect.'));

    renderWithProviders(<CheckoutIdentificationPage />);
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'bad@x.fr' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'),      { target: { value: 'wrong' } });
    fireEvent.submit(screen.getByRole('button', { name: /continuer/i }).closest('form')!);

    expect(await screen.findByText('Email ou mot de passe incorrect.')).toBeInTheDocument();
  });
});
