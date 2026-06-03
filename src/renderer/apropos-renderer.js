// =========================================================================
// 1. SYSTEME DE NAVIGATION (Identique aux autres pages)
// =========================================================================
window.navigate = function(page) {
  const routes = {
    'accueil':         'dashboard.html',
    'compte':          'compte.html',
    'nouvel-objectif': 'nouvel-objectif.html',
    'objectif-pro':   'objectifs.html?type=professionnel',
    'objectif-perso': 'objectifs.html?type=personnel',
    'parametres':      'parametres.html',
    'a-propos':        'a-propos.html'
  };
  
  if (routes[page]) {
    window.location.href = routes[page];
  }
};

// =========================================================================
// 2. AFFICHAGE DYNAMIQUE DU PRÉNOM (Depuis la session)
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // On récupère le prénom stocké lors de la connexion
  const cachedPrenom = sessionStorage.getItem('user_prenom') || 'Utilisateur';

  // On l'injecte dans la sidebar
  const sidebarUser = document.getElementById('user-name');
  if (sidebarUser) {
    sidebarUser.textContent = cachedPrenom;
  }
});