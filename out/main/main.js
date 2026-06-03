"use strict";
const { app, shell, BrowserWindow, Tray, Menu } = require("electron");
const path = require("path");
require("./src/main/ipc.js");
let mainWindow;
let tray = null;
const createWindow = () => {
  const mainWindow2 = new BrowserWindow({
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
  mainWindow2.on("ready-to-show", () => {
    mainWindow2.show();
  });
  mainWindow2.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow2.hide();
    }
    return false;
  });
  mainWindow2.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow2.loadURL(`${process.env.ELECTRON_RENDERER_URL}/pages/auth.html`);
  } else {
    mainWindow2.loadFile(path.join(__dirname, "src/renderer/pages/auth.html"));
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
