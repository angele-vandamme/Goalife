const { ipcMain, dialog, Notification, app } = require('electron')
const path = require('path')
const { signUp, signIn, signOut, getUser } = require('../services/auth')
const { getObjectifs, createObjectif, updateObjectif, deleteObjectif } = require('../services/goals')
const { supabase } = require('../services/supabase')

async function getAuthenticatedUser() {
  const { data: { session } = {}, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    console.warn('Avertissement Supabase session:', sessionError.message)
  }

  if (session?.user) {
    return session.user
  }

  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data?.user) throw new Error('Utilisateur non authentifié')
  return data.user
}

// =========================================================================
// Écouteurs pour l'authentification & Profil
// =========================================================================

ipcMain.handle('auth:signUp', async (event, { email, password, prenom, nom }) => {
  return await signUp(email, password, prenom, nom)
})

ipcMain.handle('auth:signIn', async (event, { email, password }) => {
  return await signIn(email, password)
})

ipcMain.handle('auth:signOut', async () => {
  return await signOut()
})

ipcMain.handle('auth:getUser', async () => {
  return await getUser()
})

ipcMain.handle('settings:getAutoLaunch', () => {
  return app.getLoginItemSettings()
})

ipcMain.removeHandler('settings:setAutoLaunch')
ipcMain.handle('settings:setAutoLaunch', (event, enabled) => {
  app.setLoginItemSettings({ openAtLogin: enabled })
  return { success: true }
})

// Ajout pour le Dashboard : Récupérer les infos de la table 'user' ou des métadonnées
ipcMain.removeHandler('profile:getUserProfile')
ipcMain.handle('profile:getUserProfile', async () => {
  try {
    const user = await getAuthenticatedUser()

    const { data, error } = await supabase
      .from('user')
      .select('prenom, nom')
      .eq('id', user.id)
      .maybeSingle()

    if (error) throw error

    if (!data || !data.prenom) {
      console.log("Table 'user' vide, récupération via user_metadata...")
      return {
        data: {
          prenom: user.user_metadata?.prenom || user.email,
          nom: user.user_metadata?.nom || ''
        }
      }
    }

    return { data }
  } catch (error) {
    console.error('Erreur IPC getUserProfile:', error.message)
    return { data: null }
  }
})

// =========================================================================
// Écouteurs pour les Objectifs
// =========================================================================

// Récupérer la liste complète filtrée par l'utilisateur connecté, triée par nouveauté
ipcMain.removeHandler('goals:get')
ipcMain.handle('goals:get', async () => {
  try {
    const user = await getAuthenticatedUser()

    const { data, error } = await supabase
      .from('objectif')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data }
  } catch (error) {
    console.error('Erreur IPC getObjectifs:', error.message)
    return { data: [] }
  }
})

// Récupérer les objectifs filtrés par type ET par utilisateur connecté
ipcMain.removeHandler('goals:getByType')
ipcMain.handle('goals:getByType', async (event, type) => {
  try {
    const user = await getAuthenticatedUser()

    const { data, error } = await supabase
      .from('objectif')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data }
  } catch (error) {
    console.error('Erreur IPC getObjectifsByType:', error.message)
    return { data: [] }
  }
})

// Créer un nouvel objectif en BDD
ipcMain.removeHandler('goals:create')
ipcMain.handle('goals:create', async (event, goal) => {
  try {
    const user = await getAuthenticatedUser()

    if (!goal?.nom?.trim() || !goal?.description?.trim()) {
      throw new Error('Veuillez renseigner le nom et la description de l\'objectif.')
    }

    const allowedStatuts = ['en cours', 'réalisé', 'à faire', 'à planifier']
    const statut = goal.statut?.trim()
    const validatedStatut = allowedStatuts.includes(statut) ? statut : 'en cours'
    if (statut && !allowedStatuts.includes(statut)) {
      console.warn(`Statut invalide reçu, fallback vers 'en cours': ${statut}`)
    }

    const insertPayload = {
      user_id:     user.id,
      nom:         goal.nom.trim(),
      statut:      validatedStatut,
      duree:       goal.duree,
      type:        goal.type,
      importance:  goal.importance,
      description: goal.description.trim(),
      image:       goal.image
    }

    const { data, error } = await createObjectif(insertPayload)

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Erreur IPC createObjectif:', error)
    return { success: false, error: error.message || 'Erreur inconnue lors de la création de l\'objectif.' }
  }
})

// Modifier un objectif (avec vérification de propriété)
ipcMain.removeHandler('goals:update')
ipcMain.handle('goals:update', async (event, updates) => {
  try {
    const user = await getAuthenticatedUser()

    const { id, ...fields } = updates

    const { data: objectif, error: checkError } = await supabase
      .from('objectif')
      .select('user_id')
      .eq('id', id)
      .maybeSingle()

    if (checkError || !objectif || objectif.user_id !== user.id) {
      throw new Error('Accès non autorisé à cet objectif')
    }

    const { error } = await supabase
      .from('objectif')
      .update(fields)
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Erreur IPC updateObjectif:', error.message)
    return { success: false, error: error.message }
  }
})

// Supprimer un objectif (avec vérification de propriété)
ipcMain.removeHandler('goals:delete')
ipcMain.handle('goals:delete', async (event, id) => {
  try {
    const user = await getAuthenticatedUser()

    const { data: objectif, error: checkError } = await supabase
      .from('objectif')
      .select('user_id')
      .eq('id', id)
      .maybeSingle()

    if (checkError || !objectif || objectif.user_id !== user.id) {
      throw new Error('Accès non autorisé à cet objectif')
    }

    const { error } = await supabase
      .from('objectif')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Erreur IPC deleteObjectif:', error.message)
    return { success: false, error: error.message }
  }
})

// =========================================================================
// Écouteur pour l'Image
// =========================================================================
ipcMain.removeHandler('image:select')
ipcMain.handle('image:select', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'png', 'jpeg', 'gif', 'webp'] }
      ]
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const selectedPath = result.filePaths[0]
    const imageData = require('fs').readFileSync(selectedPath)
    const extension = path.extname(selectedPath).slice(1).toLowerCase()
    const mimeType = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp'
    }[extension] || 'application/octet-stream'

    return {
      path: selectedPath,
      dataUrl: `data:${mimeType};base64,${imageData.toString('base64')}`
    }
  } catch (error) {
    console.error("Erreur IPC selectImage:", error.message)
    return null
  }
})

// =========================================================================
// Notifications système natives
// =========================================================================
ipcMain.handle('notification:send', (event, { title, body }) => {
  new Notification({ title, body }).show()
})

// =========================================================================
// Paramètres système
// =========================================================================
// Export JSON
ipcMain.removeHandler('goals:export')
ipcMain.handle('goals:export', async (event, data) => {
  try {
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Exporter mes objectifs',
      defaultPath: 'goalife-export.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (canceled || !filePath) return { success: false }
    const fs = require('fs')
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return { success: true }
  } catch (error) {
    console.error('Erreur export JSON:', error.message)
    return { success: false, error: error.message }
  }
})