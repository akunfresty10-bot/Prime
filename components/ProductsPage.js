'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import '@/styles/produk.css';
import { getSupabase } from '@/lib/supabase';
import { useSiteSettings } from '@/lib/useSiteSettings';
import { PLACEHOLDER, formatRupiah } from '@/lib/utils';

export default function ProductsPage() {
  const { settings: s } = useSiteSettings();

  const [products, setProducts] = useState(null); // null = masih memuat
  const [services, setServices] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [detail, setDetail] = useState(null); // { kind, item }
  const [detailOpen, setDetailOpen] = useState(false);

  const brand = s.site_title || 'GWENSHOP';
  const wa = s.whatsapp_number;

  useEffect(() => {
    if (s.site_title) document.title = `${s.site_title} - Produk`;
  }, [s.site_title]);

  useEffect(() => {
    (async () => {
      try {
        const sb = getSupabase();
        const [prod, serv] = await Promise.all([
          sb.from('products').select('*').order('created_at', { ascending: false }),
          sb.from('services').select('*').order('created_at', { ascending: false }),
        ]);
        setProducts(prod.data || []);
        setServices(serv.data || []);
      } catch (err) {
        console.error('Gagal memuat produk/layanan:', err);
        setProducts([]);
        setServices([]);
      }
    })();
  }, []);

  const q = query.toLowerCase();
  const shownProducts = (products || []).filter((p) => (p.name || '').toLowerCase().includes(q));
  const shownServices = (services || []).filter((x) => (x.title || '').toLowerCase().includes(q));

  const openDetail = (kind, item) => {
    setDetail({ kind, item });
    setDetailOpen(true);
  };

  let detailView = null;
  if (detail) {
    const isProduct = detail.kind === 'product';
    const name = isProduct ? detail.item.name : detail.item.title;
    const waText = encodeURIComponent(
      `Halo Admin, saya mau pesan ${isProduct ? 'produk' : 'jasa'}: ${name}`
    );
    detailView = {
      img: isProduct ? detail.item.image_url || PLACEHOLDER : PLACEHOLDER,
      title: name,
      price: isProduct ? formatRupiah(detail.item.price) : 'Layanan / Jasa',
      desc: detail.item.description || 'Tidak ada deskripsi.',
      waUrl: wa ? `https://wa.me/${wa}?text=${waText}` : '#',
    };
  }

  return (
    <div className="page-produk">
      {/* ===== MODAL DETAIL ===== */}
      <div
        className={`modal-overlay ${detailOpen ? 'active' : ''}`}
        onClick={(e) => e.target === e.currentTarget && setDetailOpen(false)}
      >
        <div className="detail-modal-box">
          <button className="popup-close-circle" onClick={() => setDetailOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
          <img src={detailView?.img || PLACEHOLDER} alt="Cover" className="detail-cover-img" />
          <div className="detail-body">
            <h2 className="detail-title">{detailView?.title || 'Nama Produk'}</h2>
            <div className="detail-price-row">
              <div className="detail-price">{detailView?.price || 'Rp 0'}</div>
              <a
                href={detailView?.waUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa-direct"
              >
                <i className="fa-brands fa-whatsapp fa-lg"></i> Beli via WA
              </a>
            </div>
            <div className="detail-desc-text">{detailView?.desc || 'Deskripsi lengkap...'}</div>
          </div>
        </div>
      </div>

      {/* ===== HEADER ===== */}
      <header>
        <div className="nav-container">
          <Link href="/" className="brand">
            <img src={s.logo_url || PLACEHOLDER} alt="Logo" />
            <span>{brand}</span>
          </Link>
          <a
            href={wa ? `https://wa.me/${wa}` : '#'}
            className="nav-btn-wa"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-brands fa-whatsapp"></i> CS WhatsApp
          </a>
        </div>
      </header>

      <div className="container">
        <Link href="/" className="back-portal-btn">
          <i className="fa-solid fa-arrow-left"></i> Kembali ke Menu Utama
        </Link>

        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Cari produk atau layanan..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="category-tabs">
          <button className={`tab-btn ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>
            <i className="fa-solid fa-border-all"></i> Semua
          </button>
          <button
            className={`tab-btn ${category === 'products' ? 'active' : ''}`}
            onClick={() => setCategory('products')}
          >
            <i className="fa-solid fa-box"></i> Produk
          </button>
          <button
            className={`tab-btn ${category === 'services' ? 'active' : ''}`}
            onClick={() => setCategory('services')}
          >
            <i className="fa-solid fa-headset"></i> Layanan / Jasa
          </button>
        </div>

        {category !== 'services' && (
          <div>
            <h2 className="section-title">
              <i className="fa-solid fa-bolt rgb-title" style={{ color: '#f59e0b' }}></i> Daftar Produk
            </h2>
            <div className="grid-container">
              {products === null && <div className="state-msg">Memuat daftar produk...</div>}
              {products !== null && products.length === 0 && <div className="state-msg">Belum ada produk.</div>}
              {shownProducts.map((prod) => (
                <div key={prod.id} onClick={() => openDetail('product', prod)} className="store-card">
                  <span className="card-badge">PROMO</span>
                  <img className="card-img" src={prod.image_url || PLACEHOLDER} alt={prod.name} />
                  <div>
                    <div className="card-title">{prod.name}</div>
                    <div className="card-desc">{prod.description || ''}</div>
                    <div className="card-price">{formatRupiah(prod.price)}</div>
                  </div>
                  <div className="card-btn">Lihat Detail</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {category !== 'products' && (
          <div>
            <h2 className="section-title">
              <i className="fa-solid fa-shield-halved rgb-title" style={{ color: '#3b82f6' }}></i> Layanan & Jasa
            </h2>
            <div className="grid-container">
              {services === null && <div className="state-msg">Memuat daftar layanan...</div>}
              {services !== null && services.length === 0 && <div className="state-msg">Belum ada layanan.</div>}
              {shownServices.map((serv) => (
                <div key={serv.id} onClick={() => openDetail('service', serv)} className="store-card">
                  <span className="card-badge" style={{ background: '#059669' }}>JASA</span>
                  <div>
                    <div className="card-title" style={{ marginTop: 8 }}>{serv.title}</div>
                    <div className="card-desc">{serv.description || ''}</div>
                  </div>
                  <div className="card-btn" style={{ background: '#059669' }}>Lihat Detail</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
