// ===============================
// CONFIG
// ===============================
const API_URL = "http://localhost:3000/equipamentos-impressoras";

// ===============================
// ELEMENTOS DO DOM
// ===============================
const tbody = document.getElementById("tbody-equipamentos");

// ===============================
// INIT (quando a página carrega)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    carregarEquipamentos();
});

// ===============================
// FUNÇÃO PRINCIPAL (GET)
// ===============================
async function carregarEquipamentos() {
    try {
        mostrarLoading();

        const response = await fetch(API_URL);
        const dados = await response.json();

        renderizarTabela(dados);

    } catch (erro) {
        console.error("Erro ao carregar equipamentos:", erro);
        mostrarErro();
    }
}

// ===============================
// RENDERIZAÇÃO DA TABELA
// ===============================
function renderizarTabela(lista) {

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-4 text-muted">
                    Nenhum equipamento encontrado
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = "";

    lista.forEach(eq => {

        const linha = `
            <tr data-id="${eq.id}" style="border-bottom: 1px solid #f1f1f1;">
                
                <td style="color: #1D4587; padding: 15px 0;">
                    <a href="#" 
                       onclick="abrirHistorico(${eq.id})"
                       style="text-decoration: none; color: #1D4587; font-weight: 500;">
                       ${eq.nome}
                    </a>
                </td>

                <td class="text-end">
                    <button 
                        class="btn btn-sm btn-outline-primary me-2"
                        onclick="editarEquipamento(${eq.id})">
                        <i class="bi bi-pencil"></i>
                    </button>

                    <button 
                        class="btn btn-sm btn-outline-danger"
                        onclick="verDetalhes(${eq.id})">
                        <i class="bi bi-info"></i>
                    </button>
                </td>

            </tr>
        `;

        tbody.innerHTML += linha;
    });
}

// ===============================
// LOADING
// ===============================
function mostrarLoading() {
    tbody.innerHTML = `
        <tr>
            <td colspan="2" class="text-center py-4 text-muted">
                Carregando equipamentos...
            </td>
        </tr>
    `;
}

// ===============================
// ERRO
// ===============================
function mostrarErro() {
    tbody.innerHTML = `
        <tr>
            <td colspan="2" class="text-center py-4 text-danger">
                Erro ao carregar dados 😢
            </td>
        </tr>
    `;
}

// ===============================
// AÇÕES (BOTÕES)
// ===============================

// ✏️ Editar
function editarEquipamento(id) {
    console.log("Editar equipamento ID:", id);

    // Aqui você pode abrir modal
    // ou redirecionar:
    // window.location.href = `/editar.html?id=${id}`;
}

// ℹ️ Detalhes
function verDetalhes(id) {
    console.log("Ver detalhes ID:", id);

    // Pode abrir modal de detalhes
}

// 📜 Histórico
function abrirHistorico(id) {
    console.log("Abrir histórico ID:", id);

    // Ex: abrir modal Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('modalHistorico'));
    modal.show();
}