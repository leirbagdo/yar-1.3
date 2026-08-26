# SQL — arquivos legados

Os arquivos nesta pasta (`SQL YARA.sql`, `setup.sql`) são versões
antigas e **duplicadas** do schema do banco, anteriores ao arquivo
canônico `yara-api/yara_db.sql`:

- `setup.sql` cria o banco `login` com apenas a tabela `usuarios`.
- `SQL YARA.sql` cria o banco `yara_db`, mas só com `usuarios` e sem
  as tabelas `etnias`, `aldeias`, `acervo`, `depoimentos`,
  `contribuicoes` e `eventos_timeline` que a API já espera.

Nenhum dos dois é usado por `yara-api/config/db.js` (que sempre
conecta ao banco `yara_db` completo). Foram mantidos aqui apenas por
histórico, mas **não devem mais ser executados** — use
`yara-api/yara_db.sql` para criar o banco do zero, ou
`SQL/001_refatora_tabela_acervo.sql` para migrar um banco `yara_db`
já existente para o novo formato da tabela `acervo`.
