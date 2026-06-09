// equipamentos-modelos.js
const API_BASE = "http://localhost:5000";

let token;
let todosModelos = [];

document.addEventListener("DOMContentLoaded", () => {
    token = sessionStorage.getItem("token_procape");

    if (!token) {
        alert("Acesso negado. Por favor, inicie sessão.");
        window.location.href = "../../index.html";
        return;
    }

    const perfil = sessionStorage.getItem("usuario_perfil");
    if (perfil === "gerente") {
        const btnCriar = document.getElementById("botao");
        if (btnCriar) btnCriar.style.display = "none";
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
                ${(item.ativo === false || item.ativo === 0)
                    ? `<span class="badge ms-2" style="background-color: #fdecea; color: #D32F2F; font-size: 0.75rem;">Inativo</span>`
                    : ""}
            </td>
            <td class="text-end">
                <button 
                    class="btn btn-sm ${(item.ativo === false || item.ativo === 0) ? 'btn-outline-success' : 'btn-outline-warning'}" 
                    onclick="toggleAtivo(${item.id}, ${!(item.ativo === false || item.ativo === 0)})"
                    title="${(item.ativo === false || item.ativo === 0) ? 'Ativar' : 'Desativar'}">
                    <i class="bi ${(item.ativo === false || item.ativo === 0) ? 'bi-check-circle' : 'bi-slash-circle'}"></i>
                    ${(item.ativo === false || item.ativo === 0) ? 'Ativar' : 'Desativar'}
                </button>
                <button 
                    class="btn btn-sm btn-outline-danger ms-1" 
                    onclick="excluirModelo(${item.id})"
                    title="Excluir Permanentemente">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

// ===============================
// DESATIVAR / ATIVAR MODELO
// ===============================
async function toggleAtivo(id, estaAtivo) {
    const acao = estaAtivo ? "desativar" : "ativar";
    const confirma = confirm(`Deseja ${acao} este modelo?`);
    if (!confirma) return;

    try {
        const res = await fetch(`${API_BASE}/generics/types/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ ativo: !estaAtivo })
        });

        if (res.ok) {
            await carregarModelos();
        } else {
            const erro = await res.json();
            alert(`Erro: ${erro.erro || erro.error || `Falha ao ${acao} modelo.`}`);
        }

    } catch (err) {
        console.error(`Erro ao ${acao} modelo:`, err);
        alert("Erro ao conectar com o servidor.");
    }
}

async function excluirModelo(id) {
    if (!confirm("Deseja realmente EXCLUIR permanentemente este modelo? Esta ação não poderá ser desfeita.")) return;

    try {
        const res = await fetch(`${API_BASE}/generics/types/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (res.ok) {
            alert("Modelo excluído com sucesso!");
            await carregarModelos();
        } else {
            const erro = await res.json();
            // A mensagem de erro amigável vinda do back-end será exibida aqui caso existam equipamentos vinculados
            alert(`Erro: ${erro.erro || "Falha ao excluir modelo."}`);
        }

    } catch (err) {
        console.error("Erro ao excluir modelo:", err);
        alert("Erro de conexão ao tentar excluir modelo.");
    }
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