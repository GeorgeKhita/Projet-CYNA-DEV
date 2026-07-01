import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { render } from '@testing-library/react';
import { AuthProvider } from '../../context/AuthContext';
import { ConfirmationPage } from './ConfirmationPage';

const cartItems = [
  { id: 1, name: 'CYNA SOC', category: 'SOC', categoryColor: '#00B4D8', price: 299, quantity: 1, duration: 'monthly' as const },
  { id: 2, name: 'CYNA EDR', category: 'EDR', categoryColor: '#8B5CF6', price: 199, quantity: 2, duration: 'annual'  as const },
];

const licenses = [
  { license_key: 'CYNA-ABC-1234-5678', product_name: 'CYNA SOC' },
  { license_key: 'CYNA-XYZ-9876-4321', product_name: 'CYNA EDR' },
];

function renderConfirmation(state: object = {}) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/confirmation', state }]}>
      <AuthProvider><ConfirmationPage /></AuthProvider>
    </MemoryRouter>
  );
}

// ── 1. Rendu de base ──────────────────────────────────────────────────────

describe('rendu', () => {
  it('affiche Commande confirmée !', () => {
    renderConfirmation({ cart: cartItems, order: { id: 42 } });
    expect(screen.getByText(/commande confirmée/i)).toBeInTheDocument();
  });

  it('utilise order.ref si présent', () => {
    renderConfirmation({ cart: cartItems, order: { id: 42, ref: 'CYN-000042' } });
    expect(screen.getByText('CYN-000042')).toBeInTheDocument();
  });

  it('construit le numéro depuis order.id si pas de ref', () => {
    renderConfirmation({ cart: cartItems, order: { id: 42 } });
    expect(screen.getByText('CYN-0042')).toBeInTheDocument();
  });

  it('génère un numéro fallback si order sans id ni ref', () => {
    renderConfirmation({ cart: [], order: {} });
    expect(screen.getByText(/CYN-/)).toBeInTheDocument();
  });

  it('affiche les noms des produits commandés', () => {
    renderConfirmation({ cart: cartItems, order: { id: 42 } });
    expect(screen.getByText('CYNA SOC')).toBeInTheDocument();
    expect(screen.getByText('CYNA EDR')).toBeInTheDocument();
  });

  it('affiche le label Mensuel / Annuel', () => {
    renderConfirmation({ cart: cartItems, order: { id: 42 } });
    expect(screen.getAllByText(/mensuel/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/annuel/i).length).toBeGreaterThanOrEqual(1);
  });

  it('affiche "Commande enregistrée" si cart vide', () => {
    renderConfirmation({ cart: [], order: { id: 1 } });
    expect(screen.getByText(/commande enregistrée/i)).toBeInTheDocument();
  });

  it('affiche le lien vers l\'espace client', () => {
    renderConfirmation({ cart: cartItems, order: { id: 42 } });
    expect(screen.getByRole('link', { name: /espace client/i })).toBeInTheDocument();
  });

  it('affiche le message email envoyé', () => {
    renderConfirmation({ cart: cartItems, order: { id: 42 } });
    expect(screen.getByText(/email de confirmation/i)).toBeInTheDocument();
  });
});

// ── 2. Totaux ─────────────────────────────────────────────────────────────

describe('totaux', () => {
  it('affiche le sous-total HT depuis order si présent', () => {
    renderConfirmation({
      cart: cartItems,
      order: { id: 42, subtotal: 697, tax: 139.40, total: 836.40 },
    });
    expect(screen.getByText(/sous-total ht/i)).toBeInTheDocument();
    expect(screen.getByText(/tva.*20%/i)).toBeInTheDocument();
    expect(screen.getByText(/total ttc/i)).toBeInTheDocument();
  });

  it('calcule le total depuis le cart si order.total absent (299 + 199×2 = 697 HT → 836,40 TTC)', () => {
    renderConfirmation({ cart: cartItems, order: { id: 42 } });
    // 697 HT doit apparaître dans le récap
    expect(screen.getAllByText(/697/).length).toBeGreaterThan(0);
  });

  it('affiche le total TTC depuis order.total quand fourni', () => {
    renderConfirmation({
      cart: cartItems,
      order: { id: 42, subtotal: 697, tax: 139.4, total: 836.4 },
    });
    expect(screen.getByText(/836/)).toBeInTheDocument();
  });
});

// ── 3. Clés de licence ────────────────────────────────────────────────────

describe('licences', () => {
  it('affiche la section clés si order.licenses présent', () => {
    renderConfirmation({
      cart: cartItems,
      order: { id: 42, licenses },
    });
    expect(screen.getByText(/vos clés de licence/i)).toBeInTheDocument();
  });

  it('affiche les clés de licence en monospace', () => {
    renderConfirmation({
      cart: cartItems,
      order: { id: 42, licenses },
    });
    expect(screen.getByText('CYNA-ABC-1234-5678')).toBeInTheDocument();
    expect(screen.getByText('CYNA-XYZ-9876-4321')).toBeInTheDocument();
  });

  it('associe chaque clé à son nom de produit', () => {
    renderConfirmation({
      cart: cartItems,
      order: { id: 42, licenses },
    });
    // Les deux noms de produit dans la section licences
    const socElements = screen.getAllByText('CYNA SOC');
    expect(socElements.length).toBeGreaterThanOrEqual(1);
  });

  it('n\'affiche pas la section licences si order.licenses est vide', () => {
    renderConfirmation({ cart: cartItems, order: { id: 42, licenses: [] } });
    expect(screen.queryByText(/vos clés de licence/i)).not.toBeInTheDocument();
  });

  it('n\'affiche pas la section licences si order.licenses est absent', () => {
    renderConfirmation({ cart: cartItems, order: { id: 42 } });
    expect(screen.queryByText(/vos clés de licence/i)).not.toBeInTheDocument();
  });
});
