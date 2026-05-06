-- Inserir alguns equipamentos de teste
INSERT IGNORE INTO equipamentos (id, num_patrimonio, tipo, setor_id, subsetor_id, status, data_aquisicao) VALUES
(1001, 'PAT-1001', 'computador', 1, 1, 'ativo', '2025-01-10'),
(1002, 'PAT-1002', 'computador', 1, 2, 'ativo', '2025-02-15'),
(1003, 'PAT-1003', 'impressora', 2, 3, 'ativo', '2025-03-20'),
(1004, 'PAT-1004', 'periferico', 3, 4, 'ativo', '2025-04-25');

INSERT IGNORE INTO computadores (id, os, mem_cpu, mem_ram, armazenamento) VALUES
(1001, 'Windows 11', 'Core i5', '16GB', '512GB SSD'),
(1002, 'Linux Ubuntu', 'Core i7', '32GB', '1TB NVMe');

INSERT IGNORE INTO impressoras (id, modelo, tipo_imp, coloracao) VALUES
(1003, 'HP LaserJet Pro', 'laser', 'monocromatica');

INSERT IGNORE INTO perifericos (id, tipo_per, descricao) VALUES
(1004, 'teclado', 'Teclado Mecânico Keychron');

-- Inserir histórico de equipamentos para simular relatórios
INSERT IGNORE INTO historico_equipamentos (equipamento_id, usuario_id, tipo_evento, descricao, data_evento) VALUES
(1001, 1, 'cadastro', 'Equipamento PAT-1001 cadastrado no sistema', '2025-01-10 10:00:00'),
(1002, 1, 'cadastro', 'Equipamento PAT-1002 cadastrado no sistema', '2025-02-15 11:30:00'),
(1003, 1, 'cadastro', 'Equipamento PAT-1003 cadastrado no sistema', '2025-03-20 09:15:00'),
(1004, 1, 'cadastro', 'Equipamento PAT-1004 cadastrado no sistema', '2025-04-25 14:45:00'),

(1001, 1, 'movimentacao', 'Equipamento transferido para o Suporte', '2025-05-10 10:00:00'),
(1003, 1, 'movimentacao', 'Impressora movida para o setor Financeiro', '2025-06-15 11:30:00'),

(1002, 1, 'manutencao_entrada', 'Servidor enviado para troca de disco', '2025-07-20 09:15:00'),
(1002, 1, 'manutencao_saida', 'Servidor retornou da manutenção', '2025-07-25 14:45:00');

-- Inserir alguns relatórios para aparecerem na lista e podermos testar
INSERT IGNORE INTO relatorios (id, usuario_id, tipo, periodo, data_inicio, data_fim, setor_id) VALUES
(1, 1, 'geral', 'personalizado', '2025-01-01', '2026-12-31', NULL),
(2, 1, 'movimentacoes', 'personalizado', '2025-01-01', '2026-12-31', NULL),
(3, 1, 'manutencoes', 'personalizado', '2025-01-01', '2026-12-31', NULL),
(4, 1, 'equipamentos', 'personalizado', '2025-01-01', '2026-12-31', 1);
