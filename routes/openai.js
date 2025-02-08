const express = require('express');
const router = express.Router();
const { getResponse } = require('../openaiService'); // Importar el servicio de OpenAI

router.get('/test', async (req, res) => {
    const prompt = "Dame una lista de beneficios de hacer ejercicio";
    try {
        const respuesta = await getResponse(prompt);
        res.send(`<h1>Respuesta de OpenAI:</h1><p>${respuesta}</p>`);
    } catch (error) {
        res.status(500).send("Error al obtener respuesta de OpenAI.");
    }
});

module.exports = router;
