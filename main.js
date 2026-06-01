const { app, shell, BrowserWindow } = require('electron')
const path = require('path')

require('./src/main/ipc.js')

// On déclare d'ABORD la fonction createWindow pour qu'elle existe à coup sûr globalement
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'src/main/preload.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
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

// Require les scripts et l'IPC en toute sécurité
require('./src/main/ipc.js')

// Initialisation de l'application
app.whenReady().then(() => {
  createWindow()

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