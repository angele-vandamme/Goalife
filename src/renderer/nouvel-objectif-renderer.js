// Variable globale pour stocker le chemin de l'image sélectionnée
let cheminImageSelectionnee = null;

// Gérer la navigation globale de la sidebar
function navigate(page) {
  const routes = {
    'accueil':         'dashboard.html',
    'compte':          'compte.html',
    'objectif-pro':    'objectifs.html?type=professionnel',
    'objectif-perso':  'objectifs.html?type=personnel',
    'parametres':      'parametres.html',
    'a-propos':        'a-propos.html'
  };
  if (routes[page]) window.location.href = routes[page];
}

function annuler() {
  window.location.href = 'dashboard.html';
}

function initNouvelObjectifPage() {
  document.body.style.pointerEvents = 'auto';
  document.body.style.userSelect = 'auto';
  document.body.style.opacity = '1';

  const titleInput = document.getElementById('input-nom');
  if (titleInput) {
    titleInput.focus();
  }

  // Profil en arrière-plan, ne bloque plus l'UI
  window.api.getUserProfile()
    .then(profile => {
      if (profile?.data?.prenom) {
        document.getElementById('user-name').textContent = profile.data.prenom;
      }
    })
    .catch(err => console.error("Erreur chargement profil sidebar:", err));

  // Gestion du bouton Importer
  const btnImporter = document.getElementById('btn-importer');
  if (btnImporter) {
    btnImporter.addEventListener('click', async () => {
      console.log("Clic sur le bouton Importer détecté. Appel de l'API...");
      try {
        const path = await window.api.selectImage();
        console.log("Chemin reçu de l'API :", path);
        
        if (path) {
          cheminImageSelectionnee = path;
          const preview = document.getElementById('image-preview');
          if (preview) {
            preview.innerHTML = `<img src="${path}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" />`;
          }
        }
      } catch (err) {
        console.error("Erreur lors de la sélection de l'image :", err);
      }
    });
  } else {
    console.error("Impossible de trouver l'élément HTML avec l'ID 'btn-importer'");
  }

  // Gestion de la soumission du formulaire
  const form = document.getElementById('form-nouvel-objectif');
  if (form) {
    const formMessage = document.getElementById('form-message');

    function showFormMessage(message, isError = true) {
      if (!formMessage) {
        console.warn(message)
        return
      }
      formMessage.textContent = message
      formMessage.style.color = isError ? '#d32f2f' : '#1b5e20'
      formMessage.style.padding = '10px 12px'
      formMessage.style.border = isError ? '1px solid #d32f2f' : '1px solid #1b5e20'
      formMessage.style.borderRadius = '6px'
      formMessage.style.marginBottom = '16px'
      formMessage.style.backgroundColor = isError ? 'rgba(211,47,47,0.08)' : 'rgba(27,94,32,0.08)'
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (formMessage) formMessage.textContent = '';

      const currentUser = await window.api.getUser();
      if (!currentUser) {
        showFormMessage('Veuillez vous connecter pour créer un objectif.');
        return;
      }

      const objectifData = {
        nom: document.getElementById('input-nom').value.trim(),
        statut: document.getElementById('select-statut').value,
        duree: document.getElementById('select-duree').value,
        type: document.getElementById('select-type').value,
        importance: document.getElementById('select-importance').value,
        description: document.getElementById('input-description').value.trim(),
        image: cheminImageSelectionnee
      };

      if (!objectifData.nom || !objectifData.description) {
        showFormMessage('Veuillez renseigner le nom et la description de l\'objectif.')
        return
      }

      try {
        const result = await window.api.createObjectif(objectifData)
        console.log('createObjectif result:', result)

        if (result && result.success) {
          showFormMessage(`Objectif "${objectifData.nom}" créé avec succès !`, false)
          try {
            await window.api.sendNotification('Goalife 🎯', `L'objectif "${objectifData.nom}" a bien été créé !`);
          } catch (notifyError) {
            console.warn('Notification non disponible :', notifyError);
          }
          window.location.href = 'dashboard.html';
        } else {
          const errorText = result?.error || 'Impossible d\'insérer l\'objectif.'
          showFormMessage(`Erreur création : ${errorText}`)
        }
      } catch (error) {
        console.error('Erreur soumission formulaire :', error)
        showFormMessage('Une erreur technique est survenue. Vérifiez la console ou les logs.')
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNouvelObjectifPage);
} else {
  initNouvelObjectifPage();
}