// Importamos el módulo Express para poder utilizar objetos response y request
const express = require('express');

// homeController.js
exports.index = (req, res) => {
    // Renderiza una vista llamada 'index' y pasa variables de título para usar en la plantilla
    res.render('index', {
        title: 'Bienvenido a TurnoExpress'
    });
};
