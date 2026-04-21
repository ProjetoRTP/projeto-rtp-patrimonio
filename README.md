# Patrimônio RTP

Sistema de controle de patrimônio (equipamentos, movimentações e manutenções).

## Requisitos

- Docker e Docker Compose instalados

## Setup

```bash
cp .env.example .env
# edite o .env com suas senhas
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend: http://localhost:5000
- Banco: porta 3306 (inicializado automaticamente via `patrimonio.sql`)

## Estrutura

```
backend/
  config/         # variáveis de ambiente
  database/
    script/       # patrimonio.sql (executado no init do MySQL)
  modules/
    auth/         # autenticação
    user/         # usuários
    forgot/       # recuperação de senha
  routes/         # registro dos blueprints
  main.py
  requirements.txt
frontend/
  index.html
  page/           # telas HTML
  styles/         # CSS
  js/             # scripts
docker-compose.yml
.env.example
```