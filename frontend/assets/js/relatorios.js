// relatorios.js
const API_BASE_URL = "http://localhost:5000";

const LABELS_TIPO = {
    cadastro:           "Cadastro",
    movimentacao:       "Movimentação",
    manutencao_entrada: "Manutenção (Entrada)",
    manutencao_saida:   "Manutenção (Saída)",
    mudanca_status:     "Mudança de Status"
};

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
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">A carregar...</td></tr>`;

        const resposta = await fetch(`${API_BASE_URL}/history`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (resposta.status === 401) {
            sessionStorage.removeItem("token_procape");
            window.location.href = "../index.html";
            return;
        }

        if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);

        const dados = await resposta.json();
        montarTabelaRelatorios(dados);

    } catch (erro) {
        console.error("Erro ao carregar relatórios:", erro);
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-danger">Erro ao carregar relatórios.</td></tr>`;
    }
}

function montarTabelaRelatorios(relatorios) {
    const tbody = document.getElementById("tbody-subsetores");

    if (!relatorios || relatorios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">Nenhum registro encontrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = relatorios.map(relatorio => `
        <tr>
            <td>${LABELS_TIPO[relatorio.tipo_evento] ?? relatorio.tipo_evento ?? "—"}</td>
            <td>${formatarData(relatorio.data_evento)}</td>
            <td>${relatorio.equipamento_id ?? "—"}</td>
            <td class="text-end">
                <button onclick="verDetalhes(${relatorio.id})" class="btn btn-sm btn-outline-danger" style="cursor:pointer;">
                    <i class="bi bi-info-circle"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

function formatarData(dataISO) {
    if (!dataISO) return "—";
    return new Date(dataISO).toLocaleDateString("pt-BR");
}

function verDetalhes(id) {
    window.location.href = `relatorio-info.html?id=${id}`;
}