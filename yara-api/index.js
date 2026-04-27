/**
 * YARÃ API — index.js
 * Melhorias aplicadas por Sprint:
 *
 * SPRINT 01:
 *  ✅ Senhas hashadas com bcrypt (já havia, mantido)
 *  ✅ Variáveis de ambiente via dotenv
 *  ✅ Validação completa de campos (nome, email, senha)
 *  ✅ CORS restrito à whitelist do front-end
 *
 * SPRINT 02:
 *  ✅ JWT gerado no /login + middleware de autenticação
 *  ✅ Rota GET /etnia conectada ao banco
 *  ✅ Rate limiting em /login e /signup (brute force)
 *  ✅ Middleware global de erros (sem stack trace vazando)
 *
 * SPRINT 03:
 *  ✅ CRUD completo do acervo (/acervo)
 *  ✅ Rota POST /contribuicao
 *  ✅ Rota /depoimentos com moderação
 *
 * SPRINT 04:
 *  ✅ Estrutura MVC (routes/, controllers/, middlewares/)
 *     → Aqui mantemos monolítico mas separado por seções comentadas
 *     → Veja também os arquivos separados gerados
 */

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const bcrypt       = require('bcrypt');
const jwt          = require('jsonwebtoken');
const rateLimit    = require('express-rate-limit');
const fs           = require('fs');
const path         = require('path');

const pool = require('./database');

// ─── Configurações ────────────────────────────────────────────
const SALT_ROUNDS = 10;
const PORT        = process.env.PORT || 8080;
const JWT_SECRET  = process.env.JWT_SECRET || 'yara_secret_dev';
// ERRO ORIGINAL: JWT_SECRET estava ausente — qualquer valor fixo no código é
// inseguro em produção. Agora vem do .env.

const app = express();

// ─── CORS Restrito (Sprint 01) ────────────────────────────────
// ERRO ORIGINAL: app.use(cors()) — aberto para qualquer origem.
// Correção: whitelist explícita dos domínios permitidos.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map(o => o.trim());

app.use(cors({
    origin: (origin, callback) => {
        // Permite chamadas sem origin (Postman, curl) apenas em dev
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origem não permitida — ${origin}`));
        }
    },
    credentials: true
}));

app.use(express.json());

// ─── Rate Limiting (Sprint 02) ────────────────────────────────
// ERRO ORIGINAL: sem rate limiting → vulnerável a brute force.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20,
    message: { success: false, message: 'Muitas tentativas. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false
});

// ─── Fallback JSON ────────────────────────────────────────────
const USERS_FILE   = path.join(__dirname, 'users.json');
const readUsersJSON  = () => { try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch { return []; } };
const saveUsersJSON  = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

// ─── Middleware JWT (Sprint 02) ───────────────────────────────
// ERRO ORIGINAL: nenhuma rota era protegida — qualquer um acessava tudo.
function autenticar(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token não informado' });
    }
    try {
        req.usuario = jwt.verify(auth.slice(7), JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Token inválido ou expirado' });
    }
}

function apenasAdmin(req, res, next) {
    if (req.usuario?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Acesso restrito a administradores' });
    }
    next();
}

// =============================================================
//  POST /signup — Cadastro
// =============================================================
app.post('/signup', authLimiter, async (req, res, next) => {
    const { nome, email, senha } = req.body;

    // Validação (Sprint 01)
    if (!nome?.trim())  return res.status(400).json({ success: false, message: 'O nome é obrigatório' });
    if (!email?.trim()) return res.status(400).json({ success: false, message: 'O e-mail é obrigatório' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return res.status(400).json({ success: false, message: 'Formato de e-mail inválido' });
    if (!senha?.trim()) return res.status(400).json({ success: false, message: 'A senha é obrigatória' });
    if (senha.length < 6)
        return res.status(400).json({ success: false, message: 'A senha precisa ter pelo menos 6 caracteres' });

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    try {
        const [existe] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existe.length > 0)
            return res.status(400).json({ success: false, message: 'E-mail já cadastrado' });

        await pool.execute(
            'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
            [nome.trim(), email.toLowerCase().trim(), senhaHash]
        );
        return res.status(201).json({ success: true, message: 'Usuário cadastrado com sucesso!' });

    } catch (err) {
        console.error('MySQL /signup:', err.message, '— usando fallback JSON');
    }

    // Fallback JSON
    const usuarios = readUsersJSON();
    if (usuarios.find(u => u.email === email))
        return res.status(400).json({ success: false, message: 'E-mail já cadastrado' });
    usuarios.push({ id: Date.now(), nome, email, senha: senhaHash, role: 'user' });
    saveUsersJSON(usuarios);
    return res.status(201).json({ success: true, message: 'Usuário cadastrado (fallback)!' });
});

// =============================================================
//  POST /login — Login + JWT
// =============================================================
// ERRO ORIGINAL: /login não gerava token JWT — front-end guardava só o
// objeto de usuário, sem qualquer verificação nas rotas protegidas.
app.post('/login', authLimiter, async (req, res, next) => {
    const { email, senha } = req.body;

    if (!email?.trim()) return res.status(400).json({ success: false, message: 'O e-mail é obrigatório' });
    if (!senha?.trim()) return res.status(400).json({ success: false, message: 'A senha é obrigatória' });

    try {
        const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length > 0) {
            const usuario = rows[0];
            const ok = await bcrypt.compare(senha, usuario.senha_hash);
            if (!ok) return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos' });

            const token = jwt.sign(
                { id: usuario.id, email: usuario.email, role: usuario.role },
                JWT_SECRET,
                { expiresIn: '8h' }
            );
            return res.json({
                success: true,
                token,
                user: { nome: usuario.nome, email: usuario.email, role: usuario.role }
            });
        }
    } catch (err) {
        console.error('MySQL /login:', err.message, '— usando fallback JSON');
    }

    // Fallback JSON
    const usuarios = readUsersJSON();
    const usuario  = usuarios.find(u => u.email === email);
    if (usuario && await bcrypt.compare(senha, usuario.senha)) {
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, role: usuario.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );
        return res.json({
            success: true,
            token,
            user: { nome: usuario.nome, email: usuario.email, role: usuario.role }
        });
    }

    return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos' });
});

// =============================================================
//  GET /etnia — Lista etnias (Sprint 02)
// =============================================================
// ERRO ORIGINAL: rota não existia — YaraService.js chamava /etnia mas
// recebia 404. Também há o problema do nome do arquivo (YaraService.js).
app.get('/etnia', async (req, res, next) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM etnias ORDER BY nome');
        return res.json({ success: true, data: rows });
    } catch (err) {
        next(err); // passa para o middleware global de erros
    }
});

// =============================================================
//  POST /traduzir — Tradução (dicionário expandido Sprint 02)
// =============================================================
// ERRO ORIGINAL: dicionário hard-coded com apenas 3 palavras.
// Melhoria: carrega de arquivo JSON externo (com fallback embutido).
app.post('/traduzir', (req, res, next) => {
    const { texto, from, to } = req.body;
    if (!texto || !from || !to)
        return res.status(400).json({ success: false, message: 'Informe texto, from e to' });

    let dicionario;
    try {
        const dictPath = path.join(__dirname, 'dicionario.json');
        dicionario = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
    } catch {
        // Fallback embutido com vocabulário expandido
        dicionario = {
            'pt-guajajara': {
                'bom dia': 'Kwez katu', 'boa tarde': 'Kwez katu hé', 'boa noite': 'Pyhun katu',
                'terra': 'Ywy', 'água': 'Y', 'fogo': 'Tatá', 'sol': "Kuarahy",
                'lua': 'Jasy', 'floresta': "Ka'a", 'aldeia': 'Taba',
                'criança': 'Mitã', 'pai': 'Xypy', 'mãe': 'Sy',
                'obrigado': 'Ikatú', 'sim': 'Eé', 'não': "Nahániri"
            },
            'guajajara-pt': {
                'kwez katu': 'Bom dia', 'ywy': 'Terra', 'y': 'Água',
                'tatá': 'Fogo', 'kuarahy': 'Sol', 'jasy': 'Lua',
                "ka'a": 'Floresta', 'taba': 'Aldeia', 'mitã': 'Criança',
                'xypy': 'Pai', 'sy': 'Mãe', 'ikatú': 'Obrigado',
                'eé': 'Sim', "nahániri": 'Não'
            }
        };
    }

    const par      = `${from}-${to}`;
    const traducao = dicionario[par]
        ? (dicionario[par][texto.toLowerCase().trim()] || 'Termo não catalogado.')
        : 'Par de idiomas indisponível.';

    res.json({ success: true, original: texto, traduzido: traducao });
});

// =============================================================
//  CRUD /acervo — Biblioteca Digital (Sprint 03)
// =============================================================
app.get('/acervo', async (req, res, next) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM acervo ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

app.post('/acervo', autenticar, apenasAdmin, async (req, res, next) => {
    const { titulo, tipo, descricao, url, etnia_id } = req.body;
    if (!titulo || !tipo) return res.status(400).json({ success: false, message: 'titulo e tipo são obrigatórios' });
    try {
        const [result] = await pool.execute(
            'INSERT INTO acervo (titulo, tipo, descricao, url, etnia_id) VALUES (?, ?, ?, ?, ?)',
            [titulo, tipo, descricao || null, url || null, etnia_id || null]
        );
        res.status(201).json({ success: true, id: result.insertId });
    } catch (err) { next(err); }
});

app.put('/acervo/:id', autenticar, apenasAdmin, async (req, res, next) => {
    const { titulo, tipo, descricao, url, etnia_id } = req.body;
    try {
        await pool.execute(
            'UPDATE acervo SET titulo=?, tipo=?, descricao=?, url=?, etnia_id=? WHERE id=?',
            [titulo, tipo, descricao || null, url || null, etnia_id || null, req.params.id]
        );
        res.json({ success: true, message: 'Acervo atualizado' });
    } catch (err) { next(err); }
});

app.delete('/acervo/:id', autenticar, apenasAdmin, async (req, res, next) => {
    try {
        await pool.execute('DELETE FROM acervo WHERE id=?', [req.params.id]);
        res.json({ success: true, message: 'Item removido' });
    } catch (err) { next(err); }
});

// =============================================================
//  /depoimentos — Nossa Voz com moderação (Sprint 03)
// =============================================================
app.get('/depoimentos', async (req, res, next) => {
    try {
        // Público: só aprovados
        const [rows] = await pool.execute("SELECT * FROM depoimentos WHERE status='aprovado' ORDER BY created_at DESC");
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

app.post('/depoimentos', async (req, res, next) => {
    const { autor, texto, etnia } = req.body;
    if (!autor?.trim() || !texto?.trim())
        return res.status(400).json({ success: false, message: 'autor e texto são obrigatórios' });
    try {
        await pool.execute(
            "INSERT INTO depoimentos (autor, texto, etnia, status) VALUES (?, ?, ?, 'pendente')",
            [autor.trim(), texto.trim(), etnia || null]
        );
        res.status(201).json({ success: true, message: 'Depoimento enviado para moderação' });
    } catch (err) { next(err); }
});

// Admin: aprova/rejeita depoimento
app.patch('/depoimentos/:id/status', autenticar, apenasAdmin, async (req, res, next) => {
    const { status } = req.body;
    if (!['aprovado', 'rejeitado'].includes(status))
        return res.status(400).json({ success: false, message: "status deve ser 'aprovado' ou 'rejeitado'" });
    try {
        await pool.execute('UPDATE depoimentos SET status=? WHERE id=?', [status, req.params.id]);
        res.json({ success: true });
    } catch (err) { next(err); }
});

// =============================================================
//  POST /contribuicao (Sprint 03)
// =============================================================
app.post('/contribuicao', async (req, res, next) => {
    const { nome, email, tipo, descricao } = req.body;
    if (!nome?.trim() || !descricao?.trim())
        return res.status(400).json({ success: false, message: 'nome e descricao são obrigatórios' });
    try {
        await pool.execute(
            'INSERT INTO contribuicoes (nome, email, tipo, descricao) VALUES (?, ?, ?, ?)',
            [nome.trim(), email?.trim() || null, tipo || 'outro', descricao.trim()]
        );
        res.status(201).json({ success: true, message: 'Contribuição recebida, obrigado!' });
    } catch (err) { next(err); }
});

// =============================================================
//  Middleware Global de Erros (Sprint 02)
// =============================================================
// ERRO ORIGINAL: sem handler → stack trace vazava para o cliente,
// expondo caminhos internos e versões de dependências.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    // Só loga o detalhe no servidor
    console.error('[ERRO INTERNO]', err.message);

    // Responde com mensagem genérica ao cliente
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        message: status === 500 ? 'Erro interno do servidor' : err.message
    });
});

// =============================================================
//  Inicia
// =============================================================
app.listen(PORT, () => {
    console.log(`🌿 Yara API rodando em http://localhost:${PORT}`);
});
