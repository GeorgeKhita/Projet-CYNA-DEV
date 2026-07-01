import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, setAuthUser } from '../../test-utils';
import { CheckoutIdentificationPage } from './CheckoutIdentificationPage';
import * as clientModule from '../../api/client';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

// ── Rendu ─────────────────────────────────────────────────────────────────

describe('rendu', () => {
  it('affiche le titre Identification', () => {
    renderWithProviders(<CheckoutIdentificationPage />);
    expect(screen.getByRole('heading', { name: /identification/i })).toBeInTheDocument();
  });

  it('affiche les étapes du tunnel (Identification / Paiement / Confirmation)', () => {
    renderWithProviders(<CheckoutIdentificationPage />);
    expect(screen.getAllByText('Identification').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Paiement').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Confirmation').length).toBeGreaterThanOrEqual(1);
  });

  it('affiche les 3 onglets de choix', () => {
    renderWithProviders(<CheckoutIdentificationPage />);
    // 2 boutons "Se connecter" (tab + submit) : on cherche "Créer un compte" et "Invité"
    expect(screen.getByRole('button', { name: /créer un compte/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /invité/i })).toBeInTheDocument();
  });

  it('affiche le formulaire de connexion par défaut (email + mot de passe)', () => {
    renderWithProviders(<CheckoutIdentificationPage />);
    expect(screen.getByPlaceholderText(/votre.email@entreprise/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });
});

// ── Déjà authentifié ──────────────────────────────────────────────────────

describe('déjà authentifié', () => {
  it('l\'utilisateur authentifié est reconnu comme isAuthenticated', () => {
    setAuthUser();
    expect(localStorage.getItem('cyna_token')).toBe('test-token');
    expect(JSON.parse(localStorage.getItem('cyna_user')!).first_name).toBe('Nouh');
  });
});

// ── Onglet connexion ──────────────────────────────────────────────────────

describe('onglet connexion', () => {
  it('appelle api.post /auth/login avec email et password', async () => {
    const postSpy = vi.spyOn(clientModule.api, 'post').mockResolvedValue({
      token: 'tok-123',
      user: { id: 1, first_name: 'Nouh', last_name: 'M', email: 'n@c.fr', role: 'user' },
    });

    renderWithProviders(<CheckoutIdentificationPage />);
    fireEvent.change(screen.getByPlaceholderText(/votre.email@entreprise/i), { target: { value: 'n@c.fr' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'Pass123!' } });
    fireEvent.submit(screen.getByPlaceholderText(/votre.email@entreprise/i).closest('form')!);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/auth/login', { email: 'n@c.fr', password: 'Pass123!' });
    });
  });

  it('affiche Connexion... pendant le chargement', async () => {
    vi.spyOn(clientModule.api, 'post').mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 200))
    );

    renderWithProviders(<CheckoutIdentificationPage />);
    fireEvent.change(screen.getByPlaceholderText(/votre.email@entreprise/i), { target: { value: 'n@c.fr' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'Pass123!' } });
    fireEvent.submit(screen.getByPlaceholderText(/votre.email@entreprise/i).closest('form')!);

    expect(await screen.findByText(/connexion\.\.\./i)).toBeInTheDocument();
  });

  it('affiche le message d\'erreur en cas d\'échec', async () => {
    vi.spyOn(clientModule.api, 'post').mockRejectedValue(new Error('Email ou mot de passe incorrect.'));

    renderWithProviders(<CheckoutIdentificationPage />);
    fireEvent.change(screen.getByPlaceholderText(/votre.email@entreprise/i), { target: { value: 'bad@x.fr' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } });
    fireEvent.submit(screen.getByPlaceholderText(/votre.email@entreprise/i).closest('form')!);

    expect(await screen.findByText('Email ou mot de passe incorrect.')).toBeInTheDocument();
  });
});

// ── Onglet invité ─────────────────────────────────────────────────────────

describe('onglet invité', () => {
  it('affiche le formulaire invité au clic sur l\'onglet', () => {
    renderWithProviders(<CheckoutIdentificationPage />);
    fireEvent.click(screen.getByRole('button', { name: /invité/i }));
    expect(screen.getByPlaceholderText(/votre.email@exemple/i)).toBeInTheDocument();
  });

  it('soumission stocke les infos en sessionStorage', () => {
    renderWithProviders(<CheckoutIdentificationPage />);
    fireEvent.click(screen.getByRole('button', { name: /invité/i }));
    fireEvent.change(screen.getByPlaceholderText(/votre.email@exemple/i), { target: { value: 'guest@test.fr' } });
    fireEvent.submit(screen.getByPlaceholderText(/votre.email@exemple/i).closest('form')!);
    const stored = JSON.parse(sessionStorage.getItem('cyna_guest') ?? '{}');
    expect(stored.type).toBe('guest');
    expect(stored.email).toBe('guest@test.fr');
  });
});

// ── Onglet inscription ────────────────────────────────────────────────────

describe('onglet inscription', () => {
  it('affiche le formulaire d\'inscription au clic', () => {
    renderWithProviders(<CheckoutIdentificationPage />);
    fireEvent.click(screen.getByRole('button', { name: /créer un compte/i }));
    expect(screen.getByPlaceholderText('Prénom')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nom')).toBeInTheDocument();
  });

  it('affiche une erreur si les mots de passe ne correspondent pas', async () => {
    renderWithProviders(<CheckoutIdentificationPage />);
    fireEvent.click(screen.getByRole('button', { name: /créer un compte/i }));

    const inputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(inputs[0], { target: { value: 'Pass123!' } });
    fireEvent.change(inputs[1], { target: { value: 'Different1!' } });
    fireEvent.submit(inputs[0].closest('form')!);

    expect(await screen.findByText(/mots de passe ne correspondent pas/i)).toBeInTheDocument();
  });
});
