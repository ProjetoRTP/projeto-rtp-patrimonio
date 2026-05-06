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
    const id         = params.get("id");
    const tipo       = params.get("tipo");
    const dataInicio = params.get("dataInicio");
    const dataFim    = params.get("dataFim");
    const setor      = params.get("setor");
    const equipamento = params.get("equipamento");

    // Exibe os filtros aplicados no cabeçalho
    document.getElementById("data").textContent =
        `${formatarData(dataInicio)} até ${formatarData(dataFim)}`;
        
    const labelsTipoDisplay = {
        geral: "Geral",
        movimentacoes: "Movimentações",
        manutencoes: "Manutenções",
        equipamentos: "Equipamentos",
        genericos: "Equipamentos Genéricos"
    };
    
    document.getElementById("info-tipo").textContent = labelsTipoDisplay[tipo] || tipo || "Geral";
    
    if (setor) {
        // Tentar obter o nome do setor pode requerer uma chamada à API, 
        // mas no mínimo podemos mostrar o ID por enquanto ou deixar como Todos se não houver
        document.getElementById("setor").textContent = "ID " + setor;
    }

    carregarRelatorio({ id, tipo, dataInicio, dataFim, setor, equipamento });
});

// ===============================
// BUSCA E FILTRA OS DADOS
// ===============================
async function carregarRelatorio({ id, tipo, dataInicio, dataFim, setor, equipamento }) {
    const tabela = document.getElementById("tabela-equipamentos");
    tabela.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">A carregar...</td></tr>`;

    try {
        if (!id) throw new Error("ID do relatório não fornecido.");

        const url = `${API_BASE_URL}/reports/${id}/data`;

        const resposta = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);

        let dados = await resposta.json();

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
            <td class="align-middle">${item.id}</td>
            <td class="align-middle">${LABELS_TIPO[item.tipo_evento] ?? item.tipo_evento}</td>
            <td class="align-middle">
                ${item.num_patrimonio
                    ? `<a href="equipamento-info.html?id=${item.equipamento_id}&tipo=${item.tipo_equipamento ?? 'generico'}" style="color:#1D4587;">${item.num_patrimonio}</a>`
                    : (item.equipamento_id ?? '—')
                }
            </td>
            <td class="align-middle">${item.usuario_nome ?? item.usuario_id ?? '—'}</td>
            <td class="align-middle" style="white-space: nowrap;">${formatarData(item.data_evento)}</td>
            <td class="align-middle" style="min-width: 250px; white-space: normal;">${item.descricao ?? '—'}</td>
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