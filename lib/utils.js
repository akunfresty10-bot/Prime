export const PLACEHOLDER = '/placeholder.svg';

// Hanya izinkan link http(s) atau path internal, supaya "javascript:" dsb tidak lolos.
export function safeHref(url) {
  if (!url) return '#';
  const u = String(url).trim();
  return /^(https?:\/\/|\/)/i.test(u) ? u : '#';
}

export function formatRupiah(n) {
  return `Rp ${Number(n).toLocaleString('id-ID')}`;
}
