const { supabase } = require('./supabase')

let currentSession = null
let currentUser = null

function cacheSession(sessionData) {
  currentSession = sessionData
  currentUser = sessionData?.user ?? null
}

async function signUp(email, password, prenom, nom) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { prenom, nom }
      }
    })

    if (error) throw error

    if (data?.session) {
      cacheSession(data.session)
    }

    if (data && data.user) {
      const { error: profileError } = await supabase
        .from('user')
        .insert([
          {
            id: data.user.id,
            prenom,
            nom,
            email
          }
        ])
        .onConflict('id')
        .ignore()

      if (profileError) {
        if (profileError.code === '23505' || profileError.message?.includes('duplicate key')) {
          console.warn('Profil existant déjà, création auto ignorée.')
        } else {
          console.error('Erreur lors de la création auto du profil :', profileError.message)
        }
      }
    }

    return data
  } catch (err) {
    console.error('Erreur signUp service:', err.message)
    throw err
  }
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { data, error }
  }

  if (data?.session) {
    cacheSession(data.session)
  }

  return { data, error }
}

async function signOut() {
  const { error } = await supabase.auth.signOut()
  currentSession = null
  currentUser = null
  return { error }
}

async function getUser() {
  if (currentUser) {
    return currentUser
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    console.error('Erreur getSession service:', sessionError.message)
  }

  if (sessionData?.session) {
    cacheSession(sessionData.session)
    return currentUser
  }

  const { data, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Erreur getUser service:', error.message)
    return null
  }

  cacheSession(data?.user ? { user: data.user } : null)
  return data?.user ?? null
}

module.exports = { signUp, signIn, signOut, getUser }