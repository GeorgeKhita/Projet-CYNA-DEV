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
    invoice_id: 5,
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
    invoice_id: 6,
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

// ── Bouton télécharger sur chaque commande ────────────────────────────────

describe('bouton téléchargement', () => {
  beforeEach(() => setAuthUser());

  it('affiche un bouton télécharger par commande ayant une facture', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrders);
    renderWithProviders(<CommandesPage />);
    await screen.findByText('CMD-0101');
    const buttons = screen.getAllByTitle(/télécharger la facture/i);
    expect(buttons).toHaveLength(2);
  });

  it("n'affiche pas le bouton si la commande n'a pas de facture", async () => {
    const orderWithoutInvoice = [{ ...mockOrders[0], invoice_id: undefined }];
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(orderWithoutInvoice);
    renderWithProviders(<CommandesPage />);
    await screen.findByText('CMD-0101');
    expect(screen.queryByTitle(/télécharger la facture/i)).not.toBeInTheDocument();
  });

  it('le bouton est visible sans avoir à déplier la commande', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrders);
    renderWithProviders(<CommandesPage />);
    await screen.findByText('CMD-0101');
    // CYNA SOC n'est visible qu'après dépliage — le bouton doit être là sans
    expect(screen.queryByText('CYNA SOC')).not.toBeInTheDocument();
    expect(screen.getAllByTitle(/télécharger la facture/i)[0]).toBeInTheDocument();
  });

  it('appelle fetch sur /api/invoices/:id/download au clic', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrders);
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(new Blob(['%PDF'], { type: 'application/pdf' }), { status: 200 }),
    );
    renderWithProviders(<CommandesPage />);
    await screen.findByText('CMD-0101');

    fireEvent.click(screen.getAllByTitle(/télécharger la facture/i)[0]);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/invoices/5/download',
        expect.objectContaining({ headers: expect.objectContaining({ Accept: 'application/pdf' }) }),
      );
    });
  });

  it("affiche le message d'erreur si le téléchargement échoue", async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrders);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Erreur serveur', { status: 500 }),
    );
    renderWithProviders(<CommandesPage />);
    await screen.findByText('CMD-0101');

    fireEvent.click(screen.getAllByTitle(/télécharger la facture/i)[0]);

    expect(await screen.findByText(/HTTP 500/i)).toBeInTheDocument();
  });
});

// ── Accordéon (détail lignes) ─────────────────────────────────────────────

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
