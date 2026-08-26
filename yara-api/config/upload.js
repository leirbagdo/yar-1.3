/**
 * config/upload.js
 *
 * Configuração central do multer usado pelo CRUD do acervo (Parte 2/5).
 * Os arquivos físicos são salvos em /uploads; apenas o caminho relativo
 * é persistido no banco (campo `arquivo` da tabela `acervo`).
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('./env');

const UPLOAD_PATH = path.join(__dirname, '..', env.UPLOAD_DIR);

// Garante que a pasta de uploads exista
if (!fs.existsSync(UPLOAD_PATH)) {
    fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

// Tipos aceitos: PDF, DOCX, imagens, áudio e vídeo (Parte 2)
const MIME_WHITELIST = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/webm',
    'video/ogg',
];

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_PATH),
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const safeName = file.originalname
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
            .replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, `${timestamp}-${safeName}`);
    },
});

function fileFilter(req, file, cb) {
    if (MIME_WHITELIST.includes(file.mimetype)) {
        return cb(null, true);
    }
    cb(new Error('Tipo de arquivo não suportado. Envie PDF, DOCX, imagem, áudio ou vídeo.'));
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
});

module.exports = { upload, UPLOAD_PATH };
