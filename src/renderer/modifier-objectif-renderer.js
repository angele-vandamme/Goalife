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

let cheminImageSelectionnee = null;

async function initModifierObjectifPage() {
  window.focus()
  document.body.style.pointerEvents = 'auto';
  document.body.style.userSelect = 'auto';
  document.body.style.opacity = '1';

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

        if (o.image) {
          const preview = document.getElementById('image-preview');
          if (preview) {
            preview.textContent = '';
            const imageElement = document.createElement('img');
            imageElement.alt = 'Aperçu de l\'image';
            imageElement.src = o.image;
            imageElement.addEventListener('error', () => {
              preview.textContent = 'Aperçu';
            });
            preview.appendChild(imageElement);
          }
        }
      }
    }
  } catch (err) {
    console.error('Erreur pré-remplissage:', err);
  }

  const btnImporter = document.getElementById('btn-importer');
  if (btnImporter) {
    btnImporter.addEventListener('click', async () => {
      try {
        const result = await window.api.selectImage();
        const imagePath = result?.path;
        const dataUrl = result?.dataUrl;
        if (imagePath && dataUrl) {
          cheminImageSelectionnee = imagePath;
          const preview = document.getElementById('image-preview');
          if (preview) {
            preview.textContent = '';
            const imageElement = document.createElement('img');
            imageElement.alt = 'Aperçu de l\'image';
            imageElement.src = dataUrl;
            imageElement.addEventListener('error', () => {
              console.error('Impossible de charger l\'image :', dataUrl);
              preview.textContent = 'Aperçu';
            });
            preview.appendChild(imageElement);
          }
        }
      } catch (err) {
        console.error('Erreur lors de la sélection de l\'image :', err);
      }
    });
  }

  const form = document.getElementById('form-modifier-objectif');
  if (form) {
    form.addEventListener('submit', async (e) => {
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
      if (cheminImageSelectionnee) {
        updated.image = cheminImageSelectionnee;
      }
      console.log('updated:', JSON.stringify(updated)); // debug temporaire
      const res = await window.api.updateObjectif(updated);
      if (res.success) {
        try {
          await window.api.sendNotification('Goalife ✏️', `L'objectif "${updated.nom}" a été modifié !`);
        } catch (notifyError) {
          console.warn('Notification modif non disponible :', notifyError);
        }
        history.back();
      } else {
        alert('Erreur : ' + res.error);
      }
    });
  }

  const deleteBtn = document.getElementById('btn-supprimer');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Supprimer cet objectif ?')) {
        const res = await window.api.deleteObjectif(objectifId);
        if (res.success) {
          try {
            await window.api.sendNotification('Goalife 🗑️', `Objectif supprimé avec succès.`);
          } catch (notifyError) {
            console.warn('Notification suppression non disponible :', notifyError);
          }
          window.location.href = 'dashboard.html';
        }
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initModifierObjectifPage);
} else {
  initModifierObjectifPage();
}