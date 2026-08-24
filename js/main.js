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

// ============================================
// DOM ELEMENTS
// ============================================
const audioEl = document.getElementById('bg-audio');
const popupClickArea = document.getElementById('popup-click-area');
const waModalOverlay = document.getElementById('wa-modal-overlay');
const paymentModalOverlay = document.getElementById('payment-modal-overlay');
const splashScreen = document.getElementById('splash-screen');

// ============================================
// MODAL FUNCTIONS
// ============================================
function closeWaModal() {
  waModalOverlay.classList.remove('active');
}

function openPaymentModal() {
  paymentModalOverlay.classList.add('active');
}

function closePaymentModal() {
  paymentModalOverlay.classList.remove('active');
}

function copyText(elementId, btn) {
  const text = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(text);
  const oldText = btn.textContent;
  btn.textContent = 'Disalin!';
  setTimeout(() => btn.textContent = oldText, 2000);
}

// ============================================
// LOAD SITE SETTINGS FROM SUPABASE
// ============================================
async function loadSiteSettings() {
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
      document.getElementById('header-logo').src = value;
      document.getElementById('hero-logo').src = value;
      document.getElementById('modal-banner-img').src = value;
      document.getElementById('splash-logo').src = value;
    }

    if (key === 'hero_title' && value) {
      document.getElementById('hero-title').textContent = value;
    }
    if (key === 'hero_desc' && value) {
      document.getElementById('hero-desc').textContent = value;
    }

    if (key === 'whatsapp_number' && value) {
      activeWhatsappNumber = value;
      document.getElementById('hero-owner-btn').href = `https://wa.me/${value}`;
      document.getElementById('ft-wa').href = `https://wa.me/${value}`;
      document.getElementById('ft-wa-text').textContent = value;
      document.getElementById('pay-confirm-wa').href = 
        `https://wa.me/${value}?text=${encodeURIComponent('Halo Admin, saya ingin konfirmasi pembayaran.')}`;
    }

    if (key === 'whatsapp_backup' && value) {
      document.getElementById('ft-wacad-text').textContent = value;
    }

    if (key === 'email_contact' && value) {
      document.getElementById('ft-mail-text').textContent = value;
    }

    if (key === 'instagram_link' && value) {
      document.getElementById('ft-ig').href = value;
    }
    if (key === 'telegram_link' && value) {
      document.getElementById('ft-tg').href = value;
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
      document.getElementById('pay-qris-img').src = value;
    }
    if (key === 'dana_number' && value) {
      document.getElementById('pay-dana-num').textContent = value;
    }
    if (key === 'dana_name' && value) {
      document.getElementById('pay-dana-name').textContent = value;
    }
    if (key === 'gopay_number' && value) {
      document.getElementById('pay-gopay-num').textContent = value;
    }
    if (key === 'gopay_name' && value) {
      document.getElementById('pay-gopay-name').textContent = value;
    }

    if (key === 'popup_enabled') {
      isPopupEnabled = (value === 'true');
    }
    if (key === 'popup_title' && value) {
      document.getElementById('modal-popup-title').textContent = value;
    }
    if (key === 'popup_desc' && value) {
      document.getElementById('modal-popup-desc').textContent = value;
    }
    if (key === 'wa_group_link' && value) {
      groupUrl = value;
      document.getElementById('modal-group-btn').href = value;
    }

    if (key === 'bg_music_url' && value) {
      audioEl.src = value;
    }
    if (key === 'bg_music_enabled') {
      isMusicEnabled = (value === 'true');
    }
  });

  setTimeout(() => {
    if (splashScreen) {
      splashScreen.classList.add('fade-out');
    }
    if (isPopupEnabled && groupUrl !== '#') {
      setTimeout(() => {
        waModalOverlay.classList.add('active');
      }, 400);
    }
  }, 1500);
}

if (popupClickArea) {
  popupClickArea.addEventListener('click', () => {
    if (isMusicEnabled && audioEl.paused) {
      audioEl.play().catch(() => {});
    }
  });
}

loadSiteSettings();
