// ===============================
// CONFIG
// ===============================
const API_URL = "http://localhost:5000/printer";

// ===============================
// ELEMENTOS DO DOM
// ===============================
const tbody = document.getElementById("tbody-equipamentos");
const btnAplicar = document.getElementById("btn-aplicar"); // Seletor do botão que criamos no HTML

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    carregarEquipamentos();

    // Ouvinte para o botão de aplicar filtros
    if (btnAplicar) {
        btnAplicar.addEventListener("click", () => {
            const setor = document.getElementById("filtro-setor").value;
            const status = document.getElementById("filtro-status").value;
            carregarEquipamentos(setor, status);
        });
    }
});

// ===============================
// FUNÇÃO PRINCIPAL (GET)
// ===============================
async function carregarEquipamentos(setor = "", status = "") {
    try {
        mostrarLoading();

        // Exemplo de como passar filtros para a sua API (se ela suportar)
        // const url = `${API_URL}?setor=${setor}&status=${status}`;
        const response = await fetch(API_URL);
        const dados = await response.json();

        // Se a API não filtrar, você pode filtrar no JS:
        let dadosFiltrados = dados;
        if(setor) dadosFiltrados = dadosFiltrados.filter(d => d.setor === setor);
        
        renderizarTabela(dadosFiltrados);

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

    // MELHORIA DE PERFORMANCE: Criamos a lista completa primeiro
    const htmlCompleto = lista.map(eq => `
        <tr data-id="${eq.id}" style="border-bottom: 1px solid #f1f1f1;">
            <td style="color: #1D4587; padding: 15px 0;">
                <a href="#" onclick="abrirHistorico(${eq.id})" style="text-decoration: none; color: #1D4587; font-weight: 500;">
                    ${eq.nome}
                </a>
            </td>
            <td class="text-end">
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="editarEquipamento(${eq.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="verDetalhes(${eq.id})">
                        <i class="bi bi-info"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join(''); // Transforma o array em uma única string

    // Injeta tudo de uma vez (Apenas 1 re-render do navegador)
    tbody.innerHTML = htmlCompleto;
}

// As outras funções (Loading, Erro, Ações) permanecem iguais...