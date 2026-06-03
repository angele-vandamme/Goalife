const { supabase } = require('./supabase')

async function signUp(email, password, prenom, nom) {
  try {
    // On crée le compte dans l'Authentication Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { prenom, nom } // Sauvegarde aussi dans les métadonnées par sécurité
      }
    })

    if (error) throw error

    // Si le compte est créé, on insère DIRECTEMENT la ligne dans ta table 'user'
    if (data && data.user) {
      const { error: profileError } = await supabase
        .from('user')
        .insert([
          { 
            id: data.user.id, // On reprend l'ID identique de l'authentification
            prenom: prenom, 
            nom: nom, 
            email: email 
          }
        ])

      if (profileError) {
        console.error("Erreur lors de la création auto du profil :", profileError.message)
        return { data, error: profileError }
      }

      // CONNEXION AUTOMATIQUE 
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        console.error("Erreur lors de la connexion automatique :", signInError.message)
        return { data: null, error: signInError }
      }

      // On retourne les données de la session fraîchement connectée !
      return { data: signInData, error: null }
    }

    return { data, error: null }
    
  } catch (err) {
    console.error("Erreur signUp service:", err.message)
    return { data: null, error: err }
  }
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}
    
async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

module.exports = { signUp, signIn, signOut, getUser }