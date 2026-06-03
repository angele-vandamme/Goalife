"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("api", {
  // Authentification
  signUp: (email, password, prenom, nom) => ipcRenderer.invoke("auth:signUp", { email, password, prenom, nom }),
  signIn: (email, password) => ipcRenderer.invoke("auth:signIn", { email, password }),
  signOut: () => ipcRenderer.invoke("auth:signOut"),
  getUser: () => ipcRenderer.invoke("auth:getUser"),
  getUserProfile: () => ipcRenderer.invoke("profile:getUserProfile"),
  // Notifications OS
  sendNotification: (title, body) => ipcRenderer.invoke("notification:send", { title, body }),
  // Objectifs
  getObjectifs: () => ipcRenderer.invoke("goals:get"),
  getObjectifsByType: (type) => ipcRenderer.invoke("goals:getByType", type),
  selectImage: () => ipcRenderer.invoke("image:select"),
  createObjectif: (goal) => ipcRenderer.invoke("goals:create", goal),
  updateObjectif: (updates) => ipcRenderer.invoke("goals:update", updates),
  deleteObjectif: (id) => ipcRenderer.invoke("goals:delete", id),
  exportGoals: (data) => ipcRenderer.invoke("goals:export", data),
  getAutoLaunch: () => ipcRenderer.invoke("settings:getAutoLaunch"),
  setAutoLaunch: (enabled) => ipcRenderer.invoke("settings:setAutoLaunch", enabled)
});
