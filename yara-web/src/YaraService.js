const API_URL = 'http://localhost:8080';

export const YaraService = {
    async login(email, senha) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        return response.json();
    },

    async getEtnias() {
        const response = await fetch(`${API_URL}/etnia`);
        return response.json();
    },

    async traduzir(texto) {
        const response = await fetch(`${API_URL}/traduzir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto })
        });
        return response.json();
    }
};
