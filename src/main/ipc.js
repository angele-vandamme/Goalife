const { ipcMain } = require('electron')
const { signUp, signIn, signOut, getUser } = require('../services/auth')
// Mettre les objectifs par la suite :
// const { getObjectifs, createObjectif, updateObjectif, deleteObjectif } = require('../services/goals')

// Écouteurs pour l'authentification
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