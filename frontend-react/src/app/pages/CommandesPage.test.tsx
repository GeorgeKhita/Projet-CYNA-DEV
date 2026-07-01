import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
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
  },
  {
    id: 102,
    ref: 'CMD-0102',
    status: 'paid',
    total: 1990,
    created_at: '2025-11-15T10:00:00Z',
  },
];

const mockOrdersWithInvoice = [
  {
    id: 101,
    ref: 'CMD-0101',
    status: 'paid',
    total: 299,
    invoice_id: 42,
    created_at: '2026-05-01T10:00:00Z',
  },
  {
    id: 102,
    ref: 'CMD-0102',
    status: 'paid',
    total: 1990,
    created_at: '2025-11-15T10:00:00Z',
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

// ── Groupement par année ──────────────────────────────────────────────────

describe('groupement par année', () => {
  beforeEach(() => setAuthUser());

  it('affiche un en-tête 2026 et un en-tête 2025', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrders);
    renderWithProviders(<CommandesPage />);
    await screen.findByText('CMD-0101');
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

  it('place CMD-0101 sous 2026 et CMD-0102 sous 2025', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrders);
    renderWithProviders(<CommandesPage />);
    await screen.findByText('CMD-0101');
    const h2026 = screen.getByText('2026');
    const h2025 = screen.getByText('2025');
    const section2026 = h2026.closest('div')!.parentElement!;
    const section2025 = h2025.closest('div')!.parentElement!;
    expect(section2026).toHaveTextContent('CMD-0101');
    expect(section2025).toHaveTextContent('CMD-0102');
  });
});

// ── Lien vers le détail ───────────────────────────────────────────────────

describe('lien détail', () => {
  beforeEach(() => setAuthUser());

  it('affiche un lien "Voir le détail" pour chaque commande', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrders);
    renderWithProviders(<CommandesPage />);
    await screen.findByText('CMD-0101');
    const links = screen.getAllByRole('link', { name: /voir le détail/i });
    expect(links).toHaveLength(2);
  });

  it('le lien pointe vers /espace-client/commandes/:id', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrders);
    renderWithProviders(<CommandesPage />);
    await screen.findByText('CMD-0101');
    const links = screen.getAllByRole('link', { name: /voir le détail/i });
    expect(links[0]).toHaveAttribute('href', '/espace-client/commandes/101');
  });
});

// ── Téléchargement de facture ─────────────────────────────────────────────

describe('téléchargement facture', () => {
  beforeEach(() => setAuthUser());

  it('affiche un bouton de téléchargement uniquement pour les commandes avec facture', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrdersWithInvoice);
    renderWithProviders(<CommandesPage />);
    await screen.findByText('CMD-0101');
    const downloadBtns = screen.getAllByTitle(/télécharger la facture/i);
    expect(downloadBtns).toHaveLength(1);
  });

  it('pas de bouton téléchargement quand aucune commande n\'a de facture', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrders);
    renderWithProviders(<CommandesPage />);
    await screen.findByText('CMD-0101');
    expect(screen.queryByTitle(/télécharger la facture/i)).not.toBeInTheDocument();
  });

  it('appelle /api/invoices/:id/download au clic et affiche une erreur en cas d\'échec', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrdersWithInvoice);
    vi.spyOn(clientModule, 'getToken').mockReturnValue('tok-test');
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => 'Forbidden',
    } as any);

    renderWithProviders(<CommandesPage />);
    await screen.findByText('CMD-0101');

    const btn = screen.getByTitle(/télécharger la facture/i);
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText(/HTTP 403/i)).toBeInTheDocument();
    });
  });

  it('déclenche le téléchargement en cas de succès', async () => {
    vi.spyOn(clientModule.api, 'get').mockResolvedValue(mockOrdersWithInvoice);
    vi.spyOn(clientModule, 'getToken').mockReturnValue('tok-test');

    renderWithProviders(<CommandesPage />);
    await screen.findByText('CMD-0101');

    const blob = new Blob(['%PDF-fake'], { type: 'application/pdf' });
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      blob: async () => blob,
    } as any);

    const createObjectURL = vi.fn(() => 'blob:test');
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = vi.fn();

    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((el: Node) => el);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((el: Node) => el);
    const clickSpy       = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const btn = screen.getByTitle(/télécharger la facture/i);
    fireEvent.click(btn);

    await waitFor(() => {
      expect(createObjectURL).toHaveBeenCalledWith(blob);
      expect(clickSpy).toHaveBeenCalled();
    });

    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
    clickSpy.mockRestore();
  });
});
