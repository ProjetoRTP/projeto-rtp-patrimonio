USE patrimonio;

-- ==========================================
-- TABELA DE USUÁRIOS DO SISTEMA
-- ==========================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('admin', 'operador') NOT NULL DEFAULT 'operador',
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABELA DE SETORES
-- ==========================================
CREATE TABLE setores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE
);

-- ==========================================
-- TABELA DE COLABORADORES
-- ==========================================
CREATE TABLE colaboradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    email VARCHAR(150),
    telefone VARCHAR(20),
    setor_id INT,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (setor_id) REFERENCES setores(id)
);

-- ==========================================
-- TABELA DE EQUIPAMENTOS
-- ==========================================
CREATE TABLE equipamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_tombamento VARCHAR(50) NOT NULL UNIQUE,
    numero_serie VARCHAR(100),
    nome VARCHAR(150) NOT NULL,
    tipo VARCHAR(100),
    marca VARCHAR(100),
    modelo VARCHAR(100),
    descricao TEXT,
    data_aquisicao DATE,
    valor DECIMAL(10,2),
    
    status ENUM(
        'ativo',
        'emprestado',
        'em_manutencao',
        'inativo',
        'descartado'
    ) DEFAULT 'ativo',

    setor_id INT,
    colaborador_id INT,

    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (setor_id) REFERENCES setores(id),
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id)
);

-- ==========================================
-- TABELA DE MOVIMENTAÇÕES
-- ==========================================
CREATE TABLE movimentacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipamento_id INT NOT NULL,
    setor_origem_id INT,
    setor_destino_id INT,
    colaborador_origem_id INT,
    colaborador_destino_id INT,
    usuario_id INT NOT NULL,
    data_movimentacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT,

    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id),
    FOREIGN KEY (setor_origem_id) REFERENCES setores(id),
    FOREIGN KEY (setor_destino_id) REFERENCES setores(id),
    FOREIGN KEY (colaborador_origem_id) REFERENCES colaboradores(id),
    FOREIGN KEY (colaborador_destino_id) REFERENCES colaboradores(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ==========================================
-- TABELA DE MANUTENÇÕES
-- ==========================================
CREATE TABLE manutencoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipamento_id INT NOT NULL,
    usuario_id INT NOT NULL,
    descricao TEXT NOT NULL,
    fornecedor VARCHAR(150),
    tecnico_responsavel VARCHAR(150),
    data_entrada DATETIME NOT NULL,
    data_saida DATETIME,
    custo DECIMAL(10,2),

    status ENUM(
        'aberta',
        'em_andamento',
        'finalizada',
        'cancelada'
    ) DEFAULT 'aberta',

    observacao TEXT,

    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ==========================================
-- INSERINDO SETORES EXEMPLO
-- ==========================================
INSERT INTO setores (nome, descricao) VALUES
('TI', 'Setor de tecnologia'),
('Financeiro', 'Setor financeiro'),
('RH', 'Recursos humanos'),
('Almoxarifado', 'Equipamentos em estoque');

-- ==========================================
-- INSERINDO USUÁRIO ADMIN
-- ==========================================
INSERT INTO usuarios (nome, email, senha, perfil)
VALUES (
    'Administrador',
    'admin@empresa.com',
    '123456',
    'admin'
);

-- ==========================================
-- INSERINDO COLABORADORES
-- ==========================================
INSERT INTO colaboradores (nome, cpf, email, telefone, setor_id)
VALUES
('João Silva', '123.456.789-00', 'joao@empresa.com', '(81)99999-1111', 1),
('Maria Souza', '987.654.321-00', 'maria@empresa.com', '(81)99999-2222', 2);

-- ==========================================
-- INSERINDO EQUIPAMENTOS
-- ==========================================
INSERT INTO equipamentos (
    numero_tombamento,
    numero_serie,
    nome,
    tipo,
    marca,
    modelo,
    descricao,
    data_aquisicao,
    valor,
    status,
    setor_id,
    colaborador_id
)
VALUES
(
    'TMB-0001',
    'SN123456',
    'Notebook Dell',
    'Notebook',
    'Dell',
    'Latitude 5420',
    'Notebook corporativo',
    '2025-01-10',
    4500.00,
    'ativo',
    1,
    1
),
(
    'TMB-0002',
    'SN654321',
    'Impressora HP',
    'Impressora',
    'HP',
    'LaserJet Pro',
    'Impressora do financeiro',
    '2025-02-15',
    1800.00,
    'ativo',
    2,
    2
);

-- ==========================================
-- EXEMPLO DE MOVIMENTAÇÃO
-- ==========================================
INSERT INTO movimentacoes (
    equipamento_id,
    setor_origem_id,
    setor_destino_id,
    colaborador_origem_id,
    colaborador_destino_id,
    usuario_id,
    observacao
)
VALUES (
    1,
    1,
    2,
    1,
    2,
    1,
    'Notebook transferido do TI para Financeiro'
);

-- ==========================================
-- EXEMPLO DE MANUTENÇÃO
-- ==========================================
INSERT INTO manutencoes (
    equipamento_id,
    usuario_id,
    descricao,
    fornecedor,
    tecnico_responsavel,
    data_entrada,
    custo,
    status,
    observacao
)
VALUES (
    2,
    1,
    'Troca de toner e revisão',
    'Assistência HP',
    'Carlos Técnico',
    NOW(),
    250.00,
    'em_andamento',
    'Equipamento apresentava falha de impressão'
);
