const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://mbynbgnkwwyrsmhmeldv.supabase.co/rest/v1/'
const SUPABASE_KEY = 'sb_publishable_ar0Sh4RFtZSnJIOMMiWxng_X1rEtzUo'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

module.exports = { supabase }