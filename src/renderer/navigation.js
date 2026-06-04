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

  if (routes[page]) {
    window.location.href = routes[page];
  } else {
    console.warn(`Navigation inconnue : ${page}`);
  }
};

window.annuler = function() {
  window.location.href = 'dashboard.html';
};
