import { buildLetterHtmlFull } from './letter-generator.js?v=2';

const KPPG_MAP = {
  "Sumatera Utara": "Medan",
  "Aceh": "Medan",
  "Riau": "Pekanbaru",
  "Kepulauan Riau": "Pekanbaru",
  "Sumatera Barat": "Pekanbaru",
  "Lampung": "Bandar Lampung",
  "Bengkulu": "Bandar Lampung",
  "Bangka Belitung": "Palembang",
  "Jambi": "Palembang",
  "Sumatera Selatan": "Palembang",
};

// Array state object representing SPPG rows
window.sppgList = [
  { nama: '', id: '', yayasan: '', tglOperasional: '', jenis: 'KM' }
];

window.updateKppg = function updateKppg() {
  const prov = document.getElementById('provinsi').value;
  document.getElementById('namaKppg').value = KPPG_MAP[prov] || '';
};

window.renderSppgRows = function renderSppgRows() {
  const wrap = document.getElementById('sppgRows');
  wrap.innerHTML = window.sppgList.map((row, i) => `
    <div class="sppg-card">
      <div class="sppg-title">SPPG #${i + 1}</div>
      ${window.sppgList.length > 1 ? `<button type="button" class="remove-row" onclick="removeSppgRow(${i})">Hapus</button>` : ''}
      <label>Nama SPPG</label>
      <input type="text" value="${row.nama}" oninput="window.sppgList[${i}].nama=this.value">
      <label>ID SPPG</label>
      <input type="text" value="${row.id}" oninput="window.sppgList[${i}].id=this.value">
      <label>Nama Yayasan</label>
      <input type="text" value="${row.yayasan}" oninput="window.sppgList[${i}].yayasan=this.value">
      <label>Tanggal Operasional Awal</label>
      <input type="text" value="${row.tglOperasional}" placeholder="Contoh: 25 Februari 2026" oninput="window.sppgList[${i}].tglOperasional=this.value">
      <label>Jenis (kategori tabel)</label>
      <select onchange="window.sppgList[${i}].jenis=this.value">
        <option value="KM" ${row.jenis === 'KM' ? 'selected' : ''}>KM — Kejadian Membahayakan</option>
        <option value="KF" ${row.jenis === 'KF' ? 'selected' : ''}>KF — Kejadian Fatal</option>
      </select>
    </div>
  `).join('');
};

window.addSppgRow = function addSppgRow() {
  window.sppgList.push({ nama: '', id: '', yayasan: '', tglOperasional: '', jenis: 'KM' });
  renderSppgRows();
};

window.removeSppgRow = function removeSppgRow(i) {
  window.sppgList.splice(i, 1);
  renderSppgRows();
};

window.render = function render() {
  const data = {
    tglSurat: document.getElementById('tglSurat').value,
    provinsi: document.getElementById('provinsi').value,
    kategoriSurat: document.getElementById('kategoriSurat').value,
    noSuspend: document.getElementById('noSuspend').value,
    tglSuspend: document.getElementById('tglSuspend').value,
    namaKppg: document.getElementById('namaKppg').value,
    noND: document.getElementById('noND').value,
    tglND: document.getElementById('tglND').value,
    sppgList: window.sppgList
  };

  const html = buildLetterHtmlFull(data);
  const isMulti = window.sppgList.length > 1;

  document.getElementById('previewArea').innerHTML = `
    <div class="toolbar-row">
      <span>Pratinjau Surat — 3 halaman (2 surat utama${isMulti ? ' + 1 lampiran landscape' : ' + 1 lampiran'})</span>
      <span>Diperbarui</span>
    </div>
    ${html}
  `;
};

window.downloadWord = function downloadWord() {
  const area = document.getElementById('previewArea');
  
  // Karena export Word membutuhkan inline styling atau block <style>,
  // kita fetch css-nya lalu diembed langsung sebelum convert blob
  fetch('letter-styles.css')
    .then(res => res.text())
    .then(css => {
      const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${area.innerHTML}</body></html>`;
      const converted = window.htmlDocx.asBlob(fullHtml);
      const url = URL.createObjectURL(converted);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Surat_Pencabutan_Operasional_Sementara.doc';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    })
    .catch(err => {
      console.error('Failed to fetch CSS for Word download:', err);
      alert('Gagal mengunduh dokumen dengan gaya (style). Pastikan Anda mengakses aplikasi ini via local server (http://localhost) untuk menghindari CORS Error.');
    });
};

// Initial render
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.renderSppgRows();
    window.render();
  });
} else {
  window.renderSppgRows();
  window.render();
}
