/**
 * assets/js/biblioteca.js
 * Extraído/atualizado de pages/biblioteca.html (Parte 1, 3 e 4).
 *
 * Responsável por: carregar o acervo da API (/api/acervo), montar os
 * cards, filtrar por tipo e buscar por texto. As ações de CRUD
 * (adicionar/editar/excluir) ficam em assets/js/dashboard.js —
 * biblioteca.js chama funções expostas por ele.
 *
 * Depende de assets/js/config.js e assets/js/auth.js.
 */

let todosItens = [];
let filtroAtivo = 'todos';
let buscaAtual = '';

// Ícone e rótulo por tipo (Parte 4: ícone do tipo do arquivo)
const TIPO_CONFIG = {
    documento: { icon: 'fa-file-pdf', label: 'Documento' },
    audio: { icon: 'fa-volume-up', label: 'Áudio' },
    video: { icon: 'fa-video', label: 'Vídeo' },
    imagem: { icon: 'fa-image', label: 'Imagem' },
    outro: { icon: 'fa-file-alt', label: 'Outro' },
};

function formatarData(dataUpload) {
    if (!dataUpload) return '';
    return new Date(dataUpload).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: '2-digit' });
}

function criarCard(item) {
    const cfg = TIPO_CONFIG[item.tipo] || TIPO_CONFIG.outro;
    const data = formatarData(item.data_upload);
    const arquivoUrl = item.arquivo ? `${API_URL}${item.arquivo}` : null;
    const semArquivo = arquivoUrl ? '' : 'is-disabled';

    return `
    <article class="asset-card glass card-hover-effect" data-tipo="${item.tipo}" data-id="${item.id}">
        <div class="asset-icon"><i class="fas ${cfg.icon}"></i></div>
        <span class="asset-tipo-badge">${item.categoria || cfg.label}</span>
        <h3 class="asset-title">${item.titulo}</h3>
        <p class="asset-desc">${item.descricao || 'Sem descrição disponível.'}</p>
        <div class="asset-extra">
            ${item.idioma ? `<span><strong>Idioma:</strong> ${item.idioma}</span>` : ''}
            ${item.povo ? `<span><strong>Povo:</strong> ${item.povo}</span>` : ''}
            ${item.autor ? `<span><strong>Autor:</strong> ${item.autor}</span>` : ''}
        </div>
        <div class="asset-meta">
            <span class="asset-etnia">${data ? `<span>${data}</span>` : ''}</span>
            <div class="asset-actions">
                <a class="icon-btn ${semArquivo}" href="${arquivoUrl || '#'}" target="_blank" rel="noopener"
                   title="Visualizar" ${!arquivoUrl ? 'tabindex="-1" aria-disabled="true"' : ''}>
                    <i class="fas fa-eye"></i>
                </a>
                <a class="icon-btn ${semArquivo}" href="${arquivoUrl || '#'}" download
                   title="Baixar" ${!arquivoUrl ? 'tabindex="-1" aria-disabled="true"' : ''}>
                    <i class="fas fa-download"></i>
                </a>
                <button class="icon-btn" title="Editar" onclick="abrirModalEdicao(${item.id})">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="icon-btn icon-btn-danger" title="Excluir" onclick="excluirItemAcervo(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    </article>`;
}

function renderizar() {
    const grid = document.getElementById('grid-acervo');
    const contador = document.getElementById('contador');

    const busca = buscaAtual.toLowerCase().trim();
    const filtrados = todosItens.filter((item) => {
        const matchTipo = filtroAtivo === 'todos' || item.tipo === filtroAtivo;
        const matchBusca = !busca
            || item.titulo?.toLowerCase().includes(busca)
            || item.descricao?.toLowerCase().includes(busca)
            || item.povo?.toLowerCase().includes(busca)
            || item.idioma?.toLowerCase().includes(busca)
            || item.autor?.toLowerCase().includes(busca);
        return matchTipo && matchBusca;
    });

    if (filtrados.length === 0) {
        grid.innerHTML = `
        <div class="estado-container">
            <i class="fas fa-search"></i>
            <p>Nenhum item encontrado${busca ? ` para "<strong>${busca}</strong>"` : ''} nesta categoria.</p>
        </div>`;
        contador.textContent = '';
    } else {
        grid.innerHTML = filtrados.map(criarCard).join('');
        const total = todosItens.length;
        contador.textContent = filtrados.length === total
            ? `${total} item${total !== 1 ? 's' : ''} no acervo`
            : `${filtrados.length} de ${total} item${total !== 1 ? 's' : ''}`;
    }
}

async function carregarAcervo() {
    const grid = document.getElementById('grid-acervo');
    try {
        const res = await fetch(`${API_URL}/api/acervo`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        todosItens = json.data || json || [];
        if (todosItens.length === 0) {
            grid.innerHTML = `
            <div class="estado-container">
                <i class="fas fa-book-open"></i>
                <p>O acervo ainda não possui itens cadastrados.</p>
            </div>`;
            document.getElementById('contador').textContent = '';
        } else {
            renderizar();
        }
    } catch (err) {
        console.error('Erro ao carregar acervo:', err);
        grid.innerHTML = `
        <div class="estado-container">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Não foi possível carregar o acervo.<br>
               <small>Verifique se a API está rodando em <code>${API_URL}</code></small></p>
            <button class="filter-btn u-mt-8" onclick="location.reload()">
                <i class="fas fa-redo u-mr-6"></i>Tentar novamente
            </button>
        </div>`;
    }
}

function initBibliotecaPage() {
    checkUser();
    carregarAcervo();

    document.getElementById('filtros').addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        filtroAtivo = btn.dataset.tipo;
        renderizar();
    });

    let debounceTimer;
    document.getElementById('busca').addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            buscaAtual = e.target.value;
            renderizar();
        }, 250);
    });
}

document.addEventListener('DOMContentLoaded', initBibliotecaPage);
