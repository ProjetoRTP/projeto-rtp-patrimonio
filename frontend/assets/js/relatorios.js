// relatorios.js
const API_BASE_URL = "http://localhost:5000";

const LABELS_TIPO = {
    geral:          "Geral",
    movimentacoes:  "Movimentações",
    manutencoes:    "Manutenções",
    equipamentos:   "Equipamentos"
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

        const resposta = await fetch(`${API_BASE_URL}/reports`, {
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
        montarTabela(dados);

    } catch (erro) {
        console.error("Erro ao carregar relatórios:", erro);
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-danger">Erro ao carregar relatórios.</td></tr>`;
    }
}

function montarTabela(relatorios) {
    const tbody = document.getElementById("tbody-subsetores");

    if (!relatorios || relatorios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">Nenhum relatório gerado ainda.</td></tr>`;
        return;
    }

    tbody.innerHTML = relatorios.map(r => `
        <tr>
            <td>${LABELS_TIPO[r.tipo] ?? r.tipo ?? "—"}</td>
            <td>${formatarData(r.data_criacao)}</td>
            <td>${formatarData(r.data_inicio)} → ${formatarData(r.data_fim)}</td>
            <td class="text-end">
                <button onclick="verDetalhes(${r.id}, '${r.tipo}', '${r.data_inicio}', '${r.data_fim}', '${r.setor_id ?? ''}', '${r.equipamento ?? ''}')"
                    class="btn btn-sm btn-outline-danger" style="cursor:pointer;">
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

function verDetalhes(id, tipo, dataInicio, dataFim, setor, equipamento) {
    const params = new URLSearchParams({ id, tipo, dataInicio, dataFim });
    if (setor)      params.append("setor", setor);
    if (equipamento) params.append("equipamento", equipamento);
    window.location.href = `relatorio-info.html?${params.toString()}`;
}