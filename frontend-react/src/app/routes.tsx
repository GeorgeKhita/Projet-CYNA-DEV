import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutIdentificationPage } from './pages/CheckoutIdentificationPage';
import { CheckoutPaymentPage } from './pages/CheckoutPaymentPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { DashboardPage } from './pages/DashboardPage';
import { AbonnementsPage } from './pages/AbonnementsPage';
import { CommandesPage } from './pages/CommandesPage';
import { ParametresPage } from './pages/ParametresPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ContactPage } from './pages/ContactPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage';

export const router = createBrowserRouter([
  // ── Site public ─────────────────────────────────────────────────────────
  {
    path: '/',
    Component: Layout,
    ErrorBoundary,
    children: [
      { index: true,                         Component: HomePage },
      { path: 'catalogue',                   Component: CatalogPage },
      { path: 'produit/:id',                 Component: ProductDetailPage },
      { path: 'panier',                      Component: CartPage },
      { path: 'checkout/identification',     Component: CheckoutIdentificationPage },
      { path: 'checkout/paiement',           Component: CheckoutPaymentPage },
      { path: 'confirmation',                Component: ConfirmationPage },
      { path: 'espace-client',               Component: DashboardPage },
      { path: 'espace-client/abonnements',   Component: AbonnementsPage },
      { path: 'espace-client/commandes',     Component: CommandesPage },
      { path: 'espace-client/parametres',    Component: ParametresPage },
      { path: 'connexion',                   Component: LoginPage },
      { path: 'inscription',                 Component: RegisterPage },
      { path: 'mot-de-passe-oublie',         Component: ForgotPasswordPage },
      { path: 'reinitialiser-mot-de-passe',  Component: ResetPasswordPage },
      { path: 'contact',                     Component: ContactPage },
      { path: '*',                           element: <Navigate to="/" replace /> },
    ],
  },
  // ── Panel admin ──────────────────────────────────────────────────────────
  {
    path: '/admin',
    Component: AdminLayout,
    ErrorBoundary,
    children: [
      { index: true,                Component: AdminDashboardPage },
      { path: 'produits',           Component: AdminProductsPage },
      { path: 'utilisateurs',       Component: AdminUsersPage },
      { path: 'commandes',          Component: AdminOrdersPage },
      { path: 'messages',           Component: AdminMessagesPage },
    ],
  },
]);
