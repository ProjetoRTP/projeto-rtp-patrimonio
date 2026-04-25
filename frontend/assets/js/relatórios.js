async function carregarRelatorios() {
    try {
        const resposta = await fetch("http://localhost:3000/relatorios");

        const dados = await resposta.json();

        montarTabelaRelatorios(dados);

    } catch (erro) {
        console.error("Erro ao carregar relatórios:", erro);
    }
}

function montarTabelaRelatorios(relatorios) {
    const tbody = document.getElementById("tbody-subsetores");

    tbody.innerHTML = "";

    if (relatorios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-4 text-muted">
                    Nenhum relatório encontrado
                </td>
            </tr>
        `;
        return;
    }

    relatorios.forEach(relatorio => {
        const linha = `
            <tr>
                <td>${relatorio.setor}</td>
                <td>${formatarData(relatorio.data)}</td>
                <td class="text-end">

                    <a href="relatorio-detalhe.html?id=${relatorio.id}" class="btn-acao btn-info-red">
                        <i class="bi bi-eye"></i>
                    </a>

                    <a onclick="imprimirRelatorio(${relatorio.id})" class="btn-acao btn-editar">
                        <i class="bi bi-printer"></i>
                    </a>

                </td>
            </tr>
        `;

        tbody.innerHTML += linha;
    });
}

function formatarData(dataISO) {
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
}

function imprimirRelatorio(id) {
    window.open(`relatorio-detalhe.html?id=${id}`, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
    carregarRelatorios();
});