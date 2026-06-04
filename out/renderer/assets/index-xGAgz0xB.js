const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const toRegisterBtn = document.getElementById("to-register");
const toLoginBtn = document.getElementById("to-login");
const errorTxt = document.getElementById("error-txt");
toRegisterBtn.addEventListener("click", () => {
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
  errorTxt.style.display = "none";
});
toLoginBtn.addEventListener("click", () => {
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  errorTxt.style.display = "none";
});
function showError(message) {
  errorTxt.innerText = message;
  errorTxt.style.display = "block";
}
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorTxt.style.display = "none";
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const result = await window.api.signIn(email, password);
  if (result.error) {
    showError("Échec de la connexion : " + result.error.message);
  } else {
    alert("Connexion réussie ! Redirection vers le Dashboard...");
    window.location.href = "dashboard.html";
  }
});
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorTxt.style.display = "none";
  const prenom = document.getElementById("reg-prenom").value;
  const nom = document.getElementById("reg-nom").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  if (password.length < 6) {
    showError("Le mot de passe doit contenir au moins 6 caractères.");
    return;
  }
  const result = await window.api.signUp(email, password, prenom, nom);
  if (result.error) {
    showError("Échec de l'inscription : " + result.error.message);
  } else {
    registerForm.reset();
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    errorTxt.style.display = "none";
    document.getElementById("login-email").value = email;
  }
});
