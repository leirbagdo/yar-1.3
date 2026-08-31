/**
 * assets/js/agente.js
 * Extraído de pages/agente.html — chat simulado do Yarã Bot.
 *
 * NOTA (decisão de arquitetura): esta página não constava na lista
 * de arquivos JS pedida na Parte 1, mas continha uma lógica de chat
 * considerável embutida no HTML. Para cumprir a regra "nenhum HTML
 * deve ter lógica grande interna", foi extraída para este arquivo
 * próprio em vez de ser forçada dentro de outro dos módulos citados.
 */

function initAgentePage() {
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');

    function addMessage(text, type) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg msg-${type}`;
        msgDiv.innerText = text;
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        userInput.value = '';

        // Simulação de resposta (comportamento original preservado)
        setTimeout(() => {
            addMessage(
                'Essa é uma pergunta excelente! No Maranhão, temos uma diversidade linguística incrível. Você sabia que o povo Guajajara fala a língua Tenetehara?',
                'bot'
            );
        }, 1000);
    }

    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
}

document.addEventListener('DOMContentLoaded', initAgentePage);
