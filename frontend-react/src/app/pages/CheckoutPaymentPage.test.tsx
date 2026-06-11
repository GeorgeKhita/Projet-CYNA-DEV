import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, setAuthUser } from '../../test-utils';
import { CheckoutPaymentPage } from './CheckoutPaymentPage';
import { addToCart, clearCart } from '../../lib/cart';
import * as clientModule from '../../api/client';

// ── Mock Stripe ───────────────────────────────────────────────────────────

const mockConfirmCardPayment = vi.fn();
const mockStripe = { confirmCardPayment: mockConfirmCardPayment };

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve(mockStripe)),
}));

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  CardElement: () => <div data-testid="stripe-card">Card Input</div>,
  useStripe:   () => mockStripe,
  useElements: () => ({
    getElement: () => ({ /* mock CardElement */ }),
  }),
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

  it('affiche les étapes du tunnel', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({ client_secret: 'cs_test_123' });
    addToCart({ id: 1, name: 'CYNA SOC', price: 299, duration: 'monthly', category: 'SOC' });
    renderWithProviders(<CheckoutPaymentPage />);
    expect(await screen.findByText('Paiement')).toBeInTheDocument();
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
  });

  it('affiche le composant carte Stripe', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({ client_secret: 'cs_test_123' });
    addToCart({ id: 1, name: 'CYNA SOC', price: 299, duration: 'monthly', category: 'SOC' });
    renderWithProviders(<CheckoutPaymentPage />);
    expect(await screen.findByTestId('stripe-card')).toBeInTheDocument();
  });

  it('affiche le montant total dans le bouton', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({ client_secret: 'cs_test_123' });
    addToCart({ id: 1, name: 'CYNA SOC', price: 299, duration: 'monthly', category: 'SOC' });
    renderWithProviders(<CheckoutPaymentPage />);
    expect(await screen.findByText(/299/)).toBeInTheDocument();
  });
});

// ── Paiement réussi ───────────────────────────────────────────────────────

describe('paiement réussi', () => {
  it('appelle api.post /payments/intent au montage', async () => {
    const postSpy = vi.spyOn(clientModule.api, 'post').mockResolvedValue({ client_secret: 'cs_test_123' });
    addToCart({ id: 1, name: 'CYNA SOC', price: 299, duration: 'monthly', category: 'SOC' });
    renderWithProviders(<CheckoutPaymentPage />);
    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/payments/intent', { amount: 299 });
    });
  });

  it('appelle api.post /orders après paiement Stripe réussi', async () => {
    vi.spyOn(clientModule.api, 'post')
      .mockResolvedValueOnce({ client_secret: 'cs_test_123' })
      .mockResolvedValueOnce({ id: 42, ref: 'CMD-0042' });

    mockConfirmCardPayment.mockResolvedValue({
      paymentIntent: { id: 'pi_test_123', status: 'succeeded' },
      error: null,
    });

    addToCart({ id: 1, name: 'CYNA SOC', price: 299, duration: 'monthly', category: 'SOC' });
    renderWithProviders(<CheckoutPaymentPage />);
    await screen.findByTestId('stripe-card');

    fireEvent.submit(screen.getByRole('button', { name: /confirmer l'achat/i }).closest('form')!);

    await waitFor(() => {
      expect(clientModule.api.post).toHaveBeenCalledWith('/orders', expect.objectContaining({
        payment_intent_id: 'pi_test_123',
        total: 299,
      }));
    });
  });
});

// ── Erreur de paiement ────────────────────────────────────────────────────

describe('erreur paiement', () => {
  it('affiche le message d\'erreur Stripe', async () => {
    vi.spyOn(clientModule.api, 'post').mockResolvedValue({ client_secret: 'cs_test_123' });
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
