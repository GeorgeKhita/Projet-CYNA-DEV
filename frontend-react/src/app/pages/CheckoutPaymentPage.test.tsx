import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, setAuthUser } from '../../test-utils';
import { CheckoutPaymentPage } from './CheckoutPaymentPage';
import { addToCart, clearCart } from '../../lib/cart';
import * as clientModule from '../../api/client';

// ── Mock Stripe (vi.hoisted requis car loadStripe est appelé au niveau module) ──

const { mockConfirmCardPayment } = vi.hoisted(() => {
  const mockConfirmCardPayment = vi.fn();
  return { mockConfirmCardPayment };
});

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({ confirmCardPayment: mockConfirmCardPayment })),
}));

vi.mock('@stripe/react-stripe-js', () => ({
  Elements:    ({ children }: { children: React.ReactNode }) => <>{children}</>,
  CardElement: () => <div data-testid="stripe-card">Card Input</div>,
  useStripe:   () => ({ confirmCardPayment: mockConfirmCardPayment }),
  useElements: () => ({ getElement: () => ({}) }),
}));

// ── Setup ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  clearCart();
  vi.restoreAllMocks();
  mockConfirmCardPayment.mockReset();
  setAuthUser();
});

// ── Rendu ─────────────────────────────────────────────────────────────────

describe('rendu', () => {
  it('affiche le titre Paiement', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({ client_secret: 'cs_test_123' });
    addToCart({ id: 1, name: 'CYNA SOC', price: 299, duration: 'monthly', category: 'SOC' });
    renderWithProviders(<CheckoutPaymentPage />);
    expect(await screen.findByRole('heading', { name: /paiement/i })).toBeInTheDocument();
  });

  it('affiche le composant carte Stripe', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({ client_secret: 'cs_test_123' });
    addToCart({ id: 1, name: 'CYNA SOC', price: 299, duration: 'monthly', category: 'SOC' });
    renderWithProviders(<CheckoutPaymentPage />);
    expect(await screen.findByTestId('stripe-card')).toBeInTheDocument();
  });

  it('affiche le récapitulatif avec le prix et le produit', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({ client_secret: 'cs_test_123' });
    addToCart({ id: 1, name: 'CYNA SOC', price: 299, duration: 'monthly', category: 'SOC' });
    renderWithProviders(<CheckoutPaymentPage />);
    // "299" apparaît plusieurs fois (prix article + sous-total) → getAllByText
    expect(await screen.findByText('CYNA SOC')).toBeInTheDocument();
    expect(screen.getAllByText(/299/).length).toBeGreaterThanOrEqual(1);
  });
});

// ── Initialisation ────────────────────────────────────────────────────────

describe('initialisation', () => {
  it('ne crée aucune commande tant que l\'utilisateur n\'a pas confirmé', async () => {
    // La commande + le PaymentIntent sont désormais créés au clic sur « Confirmer »,
    // plus au montage : aucun appel API ne doit partir tant que le formulaire
    // n'est pas soumis.
    const postSpy = vi.spyOn(clientModule.api, 'post').mockResolvedValue({ order_id: 1, client_secret: 'cs_test_123' });
    addToCart({ id: 1, name: 'CYNA SOC', price: 299, duration: 'monthly', category: 'SOC' });
    renderWithProviders(<CheckoutPaymentPage />);
    await screen.findByTestId('stripe-card');
    expect(postSpy).not.toHaveBeenCalled();
  });
});

// ── Paiement réussi ───────────────────────────────────────────────────────

describe('paiement réussi', () => {
  it('crée la commande, débite Stripe puis appelle confirm', async () => {
    const postSpy = vi.spyOn(clientModule.api, 'post')
      .mockResolvedValueOnce({ order_id: 42, client_secret: 'cs_test_123' }) // POST /orders
      .mockResolvedValueOnce({ id: 42, ref: 'CMD-0042', licenses: [] });      // POST /orders/42/confirm

    mockConfirmCardPayment.mockResolvedValue({
      paymentIntent: { id: 'pi_test_123', status: 'succeeded' },
      error: null,
    });

    addToCart({ id: 1, name: 'CYNA SOC', price: 299, duration: 'monthly', category: 'SOC' });
    renderWithProviders(<CheckoutPaymentPage />);
    await screen.findByTestId('stripe-card');

    fireEvent.submit(screen.getByRole('button', { name: /confirmer l'achat/i }).closest('form')!);

    // 1. Création de la commande avec les articles (prix figés côté serveur)
    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/orders', expect.objectContaining({
        items: [expect.objectContaining({ product_id: 1, quantity: 1, duration: 'monthly' })],
      }));
    });

    // 2. Débit Stripe avec le client_secret renvoyé par la commande
    expect(mockConfirmCardPayment).toHaveBeenCalledWith('cs_test_123', expect.any(Object));

    // 3. Finalisation : licences + facture + email de confirmation
    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/orders/42/confirm', {});
    });
  });
});

// ── Erreur de paiement ────────────────────────────────────────────────────

describe('erreur paiement', () => {
  it('affiche le message d\'erreur Stripe', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({ order_id: 42, client_secret: 'cs_test_123' });
    mockConfirmCardPayment.mockResolvedValue({
      paymentIntent: null,
      error: { message: 'Votre carte a été refusée.' },
    });

    addToCart({ id: 1, name: 'CYNA SOC', price: 299, duration: 'monthly', category: 'SOC' });
    renderWithProviders(<CheckoutPaymentPage />);
    await screen.findByTestId('stripe-card');

    fireEvent.submit(screen.getByRole('button', { name: /confirmer l'achat/i }).closest('form')!);

    expect(await screen.findByText('Votre carte a été refusée.')).toBeInTheDocument();
  });
});
