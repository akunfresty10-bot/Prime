// PRIME CT OFFICIAL — shared behavior

// ---------- Supabase: live settings (logo & nomor WhatsApp) ----------
const SUPABASE_URL = 'https://krxzhxxytjmqmvzndofw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_BtMu9ACi_o-V29IdGZdIDA_th6tjNzi';
const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let liveWaNumber = '6281325507265'; // fallback, ditimpa setelah data Supabase masuk

async function applyLiveSettings() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('settings')
      .select('logo_url, whatsapp_number, store_name')
      .eq('id', 1)
      .single();
    if (error || !data) return;

    if (data.logo_url) {
      document.querySelectorAll('.mark').forEach(el => {
        el.innerHTML = `<img src="${data.logo_url}" alt="PRIME CT" class="mark-logo-img">`;
      });
      document.querySelectorAll('.modal-icon').forEach(el => {
        el.innerHTML = `<img src="${data.logo_url}" alt="PRIME CT" class="modal-logo-img">`;
      });
    }

    if (data.whatsapp_number) {
      liveWaNumber = data.whatsapp_number;
      document.querySelectorAll('a[href*="wa.me/"]').forEach(a => {
        a.href = a.href.replace(/wa\.me\/\d+/, `wa.me/${data.whatsapp_number}`);
      });
    }
  } catch (e) {
    console.error('Gagal memuat setting live dari Supabase', e);
  }
}
document.addEventListener('DOMContentLoaded', applyLiveSettings);

// live clock in status bar
function tickClock(){
  const el = document.getElementById('clock');
  if(!el) return;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const ss = String(now.getSeconds()).padStart(2,'0');
  el.textContent = `${hh}:${mm}:${ss} WIB`;
}
setInterval(tickClock, 1000);
tickClock();

// mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const navlinks = document.querySelector('.navlinks');
  if(burger && navlinks){
    burger.addEventListener('click', () => {
      const open = navlinks.style.display === 'flex';
      navlinks.style.display = open ? 'none' : 'flex';
      navlinks.style.cssText += `
        position:absolute; top:72px; left:0; right:0;
        flex-direction:column; background:#12151C;
        border-bottom:1px solid #2E3644; padding:20px 24px; gap:18px;
      `;
      navlinks.style.display = open ? 'none' : 'flex';
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if(!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if(!isOpen) item.classList.add('open');
    });
  });

  // copy-to-clipboard buttons (payment numbers)
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      navigator.clipboard?.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = 'Tersalin ✓';
        setTimeout(() => { btn.textContent = original; }, 1500);
      });
    });
  });

  // product filter (produk.html)
  const filters = document.querySelectorAll('.filter');
  const products = document.querySelectorAll('.product');
  if(filters.length && products.length){
    filters.forEach(f => {
      f.addEventListener('click', () => {
        filters.forEach(x => x.classList.remove('active'));
        f.classList.add('active');
        const cat = f.getAttribute('data-filter');
        products.forEach(p => {
          const match = cat === 'all' || p.getAttribute('data-cat') === cat;
          p.style.display = match ? 'flex' : 'none';
        });
      });
    });
  }

  // simple order form -> redirect to WhatsApp with prefilled message
  const form = document.querySelector('.order-form');
  if(form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nama = form.querySelector('#f-nama')?.value || '-';
      const produk = form.querySelector('#f-produk')?.value || '-';
      const detail = form.querySelector('#f-detail')?.value || '-';
      const msg = `Halo PRIME CT, saya mau order.%0ANama: ${encodeURIComponent(nama)}%0AProduk: ${encodeURIComponent(produk)}%0ADetail: ${encodeURIComponent(detail)}`;
      window.open(`https://wa.me/${liveWaNumber}?text=${msg}`, '_blank');
    });
  }

  // ---------- sidebar drawer ----------
  const sidebar = document.querySelector('.sidebar');
  const sidebarOverlay = document.querySelector('.sidebar-overlay');
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebarClose = document.querySelector('.sidebar-close');
  function openSidebar(){ sidebar?.classList.add('open'); sidebarOverlay?.classList.add('open'); }
  function closeSidebar(){ sidebar?.classList.remove('open'); sidebarOverlay?.classList.remove('open'); }
  sidebarToggle?.addEventListener('click', openSidebar);
  sidebarClose?.addEventListener('click', closeSidebar);
  sidebarOverlay?.addEventListener('click', closeSidebar);

  // ---------- WA join-group popup (shows once per session) ----------
  const waPopup = document.getElementById('wa-popup');
  if(waPopup){
    if(!sessionStorage.getItem('primect_wa_popup_seen')){
      setTimeout(() => waPopup.classList.add('open'), 600);
    }
    waPopup.querySelectorAll('[data-close-popup]').forEach(btn => {
      btn.addEventListener('click', () => {
        waPopup.classList.remove('open');
        sessionStorage.setItem('primect_wa_popup_seen', '1');
      });
    });
  }

  // ---------- generic modal openers/closers (e.g. QRIS zoom) ----------
  document.querySelectorAll('[data-modal-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector(btn.getAttribute('data-modal-target'))?.classList.add('open');
    });
  });
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay')?.classList.remove('open');
    });
  });

  // ---------- auth tabs (login/register) ----------
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(target)?.classList.add('active');
    });
  });
  const authForm = document.querySelector('.auth-form');
  if(authForm){
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Fitur akun belum aktif — sistem login memerlukan server terpisah. Untuk saat ini, order tetap lewat WhatsApp admin.');
    });
  }

  // ---------- AI assistant (simple keyword-based FAQ bot) ----------
  const chatLog = document.getElementById('chat-log');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const KB = [
    { keys:['order','beli','pesan'], reply:'Untuk order: buka halaman Produk & Jasa, pilih produk, klik tombol Order, lalu lanjutkan detail dan pembayaran lewat WhatsApp admin.' },
    { keys:['bayar','payment','qris','dana','gopay'], reply:'Metode pembayaran yang tersedia: QRIS, DANA, dan GoPay. Setelah transfer, kirim bukti ke WhatsApp admin.' },
    { keys:['harga','price'], reply:'Harga tiap produk beda-beda, cek langsung di halaman Produk & Jasa ya — tiap kartu produk sudah ada harganya.' },
    { keys:['lama','proses','berapa hari','estimasi'], reply:'Akun premium & top up game biasanya instan-24 jam. Jasa editing dan bot custom estimasinya tertera di masing-masing produk.' },
    { keys:['garansi'], reply:'Setiap produk punya garansi replace kalau bermasalah, sesuai ketentuan yang diinfokan admin saat order.' },
    { keys:['bot','whatsapp bot','sewa bot'], reply:'Kami menyediakan sewa bot WhatsApp siap pakai dan script bot full source. Cek kategori "Bot WhatsApp" di halaman Produk & Jasa.' },
    { keys:['kontak','admin','hubungi'], reply:'Kamu bisa hubungi admin langsung lewat halaman Kontak atau tombol WhatsApp di bagian atas situs.' },
  ];
  function botReply(text){
    const lower = text.toLowerCase();
    const hit = KB.find(item => item.keys.some(k => lower.includes(k)));
    return hit ? hit.reply : 'Maaf, aku belum paham pertanyaan itu. Coba tanya soal cara order, pembayaran, harga, estimasi proses, atau garansi — atau langsung hubungi admin lewat WhatsApp.';
  }
  function addMsg(text, who){
    if(!chatLog) return;
    const div = document.createElement('div');
    div.className = `msg ${who}`;
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }
  function sendChat(){
    const val = chatInput?.value.trim();
    if(!val) return;
    addMsg(val, 'user');
    chatInput.value = '';
    setTimeout(() => addMsg(botReply(val), 'bot'), 400);
  }
  chatSend?.addEventListener('click', sendChat);
  chatInput?.addEventListener('keydown', (e) => { if(e.key === 'Enter') sendChat(); });
  document.querySelectorAll('.chat-suggest button').forEach(btn => {
    btn.addEventListener('click', () => {
      if(chatInput){ chatInput.value = btn.textContent; sendChat(); }
    });
  });

  // ---------- convert tool (client-side image resize/compress) ----------
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('convert-file');
  const convertPreview = document.getElementById('convert-preview');
  if(dropZone && fileInput){
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxW = 800;
          const scale = Math.min(1, maxW / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          convertPreview.innerHTML = `
            <div>
              <p style="font-family:var(--font-mono); font-size:0.7rem; color:var(--muted); margin-bottom:6px;">Sebelum</p>
              <img src="${ev.target.result}">
            </div>
            <div>
              <p style="font-family:var(--font-mono); font-size:0.7rem; color:var(--accent); margin-bottom:6px;">Sesudah (JPG, dikompres)</p>
              <img src="${compressed}">
            </div>
            <a href="${compressed}" download="convert-primect.jpg" class="btn small">Download Hasil</a>
          `;
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
});
