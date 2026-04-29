
const API_BASE = "http://localhost:5000";
const tbody = document.getElementById("tbody-equipamentos");
const filtroSetor = document.getElementById("filtro-setor");
const filtroStatus = document.getElementById("filtro-status");

document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("token_procape");

    if (!token) {
        alert("Acesso negado. Por favor, inicie sessão.");
        window.location.href = "../index.html";
        return;
    }

    carregarSetores(token);
    carregarComputadores(token);

    document.getElementById("btn-limpar").addEventListener("click", () => {
        filtroSetor.selectedIndex = 0;
        filtroStatus.selectedIndex = 0;
        carregarComputadores(token);
    });

    document.getElementById("btn-aplicar").addEventListener("click", () => {
        carregarComputadores(token, filtroSetor.value, filtroStatus.value);
    });
});

// ===============================
// CARREGAR SETORES DINAMICAMENTE
// ===============================
async function carregarSetores(token) {
    try {
        const res = await fetch(`${API_BASE}/sectors`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) return;

        const setores = await res.json();

        setores.forEach(setor => {
            const option = document.createElement("option");
            option.value = setor.id;
            option.textContent = setor.nome;
            filtroSetor.appendChild(option);
        });

    } catch (erro) {
        console.error("Erro ao carregar setores:", erro);
    }
}

// ===============================
// CARREGAR COMPUTADORES
// ===============================
async function carregarComputadores(token, setorFiltro = "", statusFiltro = "") {
    mostrarLoading();

    try {
        const res = await fetch(`${API_BASE}/computers`, {
            headers: {
                "Authorization": `Bearer ${token}`, // ✅ token adicionado
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error(`Erro ${res.status}`);

        let dados = await res.json();

        // ✅ Filtro por setor_id (número)
        if (setorFiltro) {
            dados = dados.filter(item => String(item.setor_id) === String(setorFiltro));
        }

        // ✅ Filtro por status (ENUM do banco)
        if (statusFiltro) {
            dados = dados.filter(item => item.status === statusFiltro);
        }

        renderizarTabela(dados, token);

    } catch (erro) {
        console.error("Erro ao carregar computadores:", erro);
        mostrarErro();
    }
}

// ===============================
// RENDERIZAÇÃO
// ===============================
function renderizarTabela(lista, token) {
    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-muted">Nenhum computador encontrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(item => `
        <tr style="border-bottom: 1px solid #f1f1f1;">
            <td style="color: #1D4587; padding: 15px 0;">
                <span style="font-weight: 500;">
                    ${item.num_patrimonio ?? "—"}
                </span>
            </td>
            <td class="text-end">
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="editarComputador(${item.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="verDetalhes(${item.id})">
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
    tbody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-muted">Buscando computadores...</td></tr>`;
}

function mostrarErro() {
    tbody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-danger fw-bold">Erro de conexão com o servidor.</td></tr>`;
}

// ===============================
// AÇÕES
// ===============================
function editarComputador(id) {
    window.location.href = `cadastro-equipamentos.html?id=${id}`; // ✅ URL corrigida
}

function verDetalhes(id) {
    window.location.href = `computador-info.html?id=${id}`; // ✅ navega ao invés de alert
}