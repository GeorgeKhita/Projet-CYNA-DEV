# Ce que le backend expose au frontend

> Document pour l'équipe front.  
> Décrit ce que le backend fournit, comment s'y connecter, et ce qu'il faut configurer.

---

## Connexion

### URL de base
```
Développement local : http://localhost:8000
Variable d'env      : VITE_API_URL dans frontend-react/.env
```

Pour changer l'URL du back (réseau local, serveur déployé...) :
```bash
# frontend-react/.env
VITE_API_URL=http://192.168.1.42:8000    # réseau local
VITE_API_URL=https://api.cyna.fr         # production
```

Puis relancer `npm run dev`.

### Authentification
- Le back utilise **Laravel Sanctum** (tokens Bearer)
- Le front stocke le token dans `localStorage` sous la clé `cyna_token`
- Il est injecté automatiquement dans toutes les requêtes via `src/api/client.ts`
- Pas besoin de rien toucher côté front — c'est déjà câblé

---

## Ce que le front consomme

### Pages et leurs appels API

| Page | Méthode | Endpoint |
|------|---------|----------|
| Catalogue | GET | `/api/products` |
| Fiche produit | GET | `/api/products/{id}` |
| Connexion | POST | `/api/auth/login` |
| Inscription | POST | `/api/auth/register` |
| Dashboard | GET | `/api/auth/me` |
| Dashboard | GET | `/api/subscriptions` |
| Dashboard | GET | `/api/orders` |
| Checkout | POST | `/api/orders` |
| Contact | POST | `/api/contact` |
| Chatbot | POST | `/api/chatbot/message` |
| Déconnexion | POST | `/api/auth/logout` |

### Format des tokens
```
Header : Authorization: Bearer {plainTextToken}
```
Le back retourne le token au login/register dans le champ `token`.

---

## Ce que le front envoie

### Création de commande (`POST /api/orders`)
```json
{
  "subtotal": 2198,
  "tax": 0,
  "total": 2198,
  "items": [
    {
      "product_id": 1,
      "quantity": 1,
      "unit_price": 1299,
      "total_price": 1299,
      "duration": "monthly"   // ou "annual"
    }
  ]
}
```

### Inscription (`POST /api/auth/register`)
```json
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "company": "ACME",
  "email": "jean@acme.fr",
  "password": "MonMdp1234!",
  "password_confirmation": "MonMdp1234!"
}
```

---

## Format de réponse attendu

### Produits — le front a besoin de ces champs
```json
{
  "id": 1,
  "name": "Cyna SOC Premium",
  "description": "...",
  "features": ["feature 1", "feature 2"],
  "price_monthly": 1299,
  "price_annual": 1079,
  "status": "available",
  "priority": 1,
  "category": "SOC",
  "category_color": "#00B4D8"
}
```

### Abonnements — le front a besoin de ces champs
```json
{
  "id": 1,
  "status": "active",
  "billing_cycle": "monthly",
  "price": 1299,
  "current_period_end": "2026-07-01",
  "product": {
    "name": "Cyna SOC Premium",
    "category": "SOC",
    "category_color": "#00B4D8"
  }
}
```

### User — le front stocke ces champs dans le contexte auth
```json
{
  "id": 1,
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean@acme.fr",
  "company": "ACME",
  "role": "user"
}
```

---

## Erreurs — comment le front les gère

Le `client.ts` parse automatiquement les erreurs Laravel :
- Si `errors` existe (422) → affiche le premier message du champ `errors`
- Sinon → affiche `message`

**Important pour le back** : toujours retourner `message` en français dans les erreurs.

---

## Fichiers front à connaître

```
src/api/client.ts          → client HTTP (token auto, parsing erreurs)
src/context/AuthContext.tsx → état auth (user, login, logout)
src/lib/cart.ts            → panier localStorage
src/app/routes.tsx         → toutes les routes de l'app
.env                       → VITE_API_URL (ignoré par git)
.env.example               → template à copier
```

---

## Checklist pour que le front fonctionne

- [ ] Backend démarré et accessible depuis la machine du front
- [ ] CORS configuré (autoriser l'origine du front)
- [ ] Base de données migrée (`php artisan migrate`)
- [ ] Données seedées (`php artisan db:seed`)
- [ ] `VITE_API_URL` configuré dans `frontend-react/.env`
- [ ] `npm run dev` relancé après changement de `.env`
