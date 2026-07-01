import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, setAuthUser } from '../../test-utils';
import { CommandeDetailPage } from './CommandeDetailPage';
import * as clientModule from '../../api/client';

// ── Mock useParams pour simuler l'id dans l'URL ───────────────────────────

const { mockUseParams } = vi.hoisted(() => {
  const mockUseParams = vi.fn(() => ({ id: '101' }));
  return { mockUseParams };
});

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useParams: mockUseParams };
});

// ── Données de test ───────────────────────────────────────────────────────

const mockOrder = {
  id: 101,
  ref: 'CMD-0101',
  status: 'paid',
  total: 358.8,
  subtotal: 299,
  tax: 59.8,
  invoice_id: 5,
  created_at: '2026-05-01T10:00:00Z',
  items: [
    {
      product_id: 1,
      product: { name: 'CYNA SOC' },
      quantity: 1,
      unit_price: 299,
      duration: 'monthly',
    },
  ],
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  mockUseParams.mockReturnValue({ id: '101' });
});

// ── Non authentifié ───────────────────────────────────────────────────────

describe('non authentifié', () => {
  it('ne rend pas le détail de la commande', async () => {
    renderWithProviders(<CommandeDetailPage />);
    await waitFor(() => {
      expect(screen.queryByText('CMD-0101')).not.toBeInTheDocument();
    });
  });
});

// ── Rendu ─────────────────────────────────────────────────────────────────

describe('rendu', () => {
  beforeEach(() => setAuthUser());

  it('affiche la référence de commande', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrder);
    renderWithProviders(<CommandeDetailPage />);
    expect(await screen.findByText('CMD-0101')).toBeInTheDocument();
  });

  it('affiche le nom du produit dans le tableau', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrder);
    renderWithProviders(<CommandeDetailPage />);
    await screen.findByText('CMD-0101');
    expect(screen.getByText('CYNA SOC')).toBeInTheDocument();
  });

  it('affiche le sous-total HT, la TVA et le total TTC', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrder);
    renderWithProviders(<CommandeDetailPage />);
    await screen.findByText('CMD-0101');
    expect(screen.getByText(/sous-total ht/i)).toBeInTheDocument();
    expect(screen.getByText(/tva/i)).toBeInTheDocument();
    expect(screen.getByText(/total ttc/i)).toBeInTheDocument();
  });

  it('affiche le badge de statut Payée', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrder);
    renderWithProviders(<CommandeDetailPage />);
    await screen.findByText('CMD-0101');
    expect(screen.getByText(/payée/i)).toBeInTheDocument();
  });

  it('affiche le bouton télécharger la facture quand invoice_id existe', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrder);
    renderWithProviders(<CommandeDetailPage />);
    await screen.findByText('CMD-0101');
    expect(screen.getByRole('button', { name: /télécharger la facture/i })).toBeInTheDocument();
  });

  it("n'affiche pas le bouton facture si pas d'invoice_id", async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue({ ...mockOrder, invoice_id: undefined });
    renderWithProviders(<CommandeDetailPage />);
    await screen.findByText('CMD-0101');
    expect(screen.queryByRole('button', { name: /télécharger la facture/i })).not.toBeInTheDocument();
  });
});

// ── Erreur 404 ────────────────────────────────────────────────────────────

describe('commande introuvable', () => {
  beforeEach(() => setAuthUser());

  it("affiche le message introuvable en cas d'erreur API", async () => {
    mockUseParams.mockReturnValue({ id: '999' });
    vi.spyOn(clientModule.api, 'get').mockRejectedValue(new Error('404'));
    renderWithProviders(<CommandeDetailPage />);
    expect(await screen.findByText(/introuvable/i)).toBeInTheDocument();
  });
});

// ── Téléchargement facture ────────────────────────────────────────────────

describe('téléchargement facture', () => {
  beforeEach(() => setAuthUser());

  it('appelle fetch sur le bon endpoint au clic', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrder);
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(new Blob(['%PDF'], { type: 'application/pdf' }), { status: 200 }),
    );
    renderWithProviders(<CommandeDetailPage />);
    await screen.findByText('CMD-0101');

    fireEvent.click(screen.getByRole('button', { name: /télécharger la facture/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/invoices/5/download',
        expect.objectContaining({ headers: expect.objectContaining({ Accept: 'application/pdf' }) }),
      );
    });
  });
});
