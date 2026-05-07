const API_URL = "http://localhost:5000/users";

document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token_procape");

  if (!token) {
    alert("Acesso negado. Por favor, inicie sessão.");
    window.location.href = "../index.html";
    return;
  }

  // Pega o ID da URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("Usuário não identificado.");
    window.location.href = "usuario.html";
    return;
  }

  // ==========================================
  // OCULTAR CAMPO DE SENHA NA EDIÇÃO (Pedido do Backend)
  // ==========================================
  const inputSenha = document.getElementById("senha");
  if (inputSenha) {
      // Oculta a "div" inteira que envolve o input de senha para não deixar um buraco no layout
      const divPai = inputSenha.closest('div'); 
      if (divPai) {
          divPai.style.display = 'none'; 
      } else {
          inputSenha.style.display = 'none';
      }
  }
  // ==========================================

  await carregarUsuario(id, token);

  document
    .getElementById("btSalvar")
    .addEventListener("click", async function (e) {
      e.preventDefault();

      // Pega os valores dos inputs
      const nome = document.getElementById("nome").value.trim();
      const cpf = document.getElementById("cpf").value.replace(/\D/g, ""); 
      const email = document.getElementById("email").value.trim();
      const data_nascimento = document.getElementById("dataNascimento").value;
      const perfil = document.getElementById("permissao").value;

      // Monta o pacote APENAS com os dados do perfil (Sem a senha!)
      const usuarioAtualizado = {
        nome,
        cpf,
        email,
        data_nascimento,
        perfil,
      };

      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "PUT", // Atualização
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
    
    // Formata o CPF ao carregar
    let cpfValor = user.cpf || "";
    if (cpfValor.length === 11) {
        cpfValor = cpfValor.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    }
    document.getElementById("cpf").value = cpfValor;
    
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