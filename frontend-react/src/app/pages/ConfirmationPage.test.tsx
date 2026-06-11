import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { render } from '@testing-library/react';
import { AuthProvider } from '../../context/AuthContext';
import { ConfirmationPage } from './ConfirmationPage';

const cartItems = [
  { id: 1, name: 'CYNA SOC', category: 'SOC', categoryColor: '#00B4D8', price: 299, quantity: 1, duration: 'monthly' as const },
  { id: 2, name: 'CYNA EDR', category: 'EDR', categoryColor: '#8B5CF6', price: 199, quantity: 2, duration: 'annual' as const },
];

function renderConfirmation(state: object = {}) {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: '/confirmation', state }]}
    >
      <AuthProvider>
        <ConfirmationPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

// ── Rendu ─────────────────────────────────────────────────────────────────

describe('rendu', () => {
  it('affiche Commande confirmée !', () => {
    renderConfirmation({ cart: cartItems, order: { id: 42 } });
    expect(screen.getByText(/commande confirmée/i)).toBeInTheDocument();
  });

  it('affiche le numéro de commande au format CYN-XXXX', () => {
    renderConfirmation({ cart: cartItems, order: { id: 42 } });
    expect(screen.getByText(/CYN-0042/)).toBeInTheDocument();
  });

  it('affiche les noms des produits commandés', () => {
    renderConfirmation({ cart: cartItems, order: { id: 42 } });
    expect(screen.getByText('CYNA SOC')).toBeInTheDocument();
    expect(screen.getByText('CYNA EDR')).toBeInTheDocument();
  });

  it('affiche le label Mensuel / Annuel', () => {
    renderConfirmation({ cart: cartItems, order: { id: 42 } });
    // "Mensuel" et "Total mensuel" sont tous les deux dans le DOM → getAllByText
    expect(screen.getAllByText(/mensuel/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/annuel/i).length).toBeGreaterThanOrEqual(1);
  });

  it('affiche le total calculé (299 + 199×2 = 697)', () => {
    renderConfirmation({ cart: cartItems, order: { id: 42 } });
    expect(screen.getByText(/697/)).toBeInTheDocument();
  });

  it('affiche le lien Accéder à mon espace client', () => {
    renderConfirmation({ cart: cartItems, order: { id: 42 } });
    expect(screen.getByRole('link', { name: /espace client/i })).toBeInTheDocument();
  });

  it('affiche "Commande enregistrée" si pas de cart dans le state', () => {
    renderConfirmation({ cart: [], order: null });
    expect(screen.getByText(/commande enregistrée/i)).toBeInTheDocument();
  });

  it('génère un numéro fallback si order sans id', () => {
    renderConfirmation({ cart: [], order: {} });
    expect(screen.getByText(/CYN-/)).toBeInTheDocument();
  });
});
