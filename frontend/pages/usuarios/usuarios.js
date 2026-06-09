// ===============================
// CONFIGURAÇÃO
// ===============================
const API_URL = "http://localhost:5000/users";

// ===============================
// ELEMENTOS DO DOM
// ===============================
const tbody = document.getElementById("tbody-usuarios");

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("token_procape");

  if (!token) {
    alert("Acesso negado. Por favor, inicie sessão.");
    window.location.href = "../../index.html";
    return;
  }

  document.getElementById("inativo").addEventListener("click", () => {
    carregarUsuarios(token)
  })

  carregarUsuarios(token);
});

// ===============================
// BUSCAR USUÁRIOS (GET)
// ===============================
async function carregarUsuarios(token) {
  try {
    tbody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-muted">Buscando usuários...</td></tr>`;
    const inativo = document.getElementById("inativo");
    const query = new URLSearchParams();
    
    if (inativo.checked) {
      query.append("inativo", "True")
    }
    const qs = query.toString();
    console.log(qs)
    const response = await fetch(`${API_URL}?${qs}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok)
      throw new Error(`Erro ${response.status}: ${response.statusText}`);

    const usuarios = await response.json();
    renderizarTabela(usuarios);
  } catch (erro) {
    console.error("Erro na integração:", erro);
    tbody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-danger">Erro ao carregar usuários. Verifique se o backend está rodando!</td></tr>`;
  }
}

// ===============================
// RENDERIZAÇÃO
// ===============================
function renderizarTabela(lista) {
  if (!lista || lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-muted">Nenhum usuário encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = lista
    .map(
      (user) => `
        <tr style="border-bottom: 1px solid #f1f1f1;">
            <td style="color: #1D4587; padding-top: 15px; padding-bottom: 15px;">
                <a href="usuario-info.html?id=${user.id}"
                   style="color: #1D4587; text-decoration: none; font-weight: 500;">
                    ${user.nome}
                </a>
            </td>
            <td class="text-end">
                <div class="d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-sm btn-outline-primary px-2 py-1" onclick="editarUsuario(${user.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger px-2 py-1" onclick="verInfo(${user.id})">
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
// AÇÕES
// ===============================
function editarUsuario(id) {
  window.location.href = `usuario-editar.html?id=${id}`;
}

function verInfo(id) {
  window.location.href = `usuario-info.html?id=${id}`;
}
