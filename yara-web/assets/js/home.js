/**
 * assets/js/home.js
 * Extraído de index.html — injeta o mapa do Maranhão, atualiza o
 * cabeçalho para usuário logado e monta o painel de detalhes de
 * cada região ao clicar no mapa.
 *
 * Depende de: assets/js/map_generator.js, assets/js/config.js,
 * assets/js/auth.js (carregados antes deste arquivo).
 */

const regionData = {
    norte: {
        title: 'Norte / Litoral',
        desc: 'Região de manguezais e floresta tropical, onde a resistência se une à biodiversidade marinha.',
        tribes: [
            { name: "Ka'apor", lang: "Ka'apor (Tupi)", link: 'pages/etnias/kaapor.html' },
            { name: 'Awá-Guajá', lang: 'Guajá (Tupi-Guarani)', link: 'pages/etnias/awa-guaja.html' },
        ],
    },
    oeste: {
        title: 'Região Oeste',
        desc: 'A Pré-Amazônia maranhense, território de grandes florestas e guardiões ancestrais.',
        tribes: [
            { name: 'Guajajara', lang: 'Tenetehara', link: 'pages/etnias/guajajara.html' },
            { name: 'Gavião Pukobyê', lang: 'Timbira', link: 'pages/etnias/gaviao.html' },
            { name: 'Krikati', lang: 'Timbira', link: 'pages/etnias/krikati.html' },
        ],
    },
    centro: {
        title: 'Região Central',
        desc: 'O coração do Maranhão, marcado pelos rituais Timbira e o cerrado preservado.',
        tribes: [
            { name: 'Canela Apanyekrá', lang: 'Timbira', link: 'pages/etnias/canela-apa.html' },
            { name: 'Canela Ramkokamekrá', lang: 'Timbira', link: 'pages/etnias/canela-ram.html' },
            { name: 'Timbira', lang: 'Tronco Jê', link: 'pages/etnias/timbira.html' },
        ],
    },
    leste: {
        title: 'Região Leste',
        desc: 'Área de transição e campos, com forte presença da retomada cultural Gamela.',
        tribes: [
            { name: 'Gamela', lang: 'Retomada', link: 'pages/etnias/gamela.html' },
        ],
    },
    sul: {
        title: 'Região Sul',
        desc: 'O alto sertão maranhense, onde o relevo e a cultura Timbira se encontram.',
        tribes: [
            { name: 'Krenyê', lang: 'Língua Jê', link: 'pages/etnias/krenye.html' },
            { name: 'Kreye', lang: 'Língua Jê', link: 'pages/etnias/kreye.html' },
        ],
    },
};

function renderRegion(regionEl) {
    const region = regionEl.getAttribute('data-region');
    const data = regionData[region];
    if (!data) return;

    document.querySelectorAll('.region-path').forEach((p) => p.classList.remove('active'));
    regionEl.classList.add('active');

    document.getElementById('defaultMsg').style.display = 'none';
    document.getElementById('regionContent').style.display = 'block';

    document.getElementById('regionTitle').innerText = data.title;
    document.getElementById('regionDesc').innerText = data.desc;

    const list = document.getElementById('tribeList');
    list.innerHTML = '';
    data.tribes.forEach((tribe) => {
        const item = document.createElement('a');
        item.href = tribe.link;
        item.className = 'tribe-item';
        item.innerHTML = `
            <div>
                <strong class="tribe-item-name">${tribe.name}</strong>
                <small class="u-text-accent">${tribe.lang}</small>
            </div>
            <i class="fas fa-chevron-right"></i>
        `;
        list.appendChild(item);
    });
}

function initHomePage() {
    injectMap('mapContainer');

    checkUser((usuario) => {
        const welcomeTitle = document.getElementById('welcomeTitle');
        if (welcomeTitle) welcomeTitle.innerText = `Olá, ${usuario.nome}! Bem-vindo ao Yarã.`;
    });

    document.querySelectorAll('.region-path').forEach((path) => {
        path.addEventListener('click', function () {
            renderRegion(this);
        });
    });
}

document.addEventListener('DOMContentLoaded', initHomePage);
