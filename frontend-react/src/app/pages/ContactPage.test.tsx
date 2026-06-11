import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { ContactPage } from './ContactPage';
import * as clientModule from '../../api/client';

beforeEach(() => {
  vi.restoreAllMocks();
});

function fillForm() {
  fireEvent.change(screen.getByPlaceholderText(/votre.email/i), { target: { value: 'contact@entreprise.fr' } });
  fireEvent.change(screen.getByPlaceholderText(/objet/i),        { target: { value: 'Question sur SOC' } });
  fireEvent.change(screen.getByPlaceholderText(/décrivez/i),     { target: { value: 'Bonjour, je souhaite...' } });
}

// ── Rendu ─────────────────────────────────────────────────────────────────

describe('rendu', () => {
  it('affiche le titre Contactez-nous', () => {
    renderWithProviders(<ContactPage />);
    expect(screen.getByRole('heading', { name: /contactez-nous/i })).toBeInTheDocument();
  });

  it('affiche les champs email, sujet, message', () => {
    renderWithProviders(<ContactPage />);
    expect(screen.getByPlaceholderText(/votre.email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/objet/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/décrivez/i)).toBeInTheDocument();
  });

  it('affiche le bouton Envoyer', () => {
    renderWithProviders(<ContactPage />);
    expect(screen.getByRole('button', { name: /envoyer/i })).toBeInTheDocument();
  });
});

// ── Soumission réussie ────────────────────────────────────────────────────

describe('soumission réussie', () => {
  it('affiche la confirmation après envoi', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({});

    renderWithProviders(<ContactPage />);
    fillForm();
    fireEvent.submit(screen.getByRole('button', { name: /envoyer/i }).closest('form')!);

    expect(await screen.findByText(/message envoyé/i)).toBeInTheDocument();
  });

  it('appelle api.post avec les bonnes données', async () => {
    const postSpy = vi.spyOn(clientModule.api, 'post').mockResolvedValue({});

    renderWithProviders(<ContactPage />);
    fillForm();
    fireEvent.submit(screen.getByRole('button', { name: /envoyer/i }).closest('form')!);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/contact', {
        email:   'contact@entreprise.fr',
        subject: 'Question sur SOC',
        message: 'Bonjour, je souhaite...',
      });
    });
  });

  it('affiche le bouton Envoyer un autre message après succès', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({});

    renderWithProviders(<ContactPage />);
    fillForm();
    fireEvent.submit(screen.getByRole('button', { name: /envoyer/i }).closest('form')!);

    expect(await screen.findByRole('button', { name: /envoyer un autre message/i })).toBeInTheDocument();
  });

  it('remet le formulaire à zéro après succès puis clic sur "envoyer un autre"', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({});

    renderWithProviders(<ContactPage />);
    fillForm();
    fireEvent.submit(screen.getByRole('button', { name: /envoyer/i }).closest('form')!);
    const btnAnother = await screen.findByRole('button', { name: /envoyer un autre message/i });
    fireEvent.click(btnAnother);

    const emailInput = screen.getByPlaceholderText(/votre.email/i) as HTMLInputElement;
    expect(emailInput.value).toBe('');
  });
});

// ── Erreur ────────────────────────────────────────────────────────────────

describe('erreur', () => {
  it("affiche le message d'erreur", async () => {
    vi.spyOn(clientModule.api, 'post').mockRejectedValue(new Error('Serveur indisponible.'));

    renderWithProviders(<ContactPage />);
    fillForm();
    fireEvent.submit(screen.getByRole('button', { name: /envoyer/i }).closest('form')!);

    expect(await screen.findByText('Serveur indisponible.')).toBeInTheDocument();
  });

  it('affiche Envoi... pendant le chargement', async () => {
    vi.spyOn(clientModule.api, 'post').mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 200))
    );

    renderWithProviders(<ContactPage />);
    fillForm();
    fireEvent.submit(screen.getByRole('button', { name: /envoyer/i }).closest('form')!);

    expect(await screen.findByText('Envoi...')).toBeInTheDocument();
  });
});
