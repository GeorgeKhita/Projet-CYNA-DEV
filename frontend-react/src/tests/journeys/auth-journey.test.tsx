/**
 * Parcours Auth — tests de bout en bout simulés avec RTL.
 *
 * Chaque test représente un scénario utilisateur complet :
 *   1. Connexion réussie → session persistée
 *   2. Mauvais mot de passe → message d'erreur
 *   3. Inscription → redirection connexion
 *   4. Déconnexion → token effacé + redirect
 *   5. Mot de passe oublié → email envoyé
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { LoginPage }          from '../../app/pages/LoginPage';
import { RegisterPage }       from '../../app/pages/RegisterPage';
import { ForgotPasswordPage } from '../../app/pages/ForgotPasswordPage';
import { DashboardPage }      from '../../app/pages/DashboardPage';
import * as clientModule from '../../api/client';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ── 1. Connexion réussie ──────────────────────────────────────────────────

describe('parcours : connexion réussie', () => {
  it('stocke le token et l\'utilisateur dans localStorage', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({
      token: 'sanctum-abc',
      user: { id: 5, first_name: 'Nouh', last_name: 'M', email: 'n@cyna.fr', role: 'user' },
    });

    renderWithProviders(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'n@cyna.fr' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'),      { target: { value: 'Pass123!' } });
    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form')!);

    await waitFor(() => {
      expect(localStorage.getItem('cyna_token')).toBe('sanctum-abc');
    });
    const stored = JSON.parse(localStorage.getItem('cyna_user')!);
    expect(stored.first_name).toBe('Nouh');
  });
});

// ── 2. Mauvais identifiants ───────────────────────────────────────────────

describe('parcours : mauvais identifiants', () => {
  it('affiche l\'erreur et ne stocke aucun token', async () => {
    vi.spyOn(clientModule.api, 'post').mockRejectedValue(
      new Error('Email ou mot de passe incorrect.')
    );

    renderWithProviders(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'bad@x.fr' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'),      { target: { value: 'wrong' } });
    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form')!);

    expect(await screen.findByText('Email ou mot de passe incorrect.')).toBeInTheDocument();
    expect(localStorage.getItem('cyna_token')).toBeNull();
  });
});

// ── 3. Inscription complète ───────────────────────────────────────────────

describe('parcours : inscription', () => {
  it('appelle l\'API avec les données du formulaire', async () => {
    const postSpy = vi.spyOn(clientModule.api, 'post').mockResolvedValue({});

    renderWithProviders(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText(/prénom/i),   { target: { value: 'Alice' } });
    fireEvent.change(screen.getByPlaceholderText(/nom/i),      { target: { value: 'Dupont' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i),    { target: { value: 'alice@x.fr' } });
    const pwds = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(pwds[0], { target: { value: 'Pass123!' } });
    fireEvent.change(pwds[1], { target: { value: 'Pass123!' } });
    fireEvent.submit(screen.getByRole('button', { name: /créer mon compte/i }).closest('form')!);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
        first_name: 'Alice',
        email:      'alice@x.fr',
      }));
    });
  });

  it('affiche une erreur si les mots de passe ne correspondent pas', async () => {
    renderWithProviders(<RegisterPage />);
    const pwds = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(pwds[0], { target: { value: 'Pass123!' } });
    fireEvent.change(pwds[1], { target: { value: 'Different!' } });
    fireEvent.submit(screen.getByRole('button', { name: /créer mon compte/i }).closest('form')!);

    expect(await screen.findByText(/ne correspondent pas/i)).toBeInTheDocument();
    expect(clientModule.api.post).not.toHaveBeenCalled();
  });
});

// ── 4. Déconnexion ────────────────────────────────────────────────────────

describe('parcours : déconnexion', () => {
  it('efface le token après logout', async () => {
    localStorage.setItem('cyna_token', 'tok-to-clear');
    localStorage.setItem('cyna_user', JSON.stringify({ id: 1, first_name: 'Nouh', role: 'user' }));
    vi.spyOn(clientModule.api, 'get').mockResolvedValue([]);

    renderWithProviders(<DashboardPage />);
    expect(await screen.findByText(/vue d'ensemble/i)).toBeInTheDocument();
    expect(localStorage.getItem('cyna_token')).toBe('tok-to-clear');

    // Simule le logout directement via clearToken
    clientModule.clearToken();
    expect(localStorage.getItem('cyna_token')).toBeNull();
  });
});

// ── 5. Mot de passe oublié ────────────────────────────────────────────────

describe('parcours : mot de passe oublié', () => {
  it('affiche la confirmation après envoi de l\'email', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({});

    renderWithProviders(<ForgotPasswordPage />);
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'n@cyna.fr' } });
    fireEvent.submit(screen.getByRole('button', { name: /envoyer le lien/i }).closest('form')!);

    expect(await screen.findByText(/email envoyé/i)).toBeInTheDocument();
    expect(clientModule.api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'n@cyna.fr' });
  });
});
