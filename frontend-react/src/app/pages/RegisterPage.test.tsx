import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { RegisterPage } from './RegisterPage';
import * as clientModule from '../../api/client';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ── Rendu ─────────────────────────────────────────────────────────────────

describe('rendu', () => {
  it('affiche le titre Créer un compte', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByRole('heading', { name: /créer un compte/i })).toBeInTheDocument();
  });

  it('affiche le champ prénom', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByPlaceholderText('Jean')).toBeInTheDocument();
  });

  it('affiche le champ nom', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByPlaceholderText('Dupont')).toBeInTheDocument();
  });

  it('affiche le champ email', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByPlaceholderText(/votre.email/i)).toBeInTheDocument();
  });

  it('affiche deux champs mot de passe', () => {
    renderWithProviders(<RegisterPage />);
    const pwdInputs = screen.getAllByPlaceholderText('••••••••');
    expect(pwdInputs).toHaveLength(2);
  });

  it('affiche le bouton Créer mon compte', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByRole('button', { name: /créer mon compte/i })).toBeInTheDocument();
  });

  it('affiche le lien Se connecter', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByRole('link', { name: /se connecter/i })).toBeInTheDocument();
  });
});

// ── Validation ────────────────────────────────────────────────────────────

describe('validation', () => {
  it("affiche une erreur si les mots de passe ne correspondent pas", async () => {
    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText('Jean'), { target: { value: 'Jean' } });
    fireEvent.change(screen.getByPlaceholderText('Dupont'), { target: { value: 'Dupont' } });
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'j@d.fr' } });

    const [pwd, confirm] = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(pwd,     { target: { value: 'Pass123!' } });
    fireEvent.change(confirm, { target: { value: 'Autre456!' } });

    fireEvent.submit(screen.getByRole('button', { name: /créer mon compte/i }).closest('form')!);

    expect(await screen.findByText(/mots de passe ne correspondent pas/i)).toBeInTheDocument();
  });

  it("ne fait pas d'appel API si les mots de passe ne correspondent pas", async () => {
    const postSpy = vi.spyOn(clientModule.api, 'post');
    renderWithProviders(<RegisterPage />);

    const [pwd, confirm] = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(pwd,     { target: { value: 'Pass123!' } });
    fireEvent.change(confirm, { target: { value: 'Autre456!' } });
    fireEvent.submit(screen.getByRole('button', { name: /créer mon compte/i }).closest('form')!);

    await waitFor(() => {
      expect(postSpy).not.toHaveBeenCalled();
    });
  });
});

// ── Soumission ────────────────────────────────────────────────────────────

describe('soumission', () => {
  it("appelle api.post avec les données du formulaire", async () => {
    const postSpy = vi.spyOn(clientModule.api, 'post').mockResolvedValue({
      token: 'tok',
      user: { id: 1, first_name: 'Jean', last_name: 'D', email: 'j@d.fr', role: 'user' },
    });

    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText('Jean'),          { target: { value: 'Jean' } });
    fireEvent.change(screen.getByPlaceholderText('Dupont'),        { target: { value: 'Dupont' } });
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i),  { target: { value: 'j@d.fr' } });
    const [pwd, confirm] = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(pwd,     { target: { value: 'Pass123!' } });
    fireEvent.change(confirm, { target: { value: 'Pass123!' } });

    fireEvent.submit(screen.getByRole('button', { name: /créer mon compte/i }).closest('form')!);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
        first_name: 'Jean',
        email:      'j@d.fr',
        password:   'Pass123!',
      }));
    });
  });

  it("affiche Création... pendant le chargement", async () => {
    vi.spyOn(clientModule.api, 'post').mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 200))
    );

    renderWithProviders(<RegisterPage />);
    const [pwd, confirm] = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(screen.getByPlaceholderText('Jean'),         { target: { value: 'J' } });
    fireEvent.change(screen.getByPlaceholderText('Dupont'),       { target: { value: 'D' } });
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'j@d.fr' } });
    fireEvent.change(pwd,     { target: { value: 'P1!' } });
    fireEvent.change(confirm, { target: { value: 'P1!' } });
    fireEvent.submit(screen.getByRole('button', { name: /créer mon compte/i }).closest('form')!);

    expect(await screen.findByText('Création...')).toBeInTheDocument();
  });

  it("affiche l'erreur API", async () => {
    vi.spyOn(clientModule.api, 'post').mockRejectedValue(new Error('Email déjà utilisé.'));

    renderWithProviders(<RegisterPage />);
    const [pwd, confirm] = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(screen.getByPlaceholderText('Jean'),         { target: { value: 'J' } });
    fireEvent.change(screen.getByPlaceholderText('Dupont'),       { target: { value: 'D' } });
    fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'j@d.fr' } });
    fireEvent.change(pwd,     { target: { value: 'P1!' } });
    fireEvent.change(confirm, { target: { value: 'P1!' } });
    fireEvent.submit(screen.getByRole('button', { name: /créer mon compte/i }).closest('form')!);

    expect(await screen.findByText('Email déjà utilisé.')).toBeInTheDocument();
  });
});
