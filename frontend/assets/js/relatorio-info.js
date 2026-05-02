// relatorio-info.js
const API_BASE_URL = "http://localhost:5000";
const token = sessionStorage.getItem("token_procape");

if (!token) {
    alert("Acesso negado. Por favor, faça o login.");
    window.location.href = "../index.html";
}

// Mapeamento de tipo_evento para label legível
const LABELS_TIPO = {
    cadastro:            "Cadastro",
    movimentacao:        "Movimentação",
    manutencao_entrada:  "Manutenção (Entrada)",
    manutencao_saida:    "Manutenção (Saída)",
    mudanca_status:      "Mudança de Status"
};

document.addEventListener("DOMContentLoaded", () => {
    const params     = new URLSearchParams(window.location.search);
    const tipo       = params.get("tipo");
    const dataInicio = params.get("dataInicio");
    const dataFim    = params.get("dataFim");
    const setor      = params.get("setor");
    const equipamento = params.get("equipamento");

    // Exibe os filtros aplicados no cabeçalho
    document.getElementById("data").textContent =
        `${formatarData(dataInicio)} até ${formatarData(dataFim)}`;

    carregarRelatorio({ tipo, dataInicio, dataFim, setor, equipamento });
});

// ===============================
// BUSCA E FILTRA OS DADOS
// ===============================
async function carregarRelatorio({ tipo, dataInicio, dataFim, setor, equipamento }) {
    const tabela = document.getElementById("tabela-equipamentos");
    tabela.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">A carregar...</td></tr>`;

    try {
        // Escolhe o endpoint conforme o tipo
        let url = `${API_BASE_URL}/history`;

        if (tipo === "movimentacoes") url = `${API_BASE_URL}/history/type/movimentacao`;
        else if (tipo === "manutencoes") url = `${API_BASE_URL}/history/type/manutencao_entrada`;
        else if (tipo === "equipamentos") url = `${API_BASE_URL}/history/type/cadastro`;
        // "geral" usa /history sem filtro de tipo

        const resposta = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);

        let dados = await resposta.json();

        // Filtra por data no frontend
        dados = dados.filter(item => {
            const dataEvento = item.data_evento?.split("T")[0];
            return dataEvento >= dataInicio && dataEvento <= dataFim;
        });

        // Filtra por equipamento (num_patrimonio ou equipamento_id)
        if (equipamento) {
            dados = dados.filter(item =>
                String(item.equipamento_id).includes(equipamento) ||
                item.descricao?.toLowerCase().includes(equipamento.toLowerCase())
            );
        }

        // Atualiza resumo
        document.getElementById("total").textContent = dados.length;
        document.getElementById("uso").textContent   = dados.filter(d => d.tipo_evento === "movimentacao").length;
        document.getElementById("manut").textContent = dados.filter(d => d.tipo_evento?.startsWith("manutencao")).length;
        document.getElementById("estoque").textContent = dados.filter(d => d.tipo_evento === "cadastro").length;

        renderizarTabela(dados);

    } catch (erro) {
        console.error("Erro ao carregar relatório:", erro);
        tabela.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">Erro ao carregar dados.</td></tr>`;
    }
}

// ===============================
// RENDERIZA A TABELA
// ===============================
function renderizarTabela(lista) {
    const tabela = document.getElementById("tabela-equipamentos");

    if (!lista || lista.length === 0) {
        tabela.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Nenhum registro encontrado.</td></tr>`;
        return;
    }

    tabela.innerHTML = lista.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${LABELS_TIPO[item.tipo_evento] ?? item.tipo_evento}</td>
            <td>${item.equipamento_id ?? "—"}</td>
            <td>${item.referencia_id ?? "—"}</td>
            <td>${item.usuario_id ?? "—"}</td>
            <td>${formatarData(item.data_evento)}</td>
            <td>${item.descricao ?? "—"}</td>
        </tr>
    `).join("");
}

// ===============================
// FORMATAR DATA
// ===============================
function formatarData(dataISO) {
    if (!dataISO) return "—";
    return new Date(dataISO).toLocaleDateString("pt-BR");
}