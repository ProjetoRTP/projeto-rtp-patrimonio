CREATE DATABASE IF NOT EXISTS patrimonio;
USE patrimonio;

-- ==========================================
-- TABELA DE USUÁRIOS
-- ==========================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento date NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('admin', 'operador') DEFAULT 'operador',
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_encerramento DATETIME DEFAULT NULL
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
    email VARCHAR(150) UNIQUE,
    telefone VARCHAR(20) UNIQUE,
    setor_id INT,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (setor_id) REFERENCES setores(id)
);

-- ==========================================
-- TABELA DE EQUIPAMENTOS
-- ==========================================
CREATE TABLE IF NOT EXISTS equipamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    num_patrimonio VARCHAR(50) NOT NULL UNIQUE,
    tipo ENUM('computador','impressora','periferico'),
    endereco_ip VARCHAR(50) UNIQUE NULL,
    observacao TEXT,
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
-- TABELA DE PCs
-- ==========================================
CREATE TABLE IF NOT EXISTS computadores (
    id INT PRIMARY KEY,
    os VARCHAR(50) NOT NULL,
    mem_cpu VARCHAR(50) NOT NULL,
    mem_ram VARCHAR(50) NOT NULL,
    armazenamento VARCHAR(50) NOT NULL,

    FOREIGN KEY (id) REFERENCES equipamentos(id)
);

-- ==========================================
-- PERIFERICOS
-- ==========================================
CREATE TABLE IF NOT EXISTS perifericos (
    id INT PRIMARY KEY,
    tipo_per ENUM('mouse','teclado','tela', 'estabilizador'),
    descricao TEXT,

    FOREIGN KEY (id) REFERENCES equipamentos(id)
);

-- ==========================================
-- IMPRESSORAS
-- ==========================================
CREATE TABLE IF NOT EXISTS impressoras (
    id INT PRIMARY KEY,
    modelo VARCHAR(100),
    tipo_imp ENUM('laser','jato de tinta','termica','plotter'),
    coloracao ENUM('monocromatica', 'colorida'),
    conectividade VARCHAR(50),
    insumo VARCHAR(50),
    descricao TEXT,

    FOREIGN KEY (id) REFERENCES equipamentos(id)
);

-- ==========================================
-- TABELA DE COMPOSIÇÃO DE EQUIPAMENTOS (PC + PERIFÉRICOS)
-- ==========================================
CREATE TABLE IF NOT EXISTS equipamentos_componentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    computador_id INT,
    periferico_id INT,
    data_vinculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_desvinculo TIMESTAMP NULL,
    ativo BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (computador_id) REFERENCES computadores(id),
    FOREIGN KEY (periferico_id) REFERENCES perifericos(id)
);

-- ==========================================
-- TABELA DE MOVIMENTAÇÕES
-- ==========================================
CREATE TABLE IF NOT EXISTS movimentacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipamento_id INT NOT NULL,
    setor_origem_id INT,
    setor_destino_id INT,
    colaborador_id INT,
    data_movimentacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT,

    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id),
    FOREIGN KEY (setor_origem_id) REFERENCES setores(id),
    FOREIGN KEY (setor_destino_id) REFERENCES setores(id),
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id)
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
-- TABELA DE HISTÓRICO GERAL (LINHA DO TEMPO)
-- ==========================================
CREATE TABLE IF NOT EXISTS historico_equipamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipamento_id INT NOT NULL,
    usuario_id INT, 
    tipo_evento ENUM(
        'cadastro', 
        'movimentacao', 
        'manutencao_entrada', 
        'manutencao_saida', 
        'mudanca_status'
    ) NOT NULL,
    referencia_id INT, 
    descricao TEXT NOT NULL, 
    data_evento DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ==========================================
-- ÍNDICES PARA PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_equipamento_patrimonio
ON equipamentos(num_patrimonio);

CREATE INDEX IF NOT EXISTS idx_equipamento_status
ON equipamentos(status);

CREATE INDEX IF NOT EXISTS idx_equipamento_setor
ON equipamentos(setor_id);

CREATE INDEX IF NOT EXISTS idx_movimentacao_equipamento
ON movimentacoes(equipamento_id);

CREATE INDEX IF NOT EXISTS idx_movimentacao_data
ON movimentacoes(data_movimentacao);

CREATE INDEX IF NOT EXISTS idx_manutencao_equipamento
ON manutencoes(equipamento_id);

CREATE INDEX IF NOT EXISTS idx_manutencao_status
ON manutencoes(status);

CREATE INDEX IF NOT EXISTS idx_historico_tipo_evento
ON historico_equipamentos(tipo_evento)

CREATE INDEX IF NOT EXISTS idx_historico_equipamento
ON historico_equipamentos(equipamento_id)

CREATE INDEX IF NOT EXISTS idx_historico_eqp_usuarios
ON historico_equipamentos(usuario_id)

-- ==========================================
-- TRIGGER PARA "DELEÇÃO" DO EQUIPAMENTO
-- ==========================================
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS trg_delete_equipamento
AFTER UPDATE ON equipamentos
FOR EACH ROW
BEGIN
    IF NEW.status IN ('desativado', 'descartado')
        AND OLD.status NOT IN ('desativado','descartado') THEN
        INSERT INTO historico_equipamentos (equipamento_id, tipo_evento, usuario_id)
        VALUES (
            NEW.equipamento_id,
            'mudanca_status',

        )

-- ==========================================
-- TRIGGER PARA DESLIGAMENTO DE USUÁRIO
-- ==========================================

-- ==========================================
-- TRIGGER PARA MOVIMENTAÇÃO AUTOMÁTICA
-- ==========================================
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS trg_movimentacao_equipamento
BEFORE INSERT ON movimentacoes
FOR EACH ROW
BEGIN
    DECLARE patrimonio VARCHAR(50);
    DECLARE setor_saida VARCHAR(100);
    DECLARE setor_entrada VARCHAR(100);
    DECLARE colaborador VARCHAR(150);

    SELECT num_patrimonio INTO patrimonio 
    FROM equipamentos WHERE id = NEW.equipamento_id LIMIT 1;

    SELECT nome INTO setor_saida 
    FROM setores WHERE id = NEW.setor_origem_id LIMIT 1;

    SELECT nome INTO setor_entrada 
    FROM setores WHERE id = NEW.setor_destino_id LIMIT 1;

    SELECT nome INTO colaborador 
    FROM colaboradores WHERE id = NEW.colaborador_id LIMIT 1;

    IF NOT (NEW.setor_origem_id <=> NEW.setor_destino_id) THEN

        INSERT INTO historico_equipamentos (
            equipamento_id,
            usuario_id,
            tipo_evento,
            referencia_id,
            descricao
        )
        VALUES (
            NEW.equipamento_id,
            @usuario_logado_id,
            'movimentacao',
            NEW.id,
            CONCAT('Equipamento:', IFNULL(patrimonio, 'N/A'),
             ' foi movido para o setor: ', IFNULL(setor_entrada, 'N/A'),
             ', do setor: ', IFNULL(setor_saida, 'N/A'),
             ' por solicitação de ', IFNULL(colaborador, 'N/A'))
        );
    END IF;
END$$

DELIMITER ;

-- ==========================================
-- TRIGGER PARA ALTERAR STATUS AO ABRIR MANUTENÇÃO
-- ==========================================
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS trg_manutencao_aberta
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

CREATE TRIGGER IF NOT EXISTS trg_manutencao_finalizada
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
-- SEGURANÇA CONTRA DELEÇÃO NÃO AUTORIZADA POR USUARIO
-- ==========================================
GRANT SELECT, INSERT, UPDATE ON patrimonio.* TO 'patrimonio_user';
FLUSH PRIVILEGES

DELIMITER //

-- ==========================================
-- SEGURANÇA CONTRA ALTERAÇÃO DO HISTÓRICO (PERMITIDO APENAS A DESCRIÇÃO)
-- ==========================================
CREATE TRIGGER IF NOT EXISTS trg_protege_historico
BEFORE UPDATE ON historico_equipamentos
FOR EACH ROW
BEGIN
    IF NOT (NEW.id <=> OLD.id) OR 
       NOT (NEW.equipamento_id <=> OLD.equipamento_id) OR
       NOT (NEW.usuario_id <=> OLD.usuario_id) OR
       NOT (NEW.tipo_evento <=> OLD.tipo_evento) OR
       NOT (NEW.referencia_id <=> OLD.referencia_id) OR
       NOT (NEW.data_evento <=> OLD.data_evento) THEN
        
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ação Bloqueada';
    END IF;
END //

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

INSERT INTO usuarios (nome,cpf, email, data_nascimento, senha, perfil) VALUES
('Administrador', '12345678910', 'admin@empresa.com','2000-01-01', '123456', 'admin');