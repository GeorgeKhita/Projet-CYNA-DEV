import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
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
