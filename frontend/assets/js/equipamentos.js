// equipamentos-lista.js
const API_BASE = "http://localhost:5000";

let token;
let todosEquipamentos = [];

const LABELS_TIPO = {
    computador: "Computador",
    impressora: "Impressora",
    periferico: "Periférico",
    generico: "Genérico"
};

document.addEventListener("DOMContentLoaded", () => {
    token = sessionStorage.getItem("token_procape");

    if (!token) {
        alert("Acesso negado. Por favor, inicie sessão.");
        window.location.href = "../index.html";
        return;
    }

    carregarfiltros();
    initFiltros();
    carregarTodosEquipamentos();
});

// ===============================
// BUSCA TODOS OS TIPOS EM PARALELO
// ===============================
async function carregarTodosEquipamentos() {
    mostrarLoading();

    const status = document.getElementById("filtro-status")?.value || "";
    const setor = document.getElementById("filtro-setor")?.value || "";

    const query = new URLSearchParams();

    if (status) query.append("status", status);
    if (setor) query.append("setor", setor);

    const qs = query.toString();

    try {
        const endpoints = [
            "/computers/lista",
            "/printer/lista",
            "/peripherals/lista",
            "/generics/lista"
        ];

        const results = await Promise.all(
            endpoints.map(ep =>
                buscarEndpoint(qs ? `${ep}?${qs}` : ep)
            )
        );

        const [computadores, impressoras, perifericos, genericos] = results;

        todosEquipamentos = [
            ...computadores.map(e => ({ ...e, tipo: "computador" })),
            ...impressoras.map(e => ({ ...e, tipo: "impressora" })),
            ...perifericos.map(e => ({ ...e, tipo: "periferico" })),
            ...genericos.map(e => ({ ...e, tipo: "generico" })),
        ];

        renderizarTabela(todosEquipamentos);

    } catch (err) {
        console.error("Erro ao carregar equipamentos:", err);
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

        if (!res.ok) return [];

        return await res.json();

    } catch (err) {
        console.warn("Erro endpoint:", path, err);
        return [];
    }
}

/// ===============================
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

    tbody.innerHTML = lista.map(item => {
        // Garantimos que o tipo exista. Se não existir, forçamos um valor seguro.
        const tipoSeguro = item.tipo || "computador"; 

        return `
        <tr style="border-bottom: 1px solid #f1f1f1;">
            <td style="color: #1D4587; padding: 15px 0;">
                <a href="#" onclick="verDetalhes(${item.id}, '${tipoSeguro}')"
                    style="color: #1D4587; text-decoration: none; font-weight: 500;">
                    ${item.num_patrimonio ?? "—"}
                </a>
                <span class="badge ms-2" style="background-color: #EAF2F8; color: #1D4587; font-size: 0.75rem;">
                    ${LABELS_TIPO[tipoSeguro] ?? tipoSeguro}
                </span>
            </td>
            <td class="text-end">
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="editarEquipamento(${item.id}, '${tipoSeguro}')">
                        <i class="bi bi-pencil"></i>
                </button>
                    <!-- AQUI ESTÁ A CORREÇÃO PRINCIPAL: Passando tipoSeguro com aspas -->
                    <button class="btn btn-sm btn-outline-danger" onclick="verDetalhes(${item.id}, '${tipoSeguro}')">
                        <i class="bi bi-info"></i>
                </button>
                </div>
            </td>
        </tr>
    `}).join("");
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

/// ===============================
// AÇÕES
// ===============================
function verDetalhes(id, tipo) {
    window.location.href = `equipamento-info.html?id=${id}&tipo=${tipo}`;
}

function editarEquipamento(id, tipo) {
    window.location.href = `cadastro-equipamentos.html?id=${id}&tipo=${tipo}`;
}
/// ================================
// FILTROS
// =================================
async function carregarfiltros() {
    const setorSelect = document.getElementById("filtro-setor");

    if (!setorSelect) return;

    try {
        const res = await fetch(`${API_BASE}/sectors`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) return;

        const setores = await res.json();

        setorSelect.innerHTML = '<option value="">Todos os setores</option>';

        setores.forEach(setor => {
            const option = document.createElement("option");
            option.value = setor.id;
            option.textContent = setor.nome;
            setorSelect.appendChild(option);
        });

    } catch (err) {
        console.error("Erro setores:", err);
    }
}

async function limpaFiltros() {
    const filtroSetor = document.getElementById("filtro-setor");
    const filtroStatus = document.getElementById("filtro-status");
    filtroSetor.value = "";
    carregarTodosEquipamentos();

}

function initFiltros() {
    document
        .getElementById("btn-aplicar")
        ?.addEventListener("click", carregarTodosEquipamentos);
    document
        .getElementById("btn-limpar")
        ?.addEventListener("click", limpaFiltros)
}

function mostrarLoading() {
    document.getElementById("tbody-equipamentos").innerHTML =
        `<tr><td colspan="2">Carregando...</td></tr>`;
}

function mostrarErro() {
    document.getElementById("tbody-equipamentos").innerHTML =
        `<tr><td colspan="2">Erro ao carregar</td></tr>`;
}