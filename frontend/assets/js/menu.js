document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // PROTEÇÃO DE ROTA
  // ==========================================
  const token = sessionStorage.getItem("token_procape");

  if (!token) {
    alert("Acesso negado. Por favor, faça o login.");
    window.location.href = "../index.html"; 
    return;
  }

  // ==========================================
  // PREENCHIMENTO DINÂMICO
  // ==========================================
  const nomeUsuario = sessionStorage.getItem("usuario_nome") || "Usuário";
  const perfilUsuario = sessionStorage.getItem("usuario_perfil") || "usuario";

  const textoSaudacao = document.getElementById("texto-saudacao");
  const textoPerfil = document.getElementById("texto-perfil");

  if (textoSaudacao) {
    const primeiroNome = nomeUsuario.split(" ")[0];
    textoSaudacao.innerText = `Olá, ${primeiroNome}.`;
  }

  if (textoPerfil) {
    if (perfilUsuario.toLowerCase() === "admin") {
      textoPerfil.innerText = "Painel Administrador";
    } else if (perfilUsuario.toLowerCase() === "gerente") {
      textoPerfil.innerText = "Painel Gerência";
    } else {
      textoPerfil.innerText = "Painel do Usuário";
    }
  }

  // ==========================================
  // CONTROLE DE ACESSO POR PERFIL
  // ==========================================
  if (perfilUsuario.toLowerCase() !== "admin") { 
    document.querySelectorAll('[data-role="admin-only"]').forEach(el => {
      el.style.display = "none";
    });
  }

  // ==========================================
  // LOGOUT
  // ==========================================
  const btnSair = document.getElementById("btn-sair");

  if (btnSair) {
    btnSair.addEventListener("click", (event) => {
      event.preventDefault();

      if (confirm("Tem certeza que deseja sair do sistema?")) {
        sessionStorage.clear();
        window.location.href = "../index.html"; 
      }
    });
  }

});
