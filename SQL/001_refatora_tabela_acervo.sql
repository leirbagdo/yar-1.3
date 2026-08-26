-- ============================================================
--  MIGRAÇÃO — 001_refatora_tabela_acervo.sql
--
--  Use este script se você já tem um banco `yara_db` em produção/
--  desenvolvimento com a tabela `acervo` antiga (colunas: titulo,
--  tipo, descricao, url, etnia_id, created_at) e não quer recriar
--  o banco do zero com yara_db.sql.
--
--  Este script:
--    1. Renomeia a tabela antiga para backup;
--    2. Cria a tabela `acervo` no novo formato (Parte 2 do pedido
--       de refatoração: id, titulo, descricao, idioma, povo,
--       categoria, autor, arquivo, tipo, tamanho, data_upload,
--       usuario_id);
--    3. Migra os dados possíveis (titulo, descricao, tipo) da
--       tabela antiga.
--
--  Rode com: mysql -u root -p yara_db < 001_refatora_tabela_acervo.sql
-- ============================================================

USE yara_db;

RENAME TABLE acervo TO acervo_legado;

CREATE TABLE acervo (
  id          INT           NOT NULL AUTO_INCREMENT,
  titulo      VARCHAR(200)  NOT NULL,
  descricao   TEXT          DEFAULT NULL,
  idioma      VARCHAR(100)  DEFAULT NULL,
  povo        VARCHAR(100)  DEFAULT NULL,
  categoria   VARCHAR(100)  DEFAULT NULL,
  autor       VARCHAR(150)  DEFAULT NULL,
  arquivo     VARCHAR(500)  DEFAULT NULL,
  tipo        ENUM('documento','audio','video','imagem','outro') NOT NULL DEFAULT 'outro',
  tamanho     INT           DEFAULT NULL COMMENT 'Tamanho do arquivo em bytes',
  data_upload TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usuario_id  INT           DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Migra o que dá para migrar da tabela antiga (o campo `url` antigo
-- não é compatível com `arquivo`, pois apontava para links externos,
-- não para uploads físicos — por isso não é copiado).
INSERT INTO acervo (titulo, descricao, tipo, data_upload)
SELECT titulo, descricao, tipo, created_at FROM acervo_legado;

-- Depois de validar a migração, a tabela de backup pode ser removida:
-- DROP TABLE acervo_legado;
