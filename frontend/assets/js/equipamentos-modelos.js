// equipamentos-modelos.js
const API_BASE = "http://localhost:5000";

let token;
let todosModelos = [];

document.addEventListener("DOMContentLoaded", () => {
    token = sessionStorage.getItem("token_procape");

    if (!token) {
        alert("Acesso negado. Por favor, inicie sessão.");
        window.location.href = "../index.html";
        return;
    }

    carregarModelos();
});

// ===============================
// BUSCA OS MODELOS
// ===============================
async function carregarModelos() {
    mostrarLoading();

    try {
        const res = await fetch(`${API_BASE}/generics/types`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
            mostrarErro();
            return;
        }

        todosModelos = await res.json();
        renderizarTabela(todosModelos);

    } catch (err) {
        console.error("Erro ao carregar modelos:", err);
        mostrarErro();
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
                    Nenhum modelo encontrado.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = lista.map(item => `
        <tr style="border-bottom: 1px solid #f1f1f1;">
            <td style="color: #1D4587; padding: 15px 0;">
                <span style="font-weight: 500;">${item.nome ?? "—"}</span>
                ${item.descricao
                    ? `<span class="ms-2 text-muted" style="font-size: 0.82rem;">${item.descricao}</span>`
                    : ""}
            </td>
            <td class="text-end">
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="editarModelo(${item.id})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="verDetalhes(${item.id})" title="Detalhes">
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
    document.getElementById("tbody-equipamentos").innerHTML =
        `<tr><td colspan="2" class="text-center py-4 text-muted">Carregando modelos de equipamentos...</td></tr>`;
}

function mostrarErro() {
    document.getElementById("tbody-equipamentos").innerHTML =
        `<tr><td colspan="2" class="text-center py-4 text-danger fw-bold">Erro ao carregar modelos.</td></tr>`;
}

// ===============================
// AÇÕES
// ===============================
function verDetalhes(id) {
    window.location.href = `equipamento-generico.html?id=${id}`;
}

function editarModelo(id) {
    window.location.href = `equipamento-generico.html?id=${id}`;
}