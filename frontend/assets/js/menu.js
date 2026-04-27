// ==========================================
// LÓGICA DO MENU PRINCIPAL (DASHBOARD)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. VERIFICAÇÃO DE SEGURANÇA (Proteção de Rota)
  // Busca o token que o login.js salvou no sessionStorage
  const token = sessionStorage.getItem("token_procape");

  // Se não tiver token, significa que não passou pelo login. Expulsa para o index.
  if (!token) {
    alert("Acesso negado. Por favor, faça o login.");
    window.location.href = "index.html";
    return; // Para a execução do script aqui
  }

  // 2. PREENCHIMENTO DINÂMICO DOS DADOS DO USUÁRIO
  // Puxa os dados que vieram do back-end durante o login
  const nomeUsuario = sessionStorage.getItem("usuario_nome") || "Usuário";
  const perfilUsuario = sessionStorage.getItem("usuario_perfil") || "comum";

  // Captura os elementos na tela
  const textoSaudacao = document.getElementById("texto-saudacao");
  const textoPerfil = document.getElementById("texto-perfil");

  // Atualiza o HTML com o nome real
  if (textoSaudacao) {
    // Pega apenas o primeiro nome para ficar amigável (ex: "Leandro Silva" vira "Leandro")
    const primeiroNome = nomeUsuario.split(" ")[0];
    textoSaudacao.innerText = `Olá, ${primeiroNome}.`;
  }

  // Atualiza o subtítulo e aplica regras de negócio baseadas no perfil
  if (textoPerfil) {
    if (perfilUsuario.toLowerCase() === "admin") {
      textoPerfil.innerText = "Painel Administrador";
    } else if (perfilUsuario.toLowerCase() === "gerente") {
      textoPerfil.innerText = "Painel Gerência";
    } else {
      textoPerfil.innerText = "Painel do Usuário";

      // Exemplo de Controle de Acesso:
      // Se for usuário comum, podemos esconder o card de "Usuários" e "Setores"
      // document.getElementById('card-usuarios').style.display = 'none';
    }
  }

  // 3. LÓGICA DE LOGOUT (Sair do Sistema)
  const btnSair = document.getElementById("btn-sair");

  if (btnSair) {
    btnSair.addEventListener("click", (event) => {
      event.preventDefault(); // Evita que o link apenas pisque a tela

      // Pede confirmação (opcional, mas recomendado)
      const confirmar = confirm("Tem certeza que deseja sair do sistema?");

      if (confirmar) {
        // Limpa todos os dados salvos na sessão (Token, Nome, Perfil)
        sessionStorage.clear();

        // Redireciona de volta para a tela de login
        window.location.href = "index.html";
      }
    });
  }
});


// ==========================================
// ACESSO DO ADMIN E GERENTE
// ==========================================
// Backend deve blokear o acesso da página 'Usuários' e todas as relaciondas a essa página

document.addEventListener("DOMContentLoaded", () => {

    const tipoUsuario = "gerente";

    if (tipoUsuario !== "admin") {
        document.querySelectorAll('[data-role="admin-only"]').forEach(el => {
            el.style.display = "none";
        });
    }

});
