// ===============================
// CONFIGURAÇÕES
// ===============================
const API_URL = "http://localhost:3000/equipamentos-computadores";

// ===============================
// ELEMENTOS DO DOM
// ===============================
const tbody = document.getElementById("tbody-equipamentos");
const filtroSetor = document.getElementById('filtro-setor');
const filtroStatus = document.getElementById('filtro-status');
const botaoLimpar = document.getElementById('btn-limpar');
const botaoAplicar = document.getElementById('btn-aplicar');

// ===============================
// INICIALIZAÇÃO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    carregarComputadores();
    configurarEventos();
});

function configurarEventos() {
    // Ação de Limpar
    botaoLimpar.addEventListener('click', () => {
        filtroSetor.selectedIndex = 0;
        filtroStatus.selectedIndex = 0;
        carregarComputadores(); // Recarrega tudo sem filtros
    });

    // Ação de Aplicar
    botaoAplicar.addEventListener('click', () => {
        const setor = filtroSetor.value;
        const status = filtroStatus.value;
        
        // Chamamos a função passando os filtros escolhidos
        carregarComputadores(setor, status);
    });
}

// ===============================
// LÓGICA DE DADOS (GET / FETCH)
// ===============================
async function carregarComputadores(setorFiltro = "", statusFiltro = "") {
    try {
        mostrarLoading();

        const response = await fetch(API_URL);
        const dados = await response.json();

        // Aplicando a lógica de filtro nos dados recebidos
        let dadosFiltrados = dados;

        if (setorFiltro) {
            dadosFiltrados = dadosFiltrados.filter(item => item.setor === setorFiltro);
        }

        if (statusFiltro) {
            dadosFiltrados = dadosFiltrados.filter(item => item.status === statusFiltro);
        }

        renderizarTabela(dadosFiltrados);

    } catch (erro) {
        console.error("Erro ao carregar computadores:", erro);
        mostrarErro();
    }
}

// ===============================
// RENDERIZAÇÃO (PERFORMANCE)
// ===============================
function renderizarTabela(lista) {
    if (!lista || lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-4 text-muted">
                    Nenhum computador encontrado com esses filtros.
                </td>
            </tr>
        `;
        return;
    }

    // Gerando o HTML de uma vez só (Performance Boost)
    const htmlCompleto = lista.map(item => `
        <tr data-id="${item.id}" style="border-bottom: 1px solid #f1f1f1;">
            <td style="color: #1D4587; padding: 15px 0;">
                <a href="#" onclick="abrirHistorico(${item.id})" style="text-decoration: none; color: #1D4587; font-weight: 500;">
                    ${item.nome}
                </a>
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
    `).join('');

    tbody.innerHTML = htmlCompleto;
}

// ===============================
// HELPERS VISUAIS
// ===============================
function mostrarLoading() {
    tbody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-muted">Buscando computadores...</td></tr>`;
}

function mostrarErro() {
    tbody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-danger text-uppercase fw-bold">Erro de conexão com o servidor 😢</td></tr>`;
}

// ===============================
// AÇÕES DOS BOTÕES
// ===============================
function editarComputador(id) {
    window.location.href = `cadastro.html?id=${id}`;
}

function verDetalhes(id) {
    alert("Exibindo detalhes do computador ID: " + id);
}

function abrirHistorico(id) {
    // Se estiver usando Bootstrap Modal
    const modalElement = document.getElementById('modalHistorico');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}