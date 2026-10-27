'use client';

import { useCallback, useEffect, useState } from 'react';
import '@/styles/admin.css';
import { getSupabase } from '@/lib/supabase';
import { formatRupiah } from '@/lib/utils';

// ---------- Definisi form pengaturan ----------
const f = (key, label, opts = {}) => ({ key, label, ...opts });

const SETTINGS_SECTIONS = [
  {
    title: '1. Identitas & Branding Situs',
    fields: [
      f('site_title', 'Nama Situs'),
      f('logo_url', 'URL Logo Gambar'),
      f('bg_media_url', 'URL Latar Belakang (Video MP4 / Gambar URL)', { full: true }),
    ],
  },
  {
    title: '2. Bagian Utama (Hero Section)',
    fields: [
      f('hero_title', 'Teks Hero Utama (Judul Besar)', { full: true }),
      f('hero_desc', 'Deskripsi Hero', { full: true, textarea: true, rows: 3 }),
      f('hero_btn_primary_text', 'Teks Tombol Aksi 1 (Primary Button)'),
      f('hero_btn_primary_link', 'Link Tombol Aksi 1'),
      f('hero_btn_secondary_text', 'Teks Tombol Aksi 2 (Secondary Button)'),
      f('hero_btn_secondary_link', 'Link Tombol Aksi 2'),
    ],
  },
  {
    title: '3. Judul Section & Label Halaman',
    fields: [
      f('section_products_title', 'Judul Section Produk'),
      f('section_services_title', 'Judul Section Layanan'),
      f('footer_text', 'Teks Footer / Hak Cipta'),
    ],
  },
  {
    title: '4. Tautan Menu Navigasi Eksternal',
    fields: [
      f('ynatools_link', 'Link PRIME Tools'),
      f('ynacpanel_link', 'Link PRIME Cpanel'),
      f('ynaconvert_link', 'Link PRIME Convert'),
      f('ynaai_link', 'Link PRIME AI'),
    ],
  },
  {
    title: '5. Kontak & Sosial Media',
    fields: [
      f('whatsapp_number', 'Nomor WhatsApp Utama'),
      f('whatsapp_backup', 'Nomor WA Cadangan'),
      f('email_contact', 'Email Kontak'),
      f('instagram_link', 'Link Instagram'),
      f('telegram_link', 'Link Telegram'),
    ],
  },
  {
    title: '6. Metode Pembayaran & QRIS',
    fields: [
      f('qris_image_url', 'URL Gambar QRIS', { full: true }),
      f('dana_number', 'Nomor DANA'),
      f('dana_name', 'Nama Pemilik DANA'),
      f('gopay_number', 'Nomor GOPAY'),
      f('gopay_name', 'Nama Pemilik GOPAY'),
    ],
  },
  {
    title: '7. Pengaturan Popup WhatsApp',
    fields: [
      f('popup_enabled', 'Aktifkan Popup WA (true / false)'),
      f('popup_title', 'Judul Popup WA'),
      f('popup_desc', 'Deskripsi Popup WA', { full: true, textarea: true, rows: 3 }),
      f('wa_group_link', 'Link Grup WA Popup', { full: true }),
    ],
  },
  {
    title: '8. Pengaturan Musik Latar',
    fields: [
      f('bg_music_enabled', 'Aktifkan Musik (true / false)'),
      f('bg_music_url', 'URL Musik (Link audio MP3)', { full: true }),
    ],
  },
];

const SOSMED_FIELDS = [
  f('sosmed_whatsapp', 'WhatsApp', { placeholder: 'https://wa.me/628xxxxxxxxxx' }),
  f('sosmed_wa_channel', 'Saluran WhatsApp', { placeholder: 'https://whatsapp.com/channel/xxxxxxxxxx' }),
  f('sosmed_instagram', 'Instagram', { placeholder: 'https://instagram.com/username' }),
  f('sosmed_telegram', 'Telegram', { placeholder: 'https://t.me/username' }),
  f('sosmed_youtube', 'YouTube', { placeholder: 'https://youtube.com/@channel' }),
  f('sosmed_tiktok', 'TikTok', { placeholder: 'https://tiktok.com/@username' }),
  f('sosmed_twitter', 'Twitter / X', { placeholder: 'https://twitter.com/username' }),
  f('sosmed_facebook', 'Facebook', { placeholder: 'https://facebook.com/username' }),
  f('sosmed_github', 'GitHub', { placeholder: 'https://github.com/username' }),
  f('sosmed_linkedin', 'LinkedIn', { placeholder: 'https://linkedin.com/in/username' }),
  f('sosmed_discord', 'Discord', { placeholder: 'https://discord.gg/invite' }),
  f('sosmed_spotify', 'Spotify', { placeholder: 'https://open.spotify.com/user/...' }),
  f('sosmed_website', 'Website / Portfolio', { placeholder: 'https://website.com' }),
];

const ALL_SETTING_KEYS = [
  ...SETTINGS_SECTIONS.flatMap((sec) => sec.fields.map((x) => x.key)),
  ...SOSMED_FIELDS.map((x) => x.key),
];

const TABS = [
  { id: 'tab-settings', label: 'Pengaturan Situs', icon: 'fa-gear' },
  { id: 'tab-products', label: 'Kelola Produk', icon: 'fa-box' },
  { id: 'tab-services', label: 'Kelola Layanan', icon: 'fa-headset' },
  { id: 'tab-sosmed', label: 'Kelola Sosmed', icon: 'fa-share-nodes' },
];

const EMPTY_PRODUCT = { id: '', name: '', price: '', description: '', image_url: '' };
const EMPTY_SERVICE = { id: '', title: '', description: '' };

// ---------- Komponen kecil ----------
function SettingField({ field, value, onChange }) {
  const { key, label, full, textarea, rows, placeholder } = field;
  return (
    <div className="form-group" style={full ? { gridColumn: '1 / -1' } : undefined}>
      <label className="form-label">{label}</label>
      {textarea ? (
        <textarea
          className="form-textarea"
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
        />
      ) : (
        <input
          type="text"
          className="form-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
        />
      )}
    </div>
  );
}

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMsg, setAuthMsg] = useState('');

  const [tab, setTab] = useState('tab-settings');
  const [settings, setSettings] = useState({});
  const [products, setProducts] = useState(null);
  const [services, setServices] = useState(null);
  const [prodForm, setProdForm] = useState(EMPTY_PRODUCT);
  const [servForm, setServForm] = useState(EMPTY_SERVICE);

  const userId = session?.user?.id;

  // ----- Auth -----
  useEffect(() => {
    const sb = getSupabase();
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setAuthMsg('');
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) setAuthMsg(error.message);
  };

  const handleLogout = async () => {
    await getSupabase().auth.signOut();
    setSession(null);
  };

  // ----- Load data -----
  const loadSettings = useCallback(async () => {
    const { data } = await getSupabase().from('site_settings').select('*');
    if (!data) return;
    const map = {};
    data.forEach((item) => {
      map[item.key] = item.value || '';
    });
    setSettings(map);
  }, []);

  const loadProducts = useCallback(async () => {
    const { data } = await getSupabase().from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
  }, []);

  const loadServices = useCallback(async () => {
    const { data } = await getSupabase().from('services').select('*').order('created_at', { ascending: false });
    setServices(data || []);
  }, []);

  // Hanya dijalankan saat user berganti (bukan tiap token di-refresh), supaya isian form tidak tertimpa
  useEffect(() => {
    if (!userId) return;
    loadSettings();
    loadProducts();
    loadServices();
  }, [userId, loadSettings, loadProducts, loadServices]);

  // ----- Pengaturan -----
  const setSetting = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const saveAllSettings = async () => {
    const rows = ALL_SETTING_KEYS.map((key) => ({ key, value: settings[key] ?? '' }));
    const { error } = await getSupabase().from('site_settings').upsert(rows, { onConflict: 'key' });
    if (error) {
      alert('Gagal menyimpan pengaturan: ' + error.message);
    } else {
      alert('Semua pengaturan situs berhasil disimpan!');
    }
  };

  // ----- Produk -----
  const saveProduct = async () => {
    const { id, name, price, description, image_url } = prodForm;
    if (!name || !price) {
      alert('Nama dan Harga wajib diisi!');
      return;
    }
    const payload = { name, price: Number(price), description, image_url };
    const sb = getSupabase();
    const { error } = id
      ? await sb.from('products').update(payload).eq('id', id)
      : await sb.from('products').insert([payload]);
    if (error) {
      alert('Gagal menyimpan produk: ' + error.message);
      return;
    }
    setProdForm(EMPTY_PRODUCT);
    loadProducts();
    alert('Produk berhasil disimpan!');
  };

  const deleteProduct = async (id) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    const { error } = await getSupabase().from('products').delete().eq('id', id);
    if (error) alert('Gagal menghapus produk: ' + error.message);
    loadProducts();
  };

  // ----- Layanan -----
  const saveService = async () => {
    const { id, title, description } = servForm;
    if (!title) {
      alert('Judul layanan wajib diisi!');
      return;
    }
    const payload = { title, description };
    const sb = getSupabase();
    const { error } = id
      ? await sb.from('services').update(payload).eq('id', id)
      : await sb.from('services').insert([payload]);
    if (error) {
      alert('Gagal menyimpan layanan: ' + error.message);
      return;
    }
    setServForm(EMPTY_SERVICE);
    loadServices();
    alert('Layanan berhasil disimpan!');
  };

  const deleteService = async (id) => {
    if (!confirm('Yakin ingin menghapus layanan ini?')) return;
    const { error } = await getSupabase().from('services').delete().eq('id', id);
    if (error) alert('Gagal menghapus layanan: ' + error.message);
    loadServices();
  };

  const activeTab = TABS.find((t) => t.id === tab);

  return (
    <div className="page-admin">
      {/* ===== LOGIN SCREEN ===== */}
      {!session && (
        <div id="auth-screen">
          {!checking && (
            <form className="auth-box" onSubmit={handleLogin}>
              <h2 className="auth-title">PRIME CT Admin</h2>
              <p className="auth-subtitle">Masuk akun admin pengelola.</p>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@primect.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary">Login</button>
              <div style={{ marginTop: 15, fontSize: '0.8rem', textAlign: 'center', color: '#ef4444' }}>
                {authMsg}
              </div>
            </form>
          )}
        </div>
      )}

      {/* ===== DASHBOARD ===== */}
      <div className="admin-layout">
        <div className="sidebar">
          <div className="sidebar-brand">
            <i className="fa-solid fa-shield-halved"></i> PRIME CT Admin
          </div>
          <div className="sidebar-menu">
            {TABS.map((t) => (
              <a
                key={t.id}
                role="button"
                tabIndex={0}
                className={`menu-item ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => e.key === 'Enter' && setTab(t.id)}
              >
                <i className={`fa-solid ${t.icon}`}></i> {t.label}
              </a>
            ))}
          </div>
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket"></i> Keluar
            </button>
          </div>
        </div>

        <div className="main-content">
          <div className="top-header">
            <div className="page-title">{activeTab.label}</div>
            <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={saveAllSettings}>
              Simpan Perubahan
            </button>
          </div>

          {/* TAB 1: PENGATURAN SITUS */}
          <div className={`section-tab-content ${tab === 'tab-settings' ? 'active' : ''}`}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Konfigurasi Seluruh Konten & Teks Website</h3>
              </div>
              <div className="grid-settings">
                {SETTINGS_SECTIONS.map((sec) => [
                  <div key={sec.title} className="section-divider">{sec.title}</div>,
                  ...sec.fields.map((field) => (
                    <SettingField
                      key={field.key}
                      field={field}
                      value={settings[field.key] ?? ''}
                      onChange={setSetting}
                    />
                  )),
                ])}
              </div>
            </div>
          </div>

          {/* TAB 2: PRODUK */}
          <div className={`section-tab-content ${tab === 'tab-products' ? 'active' : ''}`}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Tambah / Edit Produk</h3>
              </div>
              <div className="grid-settings" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Nama Produk</label>
                  <input
                    type="text"
                    className="form-input"
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Harga (Angka Saja)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">URL Gambar Produk</label>
                  <input
                    type="text"
                    className="form-input"
                    value={prodForm.image_url}
                    onChange={(e) => setProdForm({ ...prodForm, image_url: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Deskripsi Produk</label>
                  <textarea
                    className="form-textarea"
                    rows={5}
                    placeholder="Tulis deskripsi produk di sini secara leluasa..."
                    value={prodForm.description}
                    onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn-primary" onClick={saveProduct}>
                {prodForm.id ? 'Simpan Perubahan Produk' : 'Simpan Produk'}
              </button>
            </div>

            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 16 }}>Daftar Produk Tersedia</h3>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr><th>Nama</th><th>Harga</th><th>Aksi</th></tr>
                  </thead>
                  <tbody>
                    {products && products.length === 0 && (
                      <tr><td colSpan={3} style={{ textAlign: 'center' }}>Belum ada produk</td></tr>
                    )}
                    {(products || []).map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{formatRupiah(p.price)}</td>
                        <td>
                          <div className="action-btns">
                            <button
                              className="btn-action btn-edit"
                              onClick={() =>
                                setProdForm({
                                  id: p.id,
                                  name: p.name || '',
                                  price: String(p.price ?? ''),
                                  description: p.description || '',
                                  image_url: p.image_url || '',
                                })
                              }
                            >
                              Edit
                            </button>
                            <button className="btn-action btn-delete" onClick={() => deleteProduct(p.id)}>
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* TAB 3: LAYANAN */}
          <div className={`section-tab-content ${tab === 'tab-services' ? 'active' : ''}`}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Tambah / Edit Layanan & Jasa</h3>
              </div>
              <div className="grid-settings" style={{ marginBottom: 16 }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Judul Layanan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={servForm.title}
                    onChange={(e) => setServForm({ ...servForm, title: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Deskripsi Layanan</label>
                  <textarea
                    className="form-textarea"
                    rows={5}
                    value={servForm.description}
                    onChange={(e) => setServForm({ ...servForm, description: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn-primary" onClick={saveService}>
                {servForm.id ? 'Simpan Perubahan Layanan' : 'Simpan Layanan'}
              </button>
            </div>

            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 16 }}>Daftar Layanan Tersedia</h3>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr><th>Judul</th><th>Deskripsi</th><th>Aksi</th></tr>
                  </thead>
                  <tbody>
                    {services && services.length === 0 && (
                      <tr><td colSpan={3} style={{ textAlign: 'center' }}>Belum ada layanan</td></tr>
                    )}
                    {(services || []).map((sv) => (
                      <tr key={sv.id}>
                        <td>{sv.title}</td>
                        <td>{sv.description || '-'}</td>
                        <td>
                          <div className="action-btns">
                            <button
                              className="btn-action btn-edit"
                              onClick={() =>
                                setServForm({
                                  id: sv.id,
                                  title: sv.title || '',
                                  description: sv.description || '',
                                })
                              }
                            >
                              Edit
                            </button>
                            <button className="btn-action btn-delete" onClick={() => deleteService(sv.id)}>
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* TAB 4: SOSMED */}
          <div className={`section-tab-content ${tab === 'tab-sosmed' ? 'active' : ''}`}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Kelola Link Sosial Media</h3>
              </div>
              <p style={{ color: 'var(--text-sub)', marginBottom: 20, fontSize: '0.85rem' }}>
                Masukkan URL lengkap untuk setiap platform sosial media. Kosongkan jika tidak ingin ditampilkan.
                Klik &quot;Simpan Perubahan&quot; di kanan atas untuk menyimpan.
              </p>
              <div className="grid-settings">
                <div className="section-divider">Platform Sosial Media</div>
                {SOSMED_FIELDS.map((field) => (
                  <SettingField
                    key={field.key}
                    field={field}
                    value={settings[field.key] ?? ''}
                    onChange={setSetting}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
