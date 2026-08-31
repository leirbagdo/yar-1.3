/**
 * assets/js/etnia.js
 *
 * As 11 páginas em pages/etnias/*.html continham, cada uma, o mesmo
 * par de linhas:
 *     injectMap('miniMap');
 *     highlightRegion('<regiao>');
 * mudando apenas o nome da região. Em vez de criar 11 arquivos JS
 * quase idênticos, este único arquivo lê a região a partir do
 * atributo `data-region` do próprio elemento #miniMap — eliminando
 * a duplicação.
 *
 * Depende de assets/js/map_generator.js (injectMap, highlightRegion).
 */

function initEtniaPage() {
    const miniMap = document.getElementById('miniMap');
    if (!miniMap) return;

    injectMap('miniMap');

    const regiao = miniMap.getAttribute('data-region');
    if (regiao) highlightRegion(regiao);
}

document.addEventListener('DOMContentLoaded', initEtniaPage);
