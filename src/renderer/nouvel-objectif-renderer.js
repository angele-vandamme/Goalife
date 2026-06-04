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
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const currentUser = await window.api.getUser();
      if (!currentUser) {
        alert("Veuillez vous connecter pour créer un objectif.");
        return;
      }

      // Récupération des éléments à afficher
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
        alert('Veuillez renseigner le nom et la description de l\'objectif.')
        return
      }

      try {
        const result = await window.api.createObjectif(objectifData)
        console.log('createObjectif result:', result)

        if (result && result.success) {
          try {
            await window.api.sendNotification('Goalife 🎯', `L'objectif "${objectifData.nom}" a bien été créé !`);
          } catch (notifyError) {
            console.warn('Notification non disponible :', notifyError);
          }
          window.location.href = 'dashboard.html';
        } else {
          alert("Erreur Supabase : " + (result.error || "Impossible d'insérer l'objectif."));
        }
      } catch (error) {
        console.error("Erreur soumission formulaire :", error);
        alert("Une erreur technique est survenue.");
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNouvelObjectifPage);
} else {
  initNouvelObjectifPage();
}