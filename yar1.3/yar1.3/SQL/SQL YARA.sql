
--
-- Banco de dados: `yara_db`
--

-- --------------------------------------------------------
DROP DATABASE yara_db;  
CREATE DATABASE yara_db;  

USE yara_db;  


--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `role`, `created_at`) VALUES
(1, 'Admin', 'admin@yara.im', 'admin', 'admin', '2026-02-11 17:53:02'),
(2, 'vregbreghthyt', 'jdabfjwrbgjr@ishdviofhiob', '123', 'user', '2026-02-11 20:36:34'),
(3, 'ksfdgbjofdngkotekovjbkovdjnpki', 'jkhxvchiabbjvsknjvnu@duifbjvnrk', 'sndandvnbfdnpskfm', 'user', '2026-02-11 20:50:17'),
(4, 'gabrieldevizinho', 'gabrieldev@aj123', '123', 'user', '2026-02-11 20:54:11'),
(5, 'luis', 'luis@gmail.com', 'luis123', 'user', '2026-02-23 11:01:54'),
(6, 'Tâmara', 'tamaralina@gmail.com', '2552', 'user', '2026-02-23 12:29:03'),
(7, 'Sidney', 'sidney@email.com', '123456', 'user', '2026-02-23 12:45:25'),
(8, 'eduardo moura', 'eduardo.moura@ifma.edu.br', '12345', 'user', '2026-02-23 12:53:39'),
(9, 'jamc', 'jamc@gmail.com', '123', 'user', '2026-02-23 13:11:53'),
(10, 'Izolina ângela Lima ', 'izolina.borges@ifma.edu.br', '123', 'user', '2026-02-23 13:28:28');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
