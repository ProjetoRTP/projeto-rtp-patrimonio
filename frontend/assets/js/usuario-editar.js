const API_URL = "http://localhost:5000/users";

document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token_procape");

  if (!token) {
    alert("Acesso negado. Por favor, inicie sessão.");
    window.location.href = "../index.html";
    return;
  }

  //  Pega o ID da URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("Usuário não identificado.");
    window.location.href = "usuario.html";
    return;
  }

  await carregarUsuario(id, token);

  document
    .getElementById("btSalvar")
    .addEventListener("click", async function (e) {
      e.preventDefault();

      const usuarioAtualizado = {
        nome: document.getElementById("nome").value,
        cpf: document.getElementById("cpf").value,
        email: document.getElementById("email").value,
        data_nascimento: document.getElementById("dataNascimento").value,
        perfil: document.getElementById("permissao").value,
      };

      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(usuarioAtualizado),
        });

        if (!response.ok) {
          const erro = await response.json();
          alert("Erro ao atualizar: " + (erro.erro || "Falha desconhecida"));
          return;
        }

        alert("Usuário atualizado com sucesso!");
        window.location.href = "usuario.html";
      } catch (erro) {
        console.error("Erro na requisição:", erro);
        alert("Não foi possível conectar ao servidor.");
      }
    });
});

async function carregarUsuario(id, token) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "Não foi possível carregar o usuário:",
        response.status,
        response.statusText,
      );
      return;
    }

    const user = await response.json();
    document.getElementById("nome").value = user.nome || "";
    document.getElementById("cpf").value = user.cpf || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("permissao").value = user.perfil || "";

    const campoData = user.data_nascimento || user.dataNascimento || "";
    if (campoData) {
      document.getElementById("dataNascimento").value = campoData
        .substring(0, 10)
        .trim();
    }
  } catch (erro) {
    console.error("Erro ao buscar usuário:", erro);
  }
}
