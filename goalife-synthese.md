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
├── src/
│   ├── main/
│   │   ├── preload.js               ← Pont sécurisé (contextBridge)
│   │   └── ipc.js                   ← Écouteurs IPC (auth)
│   ├── services/
│   │   ├── supabase.js              ← Client Supabase initialisé
│   │   └── auth.js                  ← signUp, signIn, signOut, getUser
│   └── renderer/
│       ├── css/
│       │   └── auth.css             ← Style mis à jour (design maquette)
│       ├── pages/
│       │   └── auth.html            ← Page connexion/inscription
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
| statut | varchar | 'en cours' / 'à faire' / 'à planifier' |
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
- Après inscription : bascule automatiquement vers le formulaire de connexion avec l'email pré-rempli
- Messages d'erreur en rouge, messages de succès en vert

---

## Design (maquette appliquée) ✅
| Élément | Valeur |
|--------|--------|
| Fond | Menthe `#7FFFD4` |
| Carte | Violette claire `#C9B8E8` |
| Bouton principal | Violet foncé `#7B5EA7` |
| Liens | Vert `#2EAF7D` |
| Titre | Cursif "Bienvenue sur Goalife" |
| Sous-titre | Italique souligné |
| Inputs | Blancs, placeholder en majuscules |
| Bouton Google | Blanc avec bordure (non fonctionnel) |

---

## Prochaines étapes 🔜
1. Créer la page **dashboard** (`dashboard.html`) et rediriger après connexion
2. Implémenter la gestion des **objectifs** (CRUD)
3. Brancher l'IPC pour les objectifs dans `ipc.js`
4. *(Optionnel)* Connexion Google OAuth

---

## 📋 Cahier des charges — État d'avancement

### ✅ Déjà fait
- **Authentification** (2pts) — Supabase + RLS
- **Base de données** — table `objectif` prête
- **Design/maquette** (2pts) — maquette Figma + design appliqué

### 🔜 Reste à faire

| Tâche | Points | Priorité |
|-------|--------|----------|
| CRUD objectifs (create, read, update, delete) | 2pts | 🔥 Ce soir |
| 8 écrans minimum | 2pts | 🔥 Ce soir |
| App élégante desktop | 2pts | 🔥 Ce soir |
| 4 fonctionnalités natives OS | 2pts | ⚡ Demain |
| Crash reporter / logs Supabase | 1pt | ⚡ Demain |
| Installeur (electron-builder) | 1pt | ⚡ Demain |
| Publication (scoop/chocolatey) | 2pts | 🕐 Après mercredi |
| Questions oral | 4pts | — |

### 📅 Ordre de priorité
1. Dashboard + redirect après connexion
2. CRUD objectifs (liste, ajout, édition, suppression)
3. Les 8 écrans : Accueil, Liste, Détail, Ajout, Édition, Paramètres, Auth, À propos
4. Notifications OS + icône zone de notification
5. Crash reporter Supabase
6. Installeur
7. *(Optionnel)* Publication sur scoop/chocolatey
