/**
 * assets/js/login.js
 * Extraído de pages/login.html — lógica das abas Usuário/Admin,
 * alternância Login/Cadastro e envio dos formulários para a API.
 *
 * Depende de assets/js/config.js (API_URL).
 */

let currentLoginType = 'user';

function switchLoginType(type, evento) {
    currentLoginType = type;
    document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
    if (evento?.target) evento.target.classList.add('active');
    document.getElementById('loginTitle').innerText =
        type === 'user' ? 'Acesso do Usuário' : 'Portal do Administrador';
}

function toggleForms() {
    document.getElementById('loginSection').classList.toggle('u-hidden');
    document.getElementById('signupSection').classList.toggle('u-hidden');
}

function initLoginPage() {
    // Verificar se veio para cadastrar (?type=signup)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('type') === 'signup') {
        toggleForms();
    }

    document.querySelectorAll('.tab-btn').forEach((btn, index) => {
        btn.addEventListener('click', (e) => switchLoginType(index === 0 ? 'user' : 'adm', e));
    });

    document.querySelectorAll('[data-toggle-form]').forEach((el) => {
        el.addEventListener('click', toggleForms);
    });

    document.getElementById('loginForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const senha = document.getElementById('loginPass').value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),
            });
            const data = await response.json();

            if (data.success) {
                localStorage.setItem('yara_user', JSON.stringify(data.user));
                // O token é salvo para permitir ações autenticadas (ex.: upload
                // no acervo, Parte 2) — antes era descartado pela tela de login.
                if (data.token) localStorage.setItem('yara_token', data.token);
                window.location.href = '../index.html';
            } else {
                alert(data.message || 'Erro ao fazer login');
            }
        } catch {
            alert('Erro ao conectar com a API');
        }
    });

    document.getElementById('signupForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const nome = document.getElementById('signupNome').value;
        const email = document.getElementById('signupEmail').value;
        const senha = document.getElementById('signupPass').value;

        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha }),
            });
            const data = await response.json();

            if (data.success) {
                alert('Cadastro realizado com sucesso! Faça login para continuar.');
                toggleForms();
            } else {
                alert(data.message || 'Erro ao cadastrar');
            }
        } catch {
            alert('Erro ao conectar com a API');
        }
    });
}

document.addEventListener('DOMContentLoaded', initLoginPage);
