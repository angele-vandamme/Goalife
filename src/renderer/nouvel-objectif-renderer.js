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

document.addEventListener('DOMContentLoaded', async () => {
  // Afficher le prénom de l'utilisateur connecté dans la sidebar
  try {
      const profile = await window.api.getUserProfile();
      if (profile?.data?.prenom) {
        document.getElementById('user-name').textContent = profile.data.prenom;
      }
    } catch (err) {
        console.error("Erreur chargement profil sidebar:", err);
    }

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

      // Récupération des éléments à afficher
    const objectifData = {
        nom: document.getElementById('input-nom').value,
        statut: document.getElementById('select-statut').value,
        duree: document.getElementById('select-duree').value, // Court/Moyen/Long terme
        type: document.getElementById('select-type').value,   // 'professionnel' ou 'personnel'
        importance: 'moyenne', // On met 'moyenne' par défaut
        description: document.getElementById('input-description').value,
        image: cheminImageSelectionnee
    };

      try {
        const result = await window.api.createObjectif(objectifData);

        if (result && result.success) {
          // 💡 FONCTIONNALITÉ NATIVE OS : Notification système
          await window.api.sendNotification('Goalife 🎯', `L'objectif "${objectifData.nom}" a bien été créé !`);
          // Retour automatique au Dashboard
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
});