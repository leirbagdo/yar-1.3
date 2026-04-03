const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { connectDB } = require('./database');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;
const app = express();
app.use(express.json());
app.use(cors());

const port = 8080;
const USERS_FILE = path.join(__dirname, 'users.json');

// --- Utilitários para JSON (Fallback) ---
const readUsersJSON = () => {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

const saveUsersJSON = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// --- Rotas da API ---

// Rota de Cadastro
app.post('/signup', async (req, res) => {
    const { nome, email, senha } = req.body;


    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    
    try {
        const db = await connectDB();
        if (db) {
            // Lógica MySQL
            const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
            if (rows.length > 0) {
                return res.status(400).json({ success: false, message: "E-mail já cadastrado no MySQL" });
            }
            await db.execute('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', [nome, email, senhaHash]);
            return res.status(201).json({ success: true, message: "Usuário cadastrado no MySQL" });
        }
    } catch (err) {
        console.log("MySQL não disponível, usando JSON como fallback...");
    }

    // Lógica JSON (Fallback)
    
    const usuarios = readUsersJSON();
    if (usuarios.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: "E-mail já cadastrado (JSON)" });
    }
    // ✅ Salva senhaHash no JSON também
    const novoUsuario = { id: Date.now(), nome, email, senha: senhaHash, role: "user" };
    usuarios.push(novoUsuario);
    saveUsersJSON(usuarios);
    res.status(201).json({ success: true, user: { nome: novoUsuario.nome, email: novoUsuario.email }, source: 'json' });
     // ✅ Mostra o resultado no terminal
    console.log("=== LOGIN ===");
    console.log("Senha digitada:", senha);
    console.log("Hash no banco:", usuario.senha);
    console.log("Senha correta?", senhaCorreta); // true ou false
});

// Rota de Login
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const db = await connectDB();
        if (db) {
            // ✅ Busca só pelo email (não pela senha)
            const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
            if (rows.length > 0) {
                const usuario = rows[0];
                // ✅ Compara a senha digitada com o hash salvo
                const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
                if (senhaCorreta) {
                    return res.status(200).json({ success: true, user: { nome: usuario.nome, email: usuario.email, role: usuario.role }, source: 'mysql' });
                } else {
                    return res.status(401).json({ success: false, message: "Credenciais inválidas" });
                }
            }
        }
    } catch (err) {
        console.log("MySQL não disponível para login, tentando JSON...");
    }

    // Fallback JSON
    const usuarios = readUsersJSON();
    // ✅ Busca só pelo email
    const usuario = usuarios.find(u => u.email === email);
    if (usuario) {
        // ✅ Compara a senha com o hash
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (senhaCorreta) {
            return res.status(200).json({ success: true, user: { nome: usuario.nome, email: usuario.email, role: usuario.role }, source: 'json' });
        }
    }
    res.status(401).json({ success: false, message: "Credenciais inválidas" });
     console.log("Os dois são iguais?", senha === senhaHash);
   
});




// Traduzir
app.post('/traduzir', (req, res) => {
    const { texto, from, to } = req.body;
    const dicionario = {
        "pt-guajajara": { "bom dia": "Kwez katu", "terra": "Ywy", "água": "Y" },
        "guajajara-pt": { "kwez katu": "Bom dia", "ywy": "Terra", "y": "Água" }
    };
    const par = `${from}-${to}`;
    const traducao = dicionario[par] ? (dicionario[par][texto.toLowerCase().trim()] || "Termo não catalogado.") : "Par indisponível.";
    res.json({ original: texto, traduzido: traducao });
});

app.listen(port, () => {
    console.log(`Yara API rodando em http://localhost:${port}`);
    console.log(`Pronta para conectar ao MySQL. Configure database.js quando desejar.`);
});
