const { createClient } = require('@supabase/supabase-js')

// Nettoyage de l'URL : on enlève '/rest/v1/' à la fin
const SUPABASE_URL = 'https://mbynbgnkwwyrsmhmeldv.supabase.co'
const SUPABASE_KEY = 'sb_publishable_ar0Sh4RFtZSnJIOMMiWxng_X1rEtzUo'

let supabase = null

try {
  // Initialisation sécurisée du client Supabase
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
} catch (error) {
  console.error("Erreur critique lors de l'initialisation de Supabase :", error.message)
}

module.exports = { supabase }