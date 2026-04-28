
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




/////// TABELA DE MANUTRENÇÕES POR ID

document.addEventListener("DOMContentLoaded", () => {
    carregarManutencoes();
});

async function carregarManutencoes() {
    try {
        const resposta = await fetch("http://localhost:3000/api/manutencoes");
        const dados = await resposta.json();

        const tabela = document.getElementById("tabela-manutencoes");
        tabela.innerHTML = "";

        dados.forEach(manutencao => {

            const linha = `
                <tr style="border-bottom: 1px solid #f1f1f1;">
                    
                    <td style="color: #1D4587; padding-top: 15px; padding-bottom: 15px;">
                        <a href="#" 
                        style="color: #1D4587; text-decoration: none; font-weight: 500;">
                        ${String(manutencao.id).padStart(7, '0')}
                        </a>
                    </td>

                    <td style="color: #1D4587; padding-top: 15px; padding-bottom: 15px; text-align: center;">
                        <a href="#" 
                        style="color: #1D4587; text-decoration: none; font-weight: 500;">
                        ${manutencao.nome_equipamento}
                        </a>
                    </td>

                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-danger px-2 py-1 btn-info"
                                data-id="${manutencao.id}">
                            <i class="bi bi-info"></i>
                        </button>
                    </td>

                </tr>
            `;

            tabela.innerHTML += linha;
        });

        adicionarEventos();

    } catch (erro) {
        console.error("Erro ao carregar manutenções:", erro);
    }
}



/////// BOTÕES DE CADA MANUTENÇÃO


function adicionarEventos() {

    // INFO
    document.querySelectorAll(".btn-info").forEach(botao => {
        botao.addEventListener("click", () => {
            const id = botao.getAttribute("data-id");

            window.location.href = `movimentacoes-info.html?id=${id}`;
        });
    });
}