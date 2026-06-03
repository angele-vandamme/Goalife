"use strict";
const { app, shell, BrowserWindow, Tray, Menu, crashReporter, ipcMain } = require("electron");
const { supabase } = require("./src/services/supabase.js");
const path = require("path");
require("./src/main/ipc.js");
crashReporter.start({
  productName: "Goalife",
  uploadToServer: false
  // Indique à Electron de stocker les rapports localement sans les envoyer
  // Note : submitURL n'est pas nécessaire ici car uploadToServer est à false.
});
async function logCrashToSupabase(error) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("app_crashes").insert([
      {
        user_id: user ? user.id : null,
        error_message: error.message || "Crash/Erreur inconnu",
        error_stack: error.stack || "Pas de stack trace disponible",
        process_type: "main"
      }
    ]);
  } catch (supabaseErr) {
    console.error("Échec de l'envoi du log à Supabase:", supabaseErr);
  }
}
process.on("uncaughtException", async (error) => {
  console.error("Crash détecté (Main Process) :", error);
  await logCrashToSupabase(error);
  app.quit();
});
ipcMain.removeHandler("crash:report-renderer");
ipcMain.handle("crash:report-renderer", async (event, errorDetails) => {
  await logCrashToSupabase(errorDetails);
  return { success: true };
});
let mainWindow;
let tray = null;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "src", "assets", "logo-goalife.ico"),
    webPreferences: {
      preload: path.join(__dirname, "src/main/preload.js"),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}/pages/auth.html`);
  } else {
    mainWindow.loadFile(path.join(__dirname, "src/renderer/pages/auth.html"));
  }
};
app.whenReady().then(() => {
  app.setAppUserModelId("com.goalife.app");
  createWindow();
  const iconPath = path.join(__dirname, "src", "assets", "logo-goalife.ico");
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Ouvrir Goalife",
      click: () => {
        mainWindow.show();
      }
    },
    { type: "separator" },
    {
      label: "Quitter",
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip("Goalife");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    mainWindow.show();
  });
  tray.on("right-click", () => {
    tray.popUpContextMenu(contextMenu);
  });
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch((err) => {
  console.error("Erreur lors du démarrage d'Electron :", err);
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
