// =========================================================================
// SYSTEME DE NAVIGATION 
// =========================================================================
window.navigate = function(page) {
  const routes = {
    'accueil':       'dashboard.html',
    'compte':          'compte.html',
    'nouvel-objectif': 'nouvel-objectif.html',
    'objectif-pro':   'objectifs.html?type=professionnel',
    'objectif-perso':  'objectifs.html?type=personnel',
    'parametres':      'parametres.html',
    'a-propos': 'a-propos.html'
  };
  
  if (routes[page]) {
    window.location.href = routes[page];
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  window.focus()
  // Charger le prénom pour la sidebar
  try {
    const profile = await window.api.getUserProfile();
    if (profile?.data?.prenom) {
      document.getElementById('user-name').textContent = profile.data.prenom;
    }
  } catch (err) {
    console.error("Erreur sidebar paramètres:", err);
  }

  // Logique Native : Export JSON des données CRUD du disque dur
  document.getElementById('btn-export').addEventListener('click', async () => {
    try {
      const resGoals = await window.api.getObjectifs();
      if (resGoals && resGoals.data) {
        const saveResult = await window.api.exportGoals(resGoals.data);
        if (saveResult && saveResult.success) {
          alert("🎯 Fichier d'objectifs exporté avec succès sur votre disque !");
        }
      } else {
        alert("Aucun objectif à exporter.");
      }
    } catch (err) {
      alert("Erreur lors de l'exportation des données.");
    }
  });
   // Démarrage automatique — état initial
  try {
    const { openAtLogin } = await window.api.getAutoLaunch()
    document.getElementById('sync-autolaunch').checked = openAtLogin
  } catch (err) {
    console.error("Erreur getAutoLaunch:", err)
  }

  // Démarrage automatique — changement
  document.getElementById('sync-autolaunch').addEventListener('change', async (e) => {
    await window.api.setAutoLaunch(e.target.checked)
  })
});