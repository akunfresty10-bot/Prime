// ============================================
// PRIME TOOLS FRONTEND LOGIC & INTEGRATION
// ============================================

// URL Endpoint Backend Serverless / API Route milikmu
const TOOLS_API_ENDPOINT = '/api/removebg'; // Sesuaikan lokasi endpoint backend kamu

let currentMode = 'removebg';
let selectedImageSource = null; // Bisa berupa string Base64 atau URL

// 1. Pindah Tab (Remove BG <-> Upscale)
function switchToolTab(mode) {
  currentMode = mode;
  document.querySelectorAll('.tools-tab-btn').forEach(btn => btn.classList.remove('active'));

  const btnRemoveBg = document.querySelectorAll('.tools-tab-btn')[0];
  const btnUpscale = document.querySelectorAll('.tools-tab-btn')[1];
  const optsRemoveBg = document.getElementById('options-removebg');
  const optsUpscale = document.getElementById('options-upscale');
  const btnLabel = document.getElementById('btn-label-text');

  if (mode === 'removebg') {
    btnRemoveBg.classList.add('active');
    optsRemoveBg.style.display = 'grid';
    optsUpscale.style.display = 'none';
    btnLabel.textContent = 'Proses Hapus Background';
  } else {
    btnUpscale.classList.add('active');
    optsRemoveBg.style.display = 'none';
    optsUpscale.style.display = 'grid';
    btnLabel.textContent = 'Proses Upscale Gambar';
  }
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

  const reader = new FileReader();
  reader.onload = function(e) {
    selectedImageSource = e.target.result; // Format Data URL (Base64)
    document.getElementById('upload-text-label').innerHTML = `<i class="fa-solid fa-circle-check" style="color:#4ade80;"></i> Gambar Terpilih: <b>${file.name}</b>`;
    document.getElementById('image-url-input').value = ''; // Reset input URL
  };
  reader.readAsDataURL(file);
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
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Gagal memproses gambar dari server.');
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
