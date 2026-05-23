-- ============================================================
--  YARÃ DATABASE — schema completo
--  SPRINT 01: adicionar tabelas etnias, acervo, depoimentos
--             e contribuicoes ao schema já existente.
--
--  ERRO ORIGINAL: o SQL original criava apenas `usuarios` e
--  `etnias` com `aldeias`. As tabelas `acervo`, `depoimentos`
--  e `contribuicoes` não existiam, quebrando o Sprint 03.
-- ============================================================

DROP DATABASE IF EXISTS yara_db;
CREATE DATABASE yara_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE yara_db;

-- ============================================================
-- TABELA 1: usuarios
-- ============================================================
CREATE TABLE usuarios (
  id         INT           NOT NULL AUTO_INCREMENT,
  nome       VARCHAR(100)  NOT NULL,
  email      VARCHAR(100)  NOT NULL,
  senha_hash VARCHAR(255)  NOT NULL,
  role       ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_email (email)
);

-- Usuário admin de teste (senha: admin123)
INSERT INTO usuarios (nome, email, senha_hash, role) VALUES
  ('Admin Yarã', 'admin@yara.im',
   '$2b$10$KIX6JpK8V2hH2Qz5v3yFfOWtYPT2X4aKq8hLZkR9nU7vDsMbJeCa', 'admin'),
  ('Usuário Teste', 'teste@yara.im',
   '$2b$10$KIX6JpK8V2hH2Qz5v3yFfOWtYPT2X4aKq8hLZkR9nU7vDsMbJeCa', 'user');

-- ============================================================
-- TABELA 2: etnias
-- ============================================================
CREATE TABLE etnias (
  id                   INT          NOT NULL AUTO_INCREMENT,
  nome                 VARCHAR(100) NOT NULL,
  lingua               VARCHAR(100) NOT NULL,
  tronco_linguistico   ENUM('Tupi','Jê','Isolada') NOT NULL,
  populacao_estimada   INT          DEFAULT NULL,
  territorio           VARCHAR(150) DEFAULT NULL,
  descricao            TEXT         DEFAULT NULL,
  foto_url             VARCHAR(255) DEFAULT NULL,
  regiao               ENUM('norte','oeste','centro','leste','sul') DEFAULT 'centro',
  created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

INSERT INTO etnias (nome, lingua, tronco_linguistico, populacao_estimada, territorio, descricao, regiao) VALUES
  ('Guajajara',         'Tenetehara', 'Tupi', 20000, 'TI Arariboia, TI Caru',         'Um dos maiores povos indígenas do Maranhão, conhecidos pela resistência ao desmatamento.', 'centro'),
  ("Ka'apor",           "Ka'apor",    'Tupi',  1300, 'TI Alto Turiaçu',                'Povo guerreiro do norte do Maranhão, guardiões da floresta amazônica.', 'norte'),
  ('Awá-Guajá',         'Awá',        'Tupi',   600, 'TI Awá, TI Arariboia',           'Um dos povos mais ameaçados do mundo, alguns grupos ainda em isolamento voluntário.', 'oeste'),
  ('Canela Apãniekrã',  'Canela',     'Jê',    2500, 'TI Kanela',                      'Povo do cerrado maranhense, famosos pelo Ritual da Corrida de Tora.', 'sul'),
  ('Canela Ramkokamekrã','Canela',    'Jê',    1800, 'TI Porquinhos',                  'Guardiões do cerrado e das tradições orais Jê do Maranhão.', 'sul'),
  ('Gavião',            'Pukobiê',    'Jê',     900, 'TI Governador',                  'Povo Jê do leste maranhense, resistentes à colonização desde o século XVIII.', 'leste'),
  ('Krikati',           'Krikati',    'Jê',     700, 'TI Krikati',                     'Povo Jê do centro-oeste do Maranhão, com forte tradição de pintura corporal.', 'centro'),
  ('Kreye',             'Kreye',      'Jê',     200, 'TI Aldeias Altas',               'Pequena etnia com língua própria, em risco de extinção linguística.', 'centro'),
  ('Krenyê',            'Krenyê',     'Jê',     150, 'TI Krenyê',                      'Um dos menores grupos indígenas do Maranhão, com esforços ativos de revitalização.', 'leste'),
  ('Timbira',           'Timbira',    'Jê',    3000, 'TI Geralda-Toco Preto',          'Conjunto de povos Jê do cerrado, conhecidos pelas longas corridas cerimoniais.', 'sul');

-- ============================================================
-- TABELA 3: aldeias
-- ============================================================
CREATE TABLE aldeias (
  id         INT            NOT NULL AUTO_INCREMENT,
  etnia_id   INT            NOT NULL,
  nome       VARCHAR(100)   NOT NULL,
  municipio  VARCHAR(100)   DEFAULT NULL,
  latitude   DECIMAL(10,7)  NOT NULL,
  longitude  DECIMAL(10,7)  NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (etnia_id) REFERENCES etnias(id) ON DELETE CASCADE
);

-- ============================================================
-- TABELA 4: acervo (NOVO — Sprint 01/03)
-- ERRO ORIGINAL: tabela não existia — biblioteca.html era estática.
-- ============================================================
CREATE TABLE acervo (
  id          INT           NOT NULL AUTO_INCREMENT,
  titulo      VARCHAR(200)  NOT NULL,
  tipo        ENUM('documento','audio','video','imagem','outro') NOT NULL DEFAULT 'documento',
  descricao   TEXT          DEFAULT NULL,
  url         VARCHAR(500)  DEFAULT NULL,
  etnia_id    INT           DEFAULT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (etnia_id) REFERENCES etnias(id) ON DELETE SET NULL
);

INSERT INTO acervo (titulo, tipo, descricao, etnia_id) VALUES
  ('Gramática da Língua Tenetehara', 'documento', 'Estudo linguístico da língua Guajajara publicado pela FUNAI.', 1),
  ('Cânticos Rituais Canela',        'audio',     'Gravação de cânticos do Ritual da Corrida de Tora (Canela Apãniekrã).', 4),
  ('Mapa das Terras Indígenas do Maranhão', 'documento', 'Documento oficial FUNAI com delimitações de TIs no estado.', NULL);

-- ============================================================
-- TABELA 5: depoimentos (NOVO — Sprint 01/03)
-- ERRO ORIGINAL: tabela não existia — nossa-voz.html sem backend.
-- ============================================================
CREATE TABLE depoimentos (
  id         INT           NOT NULL AUTO_INCREMENT,
  autor      VARCHAR(100)  NOT NULL,
  etnia      VARCHAR(100)  DEFAULT NULL,
  texto      TEXT          NOT NULL,
  status     ENUM('pendente','aprovado','rejeitado') NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

INSERT INTO depoimentos (autor, etnia, texto, status) VALUES
  ('Maria Guajajara', 'Guajajara', 'Nossa língua é a memória viva do nosso povo. Cada palavra carrega séculos de história.', 'aprovado'),
  ('João Krikati',    'Krikati',   'A pintura corporal não é apenas arte — é identidade, é pertencimento, é resistência.', 'aprovado');

-- ============================================================
-- TABELA 6: contribuicoes (NOVO — Sprint 01/03)
-- ERRO ORIGINAL: tabela não existia — contribuir.html sem backend.
-- ============================================================
CREATE TABLE contribuicoes (
  id          INT           NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(100)  NOT NULL,
  email       VARCHAR(100)  DEFAULT NULL,
  tipo        ENUM('documento','foto','audio','video','relato','outro') NOT NULL DEFAULT 'outro',
  descricao   TEXT          NOT NULL,
  status      ENUM('recebido','em_analise','aceito','recusado') NOT NULL DEFAULT 'recebido',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ============================================================
-- TABELA 7: eventos_timeline (NOVO — para Sprint 03)
-- ============================================================
CREATE TABLE eventos_timeline (
  id        INT          NOT NULL AUTO_INCREMENT,
  ano       INT          NOT NULL,
  titulo    VARCHAR(200) NOT NULL,
  descricao TEXT         DEFAULT NULL,
  etnia_id  INT          DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (etnia_id) REFERENCES etnias(id) ON DELETE SET NULL
);

INSERT INTO eventos_timeline (ano, titulo, descricao, etnia_id) VALUES
  (1500, 'Chegada dos Portugueses', 'Primeiros contatos entre colonizadores e povos do litoral maranhense.', NULL),
  (1612, 'Fundação de São Luís',    'Fundação da capital, impactando territórios de povos Tupi da costa.', NULL),
  (1755, 'Marquês de Pombal',       'Legislação pombalina proibiu línguas indígenas e acelerou processos de aculturação.', NULL),
  (1910, 'Criação do SPI',          'Serviço de Proteção aos Índios — primeiro órgão federal indigenista.', NULL),
  (1988, 'Constituição Federal',    'Art. 231 garante direitos originários sobre terras e organização social indígena.', NULL),
  (2023, 'Marco Temporal',          'STF derruba tese do marco temporal, protegendo TIs com posse imemorial.', NULL);
