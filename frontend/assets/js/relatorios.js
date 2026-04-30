const API_URL = ''

document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("token_procape");

    if (!token) {
        alert("Acesso negado. Por favor, inicie sessão.");
        window.location.href = "../index.html";
        return;
    }

    carregarRelatorios(token);
});

async function carregarRelatorios(token) {
    const tbody = document.getElementById("tbody-subsetores");

    try {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-muted">A carregar...</td></tr>`;

        const resposta = await fetch("http://localhost:5000/history", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);

        const dados = await resposta.json();
        montarTabelaRelatorios(dados);

        if (resposta.status === 401) {
            sessionStorage.removeItem("token_procape"); // Limpa o token inválido
            window.location.href = "../index.html";
            return;
        }

    } catch (erro) {
        console.error("Erro ao carregar relatórios:", erro);
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-danger">Erro ao carregar relatórios.</td></tr>`;
    }
}

function montarTabelaRelatorios(relatorios) {
    const tbody = document.getElementById("tbody-subsetores");

    if (!relatorios || relatorios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-muted">Nenhum relatório encontrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = relatorios.map(relatorio => `
        <tr>
            <td>${relatorio.tipo_evento ?? "—"}</td>      
            <td>${formatarData(relatorio.data_evento)}</td>
            <td class="text-end">
                <a href="relatorio-info.html?id=${relatorio.id}" class="btn-acao btn-info-red">
                    <i class="bi bi-eye"></i>
                </a>
                <a onclick="imprimirRelatorio(${relatorio.id})" class="btn-acao btn-editar" style="cursor:pointer;">
                    <i class="bi bi-printer"></i>
                </a>
            </td>
        </tr>
    `).join("");
}

function formatarData(dataISO) {
    if (!dataISO) return "—";
    return new Date(dataISO).toLocaleDateString("pt-BR");
}

function imprimirRelatorio(id) {
    window.open(`relatorio-detalhe.html?id=${id}`, "_blank");
}
