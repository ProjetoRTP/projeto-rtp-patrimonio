const API_BASE = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("token_procape");

    if (!token) {
        alert("Acesso negado. Por favor, inicie sessão.");
        window.location.href = "../index.html";
        return;
    }

    await carregarRelatorio(token);
});

async function carregarRelatorio(token) {
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    try {
        // ✅ 3 fetches paralelos
        const [resComputadores, resImpressoras, resPerifericos] = await Promise.all([
            fetch(`${API_BASE}/computers`, { headers }),
            fetch(`${API_BASE}/printer`,   { headers }),
            fetch(`${API_BASE}/peripheral`,{ headers })
        ]);

        if (!resComputadores.ok || !resImpressoras.ok || !resPerifericos.ok) {
            throw new Error("Erro ao buscar dados do servidor.");
        }

        const [computadores, impressoras, perifericos] = await Promise.all([
            resComputadores.json(),
            resImpressoras.json(),
            resPerifericos.json()
        ]);

        // Junta tudo em uma lista única
        const todos = [
            ...computadores.map(e => ({ ...e, _tipo: "Computador" })),
            ...impressoras.map(e => ({ ...e, _tipo: "Impressora" })),
            ...perifericos.map(e => ({ ...e, _tipo: "Periférico" }))
        ];

        preencherResumo(todos);
        preencherTabela(todos);

    } catch (erro) {
        console.error("Erro ao carregar relatório:", erro);
        document.getElementById("tabela-equipamentos").innerHTML = `
            <tr><td colspan="7" class="text-center py-4 text-danger">Erro ao carregar dados.</td></tr>
        `;
    }
}

function preencherResumo(todos) {
    // Data atual
    document.getElementById("data").textContent = new Date().toLocaleDateString("pt-BR");

    // Setor — exibe todos os setores únicos presentes
    const setores = [...new Set(todos.map(e => e.setor_id).filter(Boolean))];
    document.getElementById("setor").textContent = setores.length > 0 ? setores.join(", ") : "Todos";

    // Contagens por status
    const total    = todos.length;
    const emUso    = todos.filter(e => e.status === "ativo").length;
    const manut    = todos.filter(e => e.status === "em_manutencao").length;
    const estoque  = todos.filter(e => e.status === "inativo").length;

    document.getElementById("total").textContent   = total;
    document.getElementById("uso").textContent     = emUso;
    document.getElementById("manut").textContent   = manut;
    document.getElementById("estoque").textContent = estoque;
}

function preencherTabela(todos) {
    const tabela = document.getElementById("tabela-equipamentos");

    if (!todos || todos.length === 0) {
        tabela.innerHTML = `
            <tr><td colspan="7" class="text-center py-4 text-muted">Nenhum equipamento encontrado.</td></tr>
        `;
        return;
    }

    tabela.innerHTML = todos.map(eq => `
        <tr>
            <td>${eq.id ?? "—"}</td>
            <td>${eq._tipo}</td>
            <td>${eq.modelo ?? eq.tipo_per ?? eq.os ?? "—"}</td>
            <td>${eq.num_patrimonio ?? "—"}</td>
            <td>${formatarStatus(eq.status)}</td>
            <td>${formatarData(eq.data_cadastro)}</td>
            <td>${formatarData(eq.data_movimentacao ?? null)}</td>
        </tr>
    `).join("");
}

function formatarStatus(status) {
    const mapa = {
        "ativo":          `<span class="badge bg-success">Ativo</span>`,
        "emprestado":     `<span class="badge bg-info text-dark">Emprestado</span>`,
        "em_manutencao":  `<span class="badge bg-warning text-dark">Manutenção</span>`,
        "inativo":        `<span class="badge bg-secondary">Inativo</span>`,
        "desativado":     `<span class="badge bg-dark">Desativado</span>`,
        "descartado":     `<span class="badge bg-danger">Descartado</span>`
    };
    return mapa[status] ?? `<span class="badge bg-light text-dark">${status ?? "—"}</span>`;
}

function formatarData(dataISO) {
    if (!dataISO) return "—";
    return new Date(dataISO).toLocaleDateString("pt-BR");
}