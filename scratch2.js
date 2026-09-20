const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

try {
    const content = fs.readFileSync('Proyek/Surat Teguran.docx', 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });
    const iModule = require('docxtemplater/js/inspect-module')();
    doc.attachModule(iModule);
    doc.render(); // This will fail if tags are missing, but we can check tags
    console.log(iModule.getAllTags());
} catch (e) {
    console.log(e);
}
