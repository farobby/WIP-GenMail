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
import { LOGO_BASE64 } from './logo-base64.js';

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

  // Layout Kop Surat (menggunakan table agar rapi di Word)
  const kop = `
    <table class="kop-table" style="width:100%; border-collapse:collapse; margin-bottom:6px;">
      <tr>
        <td style="width:80px; vertical-align:middle; padding-right:16px;">
          <img class="crest" src="${LOGO_BASE64}" alt="Logo BGN" width="78" height="78">
        </td>
        <td style="vertical-align:middle;">
          <div class="org-name">BADAN GIZI NASIONAL <i>(NATIONAL NUTRITION AGENCY)</i></div>
          <div class="org-addr">Jalan Kebon Sirih No.1 RT.1 RW.7 Kebon Sirih, Kec. Menteng,<br>Kota Jakarta Pusat, Daerah Khusus Jakarta 10340</div>
        </td>
      </tr>
    </table>
    <div class="kop-rule"></div>
    <div class="kop-rule second"></div>
  `;

  const ythDiv = `
    <div class="yth">
      Yth.<br>
      Kepala Satuan Pelayanan Pemenuhan Gizi (SPPG) <b>${fieldOrPlaceholder(firstNama, 'nama SPPG')}</b><br>
      di Provinsi <b>${fieldOrPlaceholder(data.provinsi, 'provinsi')}</b>
    </div>
  `;

  let halStr = 'Pencabutan Pemberhentian Operasional Sementara';
  let mainContent = '';
  const dasarHtml = `<ol class="sub">\n            ${(data.dasarList || []).map(text => `<li>${fieldOrPlaceholder(text, 'Teks dasar kosong')}</li>`).join('\n            ')}\n          </ol>`;

  const kategori = data.kategoriSurat && data.kategoriSurat !== 'Tidak Ada' 
    ? data.kategoriSurat.toLowerCase() 
    : '[Pilih Kategori]';

  let jumlahHari = '[Jumlah]';
  if (kategori === 'ringan') jumlahHari = '10 (sepuluh)';
  else if (kategori === 'sedang') jumlahHari = '20 (dua puluh)';
  else if (kategori === 'berat') jumlahHari = '30 (tiga puluh)';

  if (data.jenisSuratTemplate === 'teguran') {
    halStr = 'Teguran Pelanggaran';
    mainContent = `
      <ol class="main">
        <li>Dasar:
          ${dasarHtml}
        </li>
        <li>Sehubungan dengan dasar tersebut di atas, ditemukan adanya ketidaklayakan makanan pada proses distribusi MBG di SPPG <b>[Nama SPPG]</b>, yaitu <b>[Uraikan temuan/kejadian ketidaklayakan di sini]</b>, sehingga distribusi makanan pada tanggal <b>[Tanggal Distribusi]</b> kepada <b>[Penerima Manfaat]</b> tidak dapat dilaksanakan. Guna mencegah terulangnya kejadian serupa, kepada Saudara diberikan teguran untuk melaksanakan hal-hal sebagai berikut:
          <ol class="sub" type="a">
            <li>Melakukan pengendalian mutu (<i>quality control</i>) terhadap seluruh bahan dan hasil olahan makanan sebelum proses distribusi;</li>
            <li>Memastikan proses produksi dan penyimpanan bahan pangan dilakukan sesuai standar keamanan pangan yang berlaku;</li>
            <li>Mitra/Yayasan SPPG wajib mengganti kerugian operasional yang timbul akibat kejadian tersebut.</li>
          </ol>
        </li>
        <li>Laporan tindak lanjut atas teguran ini agar disampaikan kepada Deputi Bidang Pemantauan dan Pengawasan paling lambat 3 (tiga) hari kalender sejak tanggal surat ini dikeluarkan. Teguran ini dicatat pada riwayat Satuan Pelayanan Pemenuhan Gizi Saudara dan tidak diperhitungkan dalam aturan repetisi pelanggaran, namun kelalaian yang berulang atas kewajiban di atas dapat menjadi dasar pengenaan sanksi pemberhentian operasional sementara.</li>
        <li>Demikian disampaikan surat teguran ini untuk dilaksanakan sebagaimana mestinya.</li>
      </ol>`;
  } else if (data.jenisSuratTemplate === 'suspend_kf') {
    halStr = 'Pemberhentian Operasional Sementara Kejadian Fatal';
    mainContent = `
      <ol class="main">
        <li>Dasar:
          ${dasarHtml}
        </li>
        <li>Sehubungan dengan dasar tersebut diatas, ditemukan bahwa SPPG dengan rincian sebagai berikut:
          <table class="suspend-table" style="margin-left: 1rem; margin-top: 0.5rem; margin-bottom: 0.5rem; border-collapse: collapse;">
            <tr><td style="width: 150px;">Nama SPPG</td><td>: ${firstNama}</td></tr>
            <tr><td>ID SPPG</td><td>: ${sppgList[0] ? sppgList[0].id : ''}</td></tr>
            <tr><td>Nama Yayasan</td><td>: ${sppgList[0] ? sppgList[0].yayasan : ''}</td></tr>
            <tr><td>Tanggal Ops.</td><td>: ${sppgList[0] ? sppgList[0].tglOperasional : ''}</td></tr>
          </table>
          mengalami Kejadian Fatal (KF) <b>[Uraikan kejadian fatal di sini]</b> pada penerima manfaat karena konsumsi Makan Bergizi Gratis (MBG) sebanyak <b>[Jumlah]</b> orang.
        </li>
        <li>Mempertimbangkan risiko yang dapat ditimbulkan terhadap kelanjutan operasionalisasi SPPG, maka dengan ini ditetapkan Pemberhentian Operasional Sementara terhadap SPPG dimaksud dengan kategori sanksi <b>${kategori}</b> dan pemberhentian seluruh hak operasionalnya dengan jangka waktu maksimal <b>${jumlahHari}</b> hari kalender, terhitung mulai dari tanggal surat ini dikeluarkan.</li>
        <li>Kepala SPPG diwajibkan menyelesaikan seluruh proses pembayaran yang menggunakan <i>Virtual Account</i> (VA) dalam waktu 1x24 jam untuk periode operasional sebelum dikeluarkannya surat ini.</li>
        <li>Kepala SPPG dan Perwakilan Yayasan bertanggungjawab memperbaiki hal-hal yang berisiko mengganggu keamanan pangan dan keselamatan penerima manfaat dalam jangka waktu yang telah ditetapkan. Progres pemenuhan perbaikan dilaporkan Kepala SPPG kepada Kepala KPPG setiap 7 (tujuh) hari kalender selama masa pemberhentian operasional sementara.</li>
        <li>Jika di kemudian hari ditemukan adanya kekeliruan dan ketidaksesuaian dalam proses penerbitan surat ini maka surat ini dapat ditinjau kembali sesuai dengan ketentuan yang berlaku.</li>
        <li><b>Surat ini hanya berlaku bagi pihak terkait dan tidak boleh disebarluaskan.</b> Pelanggaran atas ketentuan ini akan dikenakan sanksi sesuai peraturan perundang-undangan yang berlaku.</li>
        <li>Dalam rangka penegakan integritas dan tata kelola pemerintahan yang bersih, seluruh jajaran Kedeputian Bidang Pemantauan dan Pengawasan dalam menjalankan tugas dan fungsinya <b>tidak menerima dan tidak meminta imbalan, hadiah, atau gratifikasi dalam bentuk apapun</b>. Seluruh layanan dan proses administrasi dilaksanakan secara profesional, transparan, dan bebas dari biaya.</li>
        <li>Demikian Surat Pemberhentian Operasional Sementara ini disampaikan untuk segera ditindaklanjuti.</li>
      </ol>`;
  } else if (data.jenisSuratTemplate === 'suspend_km') {
    halStr = 'Pemberhentian Operasional Sementara Kejadian Menonjol';
    mainContent = `
      <ol class="main">
        <li>Dasar:
          ${dasarHtml}
        </li>
        <li>Sehubungan dengan dasar tersebut di atas, ditemukan bahwa SPPG terlampir tidak menindaklanjuti rekomendasi perbaikan sesuai dengan batas waktu yang telah ditentukan. Sesuaikan dengan permasalahan SPPG di ND.</li>
        <li>Mempertimbangkan risiko yang dapat ditimbulkan terhadap kelanjutan operasionalisasi SPPG, maka dengan ini ditetapkan Pemberhentian Operasional Sementara terhadap SPPG dimaksud dengan kategori sanksi <b>${kategori}</b> dengan jangka waktu maksimal <b>${jumlahHari}</b> hari terhitung mulai dari tanggal surat ini dikeluarkan.</li>
        <li>Kepala SPPG diwajibkan menyelesaikan seluruh proses pembayaran yang menggunakan <i>Virtual Account</i> (VA) dalam waktu 1x24 jam untuk periode operasional sebelum dikeluarkannya surat ini.</li>
        <li>Pencabutan status pemberhentian operasional sementara hanya dapat dilakukan setelah diserahkannya bukti perbaikan serta dokumen pendukung yang sah dan telah diverifikasi oleh Kepala KPPG kepada Deputi Bidang Pemantauan dan Pengawasan.</li>
        <li>Apabila hingga batas waktu sanksi berakhir SPPG belum menyampaikan bukti perbaikan dan dokumen pendukung yang sah, maka akan diberlakukan eskalasi kategori sanksi secara otomatis.</li>
        <li>Jika di kemudian hari ditemukan adanya kekeliruan dan ketidaksesuaian dalam proses penerbitan surat ini maka surat ini dapat ditinjau kembali sesuai dengan ketentuan yang berlaku.</li>
        <li><b>Surat ini hanya berlaku bagi pihak terkait dan tidak boleh disebarluaskan.</b> Pelanggaran atas ketentuan ini akan dikenakan sanksi sesuai peraturan perundang-undangan yang berlaku.</li>
        <li>Dalam rangka penegakan integritas dan tata kelola pemerintahan yang bersih, seluruh jajaran Kedeputian Bidang Pemantauan dan Pengawasan dalam menjalankan tugas dan fungsinya <b>tidak menerima dan tidak meminta imbalan, hadiah, atau gratifikasi dalam bentuk apapun</b>. Seluruh layanan dan proses administrasi dilaksanakan secara profesional, transparan, dan bebas dari biaya.</li>
        <li>Demikian Surat Pemberhentian Operasional Sementara ini disampaikan untuk segera ditindaklanjuti.</li>
      </ol>`;
  } else if (data.jenisSuratTemplate === 'eskalasi_km') {
    halStr = 'Eskalasi Pemberhentian Operasional Sementara Kejadian Menonjol';
    mainContent = `
      <ol class="main">
        <li>Dasar:
          ${dasarHtml}
        </li>
        <li>Sehubungan dengan dasar tersebut di atas, ditemukan bahwa SPPG terlampir tidak menindaklanjuti rekomendasi perbaikan sesuai dengan batas waktu yang telah ditentukan.</li>
        <li>Maka dengan ini ditetapkan Eskalasi Pemberhentian Operasional Sementara terhadap SPPG dimaksud menjadi kategori sanksi <b>${kategori}</b> dengan jangka waktu perbaikan <b>${jumlahHari}</b> hari terhitung mulai dari tanggal surat ini dikeluarkan.</li>
        <li>Kepala SPPG diwajibkan menyelesaikan seluruh proses pembayaran yang menggunakan <i>Virtual Account</i> (VA) dalam waktu 1x24 jam untuk periode operasional sebelum dikeluarkannya surat ini.</li>
        <li>Pencabutan status pemberhentian operasional sementara hanya dapat dilakukan setelah diserahkannya bukti perbaikan serta dokumen pendukung yang sah dan telah diverifikasi oleh Kepala KPPG kepada Deputi Bidang Pemantauan dan Pengawasan.</li>
        <li>Apabila hingga batas waktu sanksi berakhir SPPG belum menyampaikan bukti perbaikan dan dokumen pendukung yang sah, maka akan diberlakukan eskalasi kategori sanksi secara otomatis.</li>
        <li>Jika di kemudian hari ditemukan adanya kekeliruan dan ketidaksesuaian dalam proses penerbitan surat ini maka surat ini dapat ditinjau kembali sesuai dengan ketentuan yang berlaku.</li>
        <li><b>Surat ini hanya berlaku bagi pihak terkait dan tidak boleh disebarluaskan.</b> Pelanggaran atas ketentuan ini akan dikenakan sanksi sesuai peraturan perundang-undangan yang berlaku.</li>
        <li>Dalam rangka penegakan integritas dan tata kelola pemerintahan yang bersih, seluruh jajaran Kedeputian Bidang Pemantauan dan Pengawasan dalam menjalankan tugas dan fungsinya <b>tidak menerima dan tidak meminta imbalan, hadiah, atau gratifikasi dalam bentuk apapun</b>. Seluruh layanan dan proses administrasi dilaksanakan secara profesional, transparan, dan bebas dari biaya.</li>
        <li>Demikian Surat Pemberhentian Operasional Sementara ini disampaikan untuk segera ditindaklanjuti.</li>
      </ol>`;
  } else {
    // Default: Pencabutan
    halStr = 'Pencabutan Pemberhentian Operasional Sementara';
    mainContent = `
      <ol class="main">
        <li>Dasar:
          ${dasarHtml}
        </li>
        <li>Menindaklanjuti hasil verifikasi Kepala KPPG terkait pelanggaran <b>${kategori}</b> yang dilakukan, SPPG terlampir dinyatakan <b>Telah Memenuhi</b> seluruh rekomendasi perbaikan yang dipersyaratkan.</li>
        <li>Terhitung mulai dari tanggal surat ini dikeluarkan, status <b>Pemberhentian Operasional Sementara DICABUT</b> dan dinyatakan dapat beroperasi kembali secara normal dengan segala hak operasionalnya sesuai peraturan perundang-undangan yang berlaku.</li>
        <li>Dalam rangka penegakan integritas dan tata kelola pemerintahan yang bersih, seluruh jajaran Kedeputian Bidang Pemantauan dan Pengawasan dalam menjalankan tugas dan fungsinya <b>tidak menerima dan tidak meminta imbalan, hadiah, atau gratifikasi dalam bentuk apapun</b>. Seluruh layanan dan proses administrasi dilaksanakan secara profesional, transparan, dan bebas dari biaya.</li>
        <li>Demikian Surat Pencabutan Pemberhentian Operasional Sementara ini disampaikan untuk segera ditindaklanjuti.</li>
      </ol>`;
  }

  const page1 = `
    <div class="sheet">
      ${kop}
      <div class="meta" style="margin-bottom: 14px;">
        <table style="width:100%; border-collapse:collapse; font-size:11pt;">
          <tr>
            <td style="width:82px; vertical-align:top;">Nomor</td>
            <td style="width:12px; vertical-align:top;">:</td>
            <td style="vertical-align:top;">\${nomor_naskah}</td>
            <td style="text-align:right; vertical-align:top;">Jakarta, ${tglSurat}</td>
          </tr>
          <tr>
            <td style="vertical-align:top;">Sifat</td>
            <td style="vertical-align:top;">:</td>
            <td colspan="2" style="vertical-align:top;">Segera</td>
          </tr>
          <tr>
            <td style="vertical-align:top;">Lampiran</td>
            <td style="vertical-align:top;">:</td>
            <td colspan="2" style="vertical-align:top;">1 (satu) Berkas</td>
          </tr>
          <tr>
            <td style="vertical-align:top;">Hal</td>
            <td style="vertical-align:top;">:</td>
            <td colspan="2" style="vertical-align:top;">${halStr}</td>
          </tr>
        </table>
      </div>
      ${ythDiv}
      ${mainContent}
    </div>`;

  const signBlockTable = `
    <table style="width:100%; border-collapse:collapse; margin-top:30px;">
      <tr>
        <td style="width:55%;"></td>
        <td style="width:45%; text-align:left; vertical-align:top;">
          <div class="role" style="margin-bottom:56px;">Deputi Bidang Pemantauan dan Pengawasan,</div>
          <div>\${ttd_pengirim}</div>
          <div style="margin-top:6px;"><b>Dr. Ketut Sumedana</b></div>
        </td>
      </tr>
    </table>
  `;

  const page2 = `
    <div class="sheet">
      <p style="text-align:center; font-size:11pt; margin-bottom: 40px;">- 2 -</p>
      ${signBlockTable}
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
      <p style="text-align:center; font-size:11pt; margin-bottom: 40px;">- 3 -</p>
      <table style="width:100%; border-collapse:collapse; margin-bottom:14px; font-size:11pt;">
        <tr>
          <td style="width:55%;"></td>
          <td style="width:45%; text-align:left; vertical-align:top;">
            Lampiran Surat Deputi Bidang<br>
            Pemantauan dan Pengawasan<br>
            <table style="width:100%; border-collapse:collapse;">
              <tr><td style="width:60px;">Nomor</td><td style="width:12px;">:</td><td>\${nomor_naskah}</td></tr>
              <tr><td>Tanggal</td><td>:</td><td>${tglSurat}</td></tr>
            </table>
          </td>
        </tr>
      </table>
      
      <div class="lampiran-title">${data.jenisSuratTemplate === 'pencabutan' ? 'SPPG YANG DICABUT PEMBERHENTIAN OPERASIONAL SEMENTARA' : `SPPG YANG DIBERHENTIKAN OPERASIONAL SEMENTARA DENGAN KATEGORI ${kategori.toUpperCase()} (PILIH)`}</div>
      <table class="lampiran">
        <tr><th>No.</th><th>Nama SPPG</th><th>ID SPPG</th><th>Nama Yayasan</th><th>Tanggal Operasional</th><th>Kategori</th></tr>
        ${rows}
      </table>
      ${signBlockTable}
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
