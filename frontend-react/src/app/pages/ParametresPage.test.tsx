import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, setAuthUser } from '../../test-utils';
import { ParametresPage } from './ParametresPage';
import * as clientModule from '../../api/client';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.stubGlobal('alert', vi.fn());
});

// ── Non authentifié ───────────────────────────────────────────────────────

describe('non authentifié', () => {
  it('ne rend pas le contenu', async () => {
    renderWithProviders(<ParametresPage />);
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /paramètres/i })).not.toBeInTheDocument();
    });
  });
});

// ── Rendu ─────────────────────────────────────────────────────────────────

describe('rendu', () => {
  beforeEach(() => {
    setAuthUser({ id: 1, first_name: 'Nouh', last_name: 'Martin', email: 'nouh@cyna.fr', role: 'user' });
  });

  it('affiche le titre Paramètres', async () => {
    renderWithProviders(<ParametresPage />);
    expect(await screen.findByRole('heading', { name: /paramètres/i })).toBeInTheDocument();
  });

  it('pré-remplit le prénom depuis le contexte Auth', async () => {
    renderWithProviders(<ParametresPage />);
    expect(await screen.findByDisplayValue('Nouh')).toBeInTheDocument();
  });

  it('pré-remplit le nom depuis le contexte Auth', async () => {
    renderWithProviders(<ParametresPage />);
    expect(await screen.findByDisplayValue('Martin')).toBeInTheDocument();
  });

  it('pré-remplit l\'email depuis le contexte Auth', async () => {
    renderWithProviders(<ParametresPage />);
    expect(await screen.findByDisplayValue('nouh@cyna.fr')).toBeInTheDocument();
  });

  it('affiche la section Changer le mot de passe', async () => {
    renderWithProviders(<ParametresPage />);
    expect(await screen.findByText(/changer le mot de passe/i)).toBeInTheDocument();
  });

  it('affiche le bouton Supprimer mon compte', async () => {
    renderWithProviders(<ParametresPage />);
    expect(await screen.findByRole('button', { name: /supprimer mon compte/i })).toBeInTheDocument();
  });
});

// ── Mise à jour du profil ─────────────────────────────────────────────────

describe('mise à jour profil', () => {
  beforeEach(() => {
    setAuthUser({ id: 1, first_name: 'Nouh', last_name: 'Martin', email: 'nouh@cyna.fr', role: 'user' });
  });

  it('appelle api.put /auth/me avec les nouvelles données', async () => {
    const putSpy = vi.spyOn(clientModule.api, 'put').mockResolvedValue(
      { id: 1, first_name: 'Nouh', last_name: 'Dupont', email: 'nouh@cyna.fr', role: 'user' },
    );

    renderWithProviders(<ParametresPage />);
    const lastNameInput = await screen.findByDisplayValue('Martin');
    fireEvent.change(lastNameInput, { target: { value: 'Dupont' } });

    fireEvent.click(screen.getByRole('button', { name: /enregistrer les modifications/i }));

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith('/auth/me', expect.objectContaining({ last_name: 'Dupont' }));
    });
  });

  it('affiche le message de succès après sauvegarde', async () => {
    vi.spyOn(clientModule.api, 'put').mockResolvedValue(
      { id: 1, first_name: 'Nouh', last_name: 'Martin', email: 'nouh@cyna.fr', role: 'user' },
    );

    renderWithProviders(<ParametresPage />);
    await screen.findByDisplayValue('Martin');
    fireEvent.click(screen.getByRole('button', { name: /enregistrer les modifications/i }));

    expect(await screen.findByText(/profil mis à jour/i)).toBeInTheDocument();
  });
});

// ── Changement de mot de passe ────────────────────────────────────────────

describe('changement mot de passe', () => {
  beforeEach(() => setAuthUser());

  it('appelle api.put /auth/me avec les champs password', async () => {
    const putSpy = vi.spyOn(clientModule.api, 'put').mockResolvedValue({});

    renderWithProviders(<ParametresPage />);
    await screen.findByText(/changer le mot de passe/i);

    const pwdInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(pwdInputs[0], { target: { value: 'OldPass123!' } });
    fireEvent.change(pwdInputs[1], { target: { value: 'NewPass456!' } });
    fireEvent.change(pwdInputs[2], { target: { value: 'NewPass456!' } });

    fireEvent.click(screen.getByRole('button', { name: /changer le mot de passe/i }));

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith('/auth/me', expect.objectContaining({
        current_password: 'OldPass123!',
        password:         'NewPass456!',
      }));
    });
  });

  it('affiche erreur si les nouveaux mots de passe ne correspondent pas', async () => {
    renderWithProviders(<ParametresPage />);
    await screen.findByText(/changer le mot de passe/i);

    const pwdInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(pwdInputs[0], { target: { value: 'OldPass123!' } });
    fireEvent.change(pwdInputs[1], { target: { value: 'NewPass456!' } });
    fireEvent.change(pwdInputs[2], { target: { value: 'Diff789!' } });

    fireEvent.click(screen.getByRole('button', { name: /changer le mot de passe/i }));

    expect(await screen.findByText(/ne correspondent pas/i)).toBeInTheDocument();
  });
});

// ── Suppression de compte (modal) ─────────────────────────────────────────

describe('suppression de compte', () => {
  beforeEach(() => setAuthUser());

  it('ouvre la modal sur clic Supprimer mon compte', async () => {
    renderWithProviders(<ParametresPage />);
    await screen.findByRole('button', { name: /supprimer mon compte/i });

    fireEvent.click(screen.getByRole('button', { name: /supprimer mon compte/i }));

    expect(await screen.findByText(/confirmer la suppression/i)).toBeInTheDocument();
  });

  it('appelle api.delete avec le mot de passe saisi', async () => {
    const deleteSpy = vi.spyOn(clientModule.api, 'delete').mockResolvedValue({});

    renderWithProviders(<ParametresPage />);
    await screen.findByRole('button', { name: /supprimer mon compte/i });

    fireEvent.click(screen.getByRole('button', { name: /supprimer mon compte/i }));
    await screen.findByPlaceholderText(/votre mot de passe/i);

    fireEvent.change(screen.getByPlaceholderText(/votre mot de passe/i), { target: { value: 'MonMotDePasse1!' } });
    fireEvent.click(screen.getByRole('button', { name: /supprimer définitivement/i }));

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('/auth/me', { password: 'MonMotDePasse1!' });
    });
  });

  it('ferme la modal sur clic Annuler sans appeler api.delete', async () => {
    const deleteSpy = vi.spyOn(clientModule.api, 'delete').mockResolvedValue({});

    renderWithProviders(<ParametresPage />);
    await screen.findByRole('button', { name: /supprimer mon compte/i });

    fireEvent.click(screen.getByRole('button', { name: /supprimer mon compte/i }));
    await screen.findByText(/confirmer la suppression/i);

    // Le bouton "Annuler" dans la modal
    const cancelBtn = screen.getAllByRole('button', { name: /^annuler$/i })[0];
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText(/confirmer la suppression/i)).not.toBeInTheDocument();
    });
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});
