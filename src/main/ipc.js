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

// Récupérer la liste complète triée par nouveauté
ipcMain.removeHandler('goals:get'); // 🎯 FIX : Supprime le handler existant s'il y en a un pour éviter l'erreur de crash
ipcMain.handle('goals:get', async () => {
  try {
    const { data, error } = await supabase
      .from('objectif')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data } 
  } catch (error) {
    console.error('Erreur IPC getObjectifs:', error.message)
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

// Modifier un objectif
ipcMain.removeHandler('goals:update');
ipcMain.handle('goals:update', async (event, updates) => {
  try {
    const { id, ...fields } = updates;
    console.log('=== goals:update ===');
    console.log('id:', id);
    console.log('fields:', fields);
    const { error, data } = await supabase
      .from('objectif')
      .update(fields)
      .eq('id', id);
    console.log('supabase error:', error);
    console.log('supabase data:', data);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erreur IPC updateObjectif:', error.message);
    return { success: false, error: error.message };
  }
});

// Supprimer un objectif
ipcMain.removeHandler('goals:delete');
ipcMain.handle('goals:delete', async (event, id) => {
  try {
    const { data, error } = await supabase
      .from('objectif')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
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