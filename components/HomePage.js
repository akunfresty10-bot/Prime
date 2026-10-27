'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import '@/styles/home.css';
import { getSupabase } from '@/lib/supabase';
import { useSiteSettings } from '@/lib/useSiteSettings';
import { PLACEHOLDER, safeHref } from '@/lib/utils';

const WELCOME_TEXT = 'SELAMAT DATANG DI';
const TYPING_SPEED = 0.12;
const CASCADE_SELECTOR =
  '.hero-desc, .h-btn, .section-header-title, .section-main-title, .category-card, .about-box, .stats-box';

// Teks yang dipecah per huruf untuk animasi mengetik
function Letters({ text, offset = 0 }) {
  return [...text].map((ch, i) => (
    <span
      key={i}
      className="char-anim"
      style={{ animationDelay: `${offset + i * TYPING_SPEED}s` }}
    >
      {ch === ' ' ? '\u00A0' : ch}
    </span>
  ));
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className="copy-btn" onClick={copy}>
      {copied ? 'Disalin!' : 'Salin'}
    </button>
  );
}

// Angka pengunjung: +1 lewat RPC Supabase, lalu animasi hitung saat terlihat di layar
function VisitorCounter() {
  const [text, setText] = useState('8.929+');
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Tampilkan dulu angka terakhir yang tersimpan di browser
    const cached = parseInt(localStorage.getItem('cachedVisitorCount'), 10);
    if (!isNaN(cached)) setText(`${cached.toLocaleString('id-ID')}+`);

    const runAnimation = (target) => {
      const duration = 2000;
      const startTime = performance.now();
      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - (1 - progress) * (1 - progress);
        if (progress < 1) {
          setText(`${Math.floor(eased * target).toLocaleString('id-ID')}+`);
          requestAnimationFrame(step);
        } else {
          setText(`${target.toLocaleString('id-ID')}+`);
        }
      };
      requestAnimationFrame(step);
    };

    (async () => {
      try {
        const { data: newCount, error } = await getSupabase().rpc('increment_total_visitors');
        if (error || newCount === null || newCount === undefined) {
          console.error('Gagal memperbarui pengunjung, angka lama dipertahankan:', error);
          return;
        }
        localStorage.setItem('cachedVisitorCount', String(newCount));
        setText('0+');

        if (!ref.current) return;
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                runAnimation(Number(newCount));
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.3 }
        );
        observer.observe(ref.current);
      } catch (err) {
        console.error('Gagal memperbarui pengunjung:', err);
      }
    })();
  }, []);

  return (
    <div className="stats-number" id="stats-visitor-count" ref={ref}>
      {text}
    </div>
  );
}

export default function HomePage() {
  const { settings: s, loaded, hasData } = useSiteSettings();

  const pageRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  const [splash, setSplash] = useState('show'); // show | fade | gone
  const [waOpen, setWaOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [animated, setAnimated] = useState(false);

  const brand = s.site_title || 'GWENSHOP';
  const heroTitle = s.hero_title || brand;
  const logo = s.logo_url || PLACEHOLDER;
  const wa = s.whatsapp_number;
  const groupUrl = s.wa_group_link || '#';

  const hideSplash = useCallback(() => setSplash((p) => (p === 'show' ? 'fade' : p)), []);

  // Splash screen: hilang saat halaman termuat, atau maksimal 1,5 detik
  useEffect(() => {
    if (document.readyState === 'complete') hideSplash();
    else window.addEventListener('load', hideSplash);
    const t = setTimeout(hideSplash, 1500);
    return () => {
      window.removeEventListener('load', hideSplash);
      clearTimeout(t);
    };
  }, [hideSplash]);

  useEffect(() => {
    if (splash !== 'fade') return;
    const t = setTimeout(() => setSplash('gone'), 500);
    return () => clearTimeout(t);
  }, [splash]);

  // Video latar harus muted agar autoplay diizinkan browser
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.muted = true;
      v.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (s.site_title) document.title = s.site_title;
  }, [s.site_title]);

  // Setelah pengaturan termuat: tampilkan popup WA, atau langsung mulai animasi teks
  useEffect(() => {
    if (!loaded) return;
    if (!hasData) {
      hideSplash();
      return;
    }
    let t2;
    const t1 = setTimeout(() => {
      hideSplash();
      if (s.popup_enabled === 'true' && groupUrl !== '#') {
        t2 = setTimeout(() => setWaOpen(true), 400);
      } else {
        setAnimated(true);
      }
    }, 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // Efek muncul berurutan (cascade) setelah animasi mengetik selesai
  useEffect(() => {
    if (!animated || !pageRef.current) return;
    const els = pageRef.current.querySelectorAll(CASCADE_SELECTOR);
    els.forEach((el) => el.classList.add('cascade-item'));

    const typingMs =
      (([...WELCOME_TEXT].length + [...heroTitle].length) * TYPING_SPEED + 0.2) * 1000;
    const timers = [];
    const t0 = setTimeout(() => {
      els.forEach((el, i) => {
        timers.push(setTimeout(() => el.classList.add('show-cascade'), i * 120));
      });
    }, typingMs);

    return () => {
      clearTimeout(t0);
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated]);

  const closeWaModal = () => {
    setWaOpen(false);
    setAnimated(true);
  };

  const handlePopupClick = () => {
    const a = audioRef.current;
    if (s.bg_music_enabled === 'true' && a && a.paused) a.play().catch(() => {});
  };

  return (
    <div className="page-home" ref={pageRef}>
      {/* ===== SPLASH SCREEN ===== */}
      {splash !== 'gone' && (
        <div
          id="splash-screen"
          className={`splash-overlay ${splash === 'fade' ? 'fade-out' : ''}`}
          style={splash === 'fade' ? { opacity: 0, transition: 'opacity 0.5s ease' } : undefined}
        >
          <div className="popup-wa-card" style={{ textAlign: 'center' }}>
            <div className="popup-avatar-box">
              <img id="splash-logo" src={logo} alt="Logo" />
            </div>
            <h3 className="popup-title" style={{ marginBottom: 5 }}>GWENSHOP</h3>
            <p className="popup-desc" style={{ marginBottom: 20 }}>Memuat tampilan digital...</p>
            <div className="splash-progress-bar">
              <div className="splash-progress-fill"></div>
            </div>
          </div>
        </div>
      )}

      {/* ===== BACKGROUND VIDEO ===== */}
      <div id="bg-video-container">
        <div id="bg-media-slot">
          <video ref={videoRef} autoPlay muted loop playsInline preload="auto" poster="/assets/bg-poster.jpg" disablePictureInPicture>
            <source src="/assets/bg.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* ===== BACKGROUND AUDIO ===== */}
      <audio ref={audioRef} src={s.bg_music_url || undefined} loop />

      {/* ===== MODAL WA POPUP ===== */}
      <div className={`modal-overlay ${waOpen ? 'active' : ''}`}>
        <div className="popup-wa-card" onClick={handlePopupClick}>
          <button className="popup-close-circle" onClick={closeWaModal}>
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="popup-avatar-box">
            <img src={logo} alt="" />
          </div>
          <h3 className="popup-title">{s.popup_title || 'JOIN GRUP WHATSAPP'}</h3>
          <p className="popup-desc">
            {s.popup_desc || 'Masuk grup WhatsApp resmi untuk info promo & update produk.'}
          </p>
          <a href={safeHref(groupUrl)} target="_blank" rel="noopener noreferrer" className="popup-btn-join">
            Join Grup
          </a>
          <button className="popup-btn-later" onClick={closeWaModal}>Nanti</button>
        </div>
      </div>

      {/* ===== MODAL PAYMENT ===== */}
      <div className={`modal-overlay ${payOpen ? 'active' : ''}`}>
        <div className="payment-modal-card">
          <button className="popup-close-circle" onClick={() => setPayOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
          <h3 className="pay-title">Metode Pembayaran</h3>

          <div className="qris-box">
            {s.qris_image_url && <img src={s.qris_image_url} alt="QRIS" />}
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: 15 }}>
            Scan QRIS di atas untuk semua e-wallet & mobile banking
          </p>

          <div className="wallet-box">
            <div className="wallet-info">
              <h5>DANA ({s.dana_name || 'Owner'})</h5>
              <p>{s.dana_number || '-'}</p>
            </div>
            <CopyButton text={s.dana_number} />
          </div>

          <div className="wallet-box">
            <div className="wallet-info">
              <h5>GOPAY ({s.gopay_name || 'Owner'})</h5>
              <p>{s.gopay_number || '-'}</p>
            </div>
            <CopyButton text={s.gopay_number} />
          </div>

          <a
            href={
              wa
                ? `https://wa.me/${wa}?text=${encodeURIComponent('Halo Admin, saya ingin konfirmasi pembayaran.')}`
                : '#'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="pay-confirm-btn"
          >
            <i className="fa-brands fa-whatsapp"></i> Konfirmasi Bukti Transfer
          </a>
        </div>
      </div>

      {/* ===== HEADER ===== */}
      <Link href="/" className="brand">
        <div className="header-avatar">
          <img src={logo} alt="Logo" />
        </div>
        <span className="site-brand-name">{brand}</span>
      </Link>

      {/* ===== MAIN CONTENT ===== */}
      <div className="main-wrapper">
        {/* HERO SECTION */}
        <div className="hero-section">
          <div className="hero-avatar">
            <img src={logo} alt="Logo" />
          </div>

          <div className="hero-text-card animate-slide-up">
            <div className="hero-welcome">
              {animated ? <Letters text={WELCOME_TEXT} /> : WELCOME_TEXT}
            </div>
            <h1 className="hero-greeting site-brand-name">
              {animated ? (
                <Letters text={heroTitle} offset={[...WELCOME_TEXT].length * TYPING_SPEED} />
              ) : (
                heroTitle
              )}
            </h1>
            <p className="hero-desc">
              {s.hero_desc ||
                'Platform digital terpercaya untuk memenuhi kebutuhan akun premium, jasa editing, nokos all country, Sewa Bot Whatsapp, script bot, panel, VPS, partner, dan layanan digital lainnya.'}
            </p>
          </div>

          <div className="hero-buttons animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/produk" className="h-btn primary">Lihat Produk</Link>
            <button className="h-btn" onClick={() => setPayOpen(true)}>Payment</button>
            <a href={wa ? `https://wa.me/${wa}` : '#'} target="_blank" rel="noopener noreferrer" className="h-btn">
              Hubungi Owner
            </a>
            <Link href="/sosmed" className="h-btn">GWN SOSMED</Link>
          </div>
        </div>

        {/* KATEGORI POPULER */}
        <div className="section-box">
          <div className="section-header-title">KATEGORY PALING POPULER</div>
          <h2 className="section-main-title">Produk & Jasa GWENSHOP</h2>

          <div className="category-card">
            <div className="cat-icon-title">
              <i className="fa-solid fa-crown" style={{ color: 'var(--accent-primary)' }}></i> AKUN PREMIUM
            </div>
            <div className="cat-desc">Netflix, ,Alight Motion, Spotify, Canva, ChatGPT, YouTube, dan lainnya.</div>
          </div>

          <div className="category-card">
            <div className="cat-icon-title">
              <i className="fa-solid fa-palette" style={{ color: 'var(--accent-pink)' }}></i> EDITING
            </div>
            <div className="cat-desc">Jasdit HD FOTO/VIDEO, desain, CapCut, Remini,AM, dan paid edit.</div>
          </div>

          <div className="category-card">
            <div className="cat-icon-title">
              <i className="fa-solid fa-robot" style={{ color: 'var(--accent-cyan)' }}></i> BOT WHATSAPP
            </div>
            <div className="cat-desc">Script bot, sewa bot, servis bot,rename script, Tambah fitur, dan fix bug.</div>
          </div>

          <div className="category-card">
            <div className="cat-icon-title">
              <i className="fa-solid fa-server" style={{ color: 'var(--accent-indigo)' }}></i> GWN HOSTING
            </div>
            <div className="cat-desc">VPS, Panel pterodactyl, dan kebutuhan server digital lainnya.</div>
          </div>

          <Link href="/sosmed" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="category-card">
              <div className="cat-icon-title">
                <i className="fa-solid fa-share-nodes" style={{ color: 'var(--accent-pink)' }}></i> GWN SOSMED
              </div>
              <div className="cat-desc">Kumpulan link sosial media resmi GWENSHOP dalam satu halaman.</div>
            </div>
          </Link>
        </div>

        {/* TENTANG GWENSHOP */}
        <div className="about-box">
          <h3>GWENSHOP TU APASI?</h3>
          <p>
            <strong>GWNSHOP</strong> Adalah ecosystem digital store yang dikembangkan dan dikelola secara individual oleh{' '}
            <strong>GWN</strong>, Atau yang lebih akrab dikenal dengan nama panggilan <strong>PRIME</strong>.
          </p>
          <p>
            Berawal dari hobi dan keahlian di dunia digital, GWN dikenal sebagai sosok serba bisa — mulai dari Developer
            Bot, Designer, hingga Content Creator walaupun gak pernah fyp, wkwk.
          </p>
          <p>
            GWNSHOP hadir dengan komitmen untuk menyediakan layanan yang{' '}
            <strong>praktis, modern, cepat, aman dan terpercaya</strong> untuk semua kebutuhan dalam dunia digital. fokus
            kami adalah pada transaksi yang aman, tampilan yang modern, keaslian produk dan pelayanan yang responsif.
          </p>
          <p>Di GWNSHOP, semua kebutuhan digital kamu ada dalam satu tempat.</p>

          <div className="role-tags">
            <span className="role-tag">𝗢𝗪𝗡𝗘𝗥</span>
            <span className="role-tag">𝗔𝗗𝗠𝗜𝗡</span>
            <span className="role-tag">𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥</span>
            <span className="role-tag">𝗘𝗡𝗚𝗜𝗡𝗘𝗥</span>
            <span className="role-tag">𝗗𝗜𝗦𝗔𝗜𝗚𝗡𝗘𝗥</span>
            <span className="role-tag">𝗘𝗗𝗜𝗧𝗢𝗥</span>
            <span className="role-tag">𝗖𝗢𝗡𝗧𝗘𝗡 𝗖𝗥𝗘𝗔𝗧𝗢𝗥</span>
            <span className="role-tag">𝗠𝗔𝗖𝗔𝗗𝗘𝗣𝗔𝗡𝗠𝗨</span>
          </div>
        </div>

        {/* STATISTIK & KEUNGGULAN */}
        <div className="stats-box">
          <VisitorCounter />
          <div className="stats-title">Total Pelanggan</div>
          <div className="stats-desc">
            GWENSHOP dipercaya oleh ribuan pelanggan untuk kebutuhan produk digital, jasa online, layanan editing, bot,
            akun premium, dan kebutuhan digital lainnya.
          </div>

          <div className="feature-mini-grid">
            <div className="feature-mini">
              <h5><i className="fa-solid fa-bolt"></i> Fast Response</h5>
              <p>Admin siap bantu proses order dan konfirmasi payment kapan saja.</p>
            </div>
            <div className="feature-mini">
              <h5><i className="fa-solid fa-shield-halved"></i> Aman & Terpercaya</h5>
              <p>Payment resmi dan order diarahkan langsung ke kontak owner.</p>
            </div>
            <div className="feature-mini">
              <h5><i className="fa-solid fa-box-open"></i> Produk Lengkap</h5>
              <p>Katalog produk dan jasa dibuat untuk banyak kebutuhan digital.</p>
            </div>
          </div>

          <div className="order-cta-box">
            <p>
              Butuh order cepat?<br />
              Klik produk yang mau isi, detail order, pilih pembayaran, lalu kirim bukti ke WhatsApp Owner.
            </p>
            <Link href="/produk" className="h-btn primary" style={{ display: 'inline-block', maxWidth: 220, margin: '0 auto' }}>
              Mulai Order
            </Link>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer>
        <div className="footer-container">
          <div className="site-brand-name" style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            {brand}
          </div>
          <p style={{ marginBottom: 20 }}>Platform digital terpercaya untuk kebutuhan layanan digital premium.</p>

          <div className="footer-socials">
            <a href={wa ? `https://wa.me/${wa}` : '#'} target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp"></i> WhatsApp
            </a>
            <a href={safeHref(s.instagram_link)} target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-instagram"></i> Instagram
            </a>
            <a href={safeHref(s.telegram_link)} target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-telegram"></i> Telegram
            </a>
          </div>

          <div className="footer-section-title">Kontak Cepat</div>
          <div className="footer-contact-list">
            <div>WhatsApp: <span>{wa || '-'}</span></div>
            <div>WA Cadangan: <span>{s.whatsapp_backup || '-'}</span></div>
            <div>Gmail: <span>{s.email_contact || '-'}</span></div>
          </div>

          <div className="footer-section-title">Menu</div>
          <div className="footer-menu-list">
            <Link href="/produk">Produk & Jasa</Link>
            <a href="#" target="_blank" rel="noopener noreferrer">Partner Resmi</a>
            {s.ynatools_link && <a href={safeHref(s.ynatools_link)}>GWN Tools</a>}
            <Link href="/sosmed">GWN SOSMED</Link>
            <a href={safeHref(s.ynaai_link)} target="_blank" rel="noopener noreferrer">GWN AI</a>
            <a href="#">FAQ</a>
            <a href="#">Kontak</a>
          </div>

          <div className="copyright">
            &copy; 𝟮𝟬𝟮𝟲_𝗽𝗿𝗶𝗺𝗲𝗖𝗧𝗼𝗳𝗳𝗶𝗰𝗶𝗮𝗹<br />All Right Prime Developer 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
