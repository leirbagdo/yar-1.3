# 🌿 Yarã — Portal Indígena do Maranhão

**Projeto acadêmico | IFMA — Informática para Internet | 2026**

Portal web dedicado à preservação e divulgação das culturas, línguas e territórios dos povos originários do Maranhão.

---

## 🏗️ Estrutura do projeto

```
yar-1.3/
├── yara-api/          ← Back-end Node.js + Express
│   ├── index.js       ← API principal (rotas, middlewares)
│   ├── database.js    ← Pool MySQL (configurado via .env)
│   ├── yara_db.sql    ← Schema completo do banco
│   ├── .env.example   ← Variáveis de ambiente (copiar para .env)
│   ├── package.json
│   └── index.test.js  ← Testes automatizados (Jest + Supertest)
│
└── yara-web/          ← Front-end (HTML, CSS, JS)
    ├── index.html
    ├── assets/
    │   ├── css/modern.css
    │   └── js/map_generator.js
    ├── pages/
    │   ├── login.html
    │   ├── agente.html
    │   ├── biblioteca.html
    │   ├── tradutor.html
    │   ├── timeline.html
    │   ├── nossa-voz.html
    │   ├── contribuir.html
    │   └── etnias/...
    └── src/
        └── YaraService.js  ← Cliente da API (fetch + JWT)
```

---

## ⚙️ Setup local

### 1. Banco de dados (MySQL / XAMPP)

```sql
-- No phpMyAdmin ou terminal MySQL:
source yara-api/yara_db.sql
```

### 2. Back-end

```bash
cd yara-api
cp .env.example .env      # Configure as variáveis
npm install
npm run dev               # Inicia em http://localhost:8080
```

### 3. Front-end

```bash
cd yara-web
npm install
npm run dev               # Vite em http://localhost:5173
```

---

## 🔑 Variáveis de ambiente (`.env`)

| Variável | Descrição | Padrão |
|---|---|---|
| `DB_HOST` | Host do MySQL | `localhost` |
| `DB_USER` | Usuário do MySQL | `root` |
| `DB_PASS` | Senha do MySQL | *(vazio)* |
| `DB_NAME` | Nome do banco | `yara_db` |
| `DB_PORT` | Porta do MySQL | `3307` |
| `JWT_SECRET` | **Segredo JWT — mude em produção!** | `yara_secret_dev` |
| `PORT` | Porta da API | `8080` |
| `ALLOWED_ORIGINS` | Origens CORS (vírgula) | `http://localhost:5173` |
| `GEMINI_API_KEY` | Chave Google Gemini (Sprint 03) | — |

> ⚠️ **Nunca commite o `.env` real no Git.** Adicione ao `.gitignore`.

---

## 🚀 Rotas da API

### Autenticação

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/signup` | Cadastro de usuário | — |
| POST | `/login` | Login → retorna `token` JWT | — |

### Etnias & Conteúdo

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/etnia` | Lista todas as etnias | — |
| GET | `/acervo` | Lista biblioteca digital | — |
| POST | `/acervo` | Cria item no acervo | Admin |
| PUT | `/acervo/:id` | Edita item | Admin |
| DELETE | `/acervo/:id` | Remove item | Admin |
| GET | `/depoimentos` | Lista depoimentos aprovados | — |
| POST | `/depoimentos` | Envia depoimento (fica pendente) | — |
| PATCH | `/depoimentos/:id/status` | Aprova/rejeita depoimento | Admin |
| POST | `/contribuicao` | Envia contribuição | — |
| POST | `/traduzir` | Tradução Guajajara ↔ PT | — |
| POST | `/agente` | Chat com IA (Gemini/OpenAI) | — |

### Autenticação de rotas protegidas

Inclua o header:
```
Authorization: Bearer <token>
```

---

## 🧪 Testes automatizados

```bash
cd yara-api
npm test
```

Cobertura atual:
- `POST /signup` — validação, duplicatas, cadastro
- `POST /login` — credenciais erradas, retorno de token JWT
- `GET /etnia` — resposta da listagem
- `POST /traduzir` — campos obrigatórios, tradução correta
- `GET /acervo` — listagem pública
- `POST /acervo` — bloqueio sem token

---

## 🐳 Deploy (Sprint 04)

### Dockerfile (API)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 8080
CMD ["node", "index.js"]
```

### Railway / Render

1. Conecte o repositório
2. Configure as variáveis de ambiente no painel
3. Build command: `npm install`
4. Start command: `node index.js`
5. Use um banco MySQL externo (PlanetScale, Railway MySQL, etc.)

---

## 👥 Equipe

| Integrante | Área | Sprint Principal |
|---|---|---|
| Gabriel Martins | Back-end | Segurança, JWT, IA, Deploy |
| Joseph Escher | Back-end | CORS, Rotas, CRUD, Deploy |
| Antônio | Front-end | Login, Sessão, Admin |
| Breno Marques | Front-end | Mapa, Timeline, Mobile |
| 5º Integrante | Front-end | SQL, Tradutor, Nossa Voz, Docs |

---

## 📄 Licença

Projeto acadêmico — IFMA 2026. Conteúdo cultural com fins educacionais.
