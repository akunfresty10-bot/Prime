const defaultConfig = {
    storeName: "PRIME CT STORE",
    description: "Platform digital terpercaya untuk kebutuhan akun premium, jasa editing, top up game, bot WhatsApp, script bot, panel, VPS, partner, dan layanan digital lainnya.",
    whatsappMain: "0831-7340-3262",
    email: "primectstore@gmail.com",
    whatsappGroupLink: "https://chat.whatsapp.com/",
    instagramLink: "https://instagram.com",
    telegramLink: "https://t.me",
    logoUrl: "https://via.placeholder.com/120/9333ea/ffffff?text=PRIME",
    targetCounter: 8929
};

const defaultProducts = [
    { id: 1, title: "AKUN PREMIUM", desc: "Netflix, Spotify, Canva, ChatGPT, YouTube Premium.", icon: "fa-crown", price: "Mulai Rp 10.000" },
    { id: 2, title: "JASA EDITING HD", desc: "Jasa HD foto/video, desain grafis, Remini, Lightroom.", icon: "fa-wand-magic-sparkles", price: "Mulai Rp 5.000" },
    { id: 3, title: "BOT WHATSAPP", desc: "Script bot WA, sewa bot grup, servis bot & fitur custom.", icon: "fa-robot", price: "Mulai Rp 15.000" },
    { id: 4, title: "WEB & PANEL", desc: "Sewa Panel Pterodactyl, VPS Linux, dan Jasa Buat Web.", icon: "fa-server", price: "Mulai Rp 20.000" },
    { id: 5, title: "PRIME CONVERT", desc: "Jasa kompresi & konversi dokumen/media instan.", icon: "fa-rotate", price: "Mulai Rp 3.000" }
];

function initStore() {
    const config = JSON.parse(localStorage.getItem('prime_store_config')) || defaultConfig;
    const products = JSON.parse(localStorage.getItem('prime_store_products')) || defaultProducts;

    document.getElementById('siteTitle').innerText = `${config.storeName} - Official Digital Store`;
    document.getElementById('navStoreName').innerText = config.storeName;
    document.getElementById('heroStoreName').innerHTML = `${config.storeName} <i class="fa-solid fa-circle-check verified-badge"></i>`;
    document.getElementById('popupStoreName').innerText = config.storeName;
    document.getElementById('aboutStoreName').innerText = config.storeName;
    document.getElementById('footerStoreName').innerText = config.storeName;
    document.getElementById('heroDescription').innerText = config.description;

    document.getElementById('navLogo').src = config.logoUrl;
    document.getElementById('storeLogo').src = config.logoUrl;
    document.getElementById('popupLogo').src = config.logoUrl;

    document.getElementById('waMain').innerText = config.whatsappMain;
    document.getElementById('emailText').innerText = config.email;

    const waClean = config.whatsappMain.replace(/[^0-9]/g, '');
    document.getElementById('popupWaBtn').href = config.whatsappGroupLink;
    document.getElementById('ownerWaBtn').href = `https://wa.me/${waClean}`;
    document.getElementById('ctaWaBtn').href = `https://wa.me/${waClean}?text=Halo%20Admin,%20saya%20ingin%20konsultasi%20project`;
    document.getElementById('footerWa').href = `https://wa.me/${waClean}`;
    document.getElementById('footerIg').href = config.instagramLink;
    document.getElementById('footerTg').href = config.telegramLink;

    // Render Products
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    products.forEach(p => {
        const itemHtml = `
            <div class="card-item" onclick="openProductModal('${p.title}', '${p.desc}', '${p.price}', '${p.icon}')">
                <div class="card-icon">
                    <i class="fa-solid ${p.icon}"></i>
                </div>
                <div class="card-info">
                    <h4>${p.title}</h4>
                    <p>${p.desc}</p>
                </div>
            </div>
        `;
        grid.innerHTML += itemHtml;
    });

    animateCounter(config.targetCounter);
}

function openProductModal(title, desc, price, icon) {
    const config = JSON.parse(localStorage.getItem('prime_store_config')) || defaultConfig;
    const waClean = config.whatsappMain.replace(/[^0-9]/g, '');
    
    document.getElementById('modalProductTitle').innerText = title;
    document.getElementById('modalProductDesc').innerText = desc;
    document.getElementById('modalProductPrice').innerText = price;
    document.getElementById('modalProductIcon').innerHTML = `<i class="fa-solid ${icon}"></i>`;
    
    const waMessage = encodeURIComponent(`Halo Admin ${config.storeName}, saya mau order: *${title}* (${price})`);
    document.getElementById('modalOrderWaBtn').href = `https://wa.me/${waClean}?text=${waMessage}`;
    
    document.getElementById('productModal').style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

function closePopup() {
    document.getElementById('popupModal').style.display = 'none';
}

function animateCounter(target) {
    const counterEl = document.getElementById('counterNum');
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            counterEl.innerText = target.toLocaleString('id-ID') + "+";
            clearInterval(timer);
        } else {
            counterEl.innerText = current.toLocaleString('id-ID');
        }
    }, 30);
}

document.addEventListener("DOMContentLoaded", initStore);
