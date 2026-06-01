const { supabase } = require('./supabase')

async function signUp(email, password, prenom, nom) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { error }

  if (data.user) {
      await supabase.from('user').insert({
      id: data.user.id,
      prenom,
      nom,
      email
})
    }
    return { data }
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