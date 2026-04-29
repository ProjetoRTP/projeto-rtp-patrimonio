// URL base do back-end
const API_BASE_URL = "http://localhost:5000/auth";

document.addEventListener("DOMContentLoaded", () => {
  // Define o tempo do loading em milissegundos (2500ms = 2.5 segundos)
  setTimeout(() => {
    const loadingScreen = document.getElementById("loading-screen");
    const loginScreen = document.getElementById("login-screen");

    // Inicia o fade out (suaviza a saída do loading)
    loadingScreen.style.opacity = "0";

    // Após a transição do CSS terminar (500ms), remove a tela e mostra o login
    setTimeout(() => {
      loadingScreen.style.display = "none";
      loginScreen.style.display = "block";

      // Libera a rolagem da página que estava travada
      document.body.style.overflow = "auto";
    }, 500);
  }, 2500);
});
  // Bloqueia letras (apenas números)
  const camposNumeros = document.querySelectorAll(".apenas-numeros");
  camposNumeros.forEach(function (campo) {
    campo.addEventListener("input", function (event) {
      event.target.value = event.target.value.replace(/\D/g, "");
    });
  });

// ==========================================
// INTEGRAÇÃO: TELA DE LOGIN
// ==========================================
const formAcesso = document.getElementById("form-acesso");

if (formAcesso) {
  formAcesso.addEventListener("submit", async (event) => {
    event.preventDefault(); // Impede a página de recarregar

    // 1. Captura os dados dos inputs (usando os IDs padronizados)
    const cpf = document.getElementById("inp-cpf").value;
    const senha = document.getElementById("inp-senha").value;

    // Altera o texto do botão para dar feedback ao usuário
    const btnLogin = event.target.querySelector('button[type="submit"]');
    const textoOriginal = btnLogin.innerText;
    btnLogin.innerText = "Carregando...";
    btnLogin.disabled = true;

    try {
      // 2. Faz a requisição POST para a rota de login
      const resposta = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cpf: cpf, senha: senha }),
      });

      const dados = await resposta.json();

      // 3. Valida a resposta do back-end
      if (resposta.ok) {
        // Sucesso! Salva o token de acesso (se houver) e redireciona
        sessionStorage.setItem("token_procape", dados.token);
        sessionStorage.setItem("usuario_nome", dados.nome);
        sessionStorage.setItem("usuario_perfil", dados.perfil); // Adm, Gerente, Comum

        window.location.href = "equipamentos.html"; // Redireciona para o painel
      } else {
        // Erro (ex: Senha incorreta)
        alert(`Erro ao acessar: ${dados.mensagem}`);
      }
    } catch (erro) {
      console.error("Erro na requisição de login:", erro);
      alert(
        "Não foi possível conectar ao servidor. Verifique se o back-end está rodando.",
      );
    } finally {
      // Restaura o botão
      btnLogin.innerText = textoOriginal;
      btnLogin.disabled = false;
    }
  });
}
