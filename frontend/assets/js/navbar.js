function carregarNavbar() {
    fetch('navbar.html')
        .then(resposta => resposta.text())
        .then(html => {
            document.getElementById('espaco-da-navbar').innerHTML = html;
            
            // Chamamos a configuração logo após injetar o HTML
            configurarHoverGavetas();
        })
        .catch(erro => console.error('Erro ao carregar a navbar:', erro));
}

function configurarHoverGavetas() {
    // Seleciona todos os links que têm a etiqueta 'data-alvo'
    const linksComGaveta = document.querySelectorAll('.sidebar-link[data-alvo]');

    linksComGaveta.forEach(link => {
        const idAlvo = link.getAttribute('data-alvo');
        const gaveta = document.getElementById(idAlvo);

        if (gaveta) {
            // Abrir quando o mouse entra no LINK
            link.addEventListener('mouseenter', () => {
                gaveta.classList.add('show');
            });

            // Fechar apenas quando o mouse sair da GAVETA
            // Permite que o usuário deslize o mouse do link para os sublinks
            gaveta.addEventListener('mouseleave', () => {
                gaveta.classList.remove('show');
            });
            
            //Fechar se o mouse sair do link e NÃO for em direção à gaveta
            link.addEventListener('mouseleave', (event) => {
                // verifica se o mouse foi para a gaveta
                if (event.relatedTarget !== gaveta && !gaveta.contains(event.relatedTarget)) {
                    gaveta.classList.remove('show');
                }
            });
        }
    });
}


carregarNavbar();