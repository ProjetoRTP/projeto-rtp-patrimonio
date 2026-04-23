
/* Função Limpar */
const botaoLimpar = document.getElementById('btn-limpar');
const filtroSetor = document.getElementById('filtro-setor');
const filtroStatus = document.getElementById('filtro-status');

botaoLimpar.addEventListener('click', () => {
    filtroSetor.selectedIndex = 0;
    filtroStatus.selectedIndex = 0;
});

/* Função Aplicar */

const botaoAplicar = document.getElementById('btn-aplicar');

botaoAplicar.addEventListener('click', () => {

    const setorEscolhido = filtroSetor.value;
    const statusEscolhido = filtroStatus.value;

    if (setorEscolhido === "" && statusEscolhido === "") {
        alert("Por favor, escolha pelo menos um filtro antes de aplicar!");
    } else {
        alert("Pedido anotado meu chefe")
        // Fazer a integração aqui para buscar no banco de dados e jogar no HTML
    }
})