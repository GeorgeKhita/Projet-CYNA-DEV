# Ce que le frontend attend du backend

> Document à transmettre à l'équipe back.  
> Le frontend React appelle ces endpoints — le back doit les implémenter exactement comme décrit.

---

## Configuration obligatoire

### CORS
Le backend doit autoriser les requêtes depuis le domaine du frontend.

```
Origines autorisées : http://localhost:5173, http://localhost:5174, http://localhost:5175
  (et le domaine de production quand déployé)
Headers autorisés   : Content-Type, Authorization, Accept
Méthodes autorisées : GET, POST, PUT, PATCH, DELETE, OPTIONS
Credentials         : true (pour Sanctum)
```

### Authentification
On utilise **Laravel Sanctum** avec des tokens Bearer.  
Le frontend envoie dans chaque requête authentifiée :
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

---

## Endpoints attendus

### Auth — public

#### `POST /api/auth/register`
```json
// Request
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "company": "ACME",          // nullable
  "email": "jean@acme.fr",
  "password": "MonMdp1234!",
  "password_confirmation": "MonMdp1234!"
}

// Response 201
{
  "token": "1|abc...",
  "user": {
    "id": 1,
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean@acme.fr",
    "company": "ACME",
    "role": "user"
  }
}

// Erreur 422 (validation)
{
  "message": "Cette adresse email est déjà utilisée.",
  "errors": { "email": ["Cette adresse email est déjà utilisée."] }
}
```

#### `POST /api/auth/login`
```json
// Request
{ "email": "jean@acme.fr", "password": "MonMdp1234!" }

// Response 200
{
  "token": "1|abc...",
  "user": { "id": 1, "first_name": "Jean", "last_name": "Dupont", "email": "...", "company": "...", "role": "user" }
}

// Erreur 401
{ "message": "Email ou mot de passe incorrect." }
```

#### `POST /api/auth/forgot-password`
```json
// Request
{ "email": "jean@acme.fr" }

// Response 200
{ "message": "Si cet email existe, un lien de réinitialisation vous a été envoyé." }
```

#### `POST /api/contact`
```json
// Request
{ "email": "jean@acme.fr", "subject": "Question", "message": "Bonjour..." }

// Response 200
{ "message": "Message envoyé." }
```

#### `POST /api/chatbot/message`
```json
// Request
{ "message": "Quels sont vos tarifs ?" }

// Response 200
{ "reply": "Nos tarifs vont de 699€/mois (SOC Essentials) à 2499€/mois (XDR Enterprise)..." }
```

---

### Produits — public

#### `GET /api/products`
```json
// Response 200 — tableau de produits
[
  {
    "id": 1,
    "name": "Cyna SOC Premium",
    "slug": "cyna-soc-premium",
    "description": "Solution SOC complète...",
    "features": ["Surveillance 24/7", "IA et machine learning", "SOAR", "ISO 27001"],
    "images": [],
    "price_monthly": 1299,
    "price_annual": 1079,
    "status": "available",       // "available" | "unavailable"
    "priority": 1,
    "category": "SOC",           // nom de la catégorie
    "category_color": "#00B4D8", // couleur hex de la catégorie
    "category_id": 1
  }
]
```

#### `GET /api/products/{id}`
```json
// Response 200 — même format qu'au-dessus
// Response 404 si introuvable
```

#### `GET /api/categories`
```json
// Response 200
[
  { "id": 1, "name": "SOC", "description": "...", "color": "#00B4D8", "display_order": 1 },
  { "id": 2, "name": "EDR", "description": "...", "color": "#8B5CF6", "display_order": 2 },
  { "id": 3, "name": "XDR", "description": "...", "color": "#10B981", "display_order": 3 }
]
```

---

### Auth — authentifié (token requis)

#### `POST /api/auth/logout`
```json
// Response 200
{ "message": "Déconnexion réussie." }
```

#### `GET /api/auth/me`
```json
// Response 200
{ "id": 1, "first_name": "Jean", "last_name": "Dupont", "email": "...", "company": "...", "role": "user" }
```

#### `PUT /api/auth/me`
```json
// Request (tous les champs optionnels)
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "company": "ACME",
  "current_password": "AncienMdp1!",  // requis si on change le password
  "password": "NouveauMdp1!",
  "password_confirmation": "NouveauMdp1!"
}

// Response 200 — profil mis à jour (même format que /auth/me)
```

---

### Commandes — authentifié

#### `POST /api/orders`
```json
// Request
{
  "subtotal": 2198,
  "tax": 0,
  "total": 2198,
  "items": [
    { "product_id": 1, "quantity": 1, "unit_price": 1299, "total_price": 1299, "duration": "monthly" },
    { "product_id": 3, "quantity": 1, "unit_price": 899,  "total_price": 899,  "duration": "annual" }
  ]
}

// Response 201
{
  "id": 42,
  "status": "pending",
  "total": 2198,
  "created_at": "2026-06-08T12:00:00Z"
}
```

#### `GET /api/orders`
```json
// Response 200
[
  {
    "id": 42,
    "status": "paid",
    "total": 2198,
    "created_at": "2026-06-08T12:00:00Z",
    "items": [
      { "product_id": 1, "product": { "name": "Cyna SOC Premium" }, "quantity": 1, "unit_price": 1299, "duration": "monthly" }
    ]
  }
]
```

---

### Abonnements — authentifié

#### `GET /api/subscriptions`
```json
// Response 200
[
  {
    "id": 1,
    "status": "active",           // "active" | "cancelled" | "past_due" | "expired"
    "billing_cycle": "monthly",   // "monthly" | "annual"
    "price": 1299,
    "current_period_start": "2026-06-01",
    "current_period_end": "2026-07-01",
    "product": {
      "id": 1,
      "name": "Cyna SOC Premium",
      "category": "SOC",
      "category_color": "#00B4D8"
    }
  }
]
```

#### `PATCH /api/subscriptions/{id}/cancel`
```json
// Response 200
{ "message": "Abonnement annulé." }
```

---

## Formats d'erreur standard

Toutes les erreurs doivent suivre ce format :

| Code | Cas |
|------|-----|
| 401  | Non authentifié — `{ "message": "..." }` |
| 403  | Accès refusé — `{ "message": "..." }` |
| 404  | Ressource introuvable — `{ "message": "..." }` |
| 422  | Erreur de validation — `{ "message": "...", "errors": { "champ": ["message"] } }` |
| 500  | Erreur serveur — `{ "message": "Erreur serveur." }` |

**Important** : les messages d'erreur doivent être en **français**.

---

## Schema BDD (tables utilisées par le front)

```
users           : id, first_name, last_name, email, password, company, role, two_factor_enabled, is_email_verified
categories      : id, name, description, color, image, display_order
products        : id, category_id, name, slug, description, features(JSON), images(JSON), price_monthly, price_annual, status, priority
orders          : id, user_id, address_id(nullable), payment_method_id(nullable), stripe_pi_id, status, subtotal, tax, total, invoice_path
order_details   : id, order_id, product_id, quantity, unit_price, total_price, duration
subscriptions   : id, user_id, product_id, order_id, stripe_sub_id, status, billing_cycle, current_period_start, current_period_end, cancelled_at
support_messages: id, user_id, type, email, subject, message_body, requires_human, status
```

---

## Données de test à avoir en base

```
# Catégories : SOC (#00B4D8), EDR (#8B5CF6), XDR (#10B981)

# Produits :
SOC Premium    : 1299€/mois, 1079€/an
SOC Essentials : 699€/mois,  580€/an
EDR Enterprise : 899€/mois,  746€/an
EDR Pro        : 1199€/mois, 995€/an
XDR Suite      : 1799€/mois, 1493€/an
XDR Enterprise : 2499€/mois, 2074€/an

# Compte admin : admin@cyna-it.fr / Admin1234!
```
