function carregarNavbar() {
    fetch('../navbar/navbar.html')
        .then(res => res.text())
        .then(html => {
            // Parse the HTML and extract only the <nav> element to avoid injecting <html><head><body>
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const nav = doc.querySelector('nav');
            const container = document.getElementById('espaco-da-navbar');
            if (nav) container.appendChild(nav);

            // Injeta o CSS dinamicamente se ainda não existir
            if (!document.querySelector('link[href*="navbar.css"]')) {
                const linkCss = document.createElement('link');
                linkCss.rel = 'stylesheet';
                // Caminho relativo para o navbar.css, assumindo que estamos num /pages/modulo/
                linkCss.href = '../navbar/navbar.css?v=3';
                document.head.appendChild(linkCss);
            }

            // Adiciona margem no body para compensar a sidebar fixa
            document.body.style.marginLeft = '220px';

            // Marca o link ativo com base na URL atual
            const paginaAtual = window.location.pathname.split('/').pop().replace('.html', '');
            document.querySelectorAll('.nav-link[data-page]').forEach(link => {
                if (link.dataset.page === paginaAtual) {
                    link.classList.add('active');
                }
            });

            configurarGavetas();

            // Controle de acesso por perfil
            const perfil = sessionStorage.getItem('usuario_perfil') || '';
            if (perfil.toLowerCase() !== 'admin') {
                document.querySelectorAll('[data-role="admin-only"]').forEach(el => {
                    el.style.display = 'none';
                });
            }

            // Logout centralizado
            const btnSair = document.getElementById('btn-sair');
            if (btnSair) {
                btnSair.addEventListener('click', (event) => {
                    event.preventDefault();
                    if (confirm("Tem certeza que deseja sair do sistema?")) {
                        sessionStorage.clear();
                        window.location.href = btnSair.getAttribute('href');
                    }
                });
            }
        })
        .catch(err => console.error('Erro ao carregar navbar:', err));
}

function configurarGavetas() {
    // Click-toggle para submenus (mais adequado para sidebar)
    const linksComGaveta = document.querySelectorAll('.sidebar-link[data-alvo]');

    linksComGaveta.forEach(link => {
        const idAlvo = link.getAttribute('data-alvo');
        const gaveta = document.getElementById(idAlvo);

        if (!gaveta) return;

        link.addEventListener('click', (e) => {
            // Só previne navegação se clicar no arrow ou no próprio item de dropdown
            const isOpen = gaveta.classList.contains('show');

            // Fecha todos os outros
            document.querySelectorAll('.nav-drawer.show').forEach(d => d.classList.remove('show'));
            document.querySelectorAll('.nav-link-arrow').forEach(a => a.style.transform = '');

            if (!isOpen) {
                gaveta.classList.add('show');
                const arrow = link.querySelector('.nav-link-arrow');
                if (arrow) arrow.style.transform = 'rotate(180deg)';
                e.preventDefault(); // só previne nav se abrindo submenu
            }
        });
    });
}

carregarNavbar();
