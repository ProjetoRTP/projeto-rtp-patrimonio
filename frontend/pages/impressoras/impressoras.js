// ===============================
// CONFIG
// ===============================
const API_URL = "http://localhost:5000/printer";
const API_BASE = "http://localhost:5000"
const token = sessionStorage.getItem("token_procape");

if (!token) {
  alert("Acesso negado. Por favor, faça o login.");
  window.location.href = "../../index.html";
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
  carregarSetores();

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
async function carregarEquipamentos(
  setorFiltro = "",
  statusFiltro = "",
) {
  mostrarLoading();
  const status = document.getElementById("filtro-status")?.value || "";
  const setor = document.getElementById("filtro-setor")?.value || "";

  const query = new URLSearchParams();

  if (status) query.append("status", status);
  if (setor) query.append("setor", setor);

  const qs = query.toString();
  try {
    const res = await fetch(`${API_URL}/lista?${qs}`, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ token adicionado
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error(`Erro ${res.status}`);

    let dados = await res.json();

    renderizarTabela(dados, token);
  } catch (erro) {
    console.error("Erro ao carregar as impressoras:", erro);
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
                <a href="#" onclick="verDetalhes(${eq.id})" style="text-decoration: none; color: #1D4587; font-weight: 500;">
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
function editarEquipamento(id) {
  window.location.href = `../equipamentos/cadastro-equipamentos.html?id=${id}`;
}

function verDetalhes(id) {
  window.location.href = `impressora-info.html?id=${id}`;
}

async function carregarSetores() {
  const setorSelect = document.getElementById("filtro-setor")
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
      }

      catch (err) {
        console.error("Erro setores:", err);
    }
    }