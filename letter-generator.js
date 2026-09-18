/**
 * letter-generator.js
 * Logic inti pembuatan Surat Pencabutan Pemberhentian Operasional Sementara (BGN).
 * Murni fungsi (input data -> output HTML string), tidak menyentuh DOM sama sekali,
 * jadi bisa langsung dipakai di Next.js (client atau server component), React, atau
 * mesin templating lain.
 *
 * Cara pakai di Next.js:
 *   import { buildLetterHtml, formatTanggalIndo } from './letter-generator';
 *   const { page1, page2, page3 } = buildLetterHtml(formData);
 *   // lalu render masing-masing dengan dangerouslySetInnerHTML, atau
 *   // convert ke JSX kalau mau full-React (lihat catatan di bawah).
 */

// ---------- Util ----------

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/** Format tanggal ISO (yyyy-mm-dd) -> "10 September 2026" */
export function formatTanggalIndo(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

/** Bungkus nilai kosong dengan penanda placeholder (untuk preview saja). */
function fieldOrPlaceholder(value, fallbackLabel) {
  const v = (value || '').toString().trim();
  if (v) return escapeHtml(v);
  return `<span class="placeholder-fill">[${fallbackLabel}]</span>`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Aturan kategori pelanggaran:
 * - "Tidak Ada"  -> kalimat memakai "tersebut diatas" (tidak menyebut tingkat pelanggaran)
 * - Ringan/Sedang/Berat -> kalimat menyebut eksplisit "terkait pelanggaran <kategori>"
 */
export function frasaKategori(kategori) {
  if (!kategori || kategori === 'Tidak Ada') {
    return 'tersebut diatas';
  }
  return `terkait pelanggaran <b>${kategori.toLowerCase()}</b> yang dilakukan`;
}

// ---------- Data shape ----------
/**
 * @typedef {Object} SppgItem
 * @property {string} nama
 * @property {string} id
 * @property {string} yayasan
 * @property {string} tglOperasional
 * @property {string} jenis
 * 
 * @typedef {Object} SuratPencabutanData
 * @property {string} tglSurat        - ISO date, contoh "2026-09-10"
 * @property {string} provinsi
 * @property {'Tidak Ada'|'Ringan'|'Sedang'|'Berat'} kategoriSurat
 * @property {string} noSuspend
 * @property {string} tglSuspend
 * @property {string} namaKppg
 * @property {string} noND
 * @property {string} tglND
 * @property {SppgItem[]} sppgList    - array data SPPG
 * @property {string} [logoSrc]       - path/URL logo BGN, default "/logo-bgn.png"
 */

/**
 * Bangun 3 halaman surat (HTML string) dari data form.
 * @param {SuratPencabutanData} data
 * @returns {{page1:string, page2:string, page3:string}}
 */
export function buildLetterHtml(data) {
  const tglSurat = data.tglSurat ? formatTanggalIndo(data.tglSurat) : '<span class="placeholder-fill">[tanggal surat]</span>';
  const provinsi = fieldOrPlaceholder(data.provinsi, 'provinsi');
  const namaKppg = fieldOrPlaceholder(data.namaKppg, 'KPPG');
  const logoSrc = data.logoSrc || '/logo-bgn.png';
  const frasa = frasaKategori(data.kategoriSurat);
  const sppgList = data.sppgList || [];
  const isMulti = sppgList.length > 1;
  const firstNama = fieldOrPlaceholder(sppgList[0] ? sppgList[0].nama : '', 'nama SPPG');

  const ythLine = isMulti
    ? `Para Kepala Satuan Pelayanan Pemenuhan Gizi (SPPG) <span class="placeholder-fill">(Daftar Terlampir)</span>`
    : `Kepala Satuan Pelayanan Pemenuhan Gizi (SPPG) ${firstNama}`;

  const kop = `
    <div class="kop">
      <img class="crest" src="${logoSrc}" alt="Logo BGN">
      <div>
        <div class="org-name">BADAN GIZI NASIONAL (<i>NATIONAL NUTRITION AGENCY</i>)</div>
        <div class="org-addr">Jalan Kebon Sirih No.1 RT.1 RW.7 Kebon Sirih, Kec. Menteng,<br>Kota Jakarta Pusat, Daerah Khusus Jakarta 10340</div>
      </div>
    </div>
    <div class="kop-rule"></div>
    <div class="kop-rule second"></div>`;

  const page1 = `
    <div class="sheet">
      ${kop}
      <div class="meta">
        <div class="meta-first">
          <div style="display:flex;">
            <div class="meta-row"><span class="k">Nomor</span><span class="sep">:</span></div>
            <span>\${nomor_naskah}</span>
          </div>
          <div>Jakarta, ${tglSurat}</div>
        </div>
        <div class="meta-row"><span class="k">Sifat</span><span class="sep">:</span><span>Segera</span></div>
        <div class="meta-row"><span class="k">Lampiran</span><span class="sep">:</span><span>1 (satu) Berkas</span></div>
        <div class="meta-row"><span class="k">Hal</span><span class="sep">:</span><span>Pencabutan Pemberhentian Operasional Sementara</span></div>
      </div>
      <div class="yth">
        Yth.<br>
        ${ythLine}<br>
        di Provinsi ${provinsi}
      </div>
      <ol class="main">
        <li>Dasar
          <ol class="sub">
            ${(data.dasarList || []).map(text => `<li>${fieldOrPlaceholder(text, 'Teks dasar kosong')}</li>`).join('\n            ')}
          </ol>
        </li>
        <li>Menindaklanjuti hasil verifikasi Kepala KPPG ${namaKppg}, SPPG terlampir ${frasa} dinyatakan <b>Telah Memenuhi</b> seluruh rekomendasi perbaikan yang dipersyaratkan.</li>
        <li>Terhitung mulai dari tanggal surat ini dikeluarkan, status <b>Pemberhentian Operasional Sementara DICABUT</b> dan dinyatakan dapat beroperasi kembali secara normal dengan segala hak operasionalnya sesuai peraturan perundang-undangan yang berlaku.</li>
        <li>Dalam rangka penegakan integritas dan tata kelola pemerintahan yang bersih, seluruh jajaran Kedeputian Bidang Pemantauan dan Pengawasan dalam menjalankan tugas dan fungsinya <b>tidak menerima dan tidak meminta imbalan, hadiah, atau gratifikasi dalam bentuk apapun</b>. Seluruh layanan dan proses administrasi dilaksanakan secara profesional, transparan, dan bebas dari biaya.</li>
      </ol>
    </div>`;

  const page2 = `
    <div class="sheet">
      <div class="page-number">2</div>
      <ol class="main" start="5" style="margin-top:70px;">
        <li>Demikian Surat Pencabutan Pemberhentian Operasional Sementara ini disampaikan untuk segera ditindaklanjuti.</li>
      </ol>
      <div class="sign-block">
        <div class="role">Deputi Bidang Pemantauan dan Pengawasan,</div>
        <div>\${ttd_pengirim}</div>
        <div style="margin-top:6px;"><b>Dr. Ketut Sumedana</b></div>
      </div>
      <div class="tembusan">
        Tembusan Yth.:
        <ol>
          <li>Kepala Badan Gizi Nasional;</li>
          <li>Wakil Kepala Badan Gizi Nasional;</li>
          <li>Sekretaris Utama Badan Gizi Nasional;</li>
          <li>Deputi Bidang Penyediaan dan Penyaluran;</li>
          <li>Inspektur Utama;</li>
          <li>Kepala Kantor Pelayanan Pemenuhan Gizi (KPPG) ${namaKppg};</li>
          <li>Pejabat Pembuat Komitmen (PPK) Program MBG.</li>
        </ol>
      </div>
    </div>`;

  const rows = sppgList.map((row, i) => `
    <tr>
      <td>${i + 1}.</td>
      <td>SPPG ${fieldOrPlaceholder(row.nama, 'nama SPPG')}</td>
      <td>${fieldOrPlaceholder(row.id, 'ID')}</td>
      <td>${fieldOrPlaceholder(row.yayasan, 'yayasan')}</td>
      <td>${fieldOrPlaceholder(row.tglOperasional, 'tgl operasional')}</td>
      <td>${row.jenis || 'KM'}</td>
    </tr>`).join('');

  const page3 = `
    <div class="sheet ${isMulti ? 'landscape' : ''}">
      <div class="page-number">3</div>
      <div class="lampiran-head" style="margin-top:60px;">
        Lampiran Surat Deputi Bidang<br>
        Pemantauan dan Pengawasan<br>
        Nomor&nbsp;&nbsp;&nbsp;: \${nomor_naskah}<br>
        Tanggal&nbsp;&nbsp;: ${tglSurat}
      </div>
      <div class="lampiran-title">SPPG YANG DICABUT PEMBERHENTIAN OPERASIONAL SEMENTARA</div>
      <table class="lampiran">
        <tr><th>No.</th><th>Nama SPPG</th><th>ID SPPG</th><th>Nama Yayasan</th><th>Tanggal Operasional</th><th>Kategori</th></tr>
        ${rows}
      </table>
      <div class="sign-block">
        <div class="role">Deputi Bidang Pemantauan dan Pengawasan,</div>
        <div>\${ttd_pengirim}</div>
        <div style="margin-top:6px;"><b>Dr. Ketut Sumedana</b></div>
      </div>
    </div>`;

  return { page1, page2, page3 };
}

/**
 * Gabungkan 3 halaman jadi satu string HTML utuh (untuk preview cepat / print).
 * @param {SuratPencabutanData} data
 */
export function buildLetterHtmlFull(data) {
  const { page1, page2, page3 } = buildLetterHtml(data);
  return page1 + page2 + page3;
}
