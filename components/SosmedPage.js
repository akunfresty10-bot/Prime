'use client';

import Link from 'next/link';
import '@/styles/sosmed.css';
import { useSiteSettings } from '@/lib/useSiteSettings';
import { PLACEHOLDER, safeHref } from '@/lib/utils';

const SOCIAL_PLATFORMS = {
  whatsapp: { icon: 'fa-brands fa-whatsapp', label: 'WhatsApp', cls: 'icon-whatsapp' },
  wa_channel: { icon: 'fa-brands fa-whatsapp', label: 'Saluran WhatsApp', cls: 'icon-wa-channel' },
  instagram: { icon: 'fa-brands fa-instagram', label: 'Instagram', cls: 'icon-instagram' },
  telegram: { icon: 'fa-brands fa-telegram', label: 'Telegram', cls: 'icon-telegram' },
  youtube: { icon: 'fa-brands fa-youtube', label: 'YouTube', cls: 'icon-youtube' },
  tiktok: { icon: 'fa-brands fa-tiktok', label: 'TikTok', cls: 'icon-tiktok' },
  twitter: { icon: 'fa-brands fa-twitter', label: 'Twitter / X', cls: 'icon-twitter' },
  facebook: { icon: 'fa-brands fa-facebook', label: 'Facebook', cls: 'icon-facebook' },
  github: { icon: 'fa-brands fa-github', label: 'GitHub', cls: 'icon-github' },
  linkedin: { icon: 'fa-brands fa-linkedin', label: 'LinkedIn', cls: 'icon-linkedin' },
  discord: { icon: 'fa-brands fa-discord', label: 'Discord', cls: 'icon-discord' },
  spotify: { icon: 'fa-brands fa-spotify', label: 'Spotify', cls: 'icon-spotify' },
  website: { icon: 'fa-solid fa-globe', label: 'Website', cls: 'icon-website' },
};

export default function SosmedPage() {
  const { settings: s, loaded, hasData } = useSiteSettings();

  const bg = s.bg_media_url;
  const isVideo = bg && (bg.endsWith('.mp4') || bg.includes('video'));

  const links = Object.entries(SOCIAL_PLATFORMS)
    .map(([key, platform]) => ({ key, platform, url: (s[`sosmed_${key}`] || '').trim() }))
    .filter((l) => l.url !== '');

  return (
    <div className="page-sosmed">
      <div id="bg-video-container">
        <div id="bg-media-slot">
          {bg &&
            (isVideo ? (
              <video key={bg} autoPlay muted loop playsInline>
                <source src={bg} type="video/mp4" />
              </video>
            ) : (
              <img src={bg} alt="Background" />
            ))}
        </div>
      </div>

      <Link href="/" className="back-btn">
        <i className="fa-solid fa-arrow-left"></i> Kembali
      </Link>

      <div className="sosmed-container">
        <div className="sosmed-logo">
          <img src={s.logo_url || PLACEHOLDER} alt="Logo" />
        </div>
        <h1 className="sosmed-title">GWENSHOP</h1>
        <p className="sosmed-subtitle">Ikuti kami di semua platform sosial media</p>

        <div className="sosmed-grid">
          {!loaded && (
            <div className="loading-text">
              <i className="fa-solid fa-spinner fa-spin"></i> Memuat link...
            </div>
          )}

          {loaded && !hasData && (
            <p style={{ color: 'var(--text-sub)' }}>Gagal memuat link.</p>
          )}

          {loaded && hasData && links.length === 0 && (
            <div
              style={{
                background: 'rgba(20,25,45,0.65)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: 16,
                padding: '30px 20px',
                textAlign: 'center',
              }}
            >
              <i
                className="fa-solid fa-link"
                style={{ fontSize: '2rem', color: 'var(--text-sub)', marginBottom: 12, display: 'block' }}
              ></i>
              <p style={{ color: 'var(--text-sub)' }}>Belum ada link sosial media yang ditambahkan.</p>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.8rem', marginTop: 6 }}>
                Silakan kelola melalui Admin Panel.
              </p>
            </div>
          )}

          {links.map(({ key, platform, url }) => (
            <a
              key={key}
              href={safeHref(url)}
              target="_blank"
              rel="noopener noreferrer"
              className="sosmed-card"
            >
              <div className={`sosmed-icon ${platform.cls}`}>
                <i className={platform.icon}></i>
              </div>
              <div className="sosmed-info">
                <h4>{platform.label}</h4>
                <p>{url.replace(/^https?:\/\//, '').split('/')[0]}</p>
              </div>
              <div className="sosmed-arrow">
                <i className="fa-solid fa-chevron-right"></i>
              </div>
            </a>
          ))}
        </div>

        <div className="footer-sosmed">&copy; © 2026 primeCTofficial - All Rights Reserved</div>
      </div>
    </div>
  );
}
