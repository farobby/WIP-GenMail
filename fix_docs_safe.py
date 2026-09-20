import zipfile, shutil, re, os

REPLACEMENTS_BY_FILE = {
    "xxxx_Surat Pencabutan Pemberhentian Operasional Sementara.docx": [
        # Date
        (r'Jakarta, [\.…\s]+2026', 'Jakarta, {tglSurat}'),
        # Province
        (r'di Provinsi [\.…]+(\([0-9]+\))?', 'di Provinsi {provinsi}'),
        # SPPG in header
        (r'Kepala Satuan Pelayanan Pemenuhan Gizi \(SPPG\)\s+[\.…]+(\([0-9]+\))?', 'Kepala Satuan Pelayanan Pemenuhan Gizi (SPPG) {nama_sppg}'),
        # KPPG
        (r'Kepala Kantor Pelayanan Pemenuhan Gizi \(KPPG\)\s+[\.…]+(\([0-9]+\))?;', 'Kepala Kantor Pelayanan Pemenuhan Gizi (KPPG) {namaKppg};'),
    ],
    "xxxx_Surat Berhenti Ops Sementara (KF).docx": [
        (r'Jakarta, [\.…\s]+2026', 'Jakarta, {tglSurat}'),
        (r'di Provinsi [\.…]+(\([0-9]+\))?', 'di Provinsi {provinsi}'),
        (r'Kepala Satuan Pelayanan Pemenuhan Gizi \(SPPG\)\s+[\.…]+(\([0-9]+\))?', 'Kepala Satuan Pelayanan Pemenuhan Gizi (SPPG) {nama_sppg}'),
        (r'\(Para\) JIKA BANYAK\s+Kepala Satuan Pelayanan Pemenuhan Gizi \(SPPG\)\s+[\.…]+(\([0-9]+\))?', 'Kepala Satuan Pelayanan Pemenuhan Gizi (SPPG) {nama_sppg}'),
        (r'Kepala Kantor Pelayanan Pemenuhan Gizi \(KPPG\)\s+[\.…]+(\([0-9]+\))?;', 'Kepala Kantor Pelayanan Pemenuhan Gizi (KPPG) {namaKppg};'),
        (r'kategori sanksi\s+ringan/sedang/berat(\([0-9]+\))?\s+dengan jangka waktu maksimal\s+[\.…]+\s+\([\.…]+\)\s+\(tulis jabaran harinya, misal sepuluh\)\s+hari', 'kategori sanksi {kategori_sanksi} dengan jangka waktu maksimal {lama_sanksi} hari'),
    ],
    "xxxx_Surat Berhenti Ops Sementara (KM).docx": [
        (r'Jakarta, [\.…\s]+2026', 'Jakarta, {tglSurat}'),
        (r'di Provinsi [\.…]+(\([0-9]+\))?', 'di Provinsi {provinsi}'),
        (r'\(Para\) JIKA BANYAK\s+Kepala Satuan Pelayanan Pemenuhan Gizi \(SPPG\)\s+[\.…]+(\([0-9]+\))?', 'Kepala Satuan Pelayanan Pemenuhan Gizi (SPPG) {nama_sppg}'),
        (r'Kepala Satuan Pelayanan Pemenuhan Gizi \(SPPG\)\s+[\.…]+(\([0-9]+\))?', 'Kepala Satuan Pelayanan Pemenuhan Gizi (SPPG) {nama_sppg}'),
        (r'Kepala Kantor Pelayanan Pemenuhan Gizi \(KPPG\)\s+[\.…]+(\([0-9]+\))?;', 'Kepala Kantor Pelayanan Pemenuhan Gizi (KPPG) {namaKppg};'),
        (r'kategori sanksi\s+ringan/sedang/berat(\([0-9]+\))?\s+dengan jangka waktu maksimal\s+[\.…]+\s+\([\.…]+\)\s+\(tulis jabaran harinya, misal sepuluh\)\s+hari', 'kategori sanksi {kategori_sanksi} dengan jangka waktu maksimal {lama_sanksi} hari'),
    ],
    "Surat Teguran.docx": [
        (r'Jakarta, [\.…\s]+2026', 'Jakarta, {tglSurat}'),
        (r'Kepala Satuan Pelayanan Pemenuhan Gizi \(SPPG\)\s+[\.…]+', 'Kepala Satuan Pelayanan Pemenuhan Gizi (SPPG) {nama_sppg}'),
        (r'di Provinsi [\.…]+', 'di Provinsi {provinsi}'),
        (r'Kepala Kantor Pelayanan Pemenuhan Gizi \(KPPG\)\s+[\.…]+', 'Kepala Kantor Pelayanan Pemenuhan Gizi (KPPG) {namaKppg}'),
    ],
    "Surat Eskalasi KM.docx": [
        (r'Jakarta, [\.…\s]+2026', 'Jakarta, {tglSurat}'),
        (r'di Provinsi [\.…]+(\([0-9]+\))?', 'di Provinsi {provinsi}'),
        (r'Kepala Satuan Pelayanan Pemenuhan Gizi \(SPPG\)\s+[\.…]+(\([0-9]+\))?', 'Kepala Satuan Pelayanan Pemenuhan Gizi (SPPG) {nama_sppg}'),
        (r'Kepala Kantor Pelayanan Pemenuhan Gizi \(KPPG\)\s+[\.…]+(\([0-9]+\))?;', 'Kepala Kantor Pelayanan Pemenuhan Gizi (KPPG) {namaKppg};'),
        (r'kategori sanksi\s+ringan/sedang/berat(\([0-9]+\))?\s+dengan jangka waktu perbaikan\s+[\.…]+\s+\([\.…]+\)\s+hari', 'kategori sanksi {kategori_sanksi} dengan jangka waktu perbaikan {lama_sanksi} hari'),
    ],
}

def xml_escape(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def fix_docx(filename):
    filepath = f"Proyek/{filename}"
    backup = f"Proyek_backup/{filename}"
    
    os.makedirs("Proyek_backup", exist_ok=True)
    if not os.path.exists(backup):
        shutil.copy2(filepath, backup)
    else:
        # Always work from backup to stay idempotent
        shutil.copy2(backup, filepath)
    
    print(f"\n--- Processing {filename} ---")
    
    replacements = REPLACEMENTS_BY_FILE.get(filename, [])
    if not replacements:
        print("  No replacements defined, skipping.")
        return

    with zipfile.ZipFile(filepath, 'r') as z:
        names = z.namelist()
        contents = {}
        for name in names:
            contents[name] = z.read(name)

    target = 'word/document.xml'
    xml = contents[target].decode('utf-8')

    # IMPORTANT: docxtemplater works on the XML level. 
    # We need to replace text while being aware that text may be split across <w:r> runs.
    # Strategy: extract plain text from each <w:t>, apply regex, then rebuild
    # 
    # Simpler approach: strip XML tags to get plain text, do replacement, but we can't put it back
    # Best approach: work on the full XML but be careful about tags splitting the text
    
    # First, let's "merge" split text runs in the XML for easier regex matching.
    # We do this by looking for adjacent <w:t> tags within the same paragraph and merging them.
    # This is a simplified approach that handles common cases.
    
    # Step 1: For each paragraph, get the concatenated text and apply replacements
    # We'll replace the <w:t> content in a smart way
    
    def replace_in_xml(xml, pattern, replacement):
        """Replace text that might be split across <w:t> elements within a paragraph.
        This is done by temporarily joining the text content."""
        
        # Find all paragraphs
        para_pattern = re.compile(r'<w:p[ >].*?</w:p>', re.DOTALL)
        
        def process_para(m):
            para = m.group(0)
            # Get all text runs
            wt_pattern = re.compile(r'(<w:t[^>]*>)(.*?)(</w:t>)', re.DOTALL)
            texts = wt_pattern.findall(para)
            combined = ''.join(t[1] for t in texts)
            
            # Apply replacement on combined text
            new_combined = re.sub(pattern, replacement, combined)
            if new_combined == combined:
                return para  # No change
            
            # Now put back: replace the text in all runs
            # Simple approach: put all text in the first run, empty out the rest
            idx = 0
            def replace_run(m2):
                nonlocal idx
                if idx == 0:
                    result = m2.group(1) + xml_escape(new_combined) + m2.group(3)
                else:
                    result = m2.group(1) + '' + m2.group(3)
                idx += 1
                return result
            
            # Only replace if there's a single run or the text is simple
            if len(texts) == 1:
                new_para = wt_pattern.sub(replace_run, para)
            else:
                # Multiple runs - just do a simple replacement on the first run that contains any text
                new_para = para
                first_replaced = False
                for i, (open_t, content, close_t) in enumerate(texts):
                    if not first_replaced:
                        new_para = new_para.replace(open_t + content + close_t, open_t + xml_escape(new_combined) + close_t, 1)
                        first_replaced = True
                    else:
                        new_para = new_para.replace(open_t + content + close_t, open_t + '' + close_t, 1)
            
            return new_para
        
        return para_pattern.sub(process_para, xml)
    
    for pattern, replacement in replacements:
        xml = replace_in_xml(xml, pattern, replacement)
        
    contents[target] = xml.encode('utf-8')
    
    with zipfile.ZipFile(filepath, 'w', zipfile.ZIP_DEFLATED) as zout:
        for name in names:
            zout.writestr(name, contents[name])
    
    print(f"  Saved: {filepath}")
    print(f"  Backup kept at: {backup}")

for filename in REPLACEMENTS_BY_FILE:
    try:
        fix_docx(filename)
    except Exception as e:
        import traceback
        print(f"ERROR in {filename}: {e}")
        traceback.print_exc()
