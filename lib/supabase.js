import { createClient } from '@supabase/supabase-js';

let client;

// Dibuat saat pertama dipakai (di browser), bukan saat build,
// supaya build tidak gagal kalau env belum diisi.
export function getSupabase() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi di .env.local atau Vercel.'
      );
    }
    client = createClient(url, key);
  }
  return client;
}
