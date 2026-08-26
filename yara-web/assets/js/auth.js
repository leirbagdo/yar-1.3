/**
 * assets/js/auth.js
 *
 * Antes as funções checkUser()/logout() estavam coladas, idênticas,
 * dentro do <script> de index.html e tradutor.html (e implícitas em
 * outras páginas que exibiam o mesmo botão "Entrar"). Centralizadas
 * aqui para reuso em qualquer página que tenha um elemento
 * #authContainer no cabeçalho.
 *
 * Depende de assets/js/config.js já ter sido carregado (API_URL).
 */

function getUsuarioLogado() {
    const userJson = localStorage.getItem('yara_user');
    return userJson ? JSON.parse(userJson) : null;
}

function getToken() {
    return localStorage.getItem('yara_token');
}

function logout() {
    localStorage.removeItem('yara_user');
    localStorage.removeItem('yara_token');
    window.location.reload();
}

/**
 * Atualiza o cabeçalho (#authContainer) conforme o estado de login.
 * @param {(usuario: object) => void} [aoLogar] callback opcional executado quando há usuário logado
 */
function checkUser(aoLogar) {
    const usuario = getUsuarioLogado();
    const authContainer = document.getElementById('authContainer');
    if (!usuario || !authContainer) return;

    authContainer.innerHTML = `
        <span class="user-greeting">Olá, ${usuario.nome.split(' ')[0]}!</span>
        <button onclick="logout()" class="btn-modern btn-ghost u-p-btn">Sair</button>
    `;

    if (typeof aoLogar === 'function') aoLogar(usuario);
}
