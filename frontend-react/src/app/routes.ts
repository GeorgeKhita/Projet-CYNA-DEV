import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutIdentificationPage } from './pages/CheckoutIdentificationPage';
import { CheckoutPaymentPage } from './pages/CheckoutPaymentPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ContactPage } from './pages/ContactPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'catalogue', Component: CatalogPage },
      { path: 'produit/:id', Component: ProductDetailPage },
      { path: 'panier', Component: CartPage },
      { path: 'checkout/identification', Component: CheckoutIdentificationPage },
      { path: 'checkout/paiement', Component: CheckoutPaymentPage },
      { path: 'confirmation', Component: ConfirmationPage },
      { path: 'espace-client', Component: DashboardPage },
      { path: 'connexion', Component: LoginPage },
      { path: 'inscription', Component: RegisterPage },
      { path: 'contact', Component: ContactPage },
    ],
  },
]);
