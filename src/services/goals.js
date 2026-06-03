const { supabase } = require('./supabase')

// Récupérer tous les objectifs de l'user connecté
async function getObjectifs() {
  const { data, error } = await supabase
    .from('objectif')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

// Récupérer par type (professionnel ou personnel)
async function getObjectifsByType(type) {
  const { data, error } = await supabase
    .from('objectif')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: false })
  return { data, error }
}

// Créer un objectif
async function createObjectif({ nom, statut, duree, type, importance }) {
  const { data, error } = await supabase
    .from('objectif')
    .insert({ nom, statut, duree, type, importance })
    .select()
  return { data, error }
}

// Modifier un objectif
async function updateObjectif(id, updates) {
  const { data, error } = await supabase
    .from('objectif')
    .update(updates) // met à jour les colonnes passées
    .eq('id', id)
    .select()
  return { data, error }
}

// Supprimer un objectif
async function deleteObjectif(id) {
  const { error } = await supabase
    .from('objectif')
    .delete()
    .eq('id', id)
  return { error }
}

module.exports = { getObjectifs, getObjectifsByType, createObjectif, updateObjectif, deleteObjectif }