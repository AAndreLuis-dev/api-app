import { createClient } from '@supabase/supabase-js';

// Carrega as variáveis de ambiente do arquivo .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Cria o cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
