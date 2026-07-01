import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { CartPage } from './CartPage';
import { addToCart, clearCart } from '../../lib/cart';
import * as clientModule from '../../api/client';

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
  sessionStorage.clear();
  vi.restoreAllMocks();
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

  it('affiche le total TTC', () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByText(/total ttc/i)).toBeInTheDocument();
  });

  it('affiche le lien Passer à la caisse', () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByRole('link', { name: /passer à la caisse/i })).toBeInTheDocument();
  });

  it('affiche le lien Continuer mes achats', () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByText(/continuer mes achats/i)).toBeInTheDocument();
  });

  it('affiche le champ code promo', () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByPlaceholderText(/code promo/i)).toBeInTheDocument();
  });

  it('affiche le bouton Appliquer', () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByRole('button', { name: /appliquer/i })).toBeInTheDocument();
  });
});

// ── Interactions ──────────────────────────────────────────────────────────

describe('interactions', () => {
  beforeEach(() => {
    addToCart(item);
  });

  it('le bouton + incrémente la quantité', () => {
    renderWithProviders(<CartPage />);
    fireEvent.click(screen.queryByTitle(/plus/i) ?? screen.getAllByRole('button')[1]);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('le bouton poubelle retire le produit', () => {
    renderWithProviders(<CartPage />);
    fireEvent.click(screen.getByRole('button', { name: /supprimer du panier/i }));
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
    expect(screen.getAllByText(/annuel/i).length).toBeGreaterThan(0);
  });
});

// ── Code promo ────────────────────────────────────────────────────────────

describe('code promo', () => {
  beforeEach(() => addToCart(item));

  it('affiche une erreur si on applique sans code', async () => {
    renderWithProviders(<CartPage />);
    fireEvent.click(screen.getByRole('button', { name: /appliquer/i }));
    expect(await screen.findByText(/veuillez saisir un code promo/i)).toBeInTheDocument();
  });

  it('appelle POST /promo-codes/validate avec le code saisi', async () => {
    const postSpy = vi.spyOn(clientModule.api, 'post').mockResolvedValue({
      code: 'SUMMER20', type: 'percent', value: 20, label: '-20%',
      discount_amount: 59.80, new_total_ht: 239.20,
    });

    renderWithProviders(<CartPage />);
    fireEvent.change(screen.getByPlaceholderText(/code promo/i), { target: { value: 'SUMMER20' } });
    fireEvent.click(screen.getByRole('button', { name: /appliquer/i }));

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/promo-codes/validate', expect.objectContaining({
        code: 'SUMMER20',
        total_ht: 299,
      }));
    });
  });

  it('affiche le code appliqué et la réduction dans les totaux', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({
      code: 'SUMMER20', type: 'percent', value: 20, label: '-20%',
      discount_amount: 59.80, new_total_ht: 239.20,
    });

    renderWithProviders(<CartPage />);
    fireEvent.change(screen.getByPlaceholderText(/code promo/i), { target: { value: 'SUMMER20' } });
    fireEvent.click(screen.getByRole('button', { name: /appliquer/i }));

    expect(await screen.findByText('SUMMER20')).toBeInTheDocument();
    expect(screen.getByText(/réduction/i)).toBeInTheDocument();
    expect(screen.getByText(/-59/)).toBeInTheDocument();
  });

  it('affiche une erreur si le code est invalide', async () => {
    vi.spyOn(clientModule.api, 'post').mockRejectedValue(new Error('Code promo invalide.'));

    renderWithProviders(<CartPage />);
    fireEvent.change(screen.getByPlaceholderText(/code promo/i), { target: { value: 'INVALID' } });
    fireEvent.click(screen.getByRole('button', { name: /appliquer/i }));

    expect(await screen.findByText(/code promo invalide/i)).toBeInTheDocument();
  });

  it('permet de retirer le code promo appliqué', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({
      code: 'SUMMER20', type: 'percent', value: 20, label: '-20%',
      discount_amount: 59.80, new_total_ht: 239.20,
    });

    renderWithProviders(<CartPage />);
    fireEvent.change(screen.getByPlaceholderText(/code promo/i), { target: { value: 'SUMMER20' } });
    fireEvent.click(screen.getByRole('button', { name: /appliquer/i }));

    await screen.findByText('SUMMER20');

    fireEvent.click(screen.getByRole('button', { name: /retirer/i }));

    await waitFor(() => {
      expect(screen.queryByText('SUMMER20')).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText(/code promo/i)).toBeInTheDocument();
    });
  });

  it('sauvegarde le promo dans sessionStorage', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({
      code: 'SAVE10', type: 'fixed', value: 10, label: '-10,00€',
      discount_amount: 10, new_total_ht: 289,
    });

    renderWithProviders(<CartPage />);
    fireEvent.change(screen.getByPlaceholderText(/code promo/i), { target: { value: 'SAVE10' } });
    fireEvent.click(screen.getByRole('button', { name: /appliquer/i }));

    await screen.findByText('SAVE10');

    const stored = sessionStorage.getItem('cyna_promo');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!).code).toBe('SAVE10');
  });

  it('recalcule le total TTC avec la remise', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({
      code: 'FLAT50', type: 'fixed', value: 50, label: '-50,00€',
      discount_amount: 50, new_total_ht: 249,
    });

    renderWithProviders(<CartPage />);
    fireEvent.change(screen.getByPlaceholderText(/code promo/i), { target: { value: 'FLAT50' } });
    fireEvent.click(screen.getByRole('button', { name: /appliquer/i }));

    await screen.findByText('FLAT50');

    // totalHT = 299 - 50 = 249, TVA = 49.80, TTC = 298.80
    expect(screen.getByText(/298,80/)).toBeInTheDocument();
  });
});
