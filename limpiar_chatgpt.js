const fs = require('fs');
const path = require('path');

// Función para eliminar un archivo si existe
function eliminarArchivo(ruta) {
    if (fs.existsSync(ruta)) {
        fs.unlinkSync(ruta);
        console.log(`✅ Archivo eliminado: ${ruta}`);
    } else {
        console.log(`⚠️ Archivo no encontrado: ${ruta}`);
    }
}

// Función para eliminar una línea específica de un archivo
function eliminarLineaDeArchivo(rutaArchivo, textoEliminar) {
    if (fs.existsSync(rutaArchivo)) {
        let contenido = fs.readFileSync(rutaArchivo, 'utf-8');
        const nuevasLineas = contenido.split('\n').filter(linea => !linea.includes(textoEliminar)).join('\n');
        fs.writeFileSync(rutaArchivo, nuevasLineas, 'utf-8');
        console.log(`✅ Eliminado '${textoEliminar}' de ${rutaArchivo}`);
    } else {
        console.log(`⚠️ Archivo no encontrado: ${rutaArchivo}`);
    }
}

console.log("🔍 Iniciando limpieza de residuos de ChatGPT...");

// Rutas de los archivos a eliminar
const archivosAEliminar = [
    path.join(__dirname, '.env'),
    path.join(__dirname, 'app/controllers/chatbotController.js'),
    path.join(__dirname, 'openaiService.js'),
    path.join(__dirname, 'routes/chatbotRoutes.js')
];

// Eliminar archivos
archivosAEliminar.forEach(eliminarArchivo);

// Modificar index.js para eliminar referencias a OpenAI
const indexJsPath = path.join(__dirname, 'index.js');
eliminarLineaDeArchivo(indexJsPath, "const { getResponse } = require('./openaiService');");
eliminarLineaDeArchivo(indexJsPath, "const chatbotRoutes = require('./routes/chatbotRoutes');");
eliminarLineaDeArchivo(indexJsPath, "app.use('/api/chatbot', chatbotRoutes);");

console.log("✅ Limpieza completada. Tu código ya no tiene residuos de la integración fallida de ChatGPT.");
