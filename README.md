# CYNA — Plateforme B2B Cybersécurité SaaS

> Projet fil rouge BSI Dev — Sup de Vinci 2025-2026  
> Application web e-commerce B2B spécialisée dans la vente de solutions cybersécurité en mode SaaS (SOC, EDR, XDR).

---

## Stack technique

### Frontend
| Technologie | Version | Rôle |
|---|---|---|
| React | 18 | Framework UI |
| Vite | 6 | Bundler / Dev server |
| TypeScript | 5 | Typage statique |
| Tailwind CSS | 4 | Styles utilitaires |
| React Router | 7 | Routing SPA |
| shadcn/ui + Radix UI | — | Composants accessibles |
| Stripe.js + React Stripe | — | Paiement sécurisé |
| Lucide React | — | Icônes |

### Backend
| Technologie | Version | Rôle |
|---|---|---|
| Laravel | 11 | Framework PHP |
| PHP | 8.2+ | Runtime |
| Laravel Sanctum | — | Authentification par token |
| MySQL | 8+ | Base de données |
| Stripe PHP SDK | 20.x | Paiements |
| barryvdh/laravel-dompdf | 3.x | Génération PDF |
| Mailtrap (SMTP) | — | Emails (dev/staging) |
| Anthropic Claude API | — | Chatbot IA |

---

## Prérequis

- Node.js >= 18
- PHP >= 8.2
- Composer
- MySQL (WAMP / XAMPP / Laravel Herd)
- Compte Stripe (clés test)
- Compte Mailtrap (sandbox SMTP)

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/GeorgeKhita/Projet-CYNA-DEV.git
cd Projet-CYNA-DEV
git checkout CYNA-Nouh
```

### 2. Backend Laravel

```bash
cd backend-laravel
composer install
cp .env.example .env
php artisan key:generate
```

Configurer le fichier `.env` :

```env
# Base de données
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cyna
DB_USERNAME=root
DB_PASSWORD=

# Frontend (CORS)
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:5174,127.0.0.1
FRONTEND_URL=http://localhost:5173

# Stripe (clés test)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Mailtrap SMTP
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=votre_username
MAIL_PASSWORD=votre_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@cyna.local
MAIL_FROM_NAME="CYNA"

# Chatbot IA (optionnel)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-haiku-4-5-20251001
```

Lancer les migrations :

```bash
php artisan migrate
php artisan serve
```

Le backend tourne sur **http://localhost:8000**

### 3. Frontend React

```bash
cd frontend-react
cp .env.example .env   # ou créer .env manuellement
```

Contenu du `.env` frontend :

```env
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

```bash
npm install
npm run dev
```

Le frontend tourne sur **http://localhost:5173**

---

## Structure du projet

```
Projet-CYNA-DEV/
├── backend-laravel/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/          # Contrôleurs API REST
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── OrderController.php
│   │   │   │   ├── PaymentController.php
│   │   │   │   ├── SubscriptionController.php
│   │   │   │   ├── InvoiceController.php
│   │   │   │   ├── ContactController.php
│   │   │   │   ├── ChatbotController.php
│   │   │   │   └── Admin/               # Contrôleurs admin
│   │   │   └── Middleware/
│   │   │       └── AdminMiddleware.php
│   │   └── Models/                       # Modèles Eloquent
│   ├── config/
│   │   └── services.php                  # Clés Stripe
│   ├── database/
│   │   └── migrations/                   # 17 migrations
│   └── routes/
│       └── api.php                       # Toutes les routes API
│
└── frontend-react/
    └── src/
        ├── api/
        │   └── client.ts                 # Wrapper fetch + gestion token
        ├── app/
        │   ├── components/               # Composants partagés
        │   │   ├── Layout.tsx
        │   │   ├── Navbar.tsx
        │   │   ├── Footer.tsx
        │   │   ├── ChatBot.tsx
        │   │   ├── DashboardSidebar.tsx
        │   │   ├── AdminSidebar.tsx
        │   │   ├── ProductVisual.tsx
        │   │   └── ui/                   # shadcn/ui components
        │   ├── pages/                    # Pages utilisateur
        │   │   ├── admin/                # Pages panel admin
        │   │   └── ...
        │   └── routes.tsx                # Définition des routes
        ├── context/
        │   └── AuthContext.tsx           # Auth globale (token + user)
        └── lib/
            └── cart.ts                   # Panier (localStorage)
```

---

## Base de données — Migrations

| # | Table | Description |
|---|---|---|
| 01 | `users` | Comptes utilisateurs (rôle user/admin) |
| 02 | `categories` | Catégories de produits (SOC, EDR, XDR…) |
| 03 | `products` | Produits avec prix mensuel/annuel, features JSON |
| 04 | `addresses` | Adresses de facturation |
| 05 | `payment_methods` | Méthodes de paiement enregistrées |
| 06 | `carts` | Paniers persistants (optionnel) |
| 07 | `cart_items` | Lignes de panier |
| 08 | `orders` | Commandes avec `stripe_pi_id` |
| 09 | `order_details` | Lignes de commande (produit, quantité, durée) |
| 10 | `subscriptions` | Abonnements actifs avec période start/end |
| 11 | `homepage_carousel` | Slides du carousel d'accueil |
| 12 | `support_messages` | Messages contact et chatbot |
| 13 | `security_logs` | Logs d'activité admin |
| 14 | `site_settings` | Paramètres globaux de la plateforme |
| 15 | `password_reset_tokens` | Tokens de réinitialisation mot de passe |
| 16 | `personal_access_tokens` | Tokens Sanctum |
| 17 | `invoices` | Factures liées aux commandes |

---

## Fonctionnalités

### Catalogue & Produits
- Affichage des produits par catégorie (SOC, EDR, XDR, SIEM…)
- Filtres par catégorie, recherche textuelle, tri par prix/priorité
- Page détail avec features, comparatif mensuel/annuel, ajout au panier
- Panier persistant (localStorage) avec gestion des quantités

### Authentification
- Inscription avec validation (prénom, nom, email, entreprise)
- Connexion avec token Sanctum stocké en localStorage
- Déconnexion automatique si token expiré (401)
- Mot de passe oublié → email avec lien sécurisé (token 60 min)
- Réinitialisation de mot de passe via token

### Processus de commande
- **Étape 1** : Identification (connexion ou inscription)
- **Étape 2** : Paiement sécurisé via Stripe (CardElement)
  - Création d'un PaymentIntent côté serveur
  - Confirmation du paiement côté client (`confirmCardPayment`)
  - Vérification serveur du statut avant création de la commande
- **Étape 3** : Confirmation avec numéro de commande
- Création automatique des abonnements après paiement
- Email de confirmation avec **facture PDF en pièce jointe**

### Espace client
| Route | Page |
|---|---|
| `/espace-client` | Dashboard — KPIs abonnements actifs, coût mensuel, prochain renouvellement |
| `/espace-client/abonnements` | Liste des abonnements actifs/annulés, bouton annulation |
| `/espace-client/commandes` | Historique des commandes avec **téléchargement PDF** |
| `/espace-client/parametres` | Modification profil, changement de mot de passe, export RGPD |

### Factures PDF
- Générées automatiquement après chaque paiement (barryvdh/laravel-dompdf)
- Jointes à l'email de confirmation
- Téléchargeables à tout moment depuis l'espace client
- Format professionnel : logo CYNA, TVA 20%, récapitulatif lignes, totaux HT/TTC

### Emails transactionnels (Mailtrap)
- Confirmation de commande avec facture PDF attachée
- Lien de réinitialisation de mot de passe (expire après 60 min)
- Notification support pour les messages de contact

### Chatbot IA
- Assistante intégrée (bulle flottante sur toutes les pages)
- Base de connaissances : SOC, EDR, XDR, tarifs, démo, conformité, intégration
- Propulsé par **Claude (Anthropic)** via API
- Messages non-répondus flaggés `requires_human` → visibles dans le panel admin

### Formulaire de contact
- Email, sujet, message
- Enregistrement en base (support_messages)
- Notification email envoyée au support CYNA

### Panel Admin (`/admin/*`)
| Route | Page |
|---|---|
| `/admin` | Dashboard — revenus, clients actifs, contrats, tickets ouverts |
| `/admin/produits` | CRUD complet — créer, modifier, supprimer, activer/désactiver |
| `/admin/utilisateurs` | Liste clients, détail par utilisateur, suppression |
| `/admin/commandes` | Historique toutes commandes, mise à jour statut |
| `/admin/messages` | Messages chatbot et contact — résoudre, supprimer |

### Sécurité
- Routes admin protégées par `AdminMiddleware` (rôle `admin` requis)
- Routes client protégées par `auth:sanctum`
- Tokens révoqués à la déconnexion
- Vérification serveur du PaymentIntent Stripe avant création commande
- Validation stricte de toutes les entrées (Laravel FormRequest)

### RGPD
- Export des données personnelles (JSON) via `GET /api/auth/me/export`
- Contient profil, commandes, abonnements

---

## API — Endpoints complets

### Authentification (public)
```
POST   /api/auth/register              Inscription
POST   /api/auth/login                 Connexion → token
POST   /api/auth/forgot-password       Envoi email reset
POST   /api/auth/reset-password        Reset avec token
```

### Authentification (auth:sanctum)
```
POST   /api/auth/logout                Révocation token
GET    /api/auth/me                    Profil utilisateur
PUT    /api/auth/me                    Modifier profil / mot de passe
GET    /api/auth/me/export             Export données RGPD (JSON)
```

### Catalogue (public)
```
GET    /api/products                   Liste produits (filtres: category, search, sort)
GET    /api/products/{id}              Détail produit
GET    /api/categories                 Liste catégories
```

### Contact & Chatbot (public)
```
POST   /api/contact                    Envoyer message support
POST   /api/chatbot/message            Envoyer message au chatbot IA
```

### Paiement (auth:sanctum)
```
POST   /api/payments/intent            Créer un Stripe PaymentIntent → client_secret
```

### Commandes (auth:sanctum)
```
GET    /api/orders                     Historique commandes (avec invoice_id)
POST   /api/orders                     Créer commande (vérifie Stripe + crée facture + email)
GET    /api/orders/{id}                Détail commande
```

### Abonnements (auth:sanctum)
```
GET    /api/subscriptions              Liste abonnements utilisateur
PATCH  /api/subscriptions/{id}/cancel  Annuler un abonnement
```

### Factures (auth:sanctum)
```
GET    /api/invoices                   Liste factures
GET    /api/invoices/{id}/download     Télécharger facture en PDF
```

### Admin — Dashboard (admin)
```
GET    /api/admin/dashboard            KPIs : revenus, clients, contrats, tickets
GET    /api/admin/dashboard/revenue-chart  Graphique revenus 12 mois
```

### Admin — Produits (admin)
```
GET    /api/admin/products             Liste paginée
POST   /api/admin/products             Créer produit
GET    /api/admin/products/{id}        Détail
PUT    /api/admin/products/{id}        Modifier
DELETE /api/admin/products/{id}        Supprimer
PATCH  /api/admin/products/{id}/toggle Activer / désactiver
```

### Admin — Catégories (admin)
```
GET    /api/admin/categories           Liste
POST   /api/admin/categories           Créer
PUT    /api/admin/categories/{id}      Modifier
DELETE /api/admin/categories/{id}      Supprimer
```

### Admin — Commandes (admin)
```
GET    /api/admin/orders               Toutes les commandes
GET    /api/admin/orders/{id}          Détail
PATCH  /api/admin/orders/{id}/status   Changer le statut
```

### Admin — Utilisateurs (admin)
```
GET    /api/admin/users                Liste
GET    /api/admin/users/{id}           Détail
DELETE /api/admin/users/{id}           Supprimer
```

### Admin — Carousel (admin)
```
GET    /api/admin/carousel             Liste slides
POST   /api/admin/carousel             Créer slide
PUT    /api/admin/carousel/{id}        Modifier
DELETE /api/admin/carousel/{id}        Supprimer
POST   /api/admin/carousel/reorder     Réordonner
```

### Admin — Messages support (admin)
```
GET    /api/admin/contact-messages                   Liste messages
GET    /api/admin/contact-messages/{id}              Détail
PATCH  /api/admin/contact-messages/{id}/resolve      Marquer résolu
DELETE /api/admin/contact-messages/{id}              Supprimer
```

### Admin — Paramètres & Logs (admin)
```
GET    /api/admin/settings             Paramètres plateforme
PUT    /api/admin/settings             Modifier paramètres
GET    /api/admin/logs                 Logs d'activité
DELETE /api/admin/logs                 Vider les logs
```

---

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@cyna-it.fr | Admin1234! |
| Utilisateur | jean.dupont@entreprise.fr | User1234! |

---

## Tests Stripe

Pour tester le paiement en environnement de développement :

| Carte | Numéro | Résultat |
|---|---|---|
| Visa (succès) | `4242 4242 4242 4242` | Paiement accepté |
| Refus générique | `4000 0000 0000 0002` | Paiement refusé |
| Authentification 3DS | `4000 0025 0000 3155` | Requiert 3DS |

Date d'expiration : n'importe quelle date future · CVV : n'importe quels 3 chiffres

---

## Flux de paiement complet

```
Client → CheckoutPaymentPage
  │
  ├─ POST /api/payments/intent  →  Laravel crée PaymentIntent Stripe
  │                             ←  client_secret
  │
  ├─ stripe.confirmCardPayment(client_secret)
  │                             ←  paymentIntent.status = 'succeeded'
  │
  └─ POST /api/orders { payment_intent_id, items... }
       │
       ├─ Vérification Stripe : paymentIntents->retrieve()
       ├─ Création Order + OrderDetails + Subscriptions
       ├─ Création Invoice (CYN-XXXXXX)
       ├─ Génération PDF facture (dompdf)
       └─ Email confirmation + PDF en pièce jointe (Mailtrap)
```

---

## Build de production

```bash
# Frontend
cd frontend-react
npm run build
# Sortie dans dist/

# Backend
cd backend-laravel
php artisan config:cache
php artisan route:cache
php artisan optimize
```

---

## Historique des commits principaux

| Commit | Description |
|---|---|
| `fe25521` | Intégration Stripe, Mailtrap, factures PDF, corrections bugs |
| `3bdcefd` | Fix méthodes HTTP panel admin |
| `0e69bb2` | Images produits + panel admin complet |
| `8cb4f23` | Toutes les pages prioritaires implémentées |
| `29cf3a8` | Redirection auto /connexion si token expiré (401) |
| `78fa8ef` | Pages espace-client complètes + corrections backend |
| `403edd9` | Fix SubscriptionController nouveau schéma |
| `7c0f684` | Fix Order/OrderDetail/Subscription |
| `b78b540` | Chatbot IA avec API Claude (Anthropic) |
| `49b9714` | Refactor migrations (schema cyna_corrected.sql) |
| `db2a851` | Réorganisation frontend dans `frontend-react/` |
| `9a7f7ad` | Fonctionnalités RGPD, 2FA, pages légales |
| `61810b8` | Chatbot global avec base de connaissances SOC/EDR/XDR |
| `1b9136b` | Backend Laravel complet + couche API frontend |
| `bf4e924` | MVP React + panel admin CYNA |
| `a721b5a` | Import maquette Figma + améliorations UI/UX |

---

## Auteurs

Projet réalisé dans le cadre du **Bloc 3 — BSI Dev**, Sup de Vinci (2025-2026).
