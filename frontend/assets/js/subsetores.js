// URL base da API
// URL base da API
const API_BASE_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
  // 1. VERIFICAÇÃO DE SEGURANÇA
  const token = sessionStorage.getItem("token_procape");
  if (!token) {
    alert("Acesso negado. Por favor, faça o login.");
    window.location.href = "index.html";
    return;
  }

  // 2. FUNÇÃO PARA CARREGAR OS SUBSETORES
  async function carregarSubsetores() {
    const tbody = document.getElementById("tbody-subsetores");

    try {
      const resposta = await fetch(`${API_BASE_URL}/subsectors`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (resposta.ok) {
        const subsetores = await resposta.json();
        tbody.innerHTML = "";

        if (subsetores.length === 0) {
          tbody.innerHTML =
            '<tr><td colspan="3" class="text-center py-4">Nenhum subsetor registado.</td></tr>';
          return;
        }

        subsetores.forEach((subsetor) => {
          const tr = document.createElement("tr");

          tr.innerHTML = `
                        <td>
                            <a href="subsetor-info.html?id=${subsetor.id}" style="color: #1D4587; text-decoration: none; font-weight: 500;">
                                ${subsetor.nome}
                            </a>
                        </td>
                        <td>${subsetor.setor_nome || "Não definido"}</td>
                        <td class="text-end">
                            <button class="btn-acao btn-editar me-2" onclick="editarSubsetor(${subsetor.id})" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn-acao btn-info-red" onclick="verInfoSubsetor(${subsetor.id})" title="Informações">
                                <i class="bi bi-info-circle"></i>
                            </button>
                        </td>
                    `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML =
          '<tr><td colspan="3" class="text-center text-danger py-4">Erro ao buscar subsetores.</td></tr>';
      }
    } catch (erro) {
      console.error("Erro de ligação:", erro);
      tbody.innerHTML =
        '<tr><td colspan="3" class="text-center text-danger py-4">Não foi possível ligar ao servidor.</td></tr>';
    }
  }

  carregarSubsetores();
});

// ==========================================
// FUNÇÕES DE AÇÃO (AJUSTADAS)
// ==========================================

// Usamos window. para garantir que o HTML encontre a função
window.editarSubsetor = function (id) {
  window.location.href = `cadastro-subsetor.html?id=${id}`;
};

window.verInfoSubsetor = function (id) {
  // Agora redireciona corretamente para a página de informações
  window.location.href = `subsetor-info.html?id=${id}`;
};
