const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const toRegisterBtn = document.getElementById('to-register');
const toLoginBtn = document.getElementById('to-login');
const errorTxt = document.getElementById('error-txt');

// Basculer vers l'inscription
toRegisterBtn.addEventListener('click', () => {
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
  errorTxt.style.display = 'none';
});

// Basculer vers la connexion
toLoginBtn.addEventListener('click', () => {
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  errorTxt.style.display = 'none';
});

// Fonction pour afficher une erreur
function showError(message) {
  errorTxt.innerText = message;
  errorTxt.style.display = 'block';
}

// Gérer la Connexion
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorTxt.style.display = 'none';

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  // Appel de la fonction exposée par le preload.js
  const result = await window.api.signIn(email, password);

  if (result.error) {
    showError("Échec de la connexion : " + result.error.message);
  } else {
    alert("Connexion réussie ! Redirection vers le Dashboard...");
    // TODO: Rediriger vers la page dashboard.html
  }
});

// Gérer l'Inscription
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorTxt.style.display = 'none';

  const prenom = document.getElementById('reg-prenom').value;
  const nom = document.getElementById('reg-nom').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  // Appel de la fonction d'inscription exposée par preload.js
  const result = await window.api.signUp(email, password, prenom, nom);

  if (result.error) {
    showError("Échec de l'inscription : " + result.error.message);
  } else {
    // Réinitialiser le formulaire d'inscription
    registerForm.reset();
    
    // Basculer manuellement vers le formulaire de connexion
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    errorTxt.style.display = 'none';
    
    // Pré-remplir l'email pour faciliter la connexion
    document.getElementById('login-email').value = email;
  }
});