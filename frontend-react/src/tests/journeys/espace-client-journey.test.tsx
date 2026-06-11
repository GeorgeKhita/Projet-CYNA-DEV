/**
 * Parcours Espace Client — tests de bout en bout simulés avec RTL.
 *
 * Scénarios couverts :
 *   1. Dashboard : chargement abonnements actifs
 *   2. Abonnements : annulation d'un abonnement actif
 *   3. Commandes : consultation et dépliage d'une commande
 *   4. Paramètres : mise à jour du profil
 *   5. Accès protégé : redirection si non authentifié
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, setAuthUser } from '../../test-utils';
import { DashboardPage }   from '../../app/pages/DashboardPage';
import { AbonnementsPage } from '../../app/pages/AbonnementsPage';
import { CommandesPage }   from '../../app/pages/CommandesPage';
import { ParametresPage }  from '../../app/pages/ParametresPage';
import * as clientModule from '../../api/client';

const mockUser = { id: 1, first_name: 'Nouh', last_name: 'Martin', email: 'nouh@cyna.fr', role: 'user' };

const mockActiveSubs = [
  { id: 1, product: { name: 'CYNA SOC', category: 'SOC', category_color: '#00B4D8' }, status: 'active', price: 299, billing_cycle: 'monthly', current_period_end: '2026-07-09' },
  { id: 2, product: { name: 'CYNA EDR', category: 'EDR', category_color: '#8B5CF6' }, status: 'active', price: 199, billing_cycle: 'annual',  current_period_end: '2027-06-09' },
];

const mockOrders = [
  {
    id: 101, ref: 'CMD-0101', status: 'paid', total: 299, created_at: '2026-05-01T10:00:00Z',
    items: [{ product_id: 1, product: { name: 'CYNA SOC' }, quantity: 1, unit_price: 299, duration: 'monthly' }],
  },
];

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.stubGlobal('alert',   vi.fn());
  vi.stubGlobal('confirm', vi.fn(() => true));
});

// ── 1. Dashboard ──────────────────────────────────────────────────────────

describe('parcours : dashboard', () => {
  beforeEach(() => setAuthUser(mockUser));

  it('affiche les abonnements actifs et le compteur', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockActiveSubs);
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('CYNA SOC')).toBeInTheDocument();
    expect(screen.getByText('CYNA EDR')).toBeInTheDocument();
    // compteur "2" dans la stat Abonnements actifs
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('affiche le total mensuel cumulé des abonnements actifs', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockActiveSubs);
    renderWithProviders(<DashboardPage />);

    await screen.findByText('CYNA SOC');
    // 299 + 199 = 498€
    expect(screen.getByText(/498/)).toBeInTheDocument();
  });

  it('affiche "Aucun abonnement actif" si API retourne tableau vide', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue([]);
    renderWithProviders(<DashboardPage />);
    expect(await screen.findByText(/aucun abonnement actif/i)).toBeInTheDocument();
  });
});

// ── 2. Annulation abonnement ──────────────────────────────────────────────

describe('parcours : annulation abonnement', () => {
  beforeEach(() => setAuthUser(mockUser));

  it('annuler un abonnement actif → le déplace dans "Abonnements annulés"', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockActiveSubs);
    vi.spyOn(clientModule.api, 'patch').mockResolvedValue({});

    renderWithProviders(<AbonnementsPage />);
    await screen.findByText('CYNA SOC');

    // Clic Annuler sur le premier abonnement
    const cancelBtns = screen.getAllByRole('button', { name: /annuler/i });
    fireEvent.click(cancelBtns[0]);

    // L'abonnement passe en annulé → section "Abonnements annulés" apparaît
    await waitFor(() => {
      expect(screen.getByText(/abonnements annulés/i)).toBeInTheDocument();
    });
  });

  it('ne change rien si l\'utilisateur refuse la confirmation', async () => {
    vi.stubGlobal('confirm', vi.fn(() => false));
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockActiveSubs);
    const patchSpy = vi.spyOn(clientModule.api, 'patch').mockResolvedValue({});

    renderWithProviders(<AbonnementsPage />);
    await screen.findByText('CYNA SOC');

    const cancelBtns = screen.getAllByRole('button', { name: /annuler/i });
    fireEvent.click(cancelBtns[0]);

    expect(patchSpy).not.toHaveBeenCalled();
    expect(screen.getByText('CYNA SOC')).toBeInTheDocument();
  });
});

// ── 3. Consultation commandes ─────────────────────────────────────────────

describe('parcours : commandes', () => {
  beforeEach(() => setAuthUser(mockUser));

  it('affiche la liste des commandes avec leurs références', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrders);
    renderWithProviders(<CommandesPage />);
    expect(await screen.findByText('CMD-0101')).toBeInTheDocument();
  });

  it('déplie une commande et affiche les détails produit', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrders);
    renderWithProviders(<CommandesPage />);
    const ref = await screen.findByText('CMD-0101');
    fireEvent.click(ref.closest('button')!);
    expect(await screen.findByText('CYNA SOC')).toBeInTheDocument();
  });
});

// ── 4. Mise à jour profil ─────────────────────────────────────────────────

describe('parcours : mise à jour profil', () => {
  beforeEach(() => setAuthUser(mockUser));

  it('modifie le nom et appelle l\'API', async () => {
    const putSpy = vi.spyOn(clientModule.api, 'put').mockResolvedValue(
      { ...mockUser, last_name: 'Dupont' }
    );

    renderWithProviders(<ParametresPage />);
    const lastNameInput = await screen.findByDisplayValue('Martin');
    fireEvent.change(lastNameInput, { target: { value: 'Dupont' } });
    fireEvent.click(screen.getByRole('button', { name: /enregistrer les modifications/i }));

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith('/auth/me', expect.objectContaining({ last_name: 'Dupont' }));
    });
    expect(await screen.findByText(/profil mis à jour/i)).toBeInTheDocument();
  });
});

// ── 5. Accès protégé ──────────────────────────────────────────────────────

describe('parcours : accès protégé', () => {
  it('dashboard redirige si non authentifié', async () => {
    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.queryByText(/vue d'ensemble/i)).not.toBeInTheDocument();
    });
  });

  it('abonnements redirige si non authentifié', async () => {
    renderWithProviders(<AbonnementsPage />);
    await waitFor(() => {
      expect(screen.queryByText(/mes abonnements/i)).not.toBeInTheDocument();
    });
  });

  it('commandes redirige si non authentifié', async () => {
    renderWithProviders(<CommandesPage />);
    await waitFor(() => {
      expect(screen.queryByText(/mes commandes/i)).not.toBeInTheDocument();
    });
  });

  it('paramètres redirige si non authentifié', async () => {
    renderWithProviders(<ParametresPage />);
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /paramètres/i })).not.toBeInTheDocument();
    });
  });
});
