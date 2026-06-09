const API_BASE = "http://localhost:5000";
const tbody = document.getElementById("tbody-equipamentos");
const filtroSetor = document.getElementById("filtro-setor");
const filtroStatus = document.getElementById("filtro-status");

document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("token_procape");

  if (!token) {
    alert("Acesso negado. Por favor, inicie sessão.");
    window.location.href = "../../index.html";
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

// ===============================
// CARREGAR COMPUTADORES
// ===============================
async function carregarComputadores(
  token,
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
    const res = await fetch(`${API_BASE}/computers?${qs}`, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ token adicionado
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error(`Erro ${res.status}`);

    let dados = await res.json();

    // ✅ Filtro por setor_id (número)
    if (setorFiltro) {
      dados = dados.filter(
        (item) => String(item.setor_id) === String(setorFiltro),
      );
    }

    // ✅ Filtro por status (ENUM do banco)
    if (statusFiltro) {
      dados = dados.filter((item) => item.status === statusFiltro);
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

  tbody.innerHTML = lista
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid #f1f1f1;">
            <td style="color: #1D4587; padding: 15px 0;">
                <a href="#" onclick="verDetalhes(${item.id}, 'computador')" style="color: #1D4587; text-decoration: none; font-weight: 500;">
                    ${item.num_patrimonio ?? "—"}
                </a>
            </td>
            <td class="text-end">
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="editarEquipamento(${item.id}, 'computador')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="verDetalhes(${item.id}, 'computador')">
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
function verDetalhes(id, tipo) {
    window.location.href = `equipamento-info.html?id=${id}&tipo=${tipo}`;
}

function editarEquipamento(id, tipo) {
    window.location.href = `../equipamentos/cadastro-equipamentos.html?id=${id}&tipo=${tipo}`;
}