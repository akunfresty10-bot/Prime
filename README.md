# GWNSHOP (Next.js)

## Jalankan lokal
```bash
npm install
npm run dev
```
Buka http://localhost:3000 — env lokal dibaca dari `.env.local`.

## Environment variable
| Nama | Isi |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable / anon key Supabase |

- `.env.local` hanya untuk lokal dan **jangan di-upload ke GitHub** (sudah ada di `.gitignore`).
- Di Vercel: Project → Settings → Environment Variables → isi dua variabel di atas, lalu **Redeploy**
  (variabel `NEXT_PUBLIC_` ditanam saat build, jadi perubahan baru berlaku setelah build ulang).
- Jangan pernah memakai awalan `NEXT_PUBLIC_` untuk `service_role` key.

## Struktur
- `app/` — route: `/` (home), `/produk`, `/sosmed`, `/admin`
- `components/` — isi tiap halaman
- `styles/` — CSS tiap halaman (sudah di-scope per halaman)
- `lib/` — koneksi Supabase & helper
- `public/` — video latar `assets/bg.mp4`, `placeholder.svg`
