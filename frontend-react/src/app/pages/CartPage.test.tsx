import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { CartPage } from './CartPage';
import { addToCart, clearCart } from '../../lib/cart';

const item = {
  id: 1, name: 'CYNA SOC', category: 'SOC', categoryColor: '#00B4D8',
  price: 299, duration: 'monthly' as const,
};

const item2 = {
  id: 2, name: 'CYNA EDR', category: 'EDR', categoryColor: '#8B5CF6',
  price: 199, duration: 'annual' as const,
};

beforeEach(() => {
  clearCart();
  localStorage.clear();
});

// ── Panier vide ───────────────────────────────────────────────────────────

describe('panier vide', () => {
  it("affiche le message panier vide", () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByText(/votre panier est vide/i)).toBeInTheDocument();
  });

  it("affiche le lien Découvrir nos solutions", () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByRole('link', { name: /découvrir nos solutions/i })).toBeInTheDocument();
  });

  it("n'affiche pas de total", () => {
    renderWithProviders(<CartPage />);
    expect(screen.queryByText(/total mensuel/i)).not.toBeInTheDocument();
  });
});

// ── Panier avec items ─────────────────────────────────────────────────────

describe('panier avec items', () => {
  beforeEach(() => {
    addToCart(item);
  });

  it('affiche le nom du produit', () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByText('CYNA SOC')).toBeInTheDocument();
  });

  it('affiche le type abonnement Mensuel', () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByText(/abonnement mensuel/i)).toBeInTheDocument();
  });

  it('affiche la quantité initiale', () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('affiche le total mensuel', () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByText(/total mensuel/i)).toBeInTheDocument();
  });

  it('affiche le lien Passer à la caisse', () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByRole('link', { name: /passer à la caisse/i })).toBeInTheDocument();
  });

  it('affiche le lien Continuer mes achats', () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByText(/continuer mes achats/i)).toBeInTheDocument();
  });
});

// ── Interactions ──────────────────────────────────────────────────────────

describe('interactions', () => {
  beforeEach(() => {
    addToCart(item);
  });

  it('le bouton + incrémente la quantité', () => {
    renderWithProviders(<CartPage />);
    fireEvent.click(screen.getByTitle ? screen.queryByTitle(/plus/i) ?? screen.getAllByRole('button')[1] : screen.getAllByRole('button')[1]);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('le bouton poubelle retire le produit', () => {
    renderWithProviders(<CartPage />);
    const deleteButtons = screen.getAllByRole('button').filter(btn =>
      btn.querySelector('svg') !== null &&
      !btn.textContent?.includes('+') &&
      !btn.textContent?.includes('-')
    );
    // Le dernier bouton avec SVG dans la liste est le bouton supprimer
    const trashBtn = screen.getAllByRole('button').at(-1)!;
    fireEvent.click(trashBtn);
    expect(screen.getByText(/votre panier est vide/i)).toBeInTheDocument();
  });
});

// ── Plusieurs items ───────────────────────────────────────────────────────

describe('plusieurs items', () => {
  it('affiche tous les produits', () => {
    addToCart(item);
    addToCart(item2);
    renderWithProviders(<CartPage />);
    expect(screen.getByText('CYNA SOC')).toBeInTheDocument();
    expect(screen.getByText('CYNA EDR')).toBeInTheDocument();
  });

  it('affiche Annuel pour la durée annual', () => {
    addToCart(item2);
    renderWithProviders(<CartPage />);
    expect(screen.getByText(/annuel/i)).toBeInTheDocument();
  });
});
