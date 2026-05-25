# CYNA Backend — Laravel 11 API

API REST pour la plateforme B2B CYNA (Cybersécurité SaaS : SOC, EDR, XDR).  
Authentification via **Laravel Sanctum** (token Bearer).

---

## Prérequis

| Outil | Version minimum |
|-------|----------------|
| PHP   | 8.2+           |
| Composer | 2.x        |
| MySQL | 8.0+           |

---

## Installation

```bash
# 1. Aller dans le dossier backend
cd backend-laravel

# 2. Installer les dépendances PHP
composer install

# 3. Copier le fichier d'environnement
cp .env.example .env

# 4. Générer la clé d'application
php artisan key:generate

# 5. Configurer la base de données dans .env
#    DB_DATABASE=cyna_db
#    DB_USERNAME=root
#    DB_PASSWORD=

# 6. Créer la base de données (MySQL)
mysql -u root -e "CREATE DATABASE IF NOT EXISTS cyna_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 7. Lancer les migrations
php artisan migrate

# 8. Injecter les données de démo
php artisan db:seed

# 9. Démarrer le serveur de développement
php artisan serve
# → http://localhost:8000
```

---

## Comptes de démonstration

| Rôle  | Email                         | Mot de passe |
|-------|-------------------------------|--------------|
| Admin | admin@cyna-it.fr              | Admin1234!   |
| User  | jean.dupont@entreprise.fr     | User1234!    |
| User  | marie.martin@techcorp.fr      | User1234!    |
| User  | p.bernard@consulting.fr       | User1234!    |

---

## Routes API principales

### Auth (public)
| Méthode | URL                        | Description          |
|---------|----------------------------|----------------------|
| POST    | /api/auth/register         | Inscription          |
| POST    | /api/auth/login            | Connexion            |
| POST    | /api/auth/forgot-password  | Mot de passe oublié  |

### Auth (authentifié)
| Méthode | URL             | Description             |
|---------|-----------------|-------------------------|
| POST    | /api/auth/logout | Déconnexion            |
| GET     | /api/auth/me    | Profil utilisateur       |
| PUT     | /api/auth/me    | Modifier le profil       |

### Produits & Catégories (public)
| Méthode | URL                   | Description       |
|---------|-----------------------|-------------------|
| GET     | /api/products         | Liste produits    |
| GET     | /api/products/:id     | Détail produit    |
| GET     | /api/categories       | Liste catégories  |

### Commandes (authentifié)
| Méthode | URL             | Description              |
|---------|-----------------|--------------------------|
| GET     | /api/orders     | Mes commandes            |
| POST    | /api/orders     | Créer une commande       |

### Admin (auth + rôle admin)
| Méthode | URL                             | Description               |
|---------|---------------------------------|---------------------------|
| GET     | /api/admin/dashboard            | KPIs + stats              |
| CRUD    | /api/admin/products             | Gestion produits          |
| CRUD    | /api/admin/categories           | Gestion catégories        |
| GET     | /api/admin/orders               | Toutes les commandes      |
| PATCH   | /api/admin/orders/:id/status    | Changer statut commande   |
| GET     | /api/admin/users                | Tous les utilisateurs     |
| PATCH   | /api/admin/users/:id/toggle     | Activer / désactiver      |
| CRUD    | /api/admin/carousel             | Gestion carrousel         |
| GET     | /api/admin/logs                 | Logs d'activité           |
| GET/PUT | /api/admin/settings             | Paramètres système        |

---

## Headers requis pour les requêtes authentifiées

```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

---

## Structure des dossiers

```
backend-laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/       ← Contrôleurs publics
│   │   │   └── Admin/             ← Contrôleurs admin
│   │   └── Middleware/
│   │       └── AdminMiddleware.php
│   ├── Models/                    ← Modèles Eloquent
│   └── Providers/
├── bootstrap/app.php              ← Bootstrap Laravel 11
├── config/                        ← cors, database, sanctum...
├── database/
│   ├── migrations/                ← 9 tables
│   └── seeders/                   ← Données de démo
├── routes/
│   ├── api.php                    ← Toutes les routes API
│   └── web.php
├── .env                           ← Variables d'environnement
└── composer.json
```

---

## Front-end (React)

Le front-end se trouve dans `High-Fidelity Cybersecurity Web App/`.

```bash
npm install
npm run dev
# → http://localhost:5173
```

Variables d'environnement front :

```env
VITE_API_URL=http://localhost:8000/api
```
