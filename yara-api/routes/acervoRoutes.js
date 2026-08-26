/**
 * routes/acervoRoutes.js
 *
 * REST completo do acervo digital — Parte 2 do pedido.
 * Montado em /api/acervo (ver routes/index.js).
 *
 * Leitura é pública; criação/edição/exclusão exigem usuário autenticado
 * com papel de administrador (mesma regra que já existia no projeto
 * original para o CRUD do acervo).
 */

const express = require('express');
const acervoController = require('../controllers/acervoController');
const { autenticar, apenasAdmin } = require('../middlewares/auth');
const { upload } = require('../config/upload');

const router = express.Router();

router.get('/', acervoController.listar);
router.get('/:id', acervoController.buscarPorId);

router.post('/', autenticar, apenasAdmin, upload.single('arquivo'), acervoController.criar);
router.put('/:id', autenticar, apenasAdmin, upload.single('arquivo'), acervoController.atualizar);
router.delete('/:id', autenticar, apenasAdmin, acervoController.excluir);

module.exports = router;
