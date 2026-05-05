-- =============================================================
-- SISTEMA DE PATRIMÔNIO - PROCAPE
-- Script de inicialização do banco de dados
-- Criado para MySQL 8.0+
-- =============================================================

CREATE DATABASE IF NOT EXISTS patrimonio;
USE patrimonio;

-- =============================================================
-- TABELAS
-- Ordem respeita dependências de chave estrangeira:
-- setores → subsetores →  equipamentos → ...
-- =============================================================

-- -------------------------------------------------------
-- usuarios
-- Usuários do sistema com três níveis de acesso:
--   admin   → gerencia usuários + tudo do gerente
--   gerente → edita/exclui equipamentos, setores, subsetores
--   usuario → leitura + cadastra equipamentos + movimentações
-- A senha é sempre armazenada como hash bcrypt (nunca texto plano).
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id               INT          AUTO_INCREMENT PRIMARY KEY,
    nome             VARCHAR(100) NOT NULL,
    cpf              VARCHAR(14)  NOT NULL UNIQUE,
    data_nascimento  DATE         NOT NULL,
    email            VARCHAR(150) NOT NULL UNIQUE,
    senha            VARCHAR(255) NOT NULL,
    perfil           ENUM('admin', 'gerente') DEFAULT 'gerente',
    ativo            BOOLEAN      DEFAULT TRUE,
    data_criacao     DATETIME     DEFAULT CURRENT_TIMESTAMP,
    data_encerramento DATETIME    DEFAULT NULL
);

-- -------------------------------------------------------
-- setores
-- Divisões de alto nível da instituição (ex: TI, Financeiro).
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS setores (
    id        INT          AUTO_INCREMENT PRIMARY KEY,
    nome      VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    ativo     BOOLEAN      DEFAULT TRUE
);

-- -------------------------------------------------------
-- subsetores
-- Subdivisões dentro de um setor (ex: TI → Sala 04, Infraestrutura).
-- Um subsetor SEMPRE pertence a exatamente um setor.
-- Os triggers trg_valida_subsetor_* garantem que um equipamento
-- associado a um subsetor pertença ao mesmo setor pai.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS subsetores (
    id        INT          AUTO_INCREMENT PRIMARY KEY,
    nome      VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    setor_id  INT          NOT NULL,
    ativo     BOOLEAN      DEFAULT TRUE,
    FOREIGN KEY (setor_id) REFERENCES setores(id)
);

-- -------------------------------------------------------
-- equipamentos
-- Tabela base para todos os tipos de equipamento.
-- Usa herança de tabela: computadores, impressoras e perifericos
-- compartilham este ID via FK, estendendo os dados específicos.
--
-- setor_id     → localização principal (obrigatória)
-- subsetor_id  → localização refinada (ex: sala), opcional
--
-- Soft delete via status='desativado' (nunca DELETE físico).
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipamentos (
    id             INT            AUTO_INCREMENT PRIMARY KEY,
    num_patrimonio VARCHAR(50)    NOT NULL UNIQUE,
    tipo           ENUM('computador', 'impressora', 'periferico', 'generico'),
    endereco_ip    VARCHAR(50)    UNIQUE NULL,
    observacao     TEXT,
    data_aquisicao DATE,
    valor          DECIMAL(10, 2),

    -- Ciclo de vida do equipamento
    status ENUM(
        'ativo',          -- em uso normal
        'emprestado',     -- cedido temporariamente
        'em_manutencao',  -- OS aberta (gerenciado automaticamente por trigger)
        'inativo',        -- parado, mas não descartado
        'desativado',     -- soft-deleted pela aplicação
        'descartado'      -- descarte físico definitivo
    ) DEFAULT 'ativo',

    setor_id       INT,
    subsetor_id    INT NULL,      -- opcional: localização dentro do setor

    data_cadastro  DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_exclusao  DATETIME NULL,

    FOREIGN KEY (setor_id)       REFERENCES setores(id),
    FOREIGN KEY (subsetor_id)    REFERENCES subsetores(id)
);

-- -------------------------------------------------------
-- computadores
-- Estende equipamentos com atributos específicos de PCs.
-- O id é o mesmo de equipamentos (herança de tabela).
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS computadores (
    id             INT         PRIMARY KEY,
    os             VARCHAR(50) NOT NULL,
    mem_cpu        VARCHAR(50) NOT NULL,
    mem_ram        VARCHAR(50) NOT NULL,
    armazenamento  VARCHAR(50) NOT NULL,
    FOREIGN KEY (id) REFERENCES equipamentos(id)
);

-- -------------------------------------------------------
-- perifericos
-- Estende equipamentos. Pode ser vinculado a um computador
-- via equipamentos_componentes.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS perifericos (
    id       INT  PRIMARY KEY,
    tipo_per ENUM('mouse', 'teclado', 'tela', 'estabilizador'),
    descricao TEXT,
    FOREIGN KEY (id) REFERENCES equipamentos(id)
);

-- -------------------------------------------------------
-- impressoras
-- Estende equipamentos com atributos específicos de impressoras.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS impressoras (
    id            INT          PRIMARY KEY,
    modelo        VARCHAR(100),
    tipo_imp      ENUM('laser', 'jato de tinta', 'termica', 'plotter'),
    coloracao     ENUM('monocromatica', 'colorida'),
    conectividade VARCHAR(50),
    insumo        VARCHAR(50),
    descricao     TEXT,
    FOREIGN KEY (id) REFERENCES equipamentos(id)
);

-- -------------------------------------------------------
-- equipamentos_componentes
-- Vínculo entre computador e periféricos (relação N:N com histórico).
-- data_desvinculo e ativo=FALSE marcam o fim do vínculo.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipamentos_componentes (
    id              INT       AUTO_INCREMENT PRIMARY KEY,
    computador_id   INT,
    periferico_id   INT,
    data_vinculo    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_desvinculo TIMESTAMP NULL,
    ativo           BOOLEAN   DEFAULT TRUE,
    FOREIGN KEY (computador_id) REFERENCES computadores(id),
    FOREIGN KEY (periferico_id) REFERENCES perifericos(id)
);

-- -------------------------------------------------------
-- tipo_generico
-- tabela associada com equipamentos_generico N:1
-- tabela criada para definição de tipos de equipamentos (roteador, switch, cadeiras e etc)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS tipo_generico (
    id              INT       AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(50),
    descricao       TEXT      
);

-- -------------------------------------------------------
-- equipamentos_generico
-- tabela usada para sistema ser mais expansivo, aceitando adição de novos tipos de equipamentos
-- mas com menos detalhes do que equipamentos definidos
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipamentos_generico (
    id              INT       AUTO_INCREMENT PRIMARY KEY,
    tipo_id         INT       NOT NULL,
    observacao      TEXT,

    FOREIGN KEY (tipo_id) REFERENCES tipo_generico(id)
);

-- -------------------------------------------------------
-- movimentacoes
-- Registro de transferências de equipamentos entre setores/subsetores.
-- O trigger trg_movimentacao (AFTER INSERT) é responsável por:
--   1. Atualizar setor_id/subsetor_id no equipamento
--   2. Registrar o evento no historico_equipamentos
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS movimentacoes (
    id                  INT      AUTO_INCREMENT PRIMARY KEY,
    equipamento_id      INT      NOT NULL,
    setor_origem_id     INT,
    subsetor_origem_id  INT NULL,
    setor_destino_id    INT,
    subsetor_destino_id INT NULL,
    data_movimentacao   DATETIME DEFAULT CURRENT_TIMESTAMP,
    observacao          TEXT,

    FOREIGN KEY (equipamento_id)      REFERENCES equipamentos(id),
    FOREIGN KEY (setor_origem_id)     REFERENCES setores(id),
    FOREIGN KEY (subsetor_origem_id)  REFERENCES subsetores(id),
    FOREIGN KEY (setor_destino_id)    REFERENCES setores(id),
    FOREIGN KEY (subsetor_destino_id) REFERENCES subsetores(id)
);

-- -------------------------------------------------------
-- manutencoes
-- Ordens de serviço de manutenção.
-- Ao abrir (INSERT): trigger muda equipamento para 'em_manutencao'.
-- Ao fechar (UPDATE status='finalizada'|'cancelada'): trigger reverte para 'ativo'.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS manutencoes (
    id                  INT          AUTO_INCREMENT PRIMARY KEY,
    equipamento_id      INT          NOT NULL,
    descricao           TEXT         NOT NULL,
    fornecedor          VARCHAR(150),
    tecnico_responsavel VARCHAR(150),
    data_entrada        DATETIME     NOT NULL,
    data_saida          DATETIME,
    custo               DECIMAL(10, 2),

    status ENUM(
        'aberta',       -- OS recém-criada
        'em_andamento', -- em execução
        'finalizada',   -- concluída com sucesso
        'cancelada'     -- encerrada sem conclusão
    ) DEFAULT 'aberta',

    observacao TEXT,

    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id)
);

-- -------------------------------------------------------
-- historico_equipamentos
-- Linha do tempo imutável de eventos relevantes por equipamento.
-- Populada automaticamente por triggers — nunca pela aplicação diretamente.
-- O trigger trg_protege_historico bloqueia alterações em campos-chave.
--
-- tipo_evento:
--   cadastro          → equipamento cadastrado
--   movimentacao      → transferência entre setores
--   manutencao_entrada → OS aberta
--   manutencao_saida  → OS fechada (finalizada ou cancelada)
--   mudanca_status    → qualquer mudança de status relevante
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS historico_equipamentos (
    id             INT      AUTO_INCREMENT PRIMARY KEY,
    equipamento_id INT      NOT NULL,
    usuario_id     INT,     -- quem realizou a ação (pode ser NULL para ações automáticas)
    tipo_evento    ENUM(
        'cadastro',
        'movimentacao',
        'manutencao_entrada',
        'manutencao_saida',
        'mudanca_status'
    ) NOT NULL,
    referencia_id  INT,     -- ID da movimentação ou manutenção relacionada
    descricao      TEXT     NOT NULL,
    data_evento    DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id),
    FOREIGN KEY (usuario_id)     REFERENCES usuarios(id)
);



-- -------------------------------------------------------
-- relatorios
-- Armazena os relatórios gerados pelos usuários.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS relatorios (
    id           INT          AUTO_INCREMENT PRIMARY KEY,
    usuario_id   INT,
    tipo         ENUM('geral', 'movimentacoes', 'manutencoes', 'equipamentos') NOT NULL,
    periodo      VARCHAR(50),
    data_inicio  DATE,
    data_fim     DATE,
    setor_id     INT,
    equipamento  VARCHAR(50),
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (setor_id)   REFERENCES setores(id)
);



-- =============================================================
-- ÍNDICES
-- Otimizam as queries mais frequentes do sistema.
-- =============================================================

-- Busca por número de patrimônio (pesquisa mais comum)
CREATE INDEX idx_equipamento_patrimonio  ON equipamentos(num_patrimonio);
-- Filtro por status na listagem de equipamentos
CREATE INDEX idx_equipamento_status      ON equipamentos(status);
-- Filtro de equipamentos por setor
CREATE INDEX idx_equipamento_setor       ON equipamentos(setor_id);
-- Filtro de equipamentos por subsetor
CREATE INDEX idx_equipamento_subsetor    ON equipamentos(subsetor_id);

-- Subsetores por setor (usado em get_by_sector e validação de integridade)
CREATE INDEX idx_subsetor_setor          ON subsetores(setor_id);

-- Histórico de movimentações por equipamento
CREATE INDEX idx_movimentacao_equipamento ON movimentacoes(equipamento_id);
-- Ordenação temporal de movimentações
CREATE INDEX idx_movimentacao_data        ON movimentacoes(data_movimentacao);

-- Manutenções por equipamento
CREATE INDEX idx_manutencao_equipamento  ON manutencoes(equipamento_id);
-- Filtro por status da OS
CREATE INDEX idx_manutencao_status       ON manutencoes(status);

-- Linha do tempo por tipo de evento
CREATE INDEX idx_historico_tipo_evento   ON historico_equipamentos(tipo_evento);
-- Linha do tempo de um equipamento específico
CREATE INDEX idx_historico_equipamento   ON historico_equipamentos(equipamento_id);
-- Ações por usuário
CREATE INDEX idx_historico_usuario       ON historico_equipamentos(usuario_id);
-- Ordenação temporal (mais usada na view de relatórios)
CREATE INDEX idx_historico_data          ON historico_equipamentos(data_evento);

-- =============================================================
-- TRIGGERS DE INTEGRIDADE
-- Garantem consistência que os FKs sozinhos não conseguem.
-- =============================================================

-- -------------------------------------------------------
-- trg_valida_subsetor_insert / trg_valida_subsetor_update
-- Garante que o subsetor informado pertence ao setor do equipamento.
-- Essa validação existe em duas camadas:
--   1. Python (EquipmentService._validate_subsector) → mensagem clara para o cliente
--   2. Aqui no banco → barreira final, mesmo que o dado venha de fora da API
-- -------------------------------------------------------
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS trg_valida_subsetor_insert
BEFORE INSERT ON equipamentos
FOR EACH ROW
BEGIN
    IF NEW.subsetor_id IS NOT NULL THEN
        IF (SELECT setor_id FROM subsetores WHERE id = NEW.subsetor_id) != NEW.setor_id THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Subsetor does not belong to the specified sector';
        END IF;
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER IF NOT EXISTS trg_valida_subsetor_update
BEFORE UPDATE ON equipamentos
FOR EACH ROW
BEGIN
    IF NEW.subsetor_id IS NOT NULL THEN
        IF (SELECT setor_id FROM subsetores WHERE id = NEW.subsetor_id) != NEW.setor_id THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Subsetor does not belong to the specified sector';
        END IF;
    END IF;
END$$

DELIMITER ;

-- =============================================================
-- TRIGGERS DE AUTOMAÇÃO
-- =============================================================

-- -------------------------------------------------------
-- trg_movimentacao
-- AFTER INSERT em movimentacoes (usa AFTER para ter o NEW.id disponível).
-- Responsabilidades:
--   1. Atualiza setor_id e subsetor_id do equipamento para o destino
--   2. Registra o evento no historico_equipamentos (com referencia_id correto)
-- Só age se o setor de destino for diferente do de origem (evita ruído no histórico).
-- -------------------------------------------------------
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS trg_movimentacao
AFTER INSERT ON movimentacoes
FOR EACH ROW
BEGIN
    DECLARE v_patrimonio  VARCHAR(50);
    DECLARE v_setor_saida VARCHAR(100);
    DECLARE v_setor_entrada VARCHAR(100);

    -- Atualiza a localização atual do equipamento
    UPDATE equipamentos
    SET setor_id    = NEW.setor_destino_id,
        subsetor_id = NEW.subsetor_destino_id
    WHERE id = NEW.equipamento_id;

    -- Só registra no histórico se o setor realmente mudou
    IF NOT (NEW.setor_origem_id <=> NEW.setor_destino_id) THEN

        SELECT num_patrimonio INTO v_patrimonio
        FROM equipamentos WHERE id = NEW.equipamento_id LIMIT 1;

        SELECT nome INTO v_setor_saida
        FROM setores WHERE id = NEW.setor_origem_id LIMIT 1;

        SELECT nome INTO v_setor_entrada
        FROM setores WHERE id = NEW.setor_destino_id LIMIT 1;

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
            CONCAT(
                'Equipamento ', IFNULL(v_patrimonio, 'N/A'),
                ' transferido de "', IFNULL(v_setor_saida, 'N/A'),
                '" para "', IFNULL(v_setor_entrada, 'N/A')
            )
        );

    END IF;
END$$

DELIMITER ;

-- -------------------------------------------------------
-- trg_equipamento_status_change
-- Registra no histórico quando o status do equipamento muda
-- para 'desativado' ou 'descartado' (soft delete).
-- -------------------------------------------------------
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS trg_equipamento_status_change
AFTER UPDATE ON equipamentos
FOR EACH ROW
BEGIN
    IF NEW.status IN ('desativado', 'descartado')
        AND OLD.status NOT IN ('desativado', 'descartado') THEN
        INSERT INTO historico_equipamentos (equipamento_id, tipo_evento, descricao)
        VALUES (
            NEW.id,
            'mudanca_status',
            CONCAT('Status alterado de "', OLD.status, '" para "', NEW.status, '"')
        );
    END IF;
END$$

DELIMITER ;

-- -------------------------------------------------------
-- trg_manutencao_aberta
-- Ao abrir uma OS (INSERT), muda o status do equipamento para
-- 'em_manutencao' automaticamente, bloqueando novas movimentações.
-- -------------------------------------------------------
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

-- -------------------------------------------------------
-- trg_manutencao_encerrada
-- Ao encerrar uma OS ('finalizada' ou 'cancelada'), reverte o
-- status do equipamento para 'ativo'.
-- Trata ambos os casos: manutenção bem-sucedida e cancelada.
-- -------------------------------------------------------
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS trg_manutencao_encerrada
AFTER UPDATE ON manutencoes
FOR EACH ROW
BEGIN
    IF NEW.status IN ('finalizada', 'cancelada')
        AND OLD.status NOT IN ('finalizada', 'cancelada') THEN
        UPDATE equipamentos
        SET status = 'ativo'
        WHERE id = NEW.equipamento_id;
    END IF;
END$$

DELIMITER ;

-- -------------------------------------------------------
-- trg_protege_historico
-- Impede alteração de campos estruturais do histórico.
-- A descrição pode ser corrigida; todos os outros campos são imutáveis.
-- Isso garante a integridade da linha do tempo de auditoria.
-- -------------------------------------------------------
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS trg_protege_historico
BEFORE UPDATE ON historico_equipamentos
FOR EACH ROW
BEGIN
    IF NOT (NEW.id            <=> OLD.id)            OR
       NOT (NEW.equipamento_id <=> OLD.equipamento_id) OR
       NOT (NEW.usuario_id    <=> OLD.usuario_id)    OR
       NOT (NEW.tipo_evento   <=> OLD.tipo_evento)   OR
       NOT (NEW.referencia_id <=> OLD.referencia_id) OR
       NOT (NEW.data_evento   <=> OLD.data_evento)   THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'History records are immutable — only description can be updated';
    END IF;
END$$

DELIMITER ;

-- =============================================================
-- PERMISSÕES
-- O usuário 'patrimonio_user' é o usuário da aplicação.
-- Sem DELETE intencional: o sistema usa soft delete (UPDATE status).
-- =============================================================
CREATE USER IF NOT EXISTS 'patrimonio_user'@'%' IDENTIFIED BY 'patrimonio_pass';
GRANT SELECT, INSERT, UPDATE ON patrimonio.* TO 'patrimonio_user'@'%';
FLUSH PRIVILEGES;

-- =============================================================
-- DADOS DE EXEMPLO
-- =============================================================
INSERT INTO setores (nome, descricao) VALUES
('TI', 'Setor de Tecnologia'),
('Financeiro', 'Setor Financeiro'),
('RH', 'Recursos Humanos'),
('Almoxarifado', 'Equipamentos em estoque');

INSERT INTO subsetores (nome, descricao, setor_id) VALUES
('Suporte', 'Suporte técnico ao usuário', 1),
('Infraestrutura', 'Servidores e redes', 1),
('Contabilidade', 'Gestão contábil', 2),
('Recrutamento', 'Seleção de pessoal', 3);

-- Credenciais iniciais: admin@empresa.com / admin123
-- A senha abaixo é o hash bcrypt de "admin123" (gerado via Python bcrypt)
INSERT INTO usuarios (nome, cpf, email, data_nascimento, senha, perfil) VALUES
('Administrador', '12345678910', 'admin@empresa.com', '2000-01-01',
 '$2b$12$7A6MPa6v5fEBPZ/qALa/aO94GYuSdIDoFg2TeHnse33Strwr374jC', 'admin');



