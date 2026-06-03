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

            configurarHoverGavetas();

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

function configurarHoverGavetas() {
    const linksComGaveta = document.querySelectorAll('.sidebar-link[data-alvo]');

    linksComGaveta.forEach(link => {
        const idAlvo = link.getAttribute('data-alvo');
        const gaveta = document.getElementById(idAlvo);

        if (!gaveta) return;

        let timeoutId = null;

        const esconderGaveta = () => {
            timeoutId = setTimeout(() => {
                gaveta.classList.remove('show');
            }, 200);
        };

        const limparTimeout = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        };

        link.addEventListener('mouseenter', () => {
            limparTimeout();
            gaveta.classList.add('show');
        });

        link.addEventListener('mouseleave', () => {
            esconderGaveta();
        });

        gaveta.addEventListener('mouseenter', () => {
            limparTimeout();
        });

        gaveta.addEventListener('mouseleave', () => {
            esconderGaveta();
        });
    });
}

carregarNavbar();
