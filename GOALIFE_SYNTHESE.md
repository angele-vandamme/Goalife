# 🎯 GOALIFE — Synthèse du projet

## Contexte
- **Étudiante :** Angèle Vandamme
- **Deadline :** Mercredi (présentation)
- **Temps disponible :** Ce soir + demain soir/nuit
- **Niveau :** Débutante

---

## Stack technique
- **Framework desktop :** Electron (vanilla JS — pas de React)
- **Backend / BDD :** Supabase
- **Langage :** JavaScript vanilla + HTML/CSS

---

## Structure du projet
```
GOALIFE/
├── node_modules/
├── src/
│   ├── main/
│   │   ├── index.js
│   │   ├── ipc.js
│   │   └── preload.js
│   ├── renderer/
│   │   ├── components/   (vide)
│   │   ├── pages/        (vide)
│   │   └── store/
│   └── services/
│       ├── auth.js
│       ├── goals.js
│       └── supabase.js
├── .env
├── .gitignore
├── index.html
├── main.js
├── package.json
└── README.md
```

---

## Dépendances installées
```json
{
  "devDependencies": {
    "electron": "^42.1.0",
    "@vitejs/plugin-react": "^6.0.2",
    "electron-vite": "^5.0.0",
    "vite": "^8.0.16"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.49.4",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.0"
  }
}
```
> ⚠️ React est installé mais NON utilisé — on reste en Electron vanilla JS.

---

## Base de données Supabase

### Tables existantes

#### Table `type`
| Colonne | Type | Contrainte |
|---|---|---|
| id | int8 | PRIMARY, IDENTITY, NON-NULL |
| personnel | int2 | NON-NULL |
| professionnel | int2 | NULLABLE |

#### Table `user`
| Colonne | Type | Contrainte |
|---|---|---|
| id | int8 | PRIMARY, IDENTITY, NON-NULL |
| prenom | varchar | NON-NULL |
| nom | varchar | NULLABLE |
| email | varchar | NULLABLE (⚠️ était en float4, corrigé en varchar) |

### SQL à exécuter dans Supabase

```sql
-- Corriger l'email dans user
ALTER TABLE "user" ALTER COLUMN email TYPE varchar;

-- Table principale des objectifs
CREATE TABLE objectif (
  id        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id   uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nom       varchar NOT NULL,
  statut    varchar CHECK (statut IN ('en cours', 'à faire', 'à planifier')) DEFAULT 'à faire',
  duree     varchar CHECK (duree IN ('court terme', 'moyen terme', 'long terme')),
  type      varchar CHECK (type IN ('professionnel', 'personnel')) NOT NULL,
  importance varchar CHECK (importance IN ('élevé', 'moyenne', 'basse')),
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE objectif ENABLE ROW LEVEL SECURITY;

-- Politique : chaque user ne voit que ses objectifs
CREATE POLICY "Users see own objectives" ON objectif
  FOR ALL USING (auth.uid() = user_id);
```

### Table `objectif` — structure finale

| Colonne | Type | Valeurs possibles |
|---|---|---|
| `id` | uuid | auto-généré via `gen_random_uuid()` |
| `user_id` | uuid | lié à `auth.users` (RLS automatique) |
| `nom` | varchar | texte libre |
| `statut` | varchar | `en cours` / `à faire` / `à planifier` |
| `duree` | varchar | `court terme` / `moyen terme` / `long terme` |
| `type` | varchar | `professionnel` / `personnel` |
| `importance` | varchar | `élevé` (rouge) / `moyenne` (orange) / `basse` (vert) |
| `created_at` | timestamptz | auto |

> ℹ️ `id` est un UUID généré automatiquement (pas un entier auto-incrémenté) — plus sécurisé car non prédictible.

---

## Services créés

### `src/services/supabase.js`
```javascript
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://TON_URL.supabase.co'
const SUPABASE_KEY = 'TA_CLE_ANON_PUBLIC'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

module.exports = { supabase }
```
> 🔑 Remplacer URL et KEY depuis Supabase → Settings → API

### `src/services/auth.js`
```javascript
const { supabase } = require('./supabase')

async function signUp(email, password, prenom, nom) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { error }

  if (data.user) {
    await supabase.from('user').insert({
      id: data.user.id,
      prenom,
      nom,
      email
    })
  }
  return { data }
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

module.exports = { signUp, signIn, signOut, getUser }
```

### `src/services/goals.js`
```javascript
const { supabase } = require('./supabase')

// Récupérer tous les objectifs de l'user connecté
async function getObjectifs() {
  const { data, error } = await supabase
    .from('objectif')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

// Récupérer par type (professionnel ou personnel)
async function getObjectifsByType(type) {
  const { data, error } = await supabase
    .from('objectif')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: false })
  return { data, error }
}

// Créer un objectif
async function createObjectif({ nom, statut, duree, type, importance }) {
  const { data, error } = await supabase
    .from('objectif')
    .insert({ nom, statut, duree, type, importance })
    .select()
  return { data, error }
}

// Modifier un objectif
async function updateObjectif(id, updates) {
  const { data, error } = await supabase
    .from('objectif')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

// Supprimer un objectif
async function deleteObjectif(id) {
  const { error } = await supabase
    .from('objectif')
    .delete()
    .eq('id', id)
  return { error }
}

module.exports = { getObjectifs, getObjectifsByType, createObjectif, updateObjectif, deleteObjectif }
```

> ℹ️ Toutes les fonctions retournent `{ data, error }` — convention Supabase. Toujours vérifier `error` avant d'utiliser `data`.

---

## Pages à faire (8 minimum requis)

| # | Page | Statut |
|---|---|---|
| 1 | Login | ⏳ À faire |
| 2 | Création de compte | ⏳ À faire |
| 3 | Accueil / Dashboard | ⏳ À faire |
| 4 | Objectifs personnels | ⏳ À faire |
| 5 | Objectifs professionnels | ⏳ À faire |
| 6 | Nouvel objectif | ⏳ À faire |
| 7 | Modifier un objectif | ⏳ À faire |
| 8 | Paramètres | ⏳ À faire |
| + | À propos | ⏳ À faire |

---

## Fonctionnalités natives à implémenter (4 requises)

| Fonctionnalité | Librairie Electron |
|---|---|
| Démarrage automatique | `app.setLoginItemSettings()` |
| Icône dans la zone de notification (tray) | `Tray` |
| Envoi de notifications | `Notification` |
| Sauvegarde dans un dossier choisi par l'user | `dialog.showSaveDialog()` |

---

## Ce qu'on sacrifie (manque de temps)
- ❌ Publication sur Scoop/Chocolatey/Brew (-2 pts) — trop long

---

## Design / Maquettes
Couleurs principales :
- **Fond :** Vert menthe `#7FFFD4` / `#98FFD4`
- **Boutons / accents :** Violet `#9B7FD4`
- **Importance élevée :** Rouge 🔴
- **Importance moyenne :** Orange 🟠
- **Importance basse :** Vert 🟢
- **Texte titre :** Police cursive (style "Bienvenue sur Goalife")
- **Cartes :** Fond violet clair avec bords arrondis

---

## Prochaines étapes dans l'ordre
1. ✅ Configurer `supabase.js` avec les vraies clés
2. ⏳ Exécuter le SQL dans Supabase (corriger email + créer table objectif)
3. ⏳ Créer la page Login (HTML/CSS/JS)
4. ⏳ Créer la page Inscription
5. ⏳ Créer le Dashboard
6. ⏳ CRUD objectifs (liste, ajout, édition, suppression)
7. ⏳ Paramètres + À propos
8. ⏳ 4 fonctionnalités natives
9. ⏳ Crash reporter
10. ⏳ Installeur (electron-builder)
