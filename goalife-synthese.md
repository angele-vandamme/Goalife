# 🎯 Goalife — Synthèse du projet

## Stack technique
- **Electron Vanilla** (sans React) — HTML, CSS, JS pur
- **Supabase** — authentification + base de données
- **electron-vite** non utilisé finalement — structure manuelle

---

## Structure des fichiers
```
Goalife/
├── main.js                          ← Point d'entrée Electron
├── assets/
│   └── logo-goalife.ico             ← Icône de la fenêtre app
├── src/
│   ├── main/
│   │   ├── preload.js               ← Pont sécurisé (contextBridge)
│   │   └── ipc.js                   ← Écouteurs IPC (auth + objectifs)
│   ├── services/
│   │   ├── supabase.js              ← Client Supabase initialisé
│   │   └── auth.js                  ← signUp, signIn, signOut, getUser
│   └── renderer/
│       ├── css/
│       │   └── auth.css             ← Style mis à jour (design maquette)
│       ├── pages/
│       │   ├── auth.html            ← Page connexion/inscription
│       │   └── dashboard.html       ← Page dashboard (✅ créée)
│       └── auth-renderer.js         ← Logique formulaires
```

---

## Base de données Supabase

### Table `user`
| Colonne | Type | Contrainte |
|--------|------|------------|
| id | uuid | PRIMARY KEY |
| prenom | varchar | nullable |
| nom | varchar | nullable |
| email | varchar | nullable |

### Table `objectif`
| Colonne | Type | Contrainte |
|--------|------|------------|
| id | uuid | PRIMARY KEY |
| user_id | uuid | REFERENCES auth.users |
| nom | varchar | NOT NULL |
| statut | varchar | 'en cours' / 'à faire' / 'à planifier' / 'réalisé' |
| duree | varchar | 'court terme' / 'moyen terme' / 'long terme' |
| type | varchar | 'professionnel' / 'personnel' |
| importance | varchar | 'élevé' / 'moyenne' / 'basse' |
| created_at | timestamptz | DEFAULT now() |

- **RLS activée** sur la table `objectif`
- **Pas de trigger** — l'insert dans `user` est fait manuellement dans `auth.js` après le `signUp`

---

## Configuration Supabase
- **URL** : `https://mbynbgnkwwyrsmhmeldv.supabase.co` (sans `/rest/v1/`)
- **Confirmation email** : désactivée

---

## État de l'authentification ✅
- Inscription : fonctionnelle — crée l'utilisateur dans `auth.users` ET dans la table `user`
- Connexion : fonctionnelle
- Après connexion/inscription : redirige vers `dashboard.html` via `window.location.href`
- Messages d'erreur en rouge, messages de succès en vert

---

## Dashboard ✅
- Fichier : `src/renderer/pages/dashboard.html`
- Sidebar menthe `#7FFFD4` avec bordure verte `#2EAF7D`
- Fond principal blanc
- Carte violette `#C9B8E8` centrée avec stats (réalisé / en cours / à réaliser)
- Tableau "Last goal" avec les colonnes : Nom, Statut, Durée, Description, Catégorie, Importance
- "A propos" + icône en haut à droite (zone blanche)
- Navigation via `window.location.href` entre les pages
- Données chargées via `window.electronAPI` (IPC) — à brancher dans `preload.js` + `ipc.js`

---

## Icône de l'application ✅
- Fichier : `assets/logo-goalife.ico`
- Configurée dans `main.js` via `icon: path.join(__dirname, 'assets/logo-goalife.ico')`

---

## Design (maquette appliquée) ✅
| Élément | Valeur |
|--------|--------|
| Fond sidebar | Menthe `#7FFFD4` |
| Fond principal | Blanc `#FFFFFF` |
| Carte dashboard | Violette claire `#C9B8E8` |
| Bouton actif | Violet foncé `#7B5EA7` |
| Bordure boutons | Vert `#2EAF7D` |
| Bordure sidebar | Vert `#2EAF7D` |
| Titre auth | Cursif "Bienvenue sur Goalife" |
| Inputs | Blancs, placeholder en majuscules |
| Bouton Google | Blanc avec bordure (non fonctionnel) |

---

## Prochaines étapes 🔜
1. Brancher `preload.js` + `ipc.js` pour `getObjectifs` et `getUserProfile`
2. Implémenter le CRUD objectifs (liste, ajout, édition, suppression)
3. Créer les pages restantes : Nouvel objectif, Objectif Pro, Objectif Perso, Paramètres, À propos, Compte
4. Notifications OS + icône zone de notification
5. Crash reporter Supabase
6. Installeur (electron-builder)
7. *(Optionnel)* Publication sur scoop/chocolatey

---

## 📋 Cahier des charges — État d'avancement

### ✅ Déjà fait
- **Authentification** (2pts) — Supabase + RLS
- **Base de données** — table `objectif` prête
- **Design/maquette** (2pts) — maquette Figma + design appliqué
- **Dashboard** — page créée, design fidèle à la maquette
- **Icône app** — logo Goalife configuré dans `main.js`
- **Redirection** après connexion vers dashboard

### 🔜 Reste à faire

| Tâche | Points | Priorité |
|-------|--------|----------|
| CRUD objectifs (create, read, update, delete) | 2pts | 🔥 |
| 8 écrans minimum | 2pts | 🔥 |
| App élégante desktop | 2pts | 🔥 |
| 4 fonctionnalités natives OS | 2pts | ⚡ |
| Crash reporter / logs Supabase | 1pt | ⚡ |
| Installeur (electron-builder) | 1pt | ⚡ |
| Publication (scoop/chocolatey) | 2pts | 🕐 |
| Questions oral | 4pts | — |

### 📅 Ordre de priorité
1. Brancher IPC pour dashboard (getObjectifs, getUserProfile)
2. CRUD objectifs (liste, ajout, édition, suppression)
3. Les 8 écrans : Accueil ✅, Auth ✅, Nouvel objectif, Objectif Pro, Objectif Perso, Paramètres, Compte, À propos
4. Notifications OS + icône zone de notification
5. Crash reporter Supabase
6. Installeur
7. *(Optionnel)* Publication sur scoop/chocolatey
