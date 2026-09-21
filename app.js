import { buildLetterHtmlFull } from './letter-generator.js?v=3';

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
  const jenis = document.getElementById('jenisSuratTemplate').value;
  const area = document.getElementById('previewArea');
  const sheets = Array.from(area.querySelectorAll('.sheet'));

  if (!sheets.length) {
    alert('Belum ada pratinjau. Klik "Perbarui Pratinjau" terlebih dahulu.');
    return;
  }

  // CSS yang di-inline langsung agar html-docx-js bisa membaca styling
  const css = `
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; line-height: 1.15; color: #111; margin: 0; }
    table { border-collapse: collapse; width: 100%; }
    td, th { vertical-align: top; }
    ol { margin: 0; padding-left: 26px; }
    ol > li { margin-bottom: 10px; text-align: justify; }
    ol.sub { list-style-type: lower-alpha; padding-left: 24px; }
    ol.sub > li { margin-bottom: 7px; }
    hr.kop-rule { border: none; border-top: 1.5px solid #8296a6; margin: 4px 0; }
    .org-name { font-weight: bold; font-size: 13.5pt; color: #5c7a92; }
    .org-addr { font-size: 10pt; color: #555; margin-top: 2px; }
    .yth { margin-bottom: 14px; }
    .placeholder-fill { color: #b45309; font-weight: 600; }
    table.lampiran th, table.lampiran td { border: 1px solid #111; padding: 6px 8px; text-align: center; }
    .tembusan { margin-top: 20px; }
    .tembusan ol { margin: 6px 0 0 22px; padding: 0; }
    .lampiran-title { text-align: center; font-weight: bold; margin-bottom: 12px; }
    b { font-weight: bold; }
    i { font-style: italic; }
  `;

  // Ambil HTML dari setiap .sheet, gabungkan dengan page break
  const combinedBody = sheets.map((sheet) => {
    const clone = sheet.cloneNode(true);
    // Hapus class dan style positioning dari .sheet agar tidak mengganggu layout Word
    clone.className = '';
    clone.style.cssText = '';
    return clone.outerHTML;
  }).join('<br style="page-break-before: always; clear: both;" />');

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${css}</style>
</head>
<body>
${combinedBody}
</body>
</html>`;

  try {
    // htmlDocx adalah nama global yang diekspos oleh html-docx-js
    const converted = htmlDocx.asBlob(fullHtml, {
      orientation: 'portrait',
      margins: {
        top: 1440,     // 1 inch = 1440 twips
        right: 1440,
        bottom: 1440,
        left: 1440,
      }
    });
    const url = URL.createObjectURL(converted);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Surat_${jenis}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert('Gagal mengunduh: ' + err.message);
  }
};

window.downloadPdf = function downloadPdf() {
  const jenis = document.getElementById('jenisSuratTemplate').value;
  const element = document.getElementById('previewArea');
  
  // Clone element to remove the toolbar row before exporting
  const clone = element.cloneNode(true);
  const toolbar = clone.querySelector('.toolbar-row');
  if (toolbar) toolbar.remove();

  // Remove spacing/shadows so it looks like a clean document
  clone.style.gap = '0'; // Remove the gap between sheets
  
  const sheets = clone.querySelectorAll('.sheet');
  sheets.forEach((sheet, index) => {
    sheet.style.boxShadow = 'none';
    sheet.style.margin = '0';
    // Remove forced height to prevent overflow to next page
    sheet.style.minHeight = 'auto';
    // Add page break after each sheet (except the last one)
    if (index < sheets.length - 1) {
      sheet.style.pageBreakAfter = 'always';
    }
  });

  // html2pdf options
  const opt = {
    margin:       0, // We set 0 because the .sheet already has 96px internal padding
    filename:     `Surat_${jenis}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: 'css' }
  };

  // Convert the cleaned clone to PDF
  html2pdf().set(opt).from(clone).save();
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
