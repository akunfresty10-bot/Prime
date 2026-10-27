'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from './supabase';

// Mengambil semua baris tabel site_settings jadi objek { key: value }.
export function useSiteSettings() {
  const [state, setState] = useState({ settings: {}, loaded: false, hasData: false });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await getSupabase().from('site_settings').select('*');
        if (!active) return;
        if (data) {
          const map = {};
          data.forEach((item) => {
            map[item.key] = item.value;
          });
          setState({ settings: map, loaded: true, hasData: true });
        } else {
          setState({ settings: {}, loaded: true, hasData: false });
        }
      } catch (err) {
        console.error('Gagal memuat pengaturan situs:', err);
        if (active) setState({ settings: {}, loaded: true, hasData: false });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return state;
}
