/**
 * routes/index.js
 *
 * Agrega todas as rotas da API em um só lugar. Mantém os mesmos
 * caminhos (`/login`, `/signup`, `/etnia`, `/traduzir`, `/depoimentos`,
 * `/contribuicao`) já usados pelo front-end existente, para não quebrar
 * nenhuma tela. A única mudança de caminho é o acervo, que passa a
 * viver em `/api/acervo` — exigência explícita da Parte 2 do pedido de
 * refatoração (ver README/relatório de entrega para detalhes).
 */

const express = require('express');

const authRoutes = require('./authRoutes');
const etniaRoutes = require('./etniaRoutes');
const traducaoRoutes = require('./traducaoRoutes');
const depoimentoRoutes = require('./depoimentoRoutes');
const contribuicaoRoutes = require('./contribuicaoRoutes');
const acervoRoutes = require('./acervoRoutes');

const router = express.Router();

router.use('/', authRoutes);              // /signup, /login
router.use('/etnia', etniaRoutes);        // /etnia
router.use('/traduzir', traducaoRoutes);  // /traduzir
router.use('/depoimentos', depoimentoRoutes); // /depoimentos
router.use('/contribuicao', contribuicaoRoutes); // /contribuicao
router.use('/api/acervo', acervoRoutes);  // /api/acervo (Parte 2)

module.exports = router;
