// Este script contém as coordenadas simplificadas para um mapa do Maranhão mais fiel
// Baseado no contorno real, mas otimizado para web e interatividade regional

const maranhaoMap = {
    viewBox: "0 0 400 500",
    regions: [
        {
            id: "norte",
            name: "Norte / Litoral",
            path: "M150,20 L250,25 L280,60 L300,100 L280,130 L200,140 L120,130 L100,80 L130,40 Z",
            labelPos: { x: 180, y: 80 }
        },
        {
            id: "oeste",
            name: "Oeste",
            path: "M120,130 L200,140 L180,250 L150,350 L80,350 L60,250 L80,180 Z",
            labelPos: { x: 110, y: 240 }
        },
        {
            id: "centro",
            name: "Centro",
            path: "M200,140 L280,130 L320,200 L310,300 L250,350 L180,350 L180,250 Z",
            labelPos: { x: 240, y: 240 }
        },
        {
            id: "leste",
            name: "Leste",
            path: "M280,130 L350,140 L380,220 L360,300 L320,320 L320,200 Z",
            labelPos: { x: 340, y: 220 }
        },
        {
            id: "sul",
            name: "Sul",
            path: "M80,350 L150,350 L250,350 L310,300 L320,320 L280,450 L200,480 L120,460 L80,420 Z",
            labelPos: { x: 180, y: 410 }
        }
    ]
};

function injectMap(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let svgHtml = `<svg viewBox="${maranhaoMap.viewBox}" class="map-ma-svg" id="mapaMA">`;
    
    maranhaoMap.regions.forEach(reg => {
        svgHtml += `
            <g class="region-group" data-region="${reg.id}">
                <path d="${reg.path}" class="region-path" data-region="${reg.id}"></path>
                <text x="${reg.labelPos.x}" y="${reg.labelPos.y}" class="region-label">${reg.name.split(' ')[0]}</text>
            </g>
        `;
    });
    
    svgHtml += `</svg>`;
    container.innerHTML = svgHtml;
}

/**
 * Destaca uma região específica no mapa
 * @param {string} regionId - ID da região (norte, oeste, centro, leste, sul)
 */
function highlightRegion(regionId) {
    const paths = document.querySelectorAll('.region-path');
    paths.forEach(p => {
        if (p.getAttribute('data-region') === regionId) {
            p.classList.add('active');
            // Efeito de pulso no destaque
            p.style.filter = 'drop-shadow(0 0 20px var(--accent-glow))';
        } else {
            p.classList.remove('active');
            p.style.opacity = '0.3'; // Esmaece as outras regiões
        }
    });
}
