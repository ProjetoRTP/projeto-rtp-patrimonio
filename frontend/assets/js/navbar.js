function carregarNavbar() {
    fetch('navbar.html')
        .then(resposta => {
            return resposta.text();
        })
        .then(html => {
            document.getElementById('espaco-da-navbar').innerHTML = html;

            configurarEventosNavbar();
        })
        .catch(erro => {
            console.error('Erro ao carregar a navbar: ', erro);
        });

}

function configurarEventosNavbar() {
    // Selecionamos o link "Equipamentos" (precisaremos adicionar uma classe ou ID nele)
    // E a gaveta que queremos mostrar
    const linkEquipamentos = document.querySelector('.sidebar-link[href="../pages/computadores.html"]');
    const gaveta = document.getElementById('gavetaComputadores');

    if (linkEquipamentos && gaveta) {
        // Quando o mouse entra no link
        linkEquipamentos.addEventListener('mouseenter', () => {
            gaveta.classList.add('show');
        });

        // Quando o mouse sai da área (Link + Gaveta)
        // Dica: Para não fechar enquanto o usuário tenta clicar nos sublinks, 
        // o ideal é envolver ambos em uma <div> pai ou monitorar a saída de ambos.
        
        // Forma simples: fechar quando o mouse sair da gaveta
        gaveta.addEventListener('mouseleave', () => {
            gaveta.classList.remove('show');
        });
    }
}

carregarNavbar();