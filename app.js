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

const TEMPLATE_DASAR = {
  pencabutan: [
    "Keputusan Kepala Badan Gizi Nasional Nomor 401.1 Tahun 2025 tentang Petunjuk Teknis Tata Kelola Penyelenggaraan Program Makan Bergizi Gratis (MBG) Tahun 2026;",
    "Keputusan Kepala Badan Gizi Nasional Republik Indonesia Nomor 63486 Tahun 2026 tentang Petunjuk Teknis Pengenaan Sanksi pada Satuan Pelayanan Pemenuhan Gizi;",
    "Surat Deputi Bidang Pemantauan dan Pengawasan Nomor [Nomor Surat] tanggal [Tanggal Surat] hal Pemberhentian Operasional Sementara;",
    "Nota Dinas Kepala Kantor Pelayanan Pemenuhan Gizi [Nama KPPG] Nomor [Nomor Nota Dinas] tanggal [Tanggal Nota Dinas] hal Permohonan Pencabutan Pemberhentian Operasional Sementara;"
  ],
  teguran: [
    "Nota Dinas Kepala KPPG Nomor [Nomor Nota Dinas] tanggal [Tanggal Nota Dinas] hal [Hal Nota Dinas];",
    "Laporan SPPG [Nama SPPG] Nomor [Nomor Laporan] tanggal [Tanggal Laporan] hal [Hal Laporan]."
  ],
  suspend_kf: [
    "Keputusan Kepala Badan Gizi Nasional Nomor 401.1 Tahun 2025 tentang Petunjuk Teknis Tata Kelola Penyelenggaraan Program Makan Bergizi Gratis (MBG) Tahun 2026;",
    "Keputusan Kepala Badan Gizi Nasional Republik Indonesia Nomor 63486 Tahun 2026 tentang Petunjuk Teknis Pengenaan Sanksi pada Satuan Pelayanan Pemenuhan Gizi;",
    "Laporan [Nama Laporan] terkait Kejadian Fatal [Uraikan Kejadian] tanggal [Tanggal Kejadian] hal Kejadian Fatal."
  ],
  suspend_km: [
    "Keputusan Kepala Badan Gizi Nasional Nomor 401.1 Tahun 2025 tentang Petunjuk Teknis Tata Kelola Penyelenggaraan Program Makan Bergizi Gratis (MBG) Tahun 2026;",
    "Keputusan Kepala Badan Gizi Nasional Republik Indonesia Nomor 63486 Tahun 2026 tentang Petunjuk Teknis Pengenaan Sanksi pada Satuan Pelayanan Pemenuhan Gizi;",
    "Nota Dinas Kepala KPPG [Nama KPPG] Nomor [Nomor Nota Dinas] tanggal [Tanggal Nota Dinas] hal [Hal Nota Dinas];",
    "Laporan Khusus Kepala SPPG [Nama SPPG] Nomor [Nomor Laporan] tanggal [Tanggal Laporan] hal [Hal Laporan]."
  ],
  eskalasi_km: [
    "Keputusan Kepala Badan Gizi Nasional Nomor 401.1 Tahun 2025 tentang Petunjuk Teknis Tata Kelola Penyelenggaraan Program Makan Bergizi Gratis (MBG) Tahun 2026;",
    "Keputusan Kepala Badan Gizi Nasional Republik Indonesia Nomor 63486 Tahun 2026 tentang Petunjuk Teknis Pengenaan Sanksi pada Satuan Pelayanan Pemenuhan Gizi;",
    "Berita Acara Perbaikan (BAP) Nomor [Nomor BAP] tanggal [Tanggal BAP];",
    "Surat Kepala SPPG [Nama SPPG] Nomor [Nomor Surat] tanggal [Tanggal Surat] hal Permohonan Pencabutan Pemberhentian Operasional Sementara;",
    "Nota Dinas Kepala KPPG [Nama KPPG] Nomor [Nomor Nota Dinas] tanggal [Tanggal Nota Dinas] hal [Hal Nota Dinas];",
    "Laporan Khusus [Judul Laporan] tanggal [Tanggal Laporan] perihal [Hal Laporan]."
  ]
};

window.dasarList = [...TEMPLATE_DASAR.pencabutan];

window.changeTemplate = function changeTemplate() {
  const jenis = document.getElementById('jenisSuratTemplate').value;
  window.dasarList = [...(TEMPLATE_DASAR[jenis] || [])];
  window.renderDasarRows();
  window.render();
};

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
        <option value="KM" ${row.jenis === 'KM' ? 'selected' : ''}>KM — Kejadian Menonjol</option>
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

window.renderDasarRows = function renderDasarRows() {
  const wrap = document.getElementById('dasarRows');
  if (!wrap) return;
  wrap.innerHTML = window.dasarList.map((text, i) => `
    <div class="sppg-card" style="margin-bottom: 10px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 5px;">
        <strong style="color: #0f172a;">Dasar #${i + 1}</strong>
        ${window.dasarList.length > 1 ? `<button type="button" class="remove-row" onclick="removeDasarRow(${i})">Hapus</button>` : ''}
      </div>
      <textarea rows="3" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: inherit;" oninput="window.dasarList[${i}]=this.value">${text}</textarea>
    </div>
  `).join('');
};

window.addDasarRow = function addDasarRow() {
  window.dasarList.push("");
  window.renderDasarRows();
};

window.removeDasarRow = function removeDasarRow(i) {
  window.dasarList.splice(i, 1);
  window.renderDasarRows();
};

window.render = function render() {
  const data = {
    jenisSuratTemplate: document.getElementById('jenisSuratTemplate').value,
    tglSurat: document.getElementById('tglSurat').value,
    provinsi: document.getElementById('provinsi').value,
    kategoriSurat: document.getElementById('kategoriSurat').value,
    namaKppg: document.getElementById('namaKppg').value,
    sppgList: window.sppgList,
    dasarList: window.dasarList
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
    window.renderDasarRows();
    window.render();
  });
} else {
  window.renderSppgRows();
  window.renderDasarRows();
  window.render();
}
