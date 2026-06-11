import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import * as clientModule from '../../api/client';

beforeEach(() => {
  vi.restoreAllMocks();
});

// ── Rendu ─────────────────────────────────────────────────────────────────

describe('rendu', () => {
  it('affiche le titre Mot de passe oublié', () => {
    renderWithProviders(<ForgotPasswordPage />);
    expect(screen.getByRole('heading', { name: /mot de passe oublié/i })).toBeInTheDocument();
  });

  it('affiche le champ email', () => {
    renderWithProviders(<ForgotPasswordPage />);
    expect(screen.getByPlaceholderText(/votre.email/i)).toBeInTheDocument();
  });

  it('affiche le bouton Envoyer le lien', () => {
    renderWithProviders(<ForgotPasswordPage />);
    expect(screen.getByRole('button', { name: /envoyer le lien/i })).toBeInTheDocument();
  });

  it('affiche le lien Retour à la connexion', () => {
    renderWithProviders(<ForgotPasswordPage />);
    expect(screen.getAllByText(/retour à la connexion/i).length).toBeGreaterThan(0);
  });
});

// ── Soumission réussie ────────────────────────────────────────────────────

describe('soumission réussie', () => {
  it('affiche le message de confirmation après envoi', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({});

    renderWithProviders(<ForgotPasswordPage />);
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'test@cyna.fr' } });
    fireEvent.submit(screen.getByRole('button', { name: /envoyer le lien/i }).closest('form')!);

    expect(await screen.findByText(/email envoyé/i)).toBeInTheDocument();
  });

  it('appelle api.post avec le bon email', async () => {
    const postSpy = vi.spyOn(clientModule.api, 'post').mockResolvedValue({});

    renderWithProviders(<ForgotPasswordPage />);
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'test@cyna.fr' } });
    fireEvent.submit(screen.getByRole('button', { name: /envoyer le lien/i }).closest('form')!);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@cyna.fr' });
    });
  });
});

// ── États de chargement / erreur ──────────────────────────────────────────

describe('chargement et erreur', () => {
  it("affiche Envoi... pendant le chargement", async () => {
    vi.spyOn(clientModule.api, 'post').mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 200))
    );

    renderWithProviders(<ForgotPasswordPage />);
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'a@b.fr' } });
    fireEvent.submit(screen.getByRole('button', { name: /envoyer le lien/i }).closest('form')!);

    expect(await screen.findByText('Envoi...')).toBeInTheDocument();
  });

  it("affiche un message d'erreur si l'API échoue", async () => {
    vi.spyOn(clientModule.api, 'post').mockRejectedValue(new Error('Email introuvable.'));

    renderWithProviders(<ForgotPasswordPage />);
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'a@b.fr' } });
    fireEvent.submit(screen.getByRole('button', { name: /envoyer le lien/i }).closest('form')!);

    expect(await screen.findByText('Email introuvable.')).toBeInTheDocument();
  });

  it('désactive le bouton pendant le chargement', async () => {
    vi.spyOn(clientModule.api, 'post').mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 200))
    );

    renderWithProviders(<ForgotPasswordPage />);
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'a@b.fr' } });
    fireEvent.submit(screen.getByRole('button', { name: /envoyer le lien/i }).closest('form')!);

    const btn = await screen.findByText('Envoi...');
    expect(btn.closest('button')).toBeDisabled();
  });
});
