/**
 * SPRINT 04 — Testes automatizados da API
 * Cobertura: /login, /signup, /etnia, /acervo, /traduzir
 *
 * Como rodar:
 *   npm install --save-dev jest supertest
 *   npm test
 *
 * ERRO ORIGINAL: zero testes — impossível detectar regressões.
 */

const request = require('supertest');

// Para testes usamos uma versão do app sem chamar app.listen()
// Extraindo o app de index.js ou criamos um app separado para testes.
// Para simplicidade, assumimos que index.js exporta `app` quando
// process.env.NODE_ENV === 'test'.
// Adicione ao final do index.js:
//   if (require.main === module) app.listen(PORT, ...);
//   module.exports = app;

process.env.NODE_ENV = 'test';

let app;

beforeAll(() => {
    // Suprime logs durante testes
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Carrega o app após suprimir logs
    app = require('./index');
});

// ─── /signup ────────────────────────────────────────────────
describe('POST /signup', () => {
    test('recusa campos vazios', async () => {
        const res = await request(app).post('/signup').send({});
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('recusa email inválido', async () => {
        const res = await request(app).post('/signup').send({
            nome: 'Teste', email: 'nao-é-email', senha: '123456'
        });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/e-mail/i);
    });

    test('recusa senha curta', async () => {
        const res = await request(app).post('/signup').send({
            nome: 'Teste', email: 'x@x.com', senha: '123'
        });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/6 caracteres/i);
    });

    test('cadastro bem-sucedido (fallback JSON)', async () => {
        const email = `test_${Date.now()}@yara.im`;
        const res = await request(app).post('/signup').send({
            nome: 'Teste Auto', email, senha: 'senha123'
        });
        expect([200, 201]).toContain(res.status);
        expect(res.body.success).toBe(true);
    });

    test('recusa e-mail duplicado', async () => {
        const email = `dup_${Date.now()}@yara.im`;
        await request(app).post('/signup').send({ nome: 'A', email, senha: 'senha123' });
        const res = await request(app).post('/signup').send({ nome: 'B', email, senha: 'senha456' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/já cadastrado/i);
    });
});

// ─── /login ─────────────────────────────────────────────────
describe('POST /login', () => {
    const email = `login_test_${Date.now()}@yara.im`;
    const senha = 'minhasenha';

    beforeAll(async () => {
        await request(app).post('/signup').send({ nome: 'Login Teste', email, senha });
    });

    test('recusa campos vazios', async () => {
        const res = await request(app).post('/login').send({});
        expect(res.status).toBe(400);
    });

    test('recusa credenciais erradas', async () => {
        const res = await request(app).post('/login').send({ email, senha: 'senhaerrada' });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test('login bem-sucedido retorna token JWT', async () => {
        const res = await request(app).post('/login').send({ email, senha });
        expect([200, 201]).toContain(res.status);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(typeof res.body.token).toBe('string');
    });
});

// ─── /etnia ─────────────────────────────────────────────────
describe('GET /etnia', () => {
    test('retorna lista de etnias', async () => {
        const res = await request(app).get('/etnia');
        // Pode ser 200 (MySQL) ou também 200 com array vazio se banco offline
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success');
    });
});

// ─── /traduzir ──────────────────────────────────────────────
describe('POST /traduzir', () => {
    test('recusa body incompleto', async () => {
        const res = await request(app).post('/traduzir').send({ texto: 'bom dia' });
        expect(res.status).toBe(400);
    });

    test('traduz "bom dia" pt→guajajara', async () => {
        const res = await request(app).post('/traduzir').send({
            texto: 'bom dia', from: 'pt', to: 'guajajara'
        });
        expect(res.status).toBe(200);
        expect(res.body.traduzido).toBe('Kwez katu');
    });

    test('retorna "Termo não catalogado." para palavra desconhecida', async () => {
        const res = await request(app).post('/traduzir').send({
            texto: 'palavrainexistente', from: 'pt', to: 'guajajara'
        });
        expect(res.status).toBe(200);
        expect(res.body.traduzido).toMatch(/não catalogado/i);
    });
});

// ─── /acervo ────────────────────────────────────────────────
describe('GET /acervo', () => {
    test('retorna lista pública do acervo', async () => {
        const res = await request(app).get('/acervo');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success');
    });
});

describe('POST /acervo (protegido)', () => {
    test('recusa sem token', async () => {
        const res = await request(app).post('/acervo').send({ titulo: 'Teste', tipo: 'documento' });
        expect(res.status).toBe(401);
    });
});
