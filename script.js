// Data Default Sistem & Isi Lengkap Sesuai Video YNA Store
const defaultConfig = {
    storeName: "PRIME CT STORE",
    description: "Platform digital terpercaya untuk kebutuhan akun premium, jasa editing, top up game, bot WhatsApp, script bot, panel, VPS, partner, dan layanan digital lainnya.",
    whatsappMain: "0831-7340-3262",
    whatsappBackup: "0831-3867-5899",
    email: "nadbrtpro@gmail.com",
    whatsappGroupLink: "https://chat.whatsapp.com/",
    instagramLink: "https://instagram.com",
    telegramLink: "https://t.me",
    logoUrl: "https://via.placeholder.com/120/9333ea/ffffff?text=PRIME",
    targetCounter: 8929
};

// List Katalog Produk & Jasa Sesuai Isi Video
const defaultProducts = [
    { id: 1, title: "AKUN PREMIUM", desc: "Netflix, Spotify, Canva, ChatGPT, YouTube, dan lainnya.", icon: "fa-crown", price: "Mulai Rp 10.000" },
    { id: 2, title: "EDITING", desc: "Jasa HD, desain, CapCut, Remini, Lightroom, dan paid edit.", icon: "fa-photo-film", price: "Mulai Rp 5.000" },
    { id: 3, title: "BOT WHATSAPP", desc: "Script bot, sewa bot, servis bot, jasa bot, dan fitur WA.", icon: "fa-robot", price: "Mulai Rp 15.000" },
    { id: 4, title: "WEB & PANEL", desc: "Panel, VPS, jasa web, dan kebutuhan server digital.", icon: "fa-globe", price: "Mulai Rp 20.000" },
    { id: 5, title: "PRIME CPANEL", desc: "Kelola hosting, server, dan panel Pterodactyl langsung dari sini.", icon: "fa-display", price: "Mulai Rp 25.000" },
    { id: 6, title: "PRIME CONVERT", desc: "Kompres & convert foto/video langsung dari browser, gratis tiap minggu.", icon: "fa-arrows-rotate", price: "Gratis / Pro" }
];

// Load Data Website
function initStore() {
    const config = JSON.parse(localStorage.getItem('prime_store_config')) || defaultConfig;
    const products = JSON.parse(localStorage.getItem('prime_store_products')) || defaultProducts;

    // Identitas Teks
    document.getElementById('siteTitle').innerText = `${config.storeName} – Digital Store`;
    document.getElementById('navStoreName').innerText = config.storeName;
    document.getElementById('heroStoreName').innerText = config.storeName;
    document.getElementById('popupStoreName').innerText = config.storeName;
    document.getElementById('aboutStoreName').innerText = config.storeName;
    document.getElementById('footerStoreName').innerText = config.storeName;
    document.getElementById('heroDescription').innerText = config.description;

    // Logos
    document.getElementById('navLogo').src = config.logoUrl;
    document.getElementById('storeLogo').src = config.logoUrl;
    document.getElementById('popupLogo').src = config.logoUrl;

    // Detail Kontak
    document.getElementById('waMain').innerText = config.whatsappMain;
    document.getElementById('waBackup').innerText = config.whatsappBackup;
    document.getElementById('emailText').innerText = config.email;

    // Links Action
    const waClean = config.whatsappMain.replace(/[^0-9]/g, '');
    document.getElementById('popupWaBtn').href = config.whatsappGroupLink;
    document.getElementById('ownerWaBtn').href = `https://wa.me/${waClean}`;
    document.getElementById('footerWa').href = `https://wa.me/${waClean}`;
    document.getElementById('footerIg').href = config.instagramLink;
    document.getElementById('footerTg').href = config.telegramLink;

    // Render Produk & Pasang Sistem Klik Modal Order
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    products.forEach(item => {
        const cardHtml = `
            <div class="card-item" onclick="openOrderModal('${item.title}', '${item.desc}', '${item.price}', '${item.icon}')">
                <div class="card-icon">
                    <i class="fa-solid ${item.icon}"></i>
                </div>
                <div class="card-info">
                    <h4>${item.title}</h4>
                    <p>${item.desc}</p>
                </div>
            </div>
        `;
        grid.innerHTML += cardHtml;
    });

    // Jalankan Counter Angka Pelanggan (0 -> 8.929+)
    animateCounter(config.targetCounter);
}

// Sistem Modal Detail Order ketika Kartu Produk Diklik
function openOrderModal(title, desc, price, icon) {
    const config = JSON.parse(localStorage.getItem('prime_store_config')) || defaultConfig;
    const waClean = config.whatsappMain.replace(/[^0-9]/g, '');

    document.getElementById('orderModalTitle').innerText = title;
    document.getElementById('orderModalDesc').innerText = desc;
    document.getElementById('orderModalPrice').innerText = price;
    document.getElementById('orderModalIcon').innerHTML = `<i class="fa-solid ${icon}"></i>`;

    // Pesan otomatis siap kirim ke WhatsApp Owner
    const textWA = encodeURIComponent(`Halo Admin ${config.storeName}, saya ingin order produk/jasa: *${title}*\n\nMohon informasi ketersediaan & metode pembayarannya.`);
    document.getElementById('orderWaActionBtn').href = `https://wa.me/${waClean}?text=${textWA}`;

    document.getElementById('orderModal').style.display = 'flex';
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
}

function closePopup() {
    document.getElementById('popupModal').style.display = 'none';
}

// Animasi Angka Counter Sesuai Video
function animateCounter(target) {
    const counterEl = document.getElementById('counterNum');
    let current = 0;
    const increment = Math.ceil(target / 80);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            counterEl.innerText = target.toLocaleString('id-ID') + "+";
            clearInterval(timer);
        } else {
            counterEl.innerText = current.toLocaleString('id-ID');
        }
    }, 25);
}

document.addEventListener("DOMContentLoaded", initStore);
