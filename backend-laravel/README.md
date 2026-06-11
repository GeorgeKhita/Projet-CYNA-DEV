# CYNA — Plateforme B2B Cybersécurité SaaS

Plateforme complète pour la vente et la gestion d'abonnements aux produits de cybersécurité CYNA (SOC, EDR, XDR).

- **Backend** : API REST Laravel 11 — `backend-laravel/`
- **Frontend** : SPA React 18 + TypeScript — `frontend-react/`

---

## Stack technique

### Backend
| Technologie | Version | Rôle |
|---|---|---|
| PHP | 8.2+ | Runtime |
| Laravel | 11 | Framework API REST |
| MySQL | 8.0+ | Base de données |
| Laravel Sanctum | 4.x | Auth Bearer token |
| pragmarx/google2fa | 9.x | TOTP 2FA (admin) |
| bacon/bacon-qr-code | 3.x | Génération QR code SVG |
| Stripe | — | Paiement (Payment Intent) |

### Frontend
| Technologie | Version | Rôle |
|---|---|---|
| React | 18.3 | UI |
| TypeScript | — | Typage |
| Vite | 6 | Build / dev server |
| React Router | 7 | Routing SPA |
| Tailwind CSS | 4 | Styles |
| shadcn/ui + Radix UI | — | Composants UI |
| Material UI | 7 | Composants admin |
| React Hook Form | 7 | Formulaires |
| Recharts | 2 | Graphiques dashboard |
| Stripe.js | — | Paiement frontend |
| Vitest + Testing Library | 4 | Tests |

---

## Prérequis

| Outil | Version |
|---|---|
| PHP | 8.2+ |
| Composer | 2.x |
| MySQL | 8.0+ |
| Node.js | 18+ |
| npm | 9+ |

---

## Installation

### Backend

```bash
cd backend-laravel

composer install

cp .env.example .env
php artisan key:generate

# Configurer .env :
# DB_DATABASE=cyna_db
# DB_USERNAME=root
# DB_PASSWORD=
# CACHE_STORE=file

mysql -u root -e "CREATE DATABASE IF NOT EXISTS cyna_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

php artisan migrate
php artisan db:seed

php artisan serve
# → http://localhost:8000
```

### Frontend

```bash
cd frontend-react

npm install

# .env (créer à la racine du dossier frontend-react)
# VITE_API_URL=http://localhost:8000
# VITE_STRIPE_PUBLIC_KEY=pk_test_...

npm run dev
# → http://localhost:5173
```

---

## Variables d'environnement

### Backend `.env`

```env
APP_NAME=CYNA
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cyna_db
DB_USERNAME=root
DB_PASSWORD=

CACHE_STORE=file          # obligatoire — évite l'erreur table 'cache' inexistante

SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@cyna-it.fr | Admin1234! |
| User | jean.dupont@entreprise.fr | User1234! |
| User | marie.martin@techcorp.fr | User1234! |
| User | p.bernard@consulting.fr | User1234! |

---

## Routes API — 58 routes

### Auth publiques

| Méthode | URL | Description |
|---|---|---|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion (retourne token ou flux 2FA) |
| POST | /api/auth/forgot-password | Demande réinitialisation mot de passe |
| POST | /api/auth/reset-password | Réinitialisation avec token |

### Auth authentifiées (Bearer token)

| Méthode | URL | Description |
|---|---|---|
| POST | /api/auth/logout | Déconnexion |
| GET | /api/auth/me | Profil utilisateur |
| PUT | /api/auth/me | Modifier le profil |
| DELETE | /api/auth/me | Supprimer le compte (RGPD) |
| GET | /api/auth/me/export | Exporter ses données (RGPD) |

### 2FA admin (Bearer token + rôle admin)

| Méthode | URL | Description |
|---|---|---|
| POST | /api/auth/admin/setup-2fa | Obtenir QR code + secret TOTP |
| POST | /api/auth/admin/confirm-2fa | Confirmer l'activation avec un code TOTP |
| POST | /api/auth/admin/verify-2fa | Vérifier le code après login (échange pending_token → Sanctum token) |
| DELETE | /api/auth/admin/disable-2fa | Désactiver la 2FA |

### Produits & Catégories (public)

| Méthode | URL | Description |
|---|---|---|
| GET | /api/products | Liste produits (paginée, filtrable) |
| GET | /api/products/:id | Détail produit |
| GET | /api/categories | Liste catégories |
| GET | /api/carousel | Diapositives du carrousel homepage |

### Espace client (authentifié)

| Méthode | URL | Description |
|---|---|---|
| GET | /api/orders | Mes commandes |
| POST | /api/orders | Créer une commande |
| GET | /api/orders/:id | Détail commande |
| GET | /api/subscriptions | Mes abonnements |
| PATCH | /api/subscriptions/:id/cancel | Annuler un abonnement |
| GET | /api/invoices | Mes factures |
| GET | /api/invoices/:id/download | Télécharger une facture PDF |
| POST | /api/payments/intent | Créer un Payment Intent Stripe |
| POST | /api/contact | Envoyer un message de contact |
| POST | /api/chatbot/message | Chatbot support |

### Admin — Dashboard

| Méthode | URL | Description |
|---|---|---|
| GET | /api/admin/dashboard | KPIs (CA, commandes, utilisateurs, abonnements) |
| GET | /api/admin/dashboard/revenue-chart | Données graphique CA mensuel |

### Admin — Produits & Catégories

| Méthode | URL | Description |
|---|---|---|
| GET/POST | /api/admin/products | Liste / Créer |
| GET/PUT/DELETE | /api/admin/products/:id | Détail / Modifier / Supprimer |
| PATCH | /api/admin/products/:id/toggle | Activer / désactiver |
| GET/POST | /api/admin/categories | Liste / Créer |
| PUT/DELETE | /api/admin/categories/:id | Modifier / Supprimer |

### Admin — Commandes & Utilisateurs

| Méthode | URL | Description |
|---|---|---|
| GET | /api/admin/orders | Toutes les commandes |
| GET | /api/admin/orders/:id | Détail commande |
| PATCH | /api/admin/orders/:id/status | Changer le statut |
| GET | /api/admin/users | Tous les utilisateurs |
| GET | /api/admin/users/:id | Détail utilisateur |
| DELETE | /api/admin/users/:id | Supprimer un utilisateur (RGPD) |

### Admin — Messages, Carrousel, Paramètres, Logs

| Méthode | URL | Description |
|---|---|---|
| GET | /api/admin/contact-messages | Tous les messages |
| GET | /api/admin/contact-messages/:id | Détail message |
| PATCH | /api/admin/contact-messages/:id/resolve | Marquer résolu |
| DELETE | /api/admin/contact-messages/:id | Supprimer |
| GET/POST | /api/admin/carousel | Gérer les diapositives |
| POST | /api/admin/carousel/reorder | Réordonner |
| PUT/DELETE | /api/admin/carousel/:id | Modifier / Supprimer |
| GET/PUT | /api/admin/settings | Paramètres site |
| GET | /api/admin/logs | Logs de sécurité |
| DELETE | /api/admin/logs | Vider les logs |

---

## Flux de connexion 2FA (admin)

```
POST /auth/login
        │
        ├─ 2FA non activée → { token, user }        ← connexion directe
        │
        └─ 2FA activée    → { requires_2fa: true, pending_token }
                                    │
                    sessionStorage.setItem('2fa_pending_token', ...)
                                    │
                         GET /verification-2fa
                                    │
                    POST /auth/admin/verify-2fa
                         { pending_token, code }
                                    │
                              { token, user }         ← Sanctum token final
```

---

## Base de données — 19 migrations

| Table | Description |
|---|---|
| users | Comptes (rôle, 2FA, is_active) |
| categories | Catégories produits |
| products | Produits (JSON features/images, statut, prix) |
| addresses | Adresses utilisateurs |
| payment_methods | Moyens de paiement |
| carts | Paniers |
| cart_items | Articles panier |
| orders | Commandes (Stripe PI ID, statut, montants) |
| order_details | Lignes de commande |
| subscriptions | Abonnements (cycle, période, statut) |
| homepage_carousel | Diapositives homepage |
| support_messages | Messages support (form + chatbot) |
| security_logs | Logs de sécurité admin |
| site_settings | Paramètres site (JSON) |
| password_reset_tokens | Tokens réinitialisation |
| personal_access_tokens | Tokens Sanctum |
| invoices | Factures (numéro CYN-XXXXXX, PDF) |
| + 2FA fields sur users | two_factor_secret (chiffré), two_factor_enabled, two_factor_confirmed_at |
| + is_active sur users | Activation / désactivation de compte |

---

## Tests

### Backend — 212 tests

```bash
# Tous les tests
php artisan test --testdox

# Par suite
php artisan test --testsuite Feature      # 57 tests  — HTTP complet
php artisan test --testsuite Unit         # 88 tests  — sans DB ni HTTP
php artisan test --testsuite Integration  # 67 tests  — DB, sans HTTP
```

| Suite | Tests | Ce qui est couvert |
|---|---|---|
| Feature | 57 | Auth, Produits, Commandes, Admin, 2FA complet |
| Unit | 88 | Modèles (casts, fillable, méthodes), AdminMiddleware |
| Integration | 67 | Relations DB, persistance, cascades, JSON round-trip |

### Frontend — 71 tests

```bash
cd frontend-react

npm test           # run une fois
npm run test:watch # mode watch
```

| Fichier | Tests | Ce qui est couvert |
|---|---|---|
| `src/lib/cart.test.ts` | 25 | getCart, addToCart, updateQuantity, removeFromCart, clearCart, getCartCount, CATEGORY_COLORS |
| `src/api/client.test.ts` | 16 | getToken/setToken/clearToken, api.get/post/put/delete, erreurs 401/422/500, auto-logout |
| `src/context/AuthContext.test.tsx` | 14 | État initial, hydratation localStorage, login, logout, isAdmin |
| `src/app/pages/LoginPage.test.tsx` | 16 | Rendu, saisie, soumission, flux 2FA, messages d'erreur |

**Total : 283 tests** (212 backend + 71 frontend)

---

## Structure des dossiers

```
Projet-CYNA-DEV/
├── backend-laravel/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/       ← Contrôleurs publics + Auth
│   │   │   │   └── Admin/             ← Contrôleurs admin
│   │   │   └── Middleware/
│   │   │       └── AdminMiddleware.php
│   │   └── Models/                    ← User, Product, Order, Subscription…
│   ├── database/
│   │   ├── factories/                 ← 9 factories (tests)
│   │   ├── migrations/                ← 19 migrations
│   │   └── seeders/                   ← Données de démo
│   ├── routes/api.php                 ← 58 routes API
│   ├── tests/
│   │   ├── Feature/                   ← 57 tests HTTP
│   │   ├── Unit/                      ← 88 tests unitaires
│   │   └── Integration/               ← 67 tests intégration
│   └── phpunit.xml
│
└── frontend-react/
    ├── src/
    │   ├── api/client.ts              ← Fetch wrapper + token management
    │   ├── context/AuthContext.tsx    ← Auth (user, login, logout, isAdmin)
    │   ├── lib/cart.ts                ← Panier localStorage
    │   ├── app/
    │   │   ├── components/            ← Navbar, Layout, ChatBot, AdminSidebar…
    │   │   └── pages/                 ← 21 pages (dont 7 admin)
    │   └── setupTests.ts              ← Mock localStorage (Node.js 25 compat)
    ├── vitest.config.ts
    └── tsconfig.json
```

---

## Headers requis (requêtes authentifiées)

```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```
