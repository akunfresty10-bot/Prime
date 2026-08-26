// ============================================
// SUPABASE CONFIG
// ============================================
const SUPABASE_URL = 'https://krxzhxxytjmqmvzndofw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_BtMu9ACi_o-V29IdGZdIDA_th6tjNzi';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// GLOBAL VARIABLES
// ============================================
let activeWhatsappNumber = '';
let isMusicEnabled = false;
let hasAnimatedHeroText = false; // Flag agar animasi hanya berjalan 1x

// ============================================
// DOM ELEMENTS (SAFE CHECK)
// ============================================
const audioEl = document.getElementById('bg-audio');
const popupClickArea = document.getElementById('popup-click-area');
const waModalOverlay = document.getElementById('wa-modal-overlay');
const paymentModalOverlay = document.getElementById('payment-modal-overlay');
const splashScreen = document.getElementById('splash-screen');

// ============================================
// SPLASH SCREEN FALLBACK (PREVENT STUCK)
// ============================================
function hideSplashScreen() {
  if (splashScreen) {
    splashScreen.classList.add('fade-out');
    splashScreen.style.opacity = '0';
    splashScreen.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      splashScreen.style.display = 'none';
    }, 500);
  }
}

// Fallback otomatis jika halaman selesai dimuat atau melebihi 1.5 detik
window.addEventListener('load', hideSplashScreen);
setTimeout(hideSplashScreen, 1500);

// ============================================
// MODAL FUNCTIONS
// ============================================
function closeWaModal() {
  if (waModalOverlay) waModalOverlay.classList.remove('active');
  // Jalankan animasi teks saat popup WA ditutup
  initHeroTextAnimation();
}

function openPaymentModal() {
  if (paymentModalOverlay) paymentModalOverlay.classList.add('active');
}

function closePaymentModal() {
  if (paymentModalOverlay) paymentModalOverlay.classList.remove('active');
}

function copyText(elementId, btn) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.textContent;
  navigator.clipboard.writeText(text);
  const oldText = btn.textContent;
  btn.textContent = 'Disalin!';
  setTimeout(() => btn.textContent = oldText, 2000);
}

// ============================================
// LOAD SITE SETTINGS FROM SUPABASE
// ============================================
async function loadSiteSettings() {
  try {
    const { data } = await supabaseClient.from('site_settings').select('*');
    if (!data) return;

    let isPopupEnabled = false;
    let groupUrl = '#';

    data.forEach(item => {
      const key = item.key;
      const value = item.value;

      if (key === 'site_title' && value) {
        document.title = value;
        document.querySelectorAll('.site-brand-name').forEach(el => el.textContent = value);
      }

      if (key === 'logo_url' && value) {
        const hLogo = document.getElementById('header-logo');
        const hrLogo = document.getElementById('hero-logo');
        const mLogo = document.getElementById('modal-banner-img');
        const sLogo = document.getElementById('splash-logo');
        if (hLogo) hLogo.src = value;
        if (hrLogo) hrLogo.src = value;
        if (mLogo) mLogo.src = value;
        if (sLogo) sLogo.src = value;
      }

      if (key === 'hero_title' && value) {
        const el = document.getElementById('hero-title');
        if (el) el.textContent = value;
      }
      if (key === 'hero_desc' && value) {
        const el = document.getElementById('hero-desc');
        if (el) el.textContent = value;
      }

      if (key === 'whatsapp_number' && value) {
        activeWhatsappNumber = value;
        const hBtn = document.getElementById('hero-owner-btn');
        const ftWa = document.getElementById('ft-wa');
        const ftWaTxt = document.getElementById('ft-wa-text');
        const payWa = document.getElementById('pay-confirm-wa');
        if (hBtn) hBtn.href = `https://wa.me/${value}`;
        if (ftWa) ftWa.href = `https://wa.me/${value}`;
        if (ftWaTxt) ftWaTxt.textContent = value;
        if (payWa) payWa.href = `https://wa.me/${value}?text=${encodeURIComponent('Halo Admin, saya ingin konfirmasi pembayaran.')}`;
      }

      if (key === 'whatsapp_backup' && value) {
        const el = document.getElementById('ft-wacad-text');
        if (el) el.textContent = value;
      }

      if (key === 'email_contact' && value) {
        const el = document.getElementById('ft-mail-text');
        if (el) el.textContent = value;
      }

      if (key === 'instagram_link' && value) {
        const el = document.getElementById('ft-ig');
        if (el) el.href = value;
      }
      if (key === 'telegram_link' && value) {
        const el = document.getElementById('ft-tg');
        if (el) el.href = value;
      }

      if (key === 'ynacpanel_link' && value) {
        const el = document.getElementById('mn-cpanel');
        if (el) el.href = value;
      }
      if (key === 'ynaai_link' && value) {
        const el = document.getElementById('mn-ai');
        if (el) el.href = value;
      }
      if (key === 'ynatools_link' && value) {
        const el = document.getElementById('mn-tools');
        if (el) el.href = value;
      }

      if (key === 'qris_image_url' && value) {
        const el = document.getElementById('pay-qris-img');
        if (el) el.src = value;
      }
      if (key === 'dana_number' && value) {
        const el = document.getElementById('pay-dana-num');
        if (el) el.textContent = value;
      }
      if (key === 'dana_name' && value) {
        const el = document.getElementById('pay-dana-name');
        if (el) el.textContent = value;
      }
      if (key === 'gopay_number' && value) {
        const el = document.getElementById('pay-gopay-num');
        if (el) el.textContent = value;
      }
      if (key === 'gopay_name' && value) {
        const el = document.getElementById('pay-gopay-name');
        if (el) el.textContent = value;
      }

      if (key === 'popup_enabled') {
        isPopupEnabled = (value === 'true');
      }
      if (key === 'popup_title' && value) {
        const el = document.getElementById('modal-popup-title');
        if (el) el.textContent = value;
      }
      if (key === 'popup_desc' && value) {
        const el = document.getElementById('modal-popup-desc');
        if (el) el.textContent = value;
      }
      if (key === 'wa_group_link' && value) {
        groupUrl = value;
        const el = document.getElementById('modal-group-btn');
        if (el) el.href = value;
      }

      if (key === 'bg_music_url' && value) {
        if (audioEl) audioEl.src = value;
      }
      if (key === 'bg_music_enabled') {
        isMusicEnabled = (value === 'true');
      }
    });

    setTimeout(() => {
      hideSplashScreen();

      if (isPopupEnabled && groupUrl !== '#' && waModalOverlay) {
        setTimeout(() => {
          waModalOverlay.classList.add('active');
        }, 400);
      } else {
        initHeroTextAnimation();
      }
    }, 1500);
  } catch (err) {
    console.error('Gagal memuat pengaturan situs:', err);
    hideSplashScreen();
  }
}

if (popupClickArea) {
  popupClickArea.addEventListener('click', () => {
    if (isMusicEnabled && audioEl && audioEl.paused) {
      audioEl.play().catch(() => {});
    }
  });
}

loadSiteSettings();

// ============================================
// TYPEWRITER ANIMATION & STAGGERED CASCADE
// ============================================
function initHeroTextAnimation() {
  if (hasAnimatedHeroText) return;

  const welcomeEl = document.querySelector('.hero-welcome');
  const titleEl = document.getElementById('hero-title');

  if (!welcomeEl && !titleEl) return;
  hasAnimatedHeroText = true;

  const cascadeElements = document.querySelectorAll(
    '.hero-desc, .h-btn, .section-header-title, .section-main-title, .category-card, .about-box, .stats-box'
  );
  cascadeElements.forEach(el => el.classList.add('cascade-item'));

  const setupLetters = (el) => {
    if (!el) return { text: '', spans: [] };
    const text = el.textContent.trim() || el.innerText.trim();
    if (!text) return { text: '', spans: [] };

    el.textContent = ''; 
    const spans = [...text].map(char => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char; 
      span.classList.add('char-anim');
      el.appendChild(span);
      return span;
    });
    return { text, spans };
  };

  const welcomeData = setupLetters(welcomeEl);
  const titleData = setupLetters(titleEl);

  const typingSpeed = 0.12; 

  welcomeData.spans.forEach((span, index) => {
    span.style.animationDelay = `${index * typingSpeed}s`;
  });

  const welcomeDuration = welcomeData.spans.length * typingSpeed;

  titleData.spans.forEach((span, index) => {
    span.style.animationDelay = `${welcomeDuration + (index * typingSpeed)}s`;
  });

  const totalTypingTime = (welcomeDuration + (titleData.spans.length * typingSpeed) + 0.2) * 1000;

  setTimeout(() => {
    cascadeElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('show-cascade');
      }, index * 120);
    });
  }, totalTypingTime);
}

// ============================================
// LOGIKA ANGKA PENGUNJUNG OTOMATIS (+1) & ANIMASI SCROLL
// ============================================
async function updateVisitorCount() {
  const countEl = document.getElementById('stats-visitor-count');
  if (!countEl) return;

  // Tampilkan dulu angka terakhir yang tersimpan di browser (fallback),
  // supaya kalau request ke Supabase lambat/gagal, angka TIDAK terlihat balik ke 0.
  const cachedCount = parseInt(localStorage.getItem('cachedVisitorCount'), 10);
  if (!isNaN(cachedCount)) {
    countEl.textContent = `${cachedCount.toLocaleString('id-ID')}+`;
  }

  try {
    // Increment dilakukan langsung di database (atomic), bukan baca-lalu-tulis dari browser.
    // Ini mencegah angka tertimpa jadi kecil/0 kalau proses baca sempat gagal.
    const { data: newCount, error } = await supabaseClient.rpc('increment_total_visitors');

    if (error || newCount === null || newCount === undefined) {
      console.error('Gagal memperbarui pengunjung, angka lama dipertahankan:', error);
      return; // JANGAN tulis apapun ke DB atau ke tampilan kalau gagal
    }

    // Simpan sebagai cache lokal agar tidak pernah tampil turun/0 di kunjungan berikutnya
    localStorage.setItem('cachedVisitorCount', newCount.toString());

    countEl.textContent = '0+';

    const startCounterAnimation = (targetNumber) => {
      const duration = 2000;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        const currentVal = Math.floor(easeProgress * targetNumber);

        countEl.textContent = `${currentVal.toLocaleString('id-ID')}+`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          countEl.textContent = `${targetNumber.toLocaleString('id-ID')}+`;
        }
      };

      requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounterAnimation(newCount);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(countEl);

  } catch (err) {
    console.error('Gagal memperbarui pengunjung:', err);
  }
}

document.addEventListener('DOMContentLoaded', updateVisitorCount);
