const API_BASE_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {

  // ============================================================
  // TRANSIÇÃO: LOADING → LOGIN
  // ============================================================
  setTimeout(() => {
    const loadingScreen = document.getElementById("loading-screen");
    const loginScreen = document.getElementById("login-screen");

    loadingScreen.style.opacity = "0";

    setTimeout(() => {
      loadingScreen.style.display = "none";
      loginScreen.style.display = "block";
      document.body.style.overflow = "auto";
    }, 500);
  }, 2500);

  // ============================================================
  // APENAS NÚMEROS
  // ============================================================
  const camposNumeros = document.querySelectorAll(".apenas-numeros");
  camposNumeros.forEach(function (campo) {
    campo.addEventListener("input", function (event) {
      event.target.value = event.target.value.replace(/\D/g, "");
    });
  });

  // ============================================================
  // LOGIN
  // ============================================================
  const formAcesso = document.getElementById("form-acesso");

  if (formAcesso) {
    formAcesso.addEventListener("submit", async (event) => {
      event.preventDefault();

      // ✅ IDs corrigidos para bater com o HTML
      const cpf = document.getElementById("inputCpf").value;
      const senha = document.getElementById("inputSenha").value;

      const btnLogin = event.target.querySelector('button[type="submit"]');
      const textoOriginal = btnLogin.innerText;
      btnLogin.innerText = "Carregando...";
      btnLogin.disabled = true;

      try {
        // ✅ URL corrigida — não duplica "/login"
        const resposta = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cpf, senha }),
        });

        const dados = await resposta.json();

        if (resposta.ok) {
          sessionStorage.setItem("token_procape", dados.access_token); // ← era dados.token
          sessionStorage.setItem("usuario_nome", dados.nome);
          sessionStorage.setItem("usuario_perfil", dados.perfil);
          window.location.href = "pages/menu_principal.html";
        } else {
          alert(`Erro ao acessar: ${dados.mensagem}`);
        }
      } catch (erro) {
        console.error("Erro na requisição de login:", erro);
        alert("Não foi possível conectar ao servidor. Verifique se o back-end está rodando.");
      } finally {
        btnLogin.innerText = textoOriginal;
        btnLogin.disabled = false;
      }
    });
  }

});
