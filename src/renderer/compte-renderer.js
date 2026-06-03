// =========================================================================
// SYSTEME DE NAVIGATION 
// =========================================================================
window.navigate = function(page) {
  const routes = {
    'accueil':       'dashboard.html',
    'compte':          'compte.html',
    'nouvel-objectif': 'nouvel-objectif.html',
    'objective-pro':   'objectifs.html?type=professionnel',
    'objectif-perso':  'objectifs.html?type=personnel',
    'parametres':      'parametres.html',
    'a-propos': 'a-propos.html'
  };
  
  if (routes[page]) {
    window.location.href = routes[page];
  }
};
document.addEventListener('DOMContentLoaded', () => {
  // 1. On pioche directement dans le stockage local de la session
  const cachedPrenom = sessionStorage.getItem('user_prenom') || 'Utilisateur';
  const cachedNom = sessionStorage.getItem('user_nom') || '';

  // 2. Injection immédiate sans aucun délai
  const sidebarUser = document.getElementById('user-name');
  const cardPrenom = document.getElementById('user-prenom');
  const cardNom = document.getElementById('user-nom');

  if (sidebarUser) sidebarUser.textContent = cachedPrenom;
  if (cardPrenom) cardPrenom.textContent = cachedPrenom;
  if (cardNom) cardNom.textContent = cachedNom;

  // 3. Gestion de la déconnexion (On vide le cache en partant)
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm("Êtes-vous sûr de vouloir vous déconnecter de Goalife ?")) {
        sessionStorage.clear(); // On nettoie les infos stockées
        await window.api.signOut();
        window.location.href = 'auth.html';
      }
    });
  }
});