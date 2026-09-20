import docx
import glob
import re

def process_table(table):
    if len(table.rows) < 2: return
    # Check if this is an SPPG table
    headers = [c.text.strip() for c in table.rows[0].cells]
    if 'Nama SPPG' in headers:
        row = table.rows[1]
        
        # Determine the columns
        for i, header in enumerate(headers):
            if header == 'No.':
                row.cells[i].text = '{#sppgList}'
            elif header == 'Nama SPPG':
                row.cells[i].text = '{nama}'
            elif header == 'ID SPPG':
                row.cells[i].text = '{id}'
            elif header == 'Nama Yayasan':
                row.cells[i].text = '{yayasan}'
            elif 'Tanggal' in header and 'Operasional' in header:
                row.cells[i].text = '{tglOperasional}'
            elif header == 'Kategori':
                row.cells[i].text = '{jenis}{/sppgList}'
            elif 'Usulan' in header:
                row.cells[i].text = '{tglUsulan}'
                
        # If '{/sppgList}' was not added to 'Kategori' (e.g. column missing), add it to the last column
        last_cell = row.cells[-1].text
        if '{/sppgList}' not in last_cell and header != 'Kategori':
             row.cells[-1].text = last_cell + '{/sppgList}'

def replace_in_paragraph(p):
    text = p.text
    if not text.strip(): return
    
    orig = text
    
    # 1. Date
    text = re.sub(r'Jakarta, [\.…]+ 2026', 'Jakarta, {tglSurat}', text)
    
    # 2. SPPG name in header
    text = re.sub(r'Kepala Satuan Pelayanan Pemenuhan Gizi \(SPPG\) [\.…]+(\([0-9]+\))?', 'Kepala Satuan Pelayanan Pemenuhan Gizi (SPPG) {nama_sppg}', text)
    text = re.sub(r'\(Para\) JIKA BANYAK Kepala Satuan Pelayanan Pemenuhan Gizi \(SPPG\) [\.…]+(\(1\))?', '{#isMulti}Para {/isMulti}Kepala Satuan Pelayanan Pemenuhan Gizi (SPPG) {nama_sppg}', text)
    
    # 3. Province
    text = re.sub(r'di Provinsi [\.…]+(\([0-9]+\))?', 'di Provinsi {provinsi}', text)
    
    # 4. KPPG
    text = re.sub(r'Kepala Kantor Pelayanan Pemenuhan Gizi \(KPPG\) [\.…]+(\([0-9]+\))?;', 'Kepala Kantor Pelayanan Pemenuhan Gizi (KPPG) {namaKppg};', text)
    text = re.sub(r'Nota Dinas Kepala KPPG [\.…]+(\([0-9]+\))? Nomor [\.…]+ tanggal [\.…]+ hal [\.…]+;?', '{teks_dasar}', text)

    # 5. Kategori sanksi & jumlah hari
    text = re.sub(r'kategori sanksi ringan/sedang/berat(\([0-9]+\))? dengan jangka waktu maksimal [\.…]+ \([…\.]+\) \(tulis jabaran harinya, misal sepuluh\) hari', 'kategori sanksi {kategori_sanksi} dengan jangka waktu maksimal {lama_sanksi} hari', text)
    
    # 6. Specific Teguran Text
    if 'Sehubungan dengan dasar tersebut di atas, ditemukan adanya ketidaklayakan makanan pada proses distribusi MBG di SPPG Kota Dumai' in text:
        text = 'Sehubungan dengan dasar tersebut di atas, ditemukan adanya ketidaklayakan makanan pada proses distribusi MBG di SPPG {nama_sppg}, yaitu [Uraikan temuan/kejadian ketidaklayakan di sini], sehingga distribusi makanan pada tanggal [Tanggal Distribusi] kepada [Penerima Manfaat] tidak dapat dilaksanakan. Guna mencegah terulangnya kejadian serupa, kepada Saudara diberikan teguran untuk melaksanakan hal-hal sebagai berikut:'
        
    if text != orig:
        p.text = text

def process_file(filename):
    print("Processing", filename)
    doc = docx.Document(filename)
    
    dasar_found = False
    paragraphs_to_delete = []
    
    for i, p in enumerate(doc.paragraphs):
        text = p.text.strip()
        
        # Detect 'Dasar' section and replace following list with loop
        if re.match(r'^Dasar\s*:?$', text):
            dasar_found = True
            # Add the loop start
            p.text = text + "\n{#dasarList}"
            continue
            
        if dasar_found:
            if 'Sehubungan dengan dasar' in text or 'Mempertimbangkan risiko' in text or 'Menindaklanjuti hasil' in text:
                dasar_found = False
                # Insert the loop end before this paragraph
                p.insert_paragraph_before("{/dasarList}")
                replace_in_paragraph(p)
            else:
                # Inside Dasar list. We replace the first item with {teks_dasar} and delete the rest
                if '{teks_dasar}' not in doc.paragraphs[i-1].text:
                    p.text = '{teks_dasar}'
                else:
                    p.text = '' # Clear the paragraph
                continue
                
        replace_in_paragraph(p)
        
    for table in doc.tables:
        process_table(table)
        
    doc.save(filename)
    print("Saved", filename)

files = glob.glob('Proyek/*.docx')
for f in files:
    process_file(f)
