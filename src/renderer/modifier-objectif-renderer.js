let objectifId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  objectifId = params.get('id');

  if (!objectifId) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Pré-remplir
  try {
    const result = await window.api.getObjectifs();
    if (result && result.data) {
      const updates = result.data.find(o => o.id === parseInt(objectifId) || o.id === objectifId);
      if (updates) {
        document.getElementById('input-nom').value = updates.nom || '';
        document.getElementById('select-statut').value = updates.statut || 'en cours';
        document.getElementById('select-duree').value = updates.duree || 'court_terme';
        document.getElementById('select-type').value = updates.type || 'professionnel';
        document.getElementById('select-importance').value = updates.importance || 'moyenne';
        document.getElementById('input-description').value = updates.description || '';
      }
    }
  } catch (err) { console.error(err); }

  // Actions
  document.getElementById('form-modifier-objectif').addEventListener('submit', async (e) => {
    e.preventDefault();
    const updated = {
      id: objectifId,
      nom: document.getElementById('input-nom').value,
      statut: document.getElementById('select-statut').value,
      duree: document.getElementById('select-duree').value,
      type: document.getElementById('select-type').value,
      importance: document.getElementById('select-importance').value,
      description: document.getElementById('input-description').value
    };
    const res = await window.api.updateObjectif(updated);
    if (res.success) {
      alert("Objectif modifié !");
      window.location.href = 'dashboard.html';
    } else { alert("Erreur : " + res.error); }
  });

  document.getElementById('btn-supprimer').addEventListener('click', async () => {
    if (confirm("Supprimer cet objectif ?")) {
      const res = await window.api.deleteObjectif(objectifId);
      if (res.success) {
        alert("Objectif supprimé !");
        window.location.href = 'dashboard.html';
      }
    }
  });
});

function annuler() { window.location.href = 'dashboard.html'; }