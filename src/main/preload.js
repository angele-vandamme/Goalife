const { contextBridge, ipcRenderer } = require('electron')

// On expose un objet "api" global dans le navigateur (window.api)
contextBridge.exposeInMainWorld('api', {
  // Authentification
  signUp: (email, password, prenom, nom) => ipcRenderer.invoke('auth:signUp', { email, password, prenom, nom }),
  signIn: (email, password) => ipcRenderer.invoke('auth:signIn', { email, password }),
  signOut: () => ipcRenderer.invoke('auth:signOut'),
  getUser: () => ipcRenderer.invoke('auth:getUser'),

  // Objectifs
  getObjectifs: () => ipcRenderer.invoke('goals:get'),
  getObjectifsByType: (type) => ipcRenderer.invoke('goals:getByType', type),
  createObjectif: (goal) => ipcRenderer.invoke('goals:create', goal),
  updateObjectif: (id, updates) => ipcRenderer.invoke('goals:update', { id, updates }),
  deleteObjectif: (id) => ipcRenderer.invoke('goals:delete', id)
})