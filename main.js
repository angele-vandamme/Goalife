const { app, shell, BrowserWindow, Tray, Menu } = require('electron')
const path = require('path')
require('./src/main/ipc.js')

// 🎯 Déclarations globales (Recommandé par la doc Tray pour éviter le Garbage Collection)

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