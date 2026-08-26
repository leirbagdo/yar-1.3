/**
 * services/etniaService.js
 */

const etniaRepository = require('../models/etniaRepository');

const etniaService = {
    async listar() {
        return etniaRepository.findAll();
    },
};

module.exports = etniaService;
