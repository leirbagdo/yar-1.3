/**
 * assets/js/dashboard.js
 *
 * Camada de administração do acervo (Parte 3): abrir/fechar o modal
 * "Adicionar Arquivo", editar um item existente e excluir — tudo via
 * Fetch API, sem recarregar a página. Depois de qualquer operação a
 * lista é recarregada chamando carregarAcervo() (definida em
 * biblioteca.js, carregado antes deste arquivo na mesma página).
 *
 * NOTA (decisão de arquitetura): o back-end original já exigia login
 * de administrador para criar/editar/excluir itens do acervo (regra
 * de segurança preexistente, preservada). Por isso este módulo checa
 * se há um token salvo (ver assets/js/auth.js) antes de tentar
 * qualquer operação de escrita.
 */

let modoEdicaoId = null;

function exigirToken() {
    const token = getToken();
    if (!token) {
        alert('Você precisa estar logado como administrador para gerenciar o acervo. Faça login para continuar.');
        window.location.href = 'login.html';
        return null;
    }
    return token;
}

function abrirModalAdicao() {
    if (!exigirToken()) return;
    modoEdicaoId = null;
    document.getElementById('modalTitulo').innerText = 'Adicionar Arquivo';
    document.getElementById('formAcervo').reset();
    document.getElementById('modalErro').classList.add('u-hidden');
    document.getElementById('campoArquivo').required = true;
    document.getElementById('modalOverlay').classList.remove('u-hidden');
}

function abrirModalEdicao(id) {
    if (!exigirToken()) return;
    const item = todosItens.find((i) => i.id === id);
    if (!item) return;

    modoEdicaoId = id;
    document.getElementById('modalTitulo').innerText = 'Editar Arquivo';
    document.getElementById('campoTitulo').value = item.titulo || '';
    document.getElementById('campoDescricao').value = item.descricao || '';
    document.getElementById('campoIdioma').value = item.idioma || '';
    document.getElementById('campoPovo').value = item.povo || '';
    document.getElementById('campoCategoria').value = item.categoria || '';
    document.getElementById('campoAutor').value = item.autor || '';
    document.getElementById('campoTipo').value = item.tipo || 'outro';
    document.getElementById('campoArquivo').required = false;
    document.getElementById('modalErro').classList.add('u-hidden');
    document.getElementById('modalOverlay').classList.remove('u-hidden');
}

function fecharModal() {
    document.getElementById('modalOverlay').classList.add('u-hidden');
    document.getElementById('formAcervo').reset();
    modoEdicaoId = null;
}

async function excluirItemAcervo(id) {
    const token = exigirToken();
    if (!token) return;

    if (!confirm('Tem certeza que deseja excluir este item do acervo? Essa ação não pode ser desfeita.')) return;

    try {
        const res = await fetch(`${API_URL}/api/acervo/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Falha ao excluir');
        await carregarAcervo();
    } catch (err) {
        alert(err.message || 'Erro ao excluir o item.');
    }
}

async function enviarFormAcervo(e) {
    e.preventDefault();
    const token = exigirToken();
    if (!token) return;

    const modalErro = document.getElementById('modalErro');
    modalErro.classList.add('u-hidden');

    const formData = new FormData();
    formData.append('titulo', document.getElementById('campoTitulo').value.trim());
    formData.append('descricao', document.getElementById('campoDescricao').value.trim());
    formData.append('idioma', document.getElementById('campoIdioma').value.trim());
    formData.append('povo', document.getElementById('campoPovo').value.trim());
    formData.append('categoria', document.getElementById('campoCategoria').value.trim());
    formData.append('autor', document.getElementById('campoAutor').value.trim());
    formData.append('tipo', document.getElementById('campoTipo').value);

    const arquivoInput = document.getElementById('campoArquivo');
    if (arquivoInput.files[0]) formData.append('arquivo', arquivoInput.files[0]);

    const url = modoEdicaoId ? `${API_URL}/api/acervo/${modoEdicaoId}` : `${API_URL}/api/acervo`;
    const method = modoEdicaoId ? 'PUT' : 'POST';

    const btnSalvar = document.getElementById('btnSalvarAcervo');
    btnSalvar.disabled = true;
    btnSalvar.innerText = 'Salvando...';

    try {
        const res = await fetch(url, {
            method,
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Falha ao salvar o item');

        fecharModal();
        await carregarAcervo(); // atualiza a lista automaticamente, sem reload (Parte 3)
    } catch (err) {
        modalErro.textContent = err.message || 'Erro ao salvar o item.';
        modalErro.classList.remove('u-hidden');
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.innerText = 'Salvar';
    }
}

function initDashboard() {
    document.getElementById('btnAdicionarArquivo').addEventListener('click', abrirModalAdicao);
    document.getElementById('modalCloseBtn').addEventListener('click', fecharModal);
    document.getElementById('btnCancelarAcervo').addEventListener('click', fecharModal);
    document.getElementById('formAcervo').addEventListener('submit', enviarFormAcervo);

    // Fecha o modal clicando fora do card
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'modalOverlay') fecharModal();
    });
}

document.addEventListener('DOMContentLoaded', initDashboard);
