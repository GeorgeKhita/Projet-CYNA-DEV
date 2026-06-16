import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, setAuthUser } from '../../test-utils';
import { DashboardPage } from './DashboardPage';
import * as clientModule from '../../api/client';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ── Redirection si non authentifié ────────────────────────────────────────

describe('non authentifié', () => {
  it('ne rend pas le contenu du dashboard', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue([]);
    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.queryByText(/vue d'ensemble/i)).not.toBeInTheDocument();
    });
  });
});

// ── Utilisateur connecté ──────────────────────────────────────────────────

describe('utilisateur connecté', () => {
  beforeEach(() => {
    setAuthUser({ id: 1, first_name: 'Nouh', last_name: 'M', email: 'n@c.fr', role: 'user' });
  });

  it("affiche le titre Vue d'ensemble", async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue([]);
    renderWithProviders(<DashboardPage />);
    expect(await screen.findByRole('heading', { name: /vue d'ensemble/i })).toBeInTheDocument();
  });

  it('affiche le prénom de l\'utilisateur', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue([]);
    renderWithProviders(<DashboardPage />);
    expect(await screen.findByText(/bonjour nouh/i)).toBeInTheDocument();
  });

  it('affiche les 3 stats KPI', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue([]);
    renderWithProviders(<DashboardPage />);
    // Le DashboardSidebar a aussi "Vue d'ensemble" → utiliser findByRole
    await screen.findByRole('heading', { name: /vue d'ensemble/i });
    // "Abonnements actifs" apparaît en stat ET en titre h2 → getAllByText
    expect(screen.getAllByText(/abonnements actifs/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/total mensuel/i)).toBeInTheDocument();
    expect(screen.getByText(/prochain renouvellement/i)).toBeInTheDocument();
  });

  it('affiche le message aucun abonnement si liste vide', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue([]);
    renderWithProviders(<DashboardPage />);
    expect(await screen.findByText(/aucun abonnement actif/i)).toBeInTheDocument();
  });

  it('affiche les abonnements actifs retournés par l\'API', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue([
      { id: 1, product: { name: 'CYNA SOC' }, status: 'active', price: 299, billing_cycle: 'monthly' },
      { id: 2, product: { name: 'CYNA EDR' }, status: 'active', price: 199, billing_cycle: 'annual' },
    ]);

    renderWithProviders(<DashboardPage />);
    expect(await screen.findByText('CYNA SOC')).toBeInTheDocument();
    expect(screen.getByText('CYNA EDR')).toBeInTheDocument();
  });

  it('affiche 2 abonnements actifs dans le compteur', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue([
      { id: 1, product: { name: 'SOC' }, status: 'active', price: 299 },
      { id: 2, product: { name: 'EDR' }, status: 'active', price: 199 },
    ]);

    renderWithProviders(<DashboardPage />);
    await screen.findByText('SOC');
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it("n'affiche que les abonnements actifs (pas les annulés)", async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue([
      { id: 1, product: { name: 'CYNA SOC' }, status: 'active',    price: 299 },
      { id: 2, product: { name: 'CYNA XDR' }, status: 'cancelled', price: 199 },
    ]);

    renderWithProviders(<DashboardPage />);
    await screen.findByText('CYNA SOC');
    expect(screen.queryByText('CYNA XDR')).not.toBeInTheDocument();
  });
});
