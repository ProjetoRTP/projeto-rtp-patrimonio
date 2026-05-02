// ===============================
// CONFIG
// ===============================
const API_URL = "http://localhost:5000/printer";
const token = sessionStorage.getItem("token_procape");

if (!token) {
  alert("Acesso negado. Por favor, faça o login.");
  window.location.href = "../index.html";
}

// ===============================
// ELEMENTOS DO DOM
// ===============================
const tbody = document.getElementById("tbody-equipamentos");
const btnAplicar = document.getElementById("btn-aplicar");
const btnLimpar = document.getElementById("btn-limpar");

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  carregarEquipamentos();

  if (btnAplicar) {
    btnAplicar.addEventListener("click", () => {
      const setor = document.getElementById("filtro-setor").value;
      const status = document.getElementById("filtro-status").value;
      carregarEquipamentos(setor, status);
    });
  }

  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      document.getElementById("filtro-setor").value = "";
      document.getElementById("filtro-status").value = "";
      carregarEquipamentos();
    });
  }
});

// ===============================
// FUNÇÃO PRINCIPAL (GET)
// ===============================
async function carregarEquipamentos(setor = "", status = "") {
  try {
    mostrarLoading();

    const response = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      mostrarErro();
      return;
    }

    const dados = await response.json();

    // Filtragem no frontend
    let dadosFiltrados = dados;
    if (setor)
      dadosFiltrados = dadosFiltrados.filter(
        (d) => String(d.setor_id) === setor,
      );
    if (status)
      dadosFiltrados = dadosFiltrados.filter((d) => d.status === status);

    renderizarTabela(dadosFiltrados);
  } catch (erro) {
    console.error("Erro ao carregar impressoras:", erro);
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
                    Nenhuma impressora encontrada
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = lista
    .map(
      (eq) => `
        <tr data-id="${eq.id}" style="border-bottom: 1px solid #f1f1f1;">
            <td style="color: #1D4587; padding: 15px 0;">
                <a href="#" onclick="abrirHistorico(${eq.id})" style="text-decoration: none; color: #1D4587; font-weight: 500;">
                    ${eq.num_patrimonio || "Sem número"}
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
    `,
    )
    .join("");
}

// ===============================
// ESTADOS DA TABELA
// ===============================
function mostrarLoading() {
  tbody.innerHTML = `
        <tr>
            <td colspan="2" class="text-center text-muted py-4">
                Carregando impressoras...
            </td>
        </tr>
    `;
}

function mostrarErro() {
  tbody.innerHTML = `
        <tr>
            <td colspan="2" class="text-center text-danger py-4">
                Erro ao carregar impressoras. Verifique se o servidor está rodando.
            </td>
        </tr>
    `;
}

// ===============================
// AÇÕES
// ===============================
function abrirHistorico(id) {
  window.location.href = `historico-equipamento.html?id=${id}`;
}

function editarEquipamento(id) {
  window.location.href = `cadastro-equipamentos.html?id=${id}`;
}

function verDetalhes(id) {
  window.location.href = `impressora-info.html?id=${id}`;
}
