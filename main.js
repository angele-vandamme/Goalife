const { app, shell, BrowserWindow, Tray, Menu, crashReporter, ipcMain} = require('electron')
// Importe le client supabase déjà configuré dans ton projet (ajuste le chemin si nécessaire)
const { supabase } = require('./src/services/supabase.js')
const path = require('path')
require('./src/main/ipc.js')

crashReporter.start({
  productName: 'Goalife',
  uploadToServer: false // Indique à Electron de stocker les rapports localement sans les envoyer
  // Note : submitURL n'est pas nécessaire ici car uploadToServer est à false.
})

// Fonction de collecte pour envoyer le crash vers Supabase
async function logCrashToSupabase(error) {
  try {
    // Récupérer l'ID de l'utilisateur actuellement connecté si disponible
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase
      .from('app_crashes')
      .insert([
        {
          user_id: user ? user.id : null,
          error_message: error.message || 'Crash/Erreur inconnu',
          error_stack: error.stack || 'Pas de stack trace disponible',
          process_type: 'main'
        }
      ])
  } catch (supabaseErr) {
    console.error("Échec de l'envoi du log à Supabase:", supabaseErr)
  }
}

// Intercepter les crashs non gérés du processus Main (Backend)
process.on('uncaughtException', async (error) => {
  console.error('Crash détecté (Main Process) :', error)
  await logCrashToSupabase(error)
  app.quit()  // Quitter proprement l'application après le crash
})

// Écouteur IPC pour capter les crashs provenant du processus Renderer (Frontend)
ipcMain.removeHandler('crash:report-renderer')
ipcMain.handle('crash:report-renderer', async (event, errorDetails) => {
  await logCrashToSupabase(errorDetails, 'renderer')
  return { success: true }
})

// Déclarations globales (Recommandé par la doc Tray pour éviter le Garbage Collection)

let mainWindow
let tray = null

// On déclare d'ABORD la fonction createWindow pour qu'elle existe à coup sûr globalement
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'src', 'assets', 'logo-goalife.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'src/main/preload.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
   
  })

  //mainWindow.webContents.openDevTools()

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

// GESTION DE LA FERMETURE : Cacher la fenêtre au lieu de quitter l'app
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
    return false
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Chargement de la page HTML d'authentification
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}/pages/auth.html`)
  } else {
    mainWindow.loadFile(path.join(__dirname, 'src/renderer/pages/auth.html'))
  }
}

// Initialisation de l'application
app.whenReady().then(() => {

  // 🔴 LIGNE DE TEST CRASH REPORTER: Force un crash au démarrage
  // throw new Error("Test de crash automatique pour le rendu Goalife !");

  // Définir l'ID pour Windows AVANT de créer la fenêtre
  app.setAppUserModelId('com.goalife.app')

  // Créer la fenêtre principale
  createWindow()
  
  const iconPath = path.join(__dirname, 'src', 'assets', 'logo-goalife.ico')
  tray = new Tray(iconPath)


  // Définition du menu contextuel (clic droit sur l'icône)
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Ouvrir Goalife', 
      click: () => {
        mainWindow.show()
      } 
    },
    { type: 'separator' },
    { 
      label: 'Quitter', 
      click: () => {
        app.isQuitting = true
        app.quit() 
    }
}])

  // Infobulle au survol de la souris
  tray.setToolTip('Goalife')

  tray.setContextMenu(contextMenu)

  // Double-clic ou clic gauche pour restaurer la fenêtre directement
  tray.on('click', () => {
    mainWindow.show()
  })

  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu)
  })
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}).catch(err => {
  console.error("Erreur lors du démarrage d'Electron :", err)
})

// Quitter quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit() // Windows et linux app.quit() et macOS if (process.platform...'darwin')
})