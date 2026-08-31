/**
 * assets/js/mapa.js
 * Extraído de pages/mapa_real.html — carrega o contorno SVG do
 * Maranhão a partir de ma_path.txt e trata o clique no mapa.
 */

function initMapaRealPage() {
    const shape = document.getElementById('ma-shape');
    const status = document.getElementById('map-status');

    fetch('../../ma_path.txt')
        .then((r) => {
            if (!r.ok) throw new Error('Arquivo não encontrado');
            return r.text();
        })
        .then((text) => {
            const d = text.trim().replace(/^d="/, '').replace(/"$/, '');
            shape.setAttribute('d', d);
            status.textContent = '';
        })
        .catch((err) => {
            status.textContent = 'Erro ao carregar mapa.';
            console.error('Mapa:', err);
        });

    shape.addEventListener('click', () => {
        shape.classList.add('is-clicked');
        setTimeout(() => shape.classList.remove('is-clicked'), 600);
    });
}

document.addEventListener('DOMContentLoaded', initMapaRealPage);
