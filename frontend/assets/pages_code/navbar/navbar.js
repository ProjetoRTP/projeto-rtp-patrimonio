function carregarNavbar() {
    fetch('../navbar/navbar.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('espaco-da-navbar').innerHTML = html;

            // Marca o link ativo com base na URL atual
            const paginaAtual = window.location.pathname.split('/').pop().replace('.html', '');
            document.querySelectorAll('.nav-link[data-page]').forEach(link => {
                if (link.dataset.page === paginaAtual) {
                    link.classList.add('active');
                }
            });

            // Controle de acesso por perfil
            const perfil = sessionStorage.getItem('usuario_perfil') || '';
            if (perfil.toLowerCase() !== 'admin') {
                document.querySelectorAll('[data-role="admin-only"]').forEach(el => {
                    el.style.display = 'none';
                });
            }
        })
        .catch(err => console.error('Erro ao carregar navbar:', err));
}

carregarNavbar();
