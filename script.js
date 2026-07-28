// PRIME CT OFFICIAL — shared behavior

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
      window.open(`https://wa.me/6281200000000?text=${msg}`, '_blank');
    });
  }
});
