import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, setAuthUser } from '../../test-utils';
import { CommandesPage } from './CommandesPage';
import * as clientModule from '../../api/client';

const mockOrders = [
  {
    id: 101,
    ref: 'CMD-0101',
    status: 'paid',
    total: 299,
    created_at: '2026-05-01T10:00:00Z',
    items: [
      { product_id: 1, product: { name: 'CYNA SOC' }, quantity: 1, unit_price: 299, duration: 'monthly' },
    ],
  },
  {
    id: 102,
    ref: 'CMD-0102',
    status: 'paid',
    total: 1990,
    created_at: '2026-04-15T10:00:00Z',
    items: [
      { product_id: 2, product: { name: 'CYNA EDR' }, quantity: 1, unit_price: 1990, duration: 'annual' },
    ],
  },
];

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ── Non authentifié ───────────────────────────────────────────────────────

describe('non authentifié', () => {
  it('ne rend pas le contenu des commandes', async () => {
    renderWithProviders(<CommandesPage />);
    await waitFor(() => {
      expect(screen.queryByText(/mes commandes/i)).not.toBeInTheDocument();
    });
  });
});

// ── Rendu ─────────────────────────────────────────────────────────────────

describe('rendu', () => {
  beforeEach(() => setAuthUser());

  it('affiche le titre Mes commandes', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrders);
    renderWithProviders(<CommandesPage />);
    expect(await screen.findByRole('heading', { name: /mes commandes/i })).toBeInTheDocument();
  });

  it('affiche les deux références de commande', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrders);
    renderWithProviders(<CommandesPage />);
    expect(await screen.findByText('CMD-0101')).toBeInTheDocument();
    expect(screen.getByText('CMD-0102')).toBeInTheDocument();
  });

  it('affiche le message aucune commande si liste vide', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue([]);
    renderWithProviders(<CommandesPage />);
    expect(await screen.findByText(/aucune commande/i)).toBeInTheDocument();
  });

  it('affiche les montants totaux', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrders);
    renderWithProviders(<CommandesPage />);
    await screen.findByText('CMD-0101');
    expect(screen.getByText('299€')).toBeInTheDocument();
  });
});

// ── Accordéon ────────────────────────────────────────────────────────────

describe('accordéon', () => {
  beforeEach(() => setAuthUser());

  it("n'affiche pas les détails au départ", async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrders);
    renderWithProviders(<CommandesPage />);
    await screen.findByText('CMD-0101');
    expect(screen.queryByText('CYNA SOC')).not.toBeInTheDocument();
  });

  it('affiche les détails après clic sur la ligne', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrders);
    renderWithProviders(<CommandesPage />);
    const ref = await screen.findByText('CMD-0101');
    fireEvent.click(ref.closest('button')!);
    expect(await screen.findByText('CYNA SOC')).toBeInTheDocument();
  });

  it('referme la ligne après un deuxième clic', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrders);
    renderWithProviders(<CommandesPage />);
    const ref = await screen.findByText('CMD-0101');
    const btn = ref.closest('button')!;
    fireEvent.click(btn);
    await screen.findByText('CYNA SOC');
    fireEvent.click(btn);
    await waitFor(() => {
      expect(screen.queryByText('CYNA SOC')).not.toBeInTheDocument();
    });
  });
});
