import { buildLetterHtmlFull } from './letter-generator.js';
const data = {
  tglSurat: '2026-09-10',
  provinsi: 'Banten',
  kategoriSurat: 'Ringan',
  noSuspend: '123',
  tglSuspend: '2026-09-01',
  namaKppg: 'Serang',
  noND: 'ND-123',
  tglND: '2026-09-05',
  sppgList: [{ nama: 'SPPG 1', id: '1', yayasan: 'Y 1', tglOperasional: '2026-01-01', jenis: 'KM' }]
};
console.log(buildLetterHtmlFull(data));
