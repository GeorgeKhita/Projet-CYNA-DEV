import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, setAuthUser } from '../../test-utils';
import { AbonnementsPage } from './AbonnementsPage';
import * as clientModule from '../../api/client';

const mockSubs = [
  {
    id: 1,
    product: { id: 10, name: 'CYNA SOC', category: 'SOC', category_color: '#00B4D8' },
    status: 'active',
    price: 299,
    billing_cycle: 'monthly',
    current_period_end: '2026-07-09',
  },
  {
    id: 2,
    product: { id: 11, name: 'CYNA EDR', category: 'EDR', category_color: '#8B5CF6' },
    status: 'active',
    price: 1990,
    billing_cycle: 'annual',
    current_period_end: '2027-06-09',
  },
];

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.stubGlobal('alert',   vi.fn());
  vi.stubGlobal('confirm', vi.fn(() => true));
});

// ── Non authentifié ───────────────────────────────────────────────────────

describe('non authentifié', () => {
  it('ne rend pas le contenu', async () => {
    renderWithProviders(<AbonnementsPage />);
    await waitFor(() => {
      expect(screen.queryByText(/mes abonnements/i)).not.toBeInTheDocument();
    });
  });
});

// ── Rendu ─────────────────────────────────────────────────────────────────

describe('rendu', () => {
  beforeEach(() => setAuthUser());

  it('affiche le titre Mes abonnements', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockSubs);
    renderWithProviders(<AbonnementsPage />);
    expect(await screen.findByRole('heading', { name: /mes abonnements/i })).toBeInTheDocument();
  });

  it('affiche les deux abonnements actifs', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockSubs);
    renderWithProviders(<AbonnementsPage />);
    expect(await screen.findByText('CYNA SOC')).toBeInTheDocument();
    expect(screen.getByText('CYNA EDR')).toBeInTheDocument();
  });

  it('affiche mensuelle / annuelle', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockSubs);
    renderWithProviders(<AbonnementsPage />);
    await screen.findByText('CYNA SOC');
    expect(screen.getByText(/mensuelle/i)).toBeInTheDocument();
    expect(screen.getByText(/annuelle/i)).toBeInTheDocument();
  });

  it('affiche le message aucun abonnement si liste vide', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue([]);
    renderWithProviders(<AbonnementsPage />);
    expect(await screen.findByText(/aucun abonnement/i)).toBeInTheDocument();
  });
});

// ── Annulation ────────────────────────────────────────────────────────────

describe('annulation', () => {
  beforeEach(() => setAuthUser());

  it('appelle api.patch sur confirmation', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockSubs);
    const patchSpy = vi.spyOn(clientModule.api, 'patch').mockResolvedValue({});

    renderWithProviders(<AbonnementsPage />);
    await screen.findByText('CYNA SOC');

    const cancelBtns = screen.getAllByRole('button', { name: /annuler/i });
    fireEvent.click(cancelBtns[0]);

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith('/subscriptions/1/cancel');
    });
  });

  it("n'appelle pas api.patch si l'utilisateur refuse la confirmation", async () => {
    vi.stubGlobal('confirm', vi.fn(() => false));
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockSubs);
    const patchSpy = vi.spyOn(clientModule.api, 'patch').mockResolvedValue({});

    renderWithProviders(<AbonnementsPage />);
    await screen.findByText('CYNA SOC');

    const cancelBtns = screen.getAllByRole('button', { name: /annuler/i });
    fireEvent.click(cancelBtns[0]);

    expect(patchSpy).not.toHaveBeenCalled();
  });

  it("passe l'abonnement à 'Annulé' après annulation", async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockSubs);
    vi.spyOn(clientModule.api, 'patch').mockResolvedValue({});

    renderWithProviders(<AbonnementsPage />);
    await screen.findByText('CYNA SOC');

    const cancelBtns = screen.getAllByRole('button', { name: /annuler/i });
    fireEvent.click(cancelBtns[0]);

    // L'abonnement change de statut → passe dans la section "Abonnements annulés"
    await waitFor(() => {
      expect(screen.getByText(/abonnements annulés/i)).toBeInTheDocument();
    });
  });
});
