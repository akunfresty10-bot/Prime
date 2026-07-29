// Data Default Sesuai Referensi Video
const defaultConfig = {
    storeName: "PRIME CT STORE",
    description: "Platform digital terpercaya untuk kebutuhan akun premium, jasa editing, top up game, bot WhatsApp, script bot, panel, VPS, partner, dan layanan digital lainnya.",
    whatsappMain: "081325507265",
    whatsappBackup: "081325503645",
    email: "primectstore@gmail.com",
    whatsappGroupLink: "https://chat.whatsapp.com/",
    instagramLink: "https://instagram.com",
    telegramLink: "https://t.me",
    logoUrl: "https://via.placeholder.com/120/8b5cf6/ffffff?text=PRIME",
    targetCounter: 8929
};

const defaultProducts = [
    { title: "AKUN PREMIUM", desc: "Netflix, Spotify, Canva, ChatGPT, YouTube, dan lainnya.", icon: "fa-crown" },
    { title: "EDITING", desc: "Jasa HD, desain, CapCut, Remini, Lightroom, dan paid edit.", icon: "fa-masks-theater" },
    { title: "BOT WHATSAPP", desc: "Script bot, sewa bot, servis bot, jasa bot, dan fitur WA.", icon: "fa-robot" },
    { title: "WEB & PANEL", desc: "Panel, VPS, jasa web, dan kebutuhan server digital.", icon: "fa-globe" },
    { title: "PRIME CPANEL", desc: "Kelola hosting, server, dan panel Pterodactyl langsung dari sini.", icon: "fa-display" },
    { title: "PRIME CONVERT", desc: "Kompres & convert foto/video langsung dari browser, gratis tiap minggu.", icon: "fa-arrows-rotate" }
];

// Load Data ke Tampilan
function initStore() {
    const config = JSON.parse(localStorage.getItem('prime_store_config')) || defaultConfig;
    const products = JSON.parse(localStorage.getItem('prime_store_products')) || defaultProducts;

    // Element Identitas
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

    // Contact Details
    document.getElementById('waMain').innerText = config.whatsappMain;
    document.getElementById('waBackup').innerText = config.whatsappBackup;
    document.getElementById('emailText').innerText = config.email;

    // Links
    const waClean = config.whatsappMain.replace(/[^0-9]/g, '');
    document.getElementById('popupWaBtn').href = config.whatsappGroupLink;
    document.getElementById('ownerWaBtn').href = `https://wa.me/${waClean}`;
    document.getElementById('footerWa').href = `https://wa.me/${waClean}`;
    document.getElementById('footerIg').href = config.instagramLink;
    document.getElementById('footerTg').href = config.telegramLink;

    // Render Product Cards
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    products.forEach(p => {
        grid.innerHTML += `
            <div class="card-item">
                <div class="card-icon">
                    <i class="fa-solid ${p.icon}"></i>
                </div>
                <div class="card-info">
                    <h4>${p.title}</h4>
                    <p>${p.desc}</p>
                </div>
            </div>
        `;
    });

    // Jalankan Animasi Counter Angka
    animateCounter(config.targetCounter);
}

// Animasi Hitung Angka Pelanggan (seperti di video)
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

function closePopup() {
    document.getElementById('popupModal').style.display = 'none';
}

document.addEventListener("DOMContentLoaded", initStore);
