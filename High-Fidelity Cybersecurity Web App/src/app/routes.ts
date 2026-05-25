import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';

// Pages client
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutIdentificationPage } from './pages/CheckoutIdentificationPage';
import { CheckoutAddressPage } from './pages/CheckoutAddressPage';
import { CheckoutPaymentPage } from './pages/CheckoutPaymentPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { DashboardPage } from './pages/DashboardPage';
import { DashboardOrdersPage } from './pages/DashboardOrdersPage';
import { DashboardSettingsPage } from './pages/DashboardSettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ContactPage } from './pages/ContactPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// Pages admin
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminCarouselPage } from './pages/admin/AdminCarouselPage';

export const router = createBrowserRouter([
  // ── Routes publiques (avec Navbar + Footer) ──
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'catalogue', Component: CatalogPage },
      { path: 'produit/:id', Component: ProductDetailPage },
      { path: 'panier', Component: CartPage },
      { path: 'checkout/identification', Component: CheckoutIdentificationPage },
      { path: 'checkout/adresse', Component: CheckoutAddressPage },
      { path: 'checkout/paiement', Component: CheckoutPaymentPage },
      { path: 'confirmation', Component: ConfirmationPage },
      { path: 'espace-client', Component: DashboardPage },
      { path: 'espace-client/commandes', Component: DashboardOrdersPage },
      { path: 'espace-client/parametres', Component: DashboardSettingsPage },
      { path: 'connexion', Component: LoginPage },
      { path: 'inscription', Component: RegisterPage },
      { path: 'contact', Component: ContactPage },
      { path: 'mot-de-passe-oublie', Component: ForgotPasswordPage },
    ],
  },

  // ── Route login admin (standalone, sans layout) ──
  {
    path: '/admin',
    Component: AdminLoginPage,
  },

  // ── Routes admin (avec AdminLayout) ──
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { path: 'dashboard', Component: AdminDashboardPage },
      { path: 'produits', Component: AdminProductsPage },
      { path: 'categories', Component: AdminCategoriesPage },
      { path: 'commandes', Component: AdminOrdersPage },
      { path: 'utilisateurs', Component: AdminUsersPage },
      { path: 'logs', Component: AdminLogsPage },
      { path: 'parametres', Component: AdminSettingsPage },
      { path: 'carrousel', Component: AdminCarouselPage },
    ],
  },
]);
