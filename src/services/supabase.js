const { createClient } = require('@supabase/supabase-js')

// Support WebSocket pour Electron (Node.js 18)
let WebSocketClass = null
try {
  WebSocketClass = require('ws')
} catch (e) {
  console.warn('ws package not available, WebSocket support disabled')
}

const SUPABASE_URL = 'https://mbynbgnkwwyrsmhmeldv.supabase.co'
const SUPABASE_KEY = 'sb_publishable_ar0Sh4RFtZSnJIOMMiWxng_X1rEtzUo'

let supabase = null

try {
  // Initialisation du client Supabase V2 avec support WebSocket et Node/Electron auth mode
  const options = {
    realtime: WebSocketClass ? { transport: 'ws' } : undefined,
    auth: {
      persistSession: false
    }
  }

  supabase = createClient(SUPABASE_URL, SUPABASE_KEY, options)
  console.log('Supabase client initialized successfully')
} catch (error) {
  console.error("Erreur critique lors de l'initialisation de Supabase :", error.message)
}

module.exports = { supabase }