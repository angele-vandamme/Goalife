# Diagnostic du projet Goalife

## 1. Problème principal d'authentification Supabase
- Le projet utilise `@supabase/supabase-js` version `1.35.7`.
- Le code dans `src/services/auth.js` adopte une syntaxe de Supabase V2, notamment :
  - `supabase.auth.signUp({ email, password, options: { data: {...} }})`
  - `supabase.auth.getUser()`
- En V1, les appels et les retours sont différents.
- Conséquence : `signUp`, `signIn` et `getUserProfile` risquent de ne pas fonctionner correctement.

## 2. Récupération de profil mal gérée
- Dans `src/renderer/dashboard-renderer.js`, le code fait :
  - `profile.data.prenom`
- Mais la fonction IPC `profile:getUserProfile` peut renvoyer `{ data: null }`.
- Cela introduit un risque de crash JavaScript lorsque le profil n’existe pas ou n’est pas trouvé.

## 3. Objectifs non filtrés par l’utilisateur connecté
- Le handler `goals:get` dans `src/main/ipc.js` récupère tous les enregistrements de la table `objectif`.
- Il manque un filtre sur `user_id`.
- Résultat : l’application peut afficher des objectifs d’autres utilisateurs.
- `goals:update` et `goals:delete` ne vérifient pas non plus que l’objectif appartient à l’utilisateur connecté.

## 4. API IPC exposée mais absente côté main
- `src/main/preload.js` expose une méthode :
  - `getObjectifsByType: (type) => ipcRenderer.invoke('goals:getByType', type)`
- Cependant, `src/main/ipc.js` ne contient aucun handler `ipcMain.handle('goals:getByType', ...)`.
- Cette méthode exposée est donc inopérante.

## 5. Routes de navigation incohérentes
- Les scripts et pages utilisent deux variantes :
  - `objectif-pro` / `objectif-perso`
  - `objective-pro` / `objective-perso`
- Exemple de fichiers concernés :
  - `parametres-renderer.js`
  - `compte-renderer.js`
  - `apropos-renderer.js`
- Cela casse potentiellement la navigation vers `objectifs.html?type=...`.

## 6. Gestion du profil utilisateur insuffisante à l'inscription
- Dans `src/services/auth.js`, la table `user` n’est peuplée qu’en cas de réponse Supabase contenant `data.user.id`.
- Avec une inscription basée sur email confirmation, ce champ peut être absent immédiatement.
- De fait, `profile:getUserProfile` peut échouer à trouver des données utilisateur.

## 7. Autres points notables
- Aucun crash reporter Electron n’est implémenté.
- `package.json` contenait un script `start` vide, ce qui empêchait le démarrage via `npm start`.
- Le menu Quitter a été corrigé pour appeler `app.quit()`.
- Il est conseillé d’ajouter un mécanisme de logs/crash reporting côté Electron ou backend.

## Priorités de correction
1. Corriger la compatibilité Supabase V1 / V2 dans `src/services/auth.js` et `src/main/ipc.js`.
2. Protéger les accès `profile.data` dans `dashboard-renderer.js`.
3. Filtrer les objectifs par `user_id` dans les handlers Supabase.
4. Ajouter le handler `goals:getByType` côté main ou retirer l’API exposée.
5. Uniformiser toutes les routes de navigation sur une seule convention.
6. Vérifier la cohérence de la table `user` et la récupération du profil.

## Conclusion
Le projet contient des fonctionnalités bien pensées et de bonnes bases Electron + Supabase, mais plusieurs parties sont mal reliées entre le renderer et le main, et la compatibilité Supabase est incorrecte. La priorité est de stabiliser l’authentification, la récupération de profil et la gestion des objectifs par utilisateur.
---

## CORRECTIONS APPLIQUÉES (Mise à jour du 2026-06-03)

### 1. Migration vers Supabase V2 ✅
- Mise à jour de `@supabase/supabase-js` de v1.35.7 à v2.107.0
- `src/services/auth.js` :
  - `signUp()` : syntaxe V2 avec `options.data`
  - `signIn()` → `signInWithPassword()` : structure correcte V2
  - `getUser()` : gestion d'erreur ajoutée
- `src/main/ipc.js` : tous les handlers adaptés à V2

### 2. Support WebSocket pour Electron ✅
- Installation du package `ws` pour Electron/Node.js 18
- `src/services/supabase.js` : initialisation avec `realtime: { transport: 'ws' }`
- Supabase V2 fonctionne correctement sans erreurs d'initialisation

### 3. Filtrage utilisateur pour les objectifs ✅
- `goals:get` : ajout du filtre `eq('user_id', user.id)`
- `goals:getByType` : **nouveau handler** implémenté avec filtre utilisateur
- `goals:update` : vérification que l'objectif appartient à l'utilisateur
- `goals:delete` : vérification de propriété d'objectif

### 4. Routes de navigation unifiées ✅
- Uniformisation sur `objectif-pro` / `objectif-perso` dans :
  - `parametres-renderer.js`
  - `compte-renderer.js`
  - `apropos-renderer.js`
  - `pages/compte.html`
  - `pages/a-propos.html`

### 5. Sécurisation des accès au profil ✅
- `dashboard-renderer.js` : vérification `profile?.data` avant accès
- `nouvel-objectif-renderer.js` : protection `profile?.data?.prenom`
- `parametres-renderer.js` : vérification stricte du profil
- Fallback sur email si profil absent

### 6. Configuration Electron-Vite ✅
- Création de `electron.vite.config.js` avec configuration correcte :
  - Entry points pour main, preload et renderer
  - Support React via `@vitejs/plugin-react`
  - Résolution des pages HTML

### 7. Script de démarrage corrigé ✅
- `package.json` : `"start": "electron-vite dev"`
- Application démarre sans erreurs

### État du projet
- ✅ Supabase V2 initialisé avec succès
- ✅ WebSocket support en place
- ✅ Authentification structurée
- ✅ Sécurité utilisateur renforcée
- ✅ Navigation cohérente
- ✅ Application opérationnelle