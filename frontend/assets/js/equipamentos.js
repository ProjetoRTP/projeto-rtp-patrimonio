// equipamentos-lista.js
const API_BASE = "http://localhost:5000";
let token;
let todosEquipamentos = [];

const LABELS_TIPO = {
    computador: "Computador",
    impressora: "Impressora",
    periferico: "Periférico",
    generico:   "Genérico"
};

document.addEventListener("DOMContentLoaded", () => {
    token = sessionStorage.getItem("token_procape");

    if (!token) {
        alert("Acesso negado. Por favor, inicie sessão.");
        window.location.href = "../index.html";
        return;
    }

    carregarTodosEquipamentos();
});

// ===============================
// BUSCA TODOS OS TIPOS EM PARALELO
// ===============================
async function carregarTodosEquipamentos() {
    mostrarLoading();

    try {
        // Busca todos os tipos em paralelo
        // ⚠️ Quando o endpoint de genéricos estiver pronto,
        // adicione: buscarEndpoint("/equipamentos?tipo=generico")
        const [computadores, impressoras, perifericos, genericos] = await Promise.all([
            buscarEndpoint("/computers"),
            buscarEndpoint("/printer"),
            buscarEndpoint("/peripherals"),
            buscarEndpoint("/generics"),
        ]);

        // Junta tudo e adiciona o tipo em cada item (caso não venha do backend)
        todosEquipamentos = [
            ...computadores.map(e => ({ ...e, tipo: e.tipo ?? "computador" })),
            ...impressoras.map(e => ({ ...e, tipo: e.tipo ?? "impressora" })),
            ...perifericos.map(e => ({ ...e, tipo: e.tipo ?? "periferico" })),
            ...genericos.map(e => ({ ...e, tipo: e.tipo ?? "generico" })),
        ];

        renderizarTabela(todosEquipamentos);

    } catch (erro) {
        console.error("Erro ao carregar equipamentos:", erro);
        mostrarErro();
    }
}

// ===============================
// HELPER PARA FETCH
// ===============================
async function buscarEndpoint(path) {
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
            console.warn(`Endpoint ${path} retornou ${res.status}`);
            return [];
        }

        return await res.json();

    } catch (erro) {
        console.warn(`Falha ao buscar ${path}:`, erro);
        return []; // Retorna vazio sem quebrar os outros
    }
}

// ===============================
// RENDERIZAÇÃO DA TABELA
// ===============================
function renderizarTabela(lista) {
    const tbody = document.getElementById("tbody-equipamentos");

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-4 text-muted">
                    Nenhum equipamento encontrado.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = lista.map(item => `
        <tr style="border-bottom: 1px solid #f1f1f1;">
            <td style="color: #1D4587; padding: 15px 0;">
                <a href="#" onclick="verDetalhes(${item.id}, '${item.tipo}')"
                    style="color: #1D4587; text-decoration: none; font-weight: 500;">
                    ${item.num_patrimonio ?? "—"}
                </a>
                <span class="badge ms-2" style="background-color: #EAF2F8; color: #1D4587; font-size: 0.75rem;">
                    ${LABELS_TIPO[item.tipo] ?? item.tipo ?? "—"}
                </span>
            </td>
            <td class="text-end">
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="editarEquipamento(${item.id}, '${item.tipo}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="verDetalhes(${item.id}, '${item.tipo}')">
                        <i class="bi bi-info"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

// ===============================
// HELPERS VISUAIS
// ===============================
function mostrarLoading() {
    const tbody = document.getElementById("tbody-equipamentos");
    tbody.innerHTML = `
        <tr>
            <td colspan="2" class="text-center py-4 text-muted">
                Carregando equipamentos...
            </td>
        </tr>`;
}

function mostrarErro() {
    const tbody = document.getElementById("tbody-equipamentos");
    tbody.innerHTML = `
        <tr>
            <td colspan="2" class="text-center py-4 text-danger fw-bold">
                Erro ao carregar equipamentos.
            </td>
        </tr>`;
}

// ===============================
// AÇÕES
// ===============================
function verDetalhes(id, tipo) {
    const rotas = {
        computador: `computador-info.html?id=${id}`,
        impressora: `impressora-info.html?id=${id}`,
        periferico: `periferico-info.html?id=${id}`,
        generico:   `equipamento-info.html?id=${id}`,
    };
    window.location.href = rotas[tipo] ?? `equipamento-info.html?id=${id}`;
}

function editarEquipamento(id, tipo) {
    window.location.href = `cadastro-equipamentos.html?id=${id}&tipo=${tipo}`;
}