import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'VITE_SUPABASE_URL veya VITE_SUPABASE_ANON_KEY .env dosyasından okunamadı. Yeni eklenen .env dosyasının Vite tarafından algılanması için terminalde "npm run dev" sunucusunu yeniden başlatmanız (Ctrl + C ve tekrar npm run dev) gerekmektedir.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
