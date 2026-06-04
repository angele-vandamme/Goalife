// =========================================================================
// SYSTEME DE NAVIGATION 
// =========================================================================
window.navigate = function(page) {
  const routes = {
    'accueil':       'dashboard.html',
    'compte':          'compte.html',
    'nouvel-objectif': 'nouvel-objectif.html',
    'objectif-pro':   'objectifs.html?type=professionnel',
    'objectif-perso':  'objectifs.html?type=pzzersonnel',
    'parametres':      'parametres.html',
    'a-propos': 'a-propos.html'
  };
  
      if (routes[page]) window.location.href = routes[page];
    }
 
    // Chargement des données Supabase via IPC
    async function loadDashboard() {
      try {
        // Récupérer et afficher le profil utilisateur
        const profile = await window.api.getUserProfile();
        if (profile?.data) {
          const prenom = profile.data.prenom || 'Utilisateur';
          const nom = profile.data.nom || '';
          document.getElementById('user-name').textContent = `${prenom} ${nom}`.trim();
          sessionStorage.setItem('user_prenom', prenom);
          sessionStorage.setItem('user_nom', nom);
        } else {
          // Fallback si pas de profil
          const user = await window.api.getUser();
          const email = user?.email || 'Utilisateur';
          document.getElementById('user-name').textContent = email;
          sessionStorage.setItem('user_prenom', email);
          sessionStorage.setItem('user_nom', '');
        }
 
        // Objectifs
        const objectifs = await window.api.getObjectifs();
        if (objectifs) {
          const realises  = objectifs.data.filter(o => o.statut === 'réalisé').length;
          const enCours   = objectifs.data.filter(o => o.statut === 'en cours').length;
          const aFaire    = objectifs.data.filter(o => o.statut === 'à faire' || o.statut === 'à planifier').length;
 
          document.getElementById('stat-realise').textContent  = realises;
          document.getElementById('stat-encours').textContent  = enCours;
          document.getElementById('stat-arealiser').textContent = aFaire;
 
          // Dernier objectif ajouté
          if (objectifs.data.length > 0) {
            const tbody = document.getElementById('last-goal-body');
            tbody.innerHTML = '';

          objectifs.data.slice(0, 5).forEach(o => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${o.nom ?? '—'}</td>
              <td>${o.statut ?? '—'}</td>
              <td>${o.duree ?? '—'}</td>
              <td>${o.description ?? '—'}</td>
              <td>${o.type ?? '—'}</td>
              <td>${o.importance ?? '—'}</td>
            `;
            tbody.appendChild(tr);
          });
        }
      }
    } catch (e) {
      console.error('Erreur chargement dashboard:', e);
    }
  }

document.addEventListener('DOMContentLoaded', loadDashboard);