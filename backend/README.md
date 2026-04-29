# RTP Patrimônio - Backend API

Esta é a API central do sistema de gestão patrimonial (RTP Patrimônio) construída com **Flask**. O backend é responsável por toda a regra de negócios de rastreamento de equipamentos, controle de autenticação/autorização, auditorias automáticas via triggers de banco de dados e controle de setores do sistema.

---

## 🚀 Tecnologias Utilizadas

- **Linguagem:** Python 3.10+
- **Framework Web:** Flask (com arquitetura de Blueprints)
- **Banco de Dados:** MySQL (Consultas utilizando SQLAlchemy Core / PyMySQL)
- **Autenticação:** JWT (`flask_jwt_extended` e senhas criptografadas com `bcrypt`)
- **Documentação da API:** Swagger/OpenAPI (`flasgger`)
- **Testes:** Pytest (E2E Testing para todas as lógicas cruciais)

---

## 📂 Arquitetura do Projeto (Clean Code)

A estrutura de diretórios foi pensada para garantir o máximo de isolamento de responsabilidades e manutenção clara:

```
backend/
├── core/                  # Módulos de bootstrap (Extensions, Register das rotas)
├── config/                # Variáveis de ambiente e lógicas de inicialização
├── database/              # Conexão com o banco (Engine) e scripts SQL (setup via triggers)
├── docs/                  # Especificações OpenAPI/Swagger em YAML puro
├── modules/               # O coração da regra de negócios (Blueprints separados por domínio)
│   ├── authentication/    # Login e geração de Tokens
│   ├── user/              # CRUD de usuários e RBAC
│   ├── collaborator/      # Gestão de funcionários da unidade
│   ├── sectors/           # Setores e Subsetores
│   ├── equipments/        # Computadores, Impressoras e Periféricos
│   ├── maintenance/       # Fluxo de entrada e saída de manutenção
│   ├── history/           # Histórico de rastreamento (Logs)
│   └── movements/         # Transferências e alocações (Trigger-based)
├── tests/                 # Suíte completa de E2E com Pytest
└── main.py                # Entrypoint principal da aplicação
```

---

## 🛠️ Como Executar Localmente

### 1. Pré-requisitos
Certifique-se de ter o Python e o MySQL instalados. Crie um banco de dados vazio chamado `patrimonio` e configure o seu usuário do banco.

### 2. Ambiente Virtual e Dependências
Crie o ambiente virtual e instale os pacotes:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Variáveis de Ambiente
Na raiz da pasta `backend/`, crie um arquivo `.env` (você pode se basear em variáveis genéricas ou num `.env.example`, se existir):
```ini
FLASK_APP=main.py
FLASK_ENV=development
JWT_SECRET_KEY=sua_chave_ultra_secreta_aqui
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=patrimonio
```

### 4. Inicializando o Banco de Dados
A API tentará criar o banco e sincronizar as tabelas via SQLAlchemy na primeira vez que rodar, mas as regras mais ricas dependem de triggers e procedures contidas em `database/script/patrimonio.sql`. Execute esse script SQL no seu SGBD (MySQL Workbench, DBeaver) para semear as triggers críticas.

### 5. Rodando a Aplicação
```bash
python main.py
```
A API estará disponível por padrão em `http://localhost:5000`.

---

## 📖 Documentação da API (Swagger)

Nossa API possui uma documentação viva construída sobre o Flasgger. Nela você pode testar as rotas interativamente (inclusive injetando o token JWT pelo botão "Authorize").

Quando o servidor local estiver rodando, acesse:
👉 **[http://localhost:5000/apidocs](http://localhost:5000/apidocs)**

---

## 🧪 Suíte de Testes (QA/E2E)

Nosso backend conta com cobertura em fluxos End-to-End validando comportamentos críticos de banco (RBAC, triggers de manutenção e movimentação, etc).

Para rodar os testes:
```bash
pytest
```
*Observação: Os testes automaticamente isolam o banco utilizando fixtures (como `patrimonio_test`), garantindo que os seus dados de desenvolvimento não sejam destruídos durante o processo.*

---

## 🔐 RBAC (Role-Based Access Control)

As permissões do sistema são ativamente checadas via decorators de rota baseados nas claims do JWT. Existem três níveis:

- **Comum:** Leitura geral, registro de equipamentos base e execução de transferências/movimentações.
- **Gerente:** Permissão para criar, editar ou desativar dados do negócio (Setores, Manutenções, edição fina de ativos).
- **Admin:** Controle total (mesmas do Gerente) + Gestão de Usuários do sistema (criação e promoção de outros usuários).
