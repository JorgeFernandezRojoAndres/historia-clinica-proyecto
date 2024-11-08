const fs = require('fs');
const js2flowchart = require('js2flowchart');
const sharp = require('sharp');
const { PDFDocument, rgb } = require('pdf-lib');

async function generateFlowchartPDF() {
    // Lee el código JavaScript que deseas convertir
    const code = fs.readFileSync('app/controllers/medicosController.js', 'utf-8');
    
    // Genera el SVG del diagrama de flujo
    const flowchartSVG = js2flowchart.convertCodeToSvg(code);
    fs.writeFileSync('diagrama_flujo.svg', flowchartSVG);

    // Convertir SVG a PNG usando sharp
    await sharp('diagrama_flujo.svg').png().toFile('diagrama_flujo.png');
    
    // Crea un PDF e inserta el PNG
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]); // Ajusta el tamaño si es necesario

    // Carga la imagen PNG en el PDF
    const pngImageBytes = fs.readFileSync('diagrama_flujo.png');
    const pngImage = await pdfDoc.embedPng(pngImageBytes);
    const pngDims = pngImage.scale(0.5);

    page.drawImage(pngImage, {
        x: 50,
        y: 300,
        width: pngDims.width,
        height: pngDims.height,
    });

    // Guarda el PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('diagrama_flujo.pdf', pdfBytes);
    console.log('Diagrama de flujo guardado en "diagrama_flujo.pdf"');
}

generateFlowchartPDF().catch((err) => console.error(err));
