// ============================================
// PCT AI FRONTEND LOGIC & INTEGRATION
// ============================================

const AI_API_ENDPOINT = '/api/ai';

// 1. Pindah Tab (Text AI <-> YouTube AI)
function switchAiTab(tabName) {
  document.querySelectorAll('.ai-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  if (tabName === 'text') {
    document.querySelectorAll('.ai-tab-btn')[0].classList.add('active');
    document.getElementById('tab-text').classList.add('active');
  } else {
    document.querySelectorAll('.ai-tab-btn')[1].classList.add('active');
    document.getElementById('tab-youtube').classList.add('active');
  }
}

// 2. Kirim Form AI
async function handleAiSubmit(event, mode) {
  event.preventDefault();

  const outputBox = document.getElementById('ai-output-box');
  const outputContent = document.getElementById('ai-output-content');
  const btnSubmit = mode === 'text' 
    ? document.getElementById('btn-text-submit') 
    : document.getElementById('btn-yt-submit');

  const originalBtnContent = btnSubmit.innerHTML;
  let payload = { mode: mode };

  if (mode === 'text') {
    payload.prompt = document.getElementById('text-prompt').value.trim();
    payload.context = document.getElementById('text-context').value.trim();
    payload.tone = document.getElementById('text-tone').value;
    payload.answerLength = document.getElementById('text-length').value;
    payload.formatPreference = document.getElementById('text-format').value;
  } else if (mode === 'youtube') {
    payload.url = document.getElementById('yt-url').value.trim();
    payload.type = document.getElementById('yt-type').value;
  }

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Memproses PCT AI...`;
  outputBox.style.display = 'block';
  outputContent.innerHTML = `<em style="color:#94a3b8;"><i class="fa-solid fa-circle-notch fa-spin"></i> Sedang berpikir dan meracik data... Mohon tunggu sebentar.</em>`;
  
  outputBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  try {
    const response = await fetch(AI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.error) {
      outputContent.innerHTML = `<span style="color:#f87171;"><i class="fa-solid fa-triangle-exclamation"></i> Gagal: ${result.message || 'Terjadi kesalahan pada sistem AI.'}</span>`;
    } else {
      let formattedResult = '';
      if (typeof result.data === 'string') {
        formattedResult = result.data;
      } else if (typeof result.data === 'object') {
        formattedResult = result.data.result || result.data.text || JSON.stringify(result.data, null, 2);
      } else {
        formattedResult = 'Berhasil memproses permintaan.';
      }

      outputContent.textContent = formattedResult;
    }
  } catch (err) {
    console.error('Error PCT AI:', err);
    outputContent.innerHTML = `<span style="color:#f87171;"><i class="fa-solid fa-plug-circle-xmark"></i> Gagal terhubung ke API AI. Pastikan server backend telah aktif.</span>`;
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = originalBtnContent;
  }
}

// 3. Salin Hasil Teks
function copyAiResult(buttonEl) {
  const content = document.getElementById('ai-output-content').innerText;
  if (!content) return;

  navigator.clipboard.writeText(content).then(() => {
    const originalText = buttonEl.innerHTML;
    buttonEl.innerHTML = `<i class="fa-solid fa-check" style="color:#4ade80;"></i> Tersalin!`;
    setTimeout(() => {
      buttonEl.innerHTML = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Gagal menyalin:', err);
  });
}
