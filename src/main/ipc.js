const { ipcMain, dialog, Notification, app } = require('electron')
const { signUp, signIn, signOut, getUser } = require('../services/auth')
const { getObjectifs, createObjectif, updateObjectif, deleteObjectif } = require('../services/goals')
const { supabase } = require('../services/supabase')

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

// Ajout pour le Dashboard : Récupérer les infos de la table 'user'
ipcMain.removeHandler('profile:getUserProfile'); // Sécurité doublon
ipcMain.handle('profile:getUserProfile', async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { data: null }

    const { data, error } = await supabase
      .from('user')
      .select('prenom, nom')
      .eq('id', user.id)
      .maybeSingle() 

    if (error) throw error
    return { data } 
  } catch (error) {
    console.error('Erreur IPC getUserProfile:', error.message)
    return { data: null }
  }
})

// =========================================================================
// Écouteurs pour les Objectifs (Nettoyés et sécurisés contre les doublons)
// =========================================================================

// Récupérer la liste complète filtrée par l'utilisateur connecté, triée par nouveauté
ipcMain.removeHandler('goals:get'); 
ipcMain.handle('goals:get', async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Utilisateur non authentifié")

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
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Utilisateur non authentifié")

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
ipcMain.removeHandler('goals:create'); // 🎯 Sécurité doublon
ipcMain.handle('goals:create', async (event, goal) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Utilisateur non connecté")

    const { data, error } = await supabase
      .from('objectif')
      .insert([
        {
          user_id:     user.id,
          nom:         goal.nom,
          statut:      goal.statut,
          duree:       goal.duree,
          type:        goal.type,
          importance:  goal.importance,
          description: goal.description,
          image:       goal.image
        }
      ])

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Erreur IPC createObjectif:", error.message)
    return { success: false, error: error.message }
  }
})

// Modifier un objectif (avec vérification de propriété)
ipcMain.removeHandler('goals:update');
ipcMain.handle('goals:update', async (event, updates) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Utilisateur non authentifié")

    const { id, ...fields } = updates;
    
    // Vérifier que l'objectif appartient à l'utilisateur
    const { data: objectif, error: checkError } = await supabase
      .from('objectif')
      .select('user_id')
      .eq('id', id)
      .maybeSingle()
    
    if (checkError || !objectif || objectif.user_id !== user.id) {
      throw new Error("Accès non autorisé à cet objectif")
    }

    const { error, data } = await supabase
      .from('objectif')
      .update(fields)
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erreur IPC updateObjectif:', error.message);
    return { success: false, error: error.message };
  }
});

// Supprimer un objectif (avec vérification de propriété)
ipcMain.removeHandler('goals:delete');
ipcMain.handle('goals:delete', async (event, id) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Utilisateur non authentifié")

    // Vérifier que l'objectif appartient à l'utilisateur
    const { data: objectif, error: checkError } = await supabase
      .from('objectif')
      .select('user_id')
      .eq('id', id)
      .maybeSingle()
    
    if (checkError || !objectif || objectif.user_id !== user.id) {
      throw new Error("Accès non autorisé à cet objectif")
    }

    const { error } = await supabase
      .from('objectif')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erreur IPC deleteObjectif:', error.message)
    return { success: false, error: error.message };
  }
});

// =========================================================================
// Écouteur pour l'Image
// =========================================================================
ipcMain.removeHandler('image:select');
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

    return result.filePaths[0]
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

ipcMain.removeHandler('settings:setAutoLaunch')
ipcMain.handle('settings:setAutoLaunch', (event, enabled) => {
  app.setLoginItemSettings({ openAtLogin: enabled })
  return { success: true }
})

ipcMain.removeHandler('settings:getAutoLaunch')
ipcMain.handle('settings:getAutoLaunch', () => {
  const { openAtLogin } = app.getLoginItemSettings()
  return { openAtLogin }
})