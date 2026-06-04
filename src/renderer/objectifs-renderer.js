// =========================================================================
// NAVIGATION (même système que dashboard)
// =========================================================================
window.navigate = function(page) {
  const routes = {
    'accueil':         'dashboard.html',
    'compte':          'compte.html',
    'nouvel-objectif': 'nouvel-objectif.html',
    'objectif-pro':    'objectifs.html?type=professionnel',
    'objectif-perso':  'objectifs.html?type=personnel',
    'parametres':      'parametres.html',
    'a-propos':        'a-propos.html'
  };
  if (routes[page]) window.location.href = routes[page];
}

// =========================================================================
// CHARGEMENT
// =========================================================================
async function loadObjectifs() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type'); // 'professionnel' ou 'personnel'

  // Titre + bouton actif dans sidebar
  if (type === 'professionnel') {
    document.getElementById('page-title').textContent = '💼 Objectifs Professionnels';
    document.getElementById('btn-pro').classList.add('active');
  } else if (type === 'personnel') {
    document.getElementById('page-title').textContent = '🏠 Objectifs Personnels';
    document.getElementById('btn-perso').classList.add('active');
  }

  // Prénom dans sidebar
  try {
    const prenom = sessionStorage.getItem('user_prenom') || '';
    const nom    = sessionStorage.getItem('user_nom') || '';
    document.getElementById('user-name').textContent = `${prenom} ${nom}`.trim();
  } catch(_) {}

  // Récupérer et filtrer les objectifs
  try {
    const result = await window.api.getObjectifs();
    const tbody  = document.getElementById('objectifs-body');

    if (!result || !Array.isArray(result.data) || result.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; opacity:0.5;">Aucun objectif pour l'instant.</td></tr>`;
      return;
    }

    // Filtre par type si paramètre présent
    const liste = type
      ? result.data.filter(o => o.type === type)
      : result.data;

    if (liste.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; opacity:0.5;">Aucun objectif de ce type.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    liste.forEach(o => {
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.innerHTML = `
        <td>${o.nom ?? '—'}</td>
        <td>${o.statut ?? '—'}</td>
        <td>${o.duree ?? '—'}</td>
        <td>${o.description ?? '—'}</td>
        <td>${o.importance ?? '—'}</td>
        <td>
          <button 
            onclick="window.location.href='modifier-objectif.html?id=${o.id}'"
            style="background:#7B5EA7; color:white; border:none; padding:6px 14px; border-radius:6px; cursor:pointer;">
            ✏️ Modifier
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch(e) {
    console.error('Erreur chargement objectifs:', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.focus()
  loadObjectifs()
});