// Navigation entre pages (adapter selon vos fichiers)
    function navigate(page) {
      const routes = {
        'compte':          'compte.html',
        'nouvel-objectif': 'nouvel-objectif.html',
        'objectif-pro':    'objectifs.html?type=professionnel',
        'objectif-perso':  'objectifs.html?type=personnel',
        'parametres':      'parametres.html',
      };
      if (routes[page]) window.location.href = routes[page];
    }
 
    // Chargement des données Supabase via IPC
    async function loadDashboard() {
      try {
        // Nom de l'utilisateur
        const user = await window.api.getUser();
        if (user) {
          const profile = await window.api.getUserProfile();
          if (profile) {
            document.getElementById('user-name').textContent =
              `${profile.data.prenom ?? ''} ${profile.data.nom ?? ''}`.trim() || user.email;
          }
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