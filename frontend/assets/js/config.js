// config.js — Configuração global da API
// Detecta automaticamente o host onde o frontend está rodando.
// Em desenvolvimento (localhost): chama direto http://localhost:5000
// Em produção (outro host): usa /api (proxy nginx → backend)
(function() {
    const isLocalhost = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1';
    window.API_BASE = isLocalhost
        ? 'http://localhost:5000'
        : window.location.origin + '/api';
})();
