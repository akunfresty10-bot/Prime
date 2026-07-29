// Data Default awal (Apabila Admin belum menyetting)
const defaultSettings = {
    storeName: "PRIME CT STORE",
    description: "Platform digital terpercaya untuk kebutuhan akun premium, jasa editing, top up game, bot WhatsApp, script bot, panel, VPS, partner, dan layanan digital lainnya.",
    whatsappOwner: "628123456789",
    whatsappGroup: "https://chat.whatsapp.com/",
    instagram: "https://instagram.com",
    telegram: "https://t.me",
    logoUrl: "https://via.placeholder.com/120/8b5cf6/ffffff?text=PRIME",
    totalCustomers: "8.900+"
};

const defaultProducts = [
    { title: "AKUN PREMIUM", desc: "Netflix, Spotify, Canva, ChatGPT, YouTube, dll.", icon: "fa-crown" },
    { title: "EDITING", desc: "Jasa HD, desain, CapCut, Remini, Lightroom, dan paid edit.", icon: "fa-photo-film" },
    { title: "BOT WHATSAPP", desc: "Script bot, sewa bot, servis bot, jasa bot, dan fitur WA.", icon: "fa-robot" },
    { title: "WEB & PANEL", desc: "Panel, VPS, jasa web, dan kebutuhan server digital.", icon: "fa-globe" },
    { title: "PRIME CPANEL", desc: "Kelola hosting, server, dan panel Pterodactyl langsung dari sini.", icon: "fa-server" }
];

// Fungsi Muat Data dari LocalStorage
function loadWebsiteData() {
    const savedConfig = JSON.parse(localStorage.getItem('prime_store_config')) || defaultSettings;
    const savedProducts = JSON.parse(localStorage.getItem('prime_store_products')) || defaultProducts;

    // Set Text & Informasi Toko
    document.getElementById('siteTitle').innerText = `${savedConfig.storeName} - Digital Platform`;
    document.getElementById('heroStoreName').innerText = savedConfig.storeName;
    document.getElementById('popupStoreName').innerText = savedConfig.storeName;
    document.getElementById('aboutStoreName').innerText = savedConfig.storeName;
    document.getElementById('footerStoreName').innerText = savedConfig.storeName;
    document.getElementById('copyrightName').innerText = savedConfig.storeName;
    
    document.getElementById('heroDescription').innerText = savedConfig.description;
    document.getElementById('totalCustomers').innerText = savedConfig.totalCustomers;

    // Set Links
    document.getElementById('popupWaBtn').href = savedConfig.whatsappGroup;
    document.getElementById('ownerWaBtn').href = `https://wa.me/${savedConfig.whatsappOwner}`;
    document.getElementById('footerWa').href = `https://wa.me/${savedConfig.whatsappOwner}`;
    document.getElementById('footerIg').href = savedConfig.instagram;
    document.getElementById('footerTg').href = savedConfig.telegram;

    // Set Logos
    document.getElementById('storeLogo').src = savedConfig.logoUrl;
    document.getElementById('popupLogo').src = savedConfig.logoUrl;

    // Render List Produk / Kategori
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = '';

    savedProducts.forEach(item => {
        const cardHtml = `
            <div class="card">
                <div class="card-icon">
                    <i class="fa-solid ${item.icon || 'fa-box'}"></i>
                </div>
                <div class="card-info">
                    <h4>${item.title}</h4>
                    <p>${item.desc}</p>
                </div>
            </div>
        `;
        productGrid.innerHTML += cardHtml;
    });
}

// Fungsi Tutup Popup
function closePopup() {
    document.getElementById('popupModal').style.display = 'none';
}

// Jalankan saat halaman dibuka
document.addEventListener("DOMContentLoaded", loadWebsiteData);
