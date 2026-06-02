# Journal de Développement - Résolution des Bugs de Connexion Supabase / Electron (Goalife)

**Date :** 2 juin 2026  
**Statut :** Résolu 🚀  
**Objectif de la session :** Connecter le Dashboard de l'application à Supabase (Authentification, profils et objectifs) sans crash et de manière totalement automatisée.

---

## 1. Erreur IPC `getUserProfile` : `.single()` vs `.maybeSingle()`
* **Problème :** L'application plantait avec l'erreur `Cannot coerce the result to a single JSON object` lors de la récupération du profil utilisateur.
* **Cause :** La fonction `.single()` de Supabase lève une exception bloquante si aucune ligne correspondante n'est trouvée dans la table `public.user` (par exemple, juste après l'inscription d'un nouvel utilisateur).
* **Solution :** Remplacement de `.single()` par `.maybeSingle()` dans `src/main/ipc.js`. Cette fonction renvoie gentiment `null` si le profil n'existe pas encore, sans faire planter l'application.

## 2. Automatisation et synchronisation de la table `user`
* **Problème :** Les utilisateurs s'inscrivaient bien dans la table interne `auth.users` de Supabase, mais leur profil restait vide dans la table publique `public.user`, masquant le prénom et le nom sur le Dashboard.
* **Solutions implémentées :**
  1. **Côté Base de données :** Configuration d'un *Trigger* (déclencheur) et d'une fonction PostgreSQL SQL pour intercepter chaque inscription et créer automatiquement la ligne correspondante dans `public.user`.
  2. **Côté Code (`src/services/auth.js`) :** Sécurisation de la méthode `signUp` pour insérer directement les métadonnées (`prenom`, `nom`, `email`) dans la table publique dès la validation de l'inscription.
  3. **Sécurité RLS (Row-Level Security) :** Ajout d'une politique de sécurité `INSERT` (`WITH CHECK (true)`) sur Supabase pour autoriser l'application à créer le profil au moment de l'inscription.

## 3. Résolution des chemins de scripts et cycles de vie Electron
* **Problème :** La console restait blanche et la fonction `loadDashboard()` ne s'exécutait jamais.
* **Causes :**
  * Le chemin du script dans `dashboard.html` était incorrect par rapport à l'arborescence réelle des fichiers (`src/renderer/dashboard-renderer.js`).
  * L'événement `DOMContentLoaded` se déclenchait parfois mal lors des redirections par `window.location.href` sous Electron.
* **Solutions :**
  * Correction des balises scripts pour cibler le bon niveau de dossier (`../dashboard-renderer.js`).
  * Appel direct de la fonction `loadDashboard()` à la racine du fichier JavaScript pour forcer l'exécution immédiate au chargement de la page.
  * Ajout temporaire de `mainWindow.webContents.openDevTools()` dans le `main.js` pour ouvrir la console automatiquement au démarrage.

## 4. Extraction et Filtrage des Données (TypeError: .filter is not a function)
* **Problème :** Plantage du script lors du filtrage des objectifs pour calculer les compteurs statistiques (Réalisé, En cours, À faire).
* **Cause :** Le service IPC renvoie un objet global encapsulé `{ data: [...] }`. Le script tentait de filtrer directement l'objet `result` au lieu du tableau `result.data`.
* **Solution :** * Extraction stricte du tableau via `const liste = objectifs.data`.
  * Ajout d'une condition de sécurité `Array.isArray(objectifs.data)` pour s'assurer que l'application ne manipule que des structures valides.
  * Correction de la vérification de longueur (`objectifs.data.length > 0`) pour afficher le tableau des 5 derniers objectifs ou le message "Aucun objectif".

---

## 🎯 Résultat final
* **Authentification (Sign Up / Sign In) :** Fonctionnelle à 100 %.
* **Profils utilisateurs :** Création 100 % automatisée en base de données avec gestion des droits d'accès RLS.
* **Dashboard :** Dynamique, sécurisé contre les valeurs `null` (repli sur l'adresse email si le nom est absent), affichage correct des compteurs statistiques et synchronisation en temps réel du tableau des objectifs via le canal `objectifs:get`.
* **Étape suivante :** Passage au **C** (Create) du CRUD avec le formulaire de `nouvel-objectif.html`.

Conversation après :

# 🎯 Contexte du Projet : Goalife (Application Desktop Electron / Supabase)

## 📌 Objectif du projet & Barème
Développement d'une application de bureau CRUD complète (Goalife) avec Electron et Supabase pour le module de Développement Desktop.
- **Base de données / Authentification :** Gérée via Supabase (table `user` pour les profils et table `objectif` pour le CRUD).
- **Contraintes phares :** RLS conforme, 8 écrans à fournir, 4 fonctionnalités natives de l'OS (Notifications, Systray, Sauvegarde disque, Démarrage automatique), logs de crashs/Supabase et création d'un installeur.

---

## 🛠️ État d'avancement Technique

### 1. Architecture IPC & Communication (100% Fonctionnelle)
La communication à 3 couches d'Electron (**Main Process (`ipc.js`)** ↔ **Preload (`preload.js`)** ↔ **Renderer**) est totalement fonctionnelle et nettoyée des bugs de duplication.
- Les canaux ont été blindés avec `ipcMain.removeHandler('nom:canal')` avant chaque enregistrement pour éviter l'erreur d'initialisation multiple (`Attempted to register a second handler`).

### 2. Écran d'Accueil / Dashboard (En cours)
- Récupère le prénom de l'utilisateur connecté depuis la table `user` de Supabase via `window.api.getUserProfile()` pour l'afficher dynamiquement dans la sidebar violette.

### 3. Écran de Création d'un Objectif (100% Fonctionnel)
- **Formulaire HTML/JS :** Formulaire à deux colonnes entièrement câblé (Nom, Statut, Temporalité, Importance, Type, Description). Le bug de syntaxe JavaScript (template string non fermé sur le prénom de la sidebar) a été résolu.
- **Gestion de l'Image :** Le bouton **"Importer"** appelle l'API native `dialog.showOpenDialog` d'Electron, récupère le chemin de l'image locale et l'affiche en direct dans une zone d'aperçu HTML.
- **Résolution des bugs Supabase (Validée) :**
  1. *Erreur RLS :* Résolue en configurant la politique d'insertion SQL ou en désactivant temporairement la RLS sur Supabase.
  2. *Erreur Check Constraint (`objectif_duree_check`) :* Résolue en alignant les attributs `value` des options du sélecteur HTML de temporalité avec les contraintes strictes de la BDD (ex: `court_terme`, `moyen_terme`, `long_terme`).
- **Fonctionnalité Native OS intégrée :** Déclenchement automatique d'une API de `Notification` système native de l'OS dès qu'un objectif est inséré en BDD avec succès.

---

## 📋 Reste à faire (Planning Commando : 4 heures)

Voici la feuille de route planifiée pour finaliser le projet de 09h00 à 13h00 :

### Étape 1 : Finaliser le CRUD & Détail (09h00 - 10h15)
- [ ] Ajouter les handlers `goals:update` et `goals:delete` dans `ipc.js` et les exposer dans `preload.js`.
- [ ] Câbler le fichier `modifier-objectif-renderer.js` pour récupérer l'ID de l'objectif dans l'URL, pré-remplir les champs et gérer la modification/suppression.
- [ ] Créer l'écran `detail-objectif.html` en mode lecture seule (`disabled`).

### Étape 2 : Fonctionnalités Natives de l'OS manquantes (10h15 - 11h00)
- [ ] **Zone de notification (Systray) :** Ajouter le composant `Tray` et `Menu` dans `main.js` pour loger l'icône de Goalife à côté de l'horloge système.
- [ ] **Sauvegarde de fichiers sur le disque :** Implémenter un bouton "Exporter mes données" dans les paramètres utilisant `dialog.showSaveDialog` et le module `fs` de Node.js pour générer un fichier `.json` local contenant les objectifs.
- [ ] **Démarrage automatique :** Gérer l'activation via `app.setLoginItemSettings`.

### Étape 3 : Écrans secondaires, Logs & Nettoyage (11h00 - 11h30)
- [ ] Créer rapidement les pages `compte.html`, `parametres.html` et `a-propos.html` en clonant la structure HTML globale.
- [ ] Créer une table `crash_logs` sur Supabase et pousser une ligne de log dans les blocs `catch` des fonctions IPC pour valider le point de collecte de crashs.
- [ ] Exclure `node_modules` et zipper le projet.

### Étape 4 : Production de l'Installeur (11h30 - 12h00)
- [ ] Configurer et exécuter un script de build (`electron-builder` ou `electron-forge`) pour compiler l'application en un exécutable d'installation de bureau (`.exe`).

### Étape 5 : Support de Présentation Oral (12h00 - 13h00)
- [ ] Monter un diaporama de 5 à 6 slides (Problématique, Architecture Electron, Modèle de données Supabase, Démo CRUD, Intégrations Natives OS, et Difficultés techniques résolues).