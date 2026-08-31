/**
 * assets/js/tradutor.js
 * Extraído de pages/tradutor.html.
 * Depende de assets/js/config.js e assets/js/auth.js.
 */

function initTradutorPage() {
    checkUser();

    document.getElementById('translateBtn').addEventListener('click', async function () {
        const input = document.getElementById('inputText').value;
        const from = document.getElementById('fromLang').value;
        const to = document.getElementById('toLang').value;
        const output = document.getElementById('outputText');

        if (!input) return;

        output.value = 'Traduzindo...';

        try {
            const response = await fetch(`${API_URL}/traduzir`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texto: input, from, to }),
            });
            const data = await response.json();
            output.value = data.traduzido;
        } catch {
            output.value = 'Erro ao conectar com a API de tradução.';
        }
    });
}

document.addEventListener('DOMContentLoaded', initTradutorPage);
