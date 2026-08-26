// ============================================
// PRIME TOOLS FRONTEND LOGIC & INTEGRATION
// ============================================

// URL Endpoint Backend Serverless / API Route milikmu
const TOOLS_API_ENDPOINT = '/api/removebg'; // Sesuaikan lokasi endpoint backend kamu

// ============================================
// DAFTAR EKOSISTEM TOOLS
// ============================================
// Untuk menambah tools baru nanti: cukup tambah 1 object di sini.
// - id            : dipakai sebagai "mode" yang dikirim ke backend
// - name / desc   : ditampilkan di kartu hub & header workspace
// - icon          : class Font Awesome
// - color         : warna aksen kartu & icon
// - available     : false = tampil sebagai "Segera Hadir" (kartu nonaktif, belum bisa diklik)
// - optionsId     : id elemen opsi (di dalam form) yang ditampilkan khusus untuk tool ini, boleh null
// - btnLabel      : teks pada tombol submit saat tool ini aktif
const TOOLS_CONFIG = [
  {
    id: 'removebg',
    name: 'Hapus Background',
    desc: 'Hilangkan background foto secara otomatis jadi transparan dalam hitungan detik.',
    icon: 'fa-wand-magic-sparkles',
    color: '#38bdf8',
    available: true,
    optionsId: 'options-removebg',
    btnLabel: 'Proses Hapus Background'
  },
  {
    id: 'upscale',
    name: 'Upscale Gambar',
    desc: 'Perbesar resolusi & pertajam detail gambar tanpa pecah atau blur.',
    icon: 'fa-expand',
    color: '#a855f7',
    available: true,
    optionsId: 'options-upscale',
    btnLabel: 'Proses Upscale Gambar'
  },
  {
    id: 'compress',
    name: 'Kompres Gambar',
    desc: 'Perkecil ukuran file gambar tanpa mengorbankan kualitas secara signifikan.',
    icon: 'fa-file-zipper',
    color: '#22c55e',
    available: false,
    optionsId: null,
    btnLabel: 'Proses Kompres Gambar'
  },
  {
    id: 'convert',
    name: 'Convert Format',
    desc: 'Ubah format gambar (JPG, PNG, WEBP) sesuai kebutuhan kamu.',
    icon: 'fa-arrows-rotate',
    color: '#f59e0b',
    available: false,
    optionsId: null,
    btnLabel: 'Proses Convert Gambar'
  }
];

let currentMode = 'removebg';
let selectedImageSource = null; // Bisa berupa string Base64 atau URL

// ============================================
// 0. RENDER HUB (KARTU PILIHAN TOOLS)
// ============================================
function renderToolsHub() {
  const grid = document.getElementById('tools-hub-grid');
  if (!grid) return;

  grid.innerHTML = TOOLS_CONFIG.map(tool => `
    <div
      class="tool-hub-card${tool.available ? '' : ' disabled'}"
      style="--tool-accent: ${tool.color};"
      onclick="${tool.available ? `openToolWorkspace('${tool.id}')` : ''}"
    >
      ${!tool.available ? `<span class="tool-hub-badge soon">SEGERA HADIR</span>` : ''}
      <div class="tool-hub-icon"><i class="fa-solid ${tool.icon}"></i></div>
      <div class="tool-hub-name">${tool.name}</div>
      <div class="tool-hub-desc">${tool.desc}</div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', renderToolsHub);

// ============================================
// 1. Buka Workspace Tool Tertentu (dari klik kartu hub)
// ============================================
function openToolWorkspace(toolId) {
  const tool = TOOLS_CONFIG.find(t => t.id === toolId);
  if (!tool || !tool.available) return;

  currentMode = tool.id;
  resetToolForm();

  // Tampilkan opsi form yang relevan untuk tool ini, sembunyikan sisanya
  TOOLS_CONFIG.forEach(t => {
    if (!t.optionsId) return;
    const el = document.getElementById(t.optionsId);
    if (el) el.style.display = (t.id === tool.id) ? 'grid' : 'none';
  });

  // Update header workspace
  const iconEl = document.getElementById('workspace-icon');
  const titleEl = document.getElementById('workspace-title');
  const subtitleEl = document.getElementById('workspace-subtitle');
  const btnLabel = document.getElementById('btn-label-text');

  if (iconEl) {
    iconEl.style.setProperty('--tool-accent', tool.color);
    iconEl.innerHTML = `<i class="fa-solid ${tool.icon}"></i>`;
  }
  if (titleEl) titleEl.textContent = tool.name;
  if (subtitleEl) subtitleEl.textContent = tool.desc;
  if (btnLabel) btnLabel.textContent = tool.btnLabel;

  // Pindah tampilan: sembunyikan hub, tampilkan workspace
  const hubView = document.getElementById('tools-hub-view');
  const workspaceView = document.getElementById('tools-workspace-view');
  if (hubView) hubView.style.display = 'none';
  if (workspaceView) workspaceView.style.display = 'block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 2. Kembali ke Hub (Daftar Tools)
function backToToolsHub() {
  const hubView = document.getElementById('tools-hub-view');
  const workspaceView = document.getElementById('tools-workspace-view');
  if (workspaceView) workspaceView.style.display = 'none';
  if (hubView) hubView.style.display = 'block';

  resetToolForm();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Reset form & hasil setiap ganti/masuk tool
function resetToolForm() {
  selectedImageSource = null;

  const form = document.getElementById('form-tool');
  if (form) form.reset();

  const uploadLabel = document.getElementById('upload-text-label');
  if (uploadLabel) uploadLabel.textContent = 'Klik atau Drag & Drop gambar ke sini';

  const resultBox = document.getElementById('tools-result-box');
  if (resultBox) resultBox.style.display = 'none';
}

// 2. Handling File Upload & Drag-and-Drop
function triggerFileInput() {
  document.getElementById('file-input').click();
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    processImageFile(file);
  }
}

function processImageFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Harap pilih file berformat gambar!');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    alert('Ukuran gambar maksimal 10MB. Silakan pilih gambar lain.');
    return;
  }

  const uploadLabel = document.getElementById('upload-text-label');
  if (uploadLabel) uploadLabel.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Memproses gambar...`;

  compressImageFile(file)
    .then((dataUrl) => {
      selectedImageSource = dataUrl; // Format Data URL (Base64), sudah dikompres/resize
      if (uploadLabel) {
        uploadLabel.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#4ade80;"></i> Gambar Terpilih: <b>${file.name}</b>`;
      }
      document.getElementById('image-url-input').value = ''; // Reset input URL
    })
    .catch((err) => {
      console.error('Gagal mengompres gambar:', err);
      alert('Gagal memuat gambar, coba gambar lain.');
      if (uploadLabel) uploadLabel.textContent = 'Klik atau Drag & Drop gambar ke sini';
    });
}

// Kompres & resize gambar di browser sebelum dikirim ke server.
// Foto dari HP (mis. hasil kamera/BeautyPlus) sering berukuran besar (bisa 5-15MB),
// setelah dikonversi ke base64 ukurannya naik ~33% dan gampang melebihi batas
// ukuran request yang diizinkan hosting -> menyebabkan server menolak tanpa
// pesan error yang jelas. Resize + kompres di sini mencegah masalah itu.
function compressImageFile(file, maxDimension = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round(height * (maxDimension / width));
            width = maxDimension;
          } else {
            width = Math.round(width * (maxDimension / height));
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // PNG dipertahankan sebagai PNG (butuh transparansi utuh untuk hasil remove-bg
        // sebelumnya jika ada), format lain dikompres sebagai JPEG.
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputType, quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function handleUrlInput(event) {
  const urlVal = event.target.value.trim();
  if (urlVal) {
    selectedImageSource = urlVal;
    document.getElementById('upload-text-label').textContent = 'Klik atau Drag & Drop gambar ke sini';
    document.getElementById('file-input').value = '';
  }
}

// Setup Drag & Drop Event
const dropZone = document.getElementById('drop-zone');
if (dropZone) {
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      processImageFile(files[0]);
    }
  });
}

// 3. Handling Submit Form Tool
async function handleToolSubmit(event) {
  event.preventDefault();

  if (!selectedImageSource) {
    alert('Silakan upload file gambar atau masukkan URL gambar terlebih dahulu!');
    return;
  }

  const btnSubmit = document.getElementById('btn-submit-tool');
  const resultBox = document.getElementById('tools-result-box');
  const imgOriginal = document.getElementById('img-original-preview');
  const imgResult = document.getElementById('img-result-preview');
  const downloadLink = document.getElementById('btn-download-link');
  const originalBtnHTML = btnSubmit.innerHTML;

  // Set Payload
  const payload = {
    mode: currentMode,
    image: selectedImageSource,
    highRes: document.getElementById('high-res-check').checked,
    scale: document.getElementById('scale-select').value
  };

  // UI State: Loading
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Memproses Gambar...`;

  // Tampilkan gambar original di preview
  imgOriginal.src = selectedImageSource;

  try {
    const response = await fetch(TOOLS_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // Coba baca sebagai JSON dulu (format error normal dari backend kita)
      let serverMessage = '';
      const rawText = await response.text().catch(() => '');
      try {
        const errData = rawText ? JSON.parse(rawText) : {};
        serverMessage = errData.error || '';
      } catch (_) {
        // Bukan JSON (mis. halaman error HTML dari hosting, payload terlalu besar, dsb)
        serverMessage = '';
      }

      if (!serverMessage) {
        if (response.status === 413) {
          serverMessage = 'Ukuran gambar terlalu besar untuk diproses server. Coba gambar dengan resolusi lebih kecil.';
        } else if (response.status === 504) {
          serverMessage = 'Server terlalu lama merespons (timeout). Coba lagi dalam beberapa saat.';
        } else {
          serverMessage = `Gagal memproses gambar dari server (HTTP ${response.status}).`;
        }
      }

      console.error('Respons error dari server:', response.status, rawText);
      throw new Error(serverMessage);
    }

    // Ambil response berupa Blob (Gambar langsung)
    const blobResult = await response.blob();
    const resultObjectUrl = URL.createObjectURL(blobResult);

    // Set Tampilan Hasil
    imgResult.src = resultObjectUrl;
    downloadLink.href = resultObjectUrl;
    downloadLink.download = `pct-tools-${currentMode}-${Date.now()}.png`;

    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  } catch (err) {
    console.error('Error PRIME TOOLS:', err);
    alert(`Terjadi Kesalahan: ${err.message}`);
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = originalBtnHTML;
  }
}
