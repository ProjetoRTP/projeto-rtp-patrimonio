CREATE DATABASE IF NOT EXISTS patrimonio;
USE patrimonio;

-- ==========================================
-- TABELA DE USUÁRIOS
-- ==========================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('admin', 'operador') DEFAULT 'operador',
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABELA DE SETORES
-- ==========================================
CREATE TABLE IF NOT EXISTS setores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE
);

-- ==========================================
-- TABELA DE COLABORADORES
-- ==========================================
CREATE TABLE IF NOT EXISTS colaboradores (
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
CREATE TABLE IF NOT EXISTS equipamentos (
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
        'desativado',
        'descartado'
    ) DEFAULT 'ativo',

    setor_id INT,
    colaborador_id INT,

    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_exclusao DATETIME NULL,

    FOREIGN KEY (setor_id) REFERENCES setores(id),
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id)
);

-- ==========================================
-- TABELA DE COMPOSIÇÃO DE EQUIPAMENTOS (PC + PERIFÉRICOS)
-- ==========================================
CREATE TABLE IF NOT EXISTS equipamentos_componentes (
    equipamento_principal_id INT NOT NULL,     -- O ID do Computador/Notebook
    equipamento_secundario_id INT NOT NULL,    -- O ID do Mouse/Teclado/Monitor
    data_vinculo DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (equipamento_principal_id, equipamento_secundario_id),
    UNIQUE (equipamento_secundario_id),

    FOREIGN KEY (equipamento_principal_id) REFERENCES equipamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (equipamento_secundario_id) REFERENCES equipamentos(id) ON DELETE CASCADE
);

-- ==========================================
-- TABELA DE MOVIMENTAÇÕES
-- ==========================================
CREATE TABLE IF NOT EXISTS movimentacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipamento_id INT NOT NULL,
    setor_origem_id INT,
    setor_destino_id INT,
    colaborador_origem_id INT,
    colaborador_destino_id INT,
    data_movimentacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT,

    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id),
    FOREIGN KEY (setor_origem_id) REFERENCES setores(id),
    FOREIGN KEY (setor_destino_id) REFERENCES setores(id),
    FOREIGN KEY (colaborador_origem_id) REFERENCES colaboradores(id),
    FOREIGN KEY (colaborador_destino_id) REFERENCES colaboradores(id)
);

-- ==========================================
-- TABELA DE MANUTENÇÕES
-- ==========================================
CREATE TABLE IF NOT EXISTS manutencoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipamento_id INT NOT NULL,
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

    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id)
);

-- ==========================================
-- ÍNDICES PARA PERFORMANCE
-- ==========================================
CREATE INDEX idx_equipamento_tombamento
ON equipamentos(numero_tombamento);

CREATE INDEX idx_equipamento_status
ON equipamentos(status);

CREATE INDEX idx_equipamento_setor
ON equipamentos(setor_id);

CREATE INDEX idx_movimentacao_equipamento
ON movimentacoes(equipamento_id);

CREATE INDEX idx_movimentacao_data
ON movimentacoes(data_movimentacao);

CREATE INDEX idx_manutencao_equipamento
ON manutencoes(equipamento_id);

CREATE INDEX idx_manutencao_status
ON manutencoes(status);

-- ==========================================
-- TRIGGER PARA MOVIMENTAÇÃO AUTOMÁTICA
-- ==========================================
DELIMITER $$

CREATE TRIGGER trg_movimentacao_equipamento
AFTER UPDATE ON equipamentos
FOR EACH ROW
BEGIN
    IF NOT (OLD.setor_id <=> NEW.setor_id) OR 
    NOT (OLD.colaborador_id <=> NEW.colaborador_id) THEN

        INSERT INTO movimentacoes (
            equipamento_id,
            setor_origem_id,
            setor_destino_id,
            colaborador_origem_id,
            colaborador_destino_id,
            data_movimentacao,
            observacao
        )
        VALUES (
            NEW.id,
            OLD.setor_id,
            NEW.setor_id,
            OLD.colaborador_id,
            NEW.colaborador_id,
            NOW(),
            'Movimentação automática registrada'
        );
    END IF;
END$$

DELIMITER ;

-- ==========================================
-- TRIGGER PARA ALTERAR STATUS AO ABRIR MANUTENÇÃO
-- ==========================================
DELIMITER $$

CREATE TRIGGER trg_manutencao_aberta
AFTER INSERT ON manutencoes
FOR EACH ROW
BEGIN
    UPDATE equipamentos
    SET status = 'em_manutencao'
    WHERE id = NEW.equipamento_id;
END$$

DELIMITER ;

-- ==========================================
-- TRIGGER PARA ALTERAR STATUS AO FINALIZAR MANUTENÇÃO
-- ==========================================
DELIMITER $$

CREATE TRIGGER trg_manutencao_finalizada
AFTER UPDATE ON manutencoes
FOR EACH ROW
BEGIN
    IF NEW.status = 'finalizada' THEN
        UPDATE equipamentos
        SET status = 'ativo'
        WHERE id = NEW.equipamento_id;
    END IF;
END$$

DELIMITER ;

-- ==========================================
-- DADOS DE EXEMPLO
-- ==========================================
INSERT INTO setores (nome, descricao) VALUES
('TI', 'Setor de Tecnologia'),
('Financeiro', 'Setor Financeiro'),
('RH', 'Recursos Humanos'),
('Almoxarifado', 'Equipamentos em estoque');

INSERT INTO colaboradores (nome, cpf, email, telefone, setor_id) VALUES
('João Silva', '123.456.789-00', 'joao@empresa.com', '(81)99999-1111', 1),
('Maria Souza', '987.654.321-00', 'maria@empresa.com', '(81)99999-2222', 2);

INSERT INTO usuarios (nome, email, senha, perfil) VALUES
('Administrador', 'admin@empresa.com', '123456', 'admin');

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
VALUES (
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
);