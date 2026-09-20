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
    
    // Instead of rendering, let's use the InspectModule to see variables
    const InspectModule = require('docxtemplater/js/inspect-module');
    const iModule = InspectModule();
    
    const doc2 = new Docxtemplater(zip, {
        modules: [iModule]
    });
    const tags = iModule.getAllTags();
    console.log(JSON.stringify(tags, null, 2));
} catch (e) {
    console.error(e);
}
