/**
 * services/traducaoService.js
 *
 * Antes o dicionário "fallback" ficava duplicado como um objeto gigante
 * hard-coded dentro de index.js, repetindo o mesmo conteúdo do arquivo
 * dicionario.json. Isso foi eliminado: agora o dicionário existe em um
 * único lugar (dicionario.json) e este serviço apenas o lê.
 */

const fs = require('fs');
const path = require('path');

const DICT_PATH = path.join(__dirname, '..', 'dicionario.json');

function carregarDicionario() {
    try {
        return JSON.parse(fs.readFileSync(DICT_PATH, 'utf8'));
    } catch (err) {
        console.error('Não foi possível ler dicionario.json:', err.message);
        return {};
    }
}

const traducaoService = {
    traduzir({ texto, from, to }) {
        if (!texto || !from || !to) {
            const erro = new Error('Informe texto, from e to');
            erro.status = 400;
            throw erro;
        }

        const dicionario = carregarDicionario();
        const par = `${from}-${to}`;
        const tabela = dicionario[par];

        const traduzido = tabela
            ? (tabela[texto.toLowerCase().trim()] || 'Termo não catalogado.')
            : 'Par de idiomas indisponível.';

        return { original: texto, traduzido };
    },
};

module.exports = traducaoService;
