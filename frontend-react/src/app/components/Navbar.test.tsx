import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders, setAuthUser } from '../../test-utils';
import { Navbar } from './Navbar';
import { addToCart, clearCart } from '../../lib/cart';

beforeEach(() => {
  localStorage.clear();
  clearCart();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
  clearCart();
});

// ── Rendu non authentifié ─────────────────────────────────────────────────

describe('non authentifié', () => {
  it('affiche le logo CYNA', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getAllByText(/cyna/i).length).toBeGreaterThan(0);
  });

  it('affiche le lien Connexion', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole('link', { name: /connexion/i })).toBeInTheDocument();
  });

  it("n'affiche pas le prénom de l'utilisateur", () => {
    renderWithProviders(<Navbar />);
    expect(screen.queryByText('Nouh')).not.toBeInTheDocument();
  });

  it('le badge panier est absent quand le panier est vide', () => {
    renderWithProviders(<Navbar />);
    // Le badge n'est rendu que si cartCount > 0
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});

// ── Rendu authentifié ─────────────────────────────────────────────────────

describe('authentifié', () => {
  beforeEach(() => setAuthUser({ id: 1, first_name: 'Nouh', last_name: 'M', email: 'n@c.fr', role: 'user' }));

  it("affiche le prénom de l'utilisateur", () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('Nouh')).toBeInTheDocument();
  });

  it('le lien espace client pointe sur /espace-client', () => {
    renderWithProviders(<Navbar />);
    const links = screen.getAllByRole('link');
    const espaceLink = links.find(l => l.getAttribute('href') === '/espace-client');
    expect(espaceLink).toBeDefined();
  });

  it("n'affiche plus le lien Connexion", () => {
    renderWithProviders(<Navbar />);
    expect(screen.queryByRole('link', { name: /connexion/i })).not.toBeInTheDocument();
  });

  it('affiche le bouton Se déconnecter (title)', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByTitle(/déconnecter/i)).toBeInTheDocument();
  });
});

// ── Panier ────────────────────────────────────────────────────────────────

describe('panier', () => {
  it('affiche le badge avec le bon nombre d\'articles', () => {
    addToCart({ id: 1, name: 'SOC', price: 299, duration: 'monthly', category: 'SOC' });
    addToCart({ id: 2, name: 'EDR', price: 199, duration: 'monthly', category: 'EDR' });
    renderWithProviders(<Navbar />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('le badge n\'est pas affiché quand le panier est vide', () => {
    renderWithProviders(<Navbar />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('met à jour le badge via setInterval après ajout au panier', async () => {
    vi.useFakeTimers();
    renderWithProviders(<Navbar />);

    addToCart({ id: 1, name: 'SOC', price: 299, duration: 'monthly', category: 'SOC' });

    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.getByText('1')).toBeInTheDocument();
  });
});

// ── Barre de recherche ────────────────────────────────────────────────────

describe('recherche', () => {
  it('affiche le champ de recherche', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument();
  });

  it('met à jour la valeur à la saisie', () => {
    renderWithProviders(<Navbar />);
    const input = screen.getByPlaceholderText(/rechercher/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'SOC' } });
    expect(input.value).toBe('SOC');
  });
});
