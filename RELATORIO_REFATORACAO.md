# Relatório de Entrega — Refatoração do Projeto Yarã

## 1. Visão geral

O projeto (`yara-web` + `yara-api`) foi refatorado estruturalmente, sem
alterar design visual nem remover funcionalidades. O trabalho seguiu as
8 partes pedidas. Abaixo está o detalhamento de cada uma, a árvore de
pastas final, os arquivos criados/alterados, os scripts SQL e as
decisões de arquitetura tomadas.

---

## 2. Estrutura final de pastas

```
yara-refatorado/
├── README.md
├── SQL/
│   ├── 001_refatora_tabela_acervo.sql      (NOVO — migração p/ bancos existentes)
│   └── legado/                              (NOVO — SQLs antigos, duplicados, preservados por histórico)
│       ├── README.md
│       ├── SQL YARA.sql
│       └── setup.sql
├── documentos/                              (inalterado — materiais de apoio do projeto)
├── img/                                     (inalterado)
├── yara-api/
│   ├── app.js                               (NOVO — monta o Express, sem dar listen)
│   ├── index.js                             (ALTERADO — agora só sobe o servidor)
│   ├── index.test.js                        (ALTERADO — endpoints /api/acervo)
│   ├── dicionario.json                      (NOVO — dicionário único, sem duplicação)
│   ├── users.json / yara_db.sql / package.json  (mantidos)
│   ├── config/
│   │   ├── env.js                           (NOVO)
│   │   ├── db.js                            (NOVO — era database.js na raiz)
│   │   └── upload.js                        (NOVO — config do multer)
│   ├── middlewares/
│   │   ├── auth.js                          (NOVO — autenticar/apenasAdmin)
│   │   ├── rateLimiter.js                   (NOVO)
│   │   └── errorHandler.js                  (NOVO)
│   ├── models/                              (NOVO — repositórios / acesso a dados)
│   │   ├── acervoRepository.js
│   │   ├── usuarioRepository.js
│   │   ├── etniaRepository.js
│   │   ├── depoimentoRepository.js
│   │   └── contribuicaoRepository.js
│   ├── services/                            (NOVO — regras de negócio)
│   │   ├── acervoService.js
│   │   ├── authService.js
│   │   ├── etniaService.js
│   │   ├── traducaoService.js
│   │   ├── depoimentoService.js
│   │   └── contribuicaoService.js
│   ├── controllers/                         (NOVO — camada HTTP)
│   │   ├── acervoController.js
│   │   ├── authController.js
│   │   ├── etniaController.js
│   │   ├── traducaoController.js
│   │   ├── depoimentoController.js
│   │   └── contribuicaoController.js
│   ├── routes/                              (NOVO)
│   │   ├── index.js
│   │   ├── acervoRoutes.js
│   │   ├── authRoutes.js
│   │   ├── etniaRoutes.js
│   │   ├── traducaoRoutes.js
│   │   ├── depoimentoRoutes.js
│   │   └── contribuicaoRoutes.js
│   └── uploads/                             (NOVO — arquivos do acervo)
└── yara-web/
    ├── index.html                           (ALTERADO — zero CSS/JS interno)
    ├── src/YaraService.js                   (inalterado — ver Observações)
    ├── assets/
    │   ├── css/modern.css                   (ALTERADO — todo CSS do projeto, organizado por seção)
    │   └── js/
    │       ├── config.js                    (NOVO)
    │       ├── auth.js                      (NOVO)
    │       ├── home.js                      (NOVO)
    │       ├── biblioteca.js                (NOVO)
    │       ├── dashboard.js                 (NOVO)
    │       ├── login.js                     (NOVO)
    │       ├── tradutor.js                  (NOVO)
    │       ├── agente.js                    (NOVO — ver Decisão #4)
    │       ├── mapa.js                      (NOVO)
    │       ├── etnia.js                     (NOVO — ver Decisão #4)
    │       └── map_generator.js             (inalterado)
    └── pages/
        ├── login.html, tradutor.html, agente.html, contribuir.html,
        │   nossa-voz.html, sobreNos.html, timeline.html, mapa.html,
        │   mapa_real.html                    (ALTERADOS — zero CSS/JS interno)
        ├── biblioteca.html                   (ALTERADO — + modal "Adicionar Arquivo", cards CRUD)
        └── etnias/*.html (11 arquivos)        (ALTERADOS — zero CSS/JS interno)
```

---

## 3. Parte 1 — Front-end

- **CSS**: todo `<style>` e `style=""` de 20 páginas HTML foi extraído
  para `assets/css/modern.css`, organizado em seções nomeadas
  (Utilitários, Home, Biblioteca, Login, Tradutor, Agente IA,
  Contribuir, Nossa Voz, Sobre Nós, Timeline, Etnias, Mapa legado).
  Confirmado por varredura automatizada: **0 ocorrências** de
  `<style>` ou `style="..."` em qualquer HTML do projeto.
- Duplicações reais encontradas e eliminadas: a marca "YARÃ" do
  cabeçalho/rodapé (19 ocorrências idênticas), o rótulo `info-item`
  das páginas de etnia (22 ocorrências), o bloco CSS completo das 11
  páginas de etnia (100% idêntico entre elas, verificado por hash).
- **JavaScript**: todo `<script>` inline foi extraído para
  `assets/js/*.js`, cada página carregando só o que precisa.
  Verificado por varredura: **0 blocos `<script>` com código** (só
  restam `<script src="...">`).

---

## 4. Parte 2 — API REST do Acervo

Implementada em `yara-api/routes/acervoRoutes.js`, montada em
`/api/acervo`:

| Método | Rota              | Descrição                          | Autenticação |
|--------|-------------------|-------------------------------------|--------------|
| GET    | `/api/acervo`     | Lista todos os itens                | Pública      |
| GET    | `/api/acervo/:id` | Busca um item                       | Pública      |
| POST   | `/api/acervo`     | Cria (multipart + multer)           | Admin        |
| PUT    | `/api/acervo/:id` | Atualiza                            | Admin        |
| DELETE | `/api/acervo/:id` | Remove registro + arquivo físico    | Admin        |

Upload feito com `multer`, salvando em `yara-api/uploads/` e
persistindo apenas o caminho relativo (`/uploads/arquivo.ext`) no
banco. Tipos aceitos: PDF, DOCX, imagens (jpg/png/webp/gif), áudio
(mp3/wav/ogg) e vídeo (mp4/webm/ogg), limite de 25 MB.

### Tabela `acervo`
Campos exatamente como pedido: `id, titulo, descricao, idioma, povo,
categoria, autor, arquivo, tipo, tamanho, data_upload, usuario_id`.

---

## 5. Parte 3 e 4 — Interface da Biblioteca

- Botão **"Adicionar Arquivo"** abre um modal (`#modalOverlay`) com
  todos os campos pedidos + seleção de arquivo.
- Envio via `fetch` (FormData multipart), **sem recarregar a
  página** — após sucesso, `carregarAcervo()` é chamada de novo e a
  grade se atualiza sozinha.
- Cada item aparece como **card** com: ícone por tipo, título,
  descrição, idioma, categoria, autor, data, e botões **Visualizar**,
  **Baixar**, **Editar** e **Excluir** (todos com confirmação/These
  tratam ausência de arquivo, erro de rede e resposta da API).

---

## 6. Parte 5 — Backend em camadas

Estrutura `controllers/ → services/ → models/` aplicada não só ao
acervo (exigência explícita), mas a toda a API, para cumprir "nada de
SQL direto nas rotas" de forma consistente. Nenhuma rota contém
`pool.execute` ou `pool.query` diretamente — toda query mora em
`models/*Repository.js`.

---

## 7. Parte 6 — Duplicações eliminadas

| Duplicação encontrada | Onde estava | Solução |
|---|---|---|
| Dicionário de tradução hard-coded | `index.js` (fallback) e `dicionario.json` | Um único `dicionario.json`, lido por `traducaoService.js` |
| `const API_URL = 'http://localhost:8080'` | Repetido em 6+ HTMLs | Centralizado em `assets/js/config.js` |
| `checkUser()` / `logout()` | Duplicado em `index.html` e `tradutor.html` | `assets/js/auth.js` |
| Bloco `<style>` das páginas de etnia | Idêntico nos 11 arquivos (hash igual) | Seção única em `modern.css` |
| `injectMap()+highlightRegion()` | 11 scripts inline quase idênticos | `assets/js/etnia.js` (lê `data-region`) |
| SQL de setup do banco | 3 arquivos divergentes (`setup.sql`, `SQL YARA.sql`, `yara_db.sql`) | `yara_db.sql` como única fonte; os outros dois movidos para `SQL/legado/` com README explicando |
| Middlewares/queries dentro de `index.js` | Arquivo único de ~250 linhas | Divididos em `config/`, `middlewares/`, `models/`, `services/`, `controllers/`, `routes/` |

---

## 8. Parte 7 — Qualidade

- `async/await` em 100% do código assíncrono (nenhum `.then` solto).
- Tratamento de erro centralizado via `middlewares/errorHandler.js` +
  `next(err)` em todos os controllers.
- Status HTTP corrigidos/padronizados: `200` (ok), `201` (criado),
  `400` (validação), `401` (sem token), `403` (sem permissão), `404`
  (não encontrado), `500` (erro interno).
- Todos os arquivos passaram por `node --check` (sintaxe válida) e
  todos os HTMLs foram validados com um parser (sem erros de
  estrutura).
- Comentários apenas onde ajudam a entender uma decisão não óbvia
  (por que um campo existe, por que algo foi movido) — não há
  comentário redundante tipo `// soma dois números`.

---

## 9. Scripts SQL

- **`yara-api/yara_db.sql`** — schema completo do zero (uso: banco
  novo). A tabela `acervo` foi redesenhada dentro deste mesmo arquivo.
- **`SQL/001_refatora_tabela_acervo.sql`** — migração para quem já
  tem um `yara_db` rodando com a tabela `acervo` antiga: renomeia a
  tabela para `acervo_legado`, cria a nova no formato pedido e migra
  os dados possíveis (`titulo`, `descricao`, `tipo`).

---

## 10. Decisões de arquitetura (pontos de atenção)

1. **Redesenho do schema `acervo`.** A tabela original usava uma FK
   para `etnias` (`etnia_id`) e um campo `url` para link externo. O
   novo formato pedido (`povo`, `categoria`, `autor`, `arquivo` real
   via upload) é incompatível com esse desenho. Optei por seguir a
   especificação literal da Parte 2, com uma FK nova para `usuarios`
   (autor do upload) no lugar da antiga FK para `etnias`. Dados
   antigos são preserváveis via `001_refatora_tabela_acervo.sql`.

2. **Correção de um bug real no login.** `login.html` recebia
   `data.token` da API mas nunca salvava — só `data.user`. Isso
   impedia qualquer ação autenticada. Corrigido em `login.js`
   (`localStorage.setItem('yara_token', ...)`), necessário para o
   upload/edição/exclusão do acervo funcionarem como pedido na Parte 3.

3. **Rota do acervo movida para `/api/acervo`.** Só essa rota mudou de
   caminho (era `/acervo`); todas as outras (`/login`, `/signup`,
   `/etnia`, `/traduzir`, `/depoimentos`, `/contribuicao`) permanecem
   exatamente iguais para não quebrar nada que já funcionava.

4. **Dois arquivos JS além dos 6 pedidos.** A lista original pedia
   `home.js, biblioteca.js, tradutor.js, mapa.js, login.js,
   dashboard.js`. Encontrei lógica JS relevante também em
   `agente.html` (chat) e nas 11 páginas de etnia (mapa em miniatura),
   que não se encaixavam bem em nenhum dos 6 arquivos sem misturar
   responsabilidades. Criei `agente.js` e `etnia.js` (este último
   compartilhado pelas 11 páginas, eliminando duplicação em vez de
   criar 11 arquivos). `dashboard.js` foi usado para as ações
   administrativas do acervo (criar/editar/excluir), já que o projeto
   não possui uma página "dashboard" própria — ver próximo ponto.

5. **Não existe página `dashboard.html`.** A lista de arquivos pedida
   citava `dashboard.js`, mas não há uma tela de dashboard no projeto
   atual. Em vez de deixá-lo vazio, usei esse nome para a camada de
   administração do acervo (modal de criar/editar, exclusão) que é
   carregada junto com `biblioteca.html` — o encaixe mais natural
   dado o escopo pedido nas Partes 3 e 4.

6. **`mapa.html` e `mapa_real.html` são páginas órfãs.** Nenhuma outra
   página do site linka para elas (confirmado por busca em todo o
   projeto) — parecem protótipos anteriores ao mapa interativo que
   hoje vive em `index.html#mapa`. Além disso, `mapa.html` referenciava
   dois arquivos CSS que não existem no projeto (`globalyara.css`,
   `mapa.css`), então já carregava sem estilo algum. Mantive as duas
   páginas funcionando (nenhuma funcionalidade removida) e apenas
   adicionei o link para `modern.css` em `mapa.html` para hospedar as
   classes extraídas de seu `style=""` original — como a página já não
   tinha estilo nenhum, isso não altera visualmente nada que um
   usuário veja hoje, e resolve a exigência de "zero CSS interno".

7. **`yara-web/src/YaraService.js` não foi tocado.** É um módulo ES
   (`export const YaraService = {...}`) que duplica parte da lógica
   hoje em `assets/js/*.js`, mas nenhum HTML do projeto o importa
   (`<script type="module">` não aparece em lugar nenhum) — é código
   morto pré-existente. Preferi não apagá-lo, já que não há garantia
   de que nada fora do projeto (build externo, outra branch) dependa
   dele; sinalizo aqui para que a equipe decida se remove.

8. **Sobre Nós tem um tema visual próprio.** `sobreNos.html` usava
   cores/tipografia completamente diferentes do resto do site (tema
   claro vs. tema escuro do restante). Isso foi preservado
   exatamente como estava — apenas escopei essas regras sob
   `body.sobrenos-page` dentro do `modern.css` compartilhado, para
   que elas não "vazem" e afetem visualmente as outras páginas que
   também carregam o mesmo arquivo CSS.

---

## 11. O que **não** foi alterado

- Nenhum texto, imagem, cor, fonte ou layout visual.
- Nenhuma URL de página mudou (exceto o endpoint interno do acervo,
  item 3 acima, que é consumido só pelo próprio front-end).
- `assets/js/map_generator.js` (gera o SVG do mapa) — mantido 100%
  intacto, já vivia em arquivo próprio.
- Pastas `img/` e `documentos/`.

---

## 12. Atualização — Acervo funcionando sem MySQL conectado

Depois da primeira entrega, foram identificados dois problemas ligados
ao mesmo ponto: **a Biblioteca dependia 100% do MySQL estar
conectado.**

- `GET /api/acervo` quebrava (erro 500) sempre que o banco estava
  fora do ar, o que impedia até **acessar** a página da Biblioteca
  (mesmo sem nenhum arquivo cadastrado).
- Um upload feito nesse cenário perdia o registro: o arquivo físico
  já era salvo em `/uploads` pelo multer, mas a metadata (título,
  descrição etc.) nunca chegava a existir em lugar nenhum, porque a
  gravação no banco falhava sem nenhum plano B.

**Correção:** `models/acervoRepository.js` ganhou o mesmo padrão de
fallback que `usuarioRepository.js` já usava para login/cadastro —
um arquivo local `yara-api/acervo.json`. Cada operação (`findAll`,
`findById`, `create`, `update`, `remove`) tenta o MySQL primeiro e,
se falhar, lê/escreve nesse arquivo:

- **Listar** nunca mais lança erro — na pior das hipóteses devolve
  uma lista vazia (ou os itens salvos no fallback, se houver).
- **Criar** sempre grava a metadata em algum lugar: no banco quando
  ele está disponível, em `acervo.json` quando não está — o arquivo
  físico e o registro ficam juntos independentemente do estado do
  MySQL.
- Itens criados no fallback continuam aparecendo, sendo editáveis e
  excluíveis normalmente mesmo depois que o MySQL volta a funcionar
  (a listagem combina os dois).

Testado isoladamente simulando uma queda total do MySQL (todas as
`pool.execute` forçadas a rejeitar): criar → listar → editar →
excluir funcionaram de ponta a ponta usando só o `acervo.json`.

Nenhuma rota, controller ou página HTML precisou mudar — a correção
ficou inteira na camada de repositório, como já previa a arquitetura
em camadas da Parte 5.

## 13. Como rodar


```bash
# Back-end
cd yara-api
cp .env.example .env   # ajuste as credenciais do MySQL
npm install
mysql -u root -p < yara_db.sql   # banco novo
# OU, se já tiver um yara_db:
# mysql -u root -p yara_db < ../SQL/001_refatora_tabela_acervo.sql
npm start                # http://localhost:8080

# Front-end
cd yara-web
npm install
npm run dev               # Vite dev server
```
