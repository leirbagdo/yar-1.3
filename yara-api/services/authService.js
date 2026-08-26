/**
 * services/authService.js
 *
 * Regras de negócio de cadastro/login. Mantém exatamente o comportamento
 * original (bcrypt + JWT + fallback JSON), apenas fora de index.js.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../models/usuarioRepository');
const env = require('../config/env');

function erroValidacao(mensagem) {
    const erro = new Error(mensagem);
    erro.status = 400;
    return erro;
}

function gerarToken(usuario) {
    return jwt.sign(
        { id: usuario.id, email: usuario.email, role: usuario.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );
}

const authService = {
    async cadastrar({ nome, email, senha }) {
        if (!nome?.trim()) throw erroValidacao('O nome é obrigatório');
        if (!email?.trim()) throw erroValidacao('O e-mail é obrigatório');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw erroValidacao('Formato de e-mail inválido');
        if (!senha?.trim()) throw erroValidacao('A senha é obrigatória');
        if (senha.length < 6) throw erroValidacao('A senha precisa ter pelo menos 6 caracteres');

        const senhaHash = await bcrypt.hash(senha, env.SALT_ROUNDS);
        const resultado = await usuarioRepository.create({
            nome: nome.trim(),
            email: email.toLowerCase().trim(),
            senhaHash,
        });

        if (!resultado.ok) throw erroValidacao('E-mail já cadastrado');
        return resultado;
    },

    async autenticar({ email, senha }) {
        if (!email?.trim()) throw erroValidacao('O e-mail é obrigatório');
        if (!senha?.trim()) throw erroValidacao('A senha é obrigatória');

        const encontrado = await usuarioRepository.findByEmail(email);
        if (!encontrado) {
            const erro = new Error('E-mail ou senha incorretos');
            erro.status = 401;
            throw erro;
        }

        const { usuario, origem } = encontrado;
        const hashArmazenado = origem === 'mysql' ? usuario.senha_hash : usuario.senha;
        const senhaConfere = await bcrypt.compare(senha, hashArmazenado);

        if (!senhaConfere) {
            const erro = new Error('E-mail ou senha incorretos');
            erro.status = 401;
            throw erro;
        }

        return {
            token: gerarToken(usuario),
            user: { nome: usuario.nome, email: usuario.email, role: usuario.role },
        };
    },
};

module.exports = authService;
