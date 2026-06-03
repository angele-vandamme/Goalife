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

document.addEventListener('DOMContentLoaded', async () => {

  const params = new URLSearchParams(window.location.search);
  const objectifId = params.get('id');

  if (!objectifId) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Pré-remplir les champs
  try {
    const result = await window.api.getObjectifs();
    if (result && result.data) {
      const o = result.data.find(o => o.id === objectifId || o.id === parseInt(objectifId));
      if (o) {
        document.getElementById('input-nom').value         = o.nom || '';
        document.getElementById('select-statut').value     = o.statut || 'en cours';
        document.getElementById('select-duree').value      = o.duree || 'court terme';
        document.getElementById('select-type').value       = o.type || 'professionnel';
        document.getElementById('select-importance').value = o.importance || 'moyenne';
        document.getElementById('input-description').value = o.description || '';
      }
    }
  
  } catch (err) {
    console.error('Erreur pré-remplissage:', err);
  }

  // Modifier
  document.getElementById('form-modifier-objectif').addEventListener('submit', async (e) => {
    e.preventDefault();
    const updated = {
      id:          objectifId,
      nom:         document.getElementById('input-nom').value,
      statut:      document.getElementById('select-statut').value,
      duree:       document.getElementById('select-duree').value,
      type:        document.getElementById('select-type').value,
      importance:  document.getElementById('select-importance').value,
      description: document.getElementById('input-description').value
    };
    console.log('updated:', JSON.stringify(updated)); // debug temporaire
    const res = await window.api.updateObjectif(updated);
    if (res.success) {
      await window.api.sendNotification('Goalife ✏️', `L'objectif "${updated.nom}" a été modifié !`);
      history.back();
    } else {
      alert('Erreur : ' + res.error);
    }
  });

  // Supprimer
  document.getElementById('btn-supprimer').addEventListener('click', async () => {
    if (confirm('Supprimer cet objectif ?')) {
      const res = await window.api.deleteObjectif(objectifId);
      if (res.success) {
        await window.api.sendNotification('Goalife 🗑️', `Objectif supprimé avec succès.`);
        window.location.href = 'dashboard.html';
      }
    }
  });

});