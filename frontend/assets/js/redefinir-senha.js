const API_BASE_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // VALIDAÇÃO DE SESSÃO (TRAVA DE LOGIN)
  // ==========================================
  const tokenSessao = sessionStorage.getItem("token_procape");
  
  if (!tokenSessao) {
    alert("Acesso negado. Por favor, inicie sessão para redefinir a senha.");
    window.location.href = "../index.html";
    return;
  }

  // ==========================================
  // ELEMENTOS DO DOM
  // ==========================================
  const form = document.getElementById("form-redefinir-senha");
  const emailField = document.getElementById("email");
  const tokenField = document.getElementById("token");
  const novaSenha = document.getElementById("nova-senha");
  const confirmarSenha = document.getElementById("confirmar-senha");
  
  // Elementos de Feedback Visual
  const barraForca = document.getElementById("barra-forca-senha");
  const textoForca = document.getElementById("texto-forca-senha");
  const textoMatch = document.getElementById("texto-match-senha");

  // ==========================================
  // 1. MOSTRAR / OCULTAR SENHA (ÍCONE DO OLHO)
  // ==========================================
  document.querySelectorAll(".toggle-password").forEach(span => {
    span.addEventListener("click", () => {
      // Descobre qual o input que este botão controla
      const inputId = span.getAttribute("data-target");
      const input = document.getElementById(inputId);
      const icon = span.querySelector("i");

      // Alterna entre texto e password
      if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("bi-eye", "bi-eye-slash");
      } else {
        input.type = "password";
        icon.classList.replace("bi-eye-slash", "bi-eye");
      }
    });
  });

  // ==========================================
  // 2. INDICADOR DE FORÇA E COMPARAÇÃO
  // ==========================================
  const validarSenhas = () => {
    const s1 = novaSenha.value;
    const s2 = confirmarSenha.value;

    // Lógica de Força (Barra Colorida)
    let forca = 0;
    const tamanhoOk = s1.length >= 8;
    const temLetras = /[a-zA-Z]/.test(s1);
    const temNumeros = /\d/.test(s1);
    const temExtras = /[A-Z]/.test(s1) || /[^a-zA-Z0-9]/.test(s1);

    if (s1.length > 0) {
      if (!tamanhoOk || !temLetras || !temNumeros) {
        forca = 1; // Fraca (não cumpre os mínimos)
      } else if (tamanhoOk && temLetras && temNumeros && !temExtras) {
        forca = 2; // Média (cumpre mínimos, mas sem extras)
      } else {
        forca = 3; // Forte (mínimos + maiúsculas ou símbolos)
      }
    }

    // Reset da barra de progresso
    barraForca.className = "progress-bar";
    
    // Aplica a cor e o tamanho baseados na força
    if (forca === 1) { 
        barraForca.style.width = "33%"; 
        barraForca.classList.add("bg-danger"); 
        textoForca.innerText = "Fraca (Faltam caracteres ou números)"; 
        textoForca.style.color = "#dc3545";
    } else if (forca === 2) { 
        barraForca.style.width = "66%"; 
        barraForca.classList.add("bg-warning"); 
        textoForca.innerText = "Média (Adicione símbolos ou maiúsculas para ficar mais forte)"; 
        textoForca.style.color = "#d39e00";
    } else if (forca === 3) { 
        barraForca.style.width = "100%"; 
        barraForca.classList.add("bg-success"); 
        textoForca.innerText = "Forte"; 
        textoForca.style.color = "#198754";
    } else {
        barraForca.style.width = "0%"; 
        textoForca.innerText = "";
    }

    // Lógica de Comparação (Texto de Coincidência)
    if (s2.length > 0) {
      if (s1 === s2) {
        textoMatch.innerText = "✓ As senhas coincidem";
        textoMatch.style.color = "#198754"; // Verde
        confirmarSenha.style.borderColor = "#198754";
      } else {
        textoMatch.innerText = "✗ As senhas não coincidem";
        textoMatch.style.color = "#dc3545"; // Vermelho
        confirmarSenha.style.borderColor = "#dc3545";
      }
    } else {
      textoMatch.innerText = "";
      confirmarSenha.style.borderColor = "#1D4587"; // Volta ao azul padrão se apagar
    }
    
    // Limpa a formatação de erro padrão do formulário
    novaSenha.classList.remove("is-invalid");
    confirmarSenha.classList.remove("is-invalid");
  };

  // Associa a função acima ao evento de digitar nos dois campos
  novaSenha.addEventListener("input", validarSenhas);
  confirmarSenha.addEventListener("input", validarSenhas);

  // ==========================================
  // 3. SUBMETER E GUARDAR A NOVA SENHA
  // ==========================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    limparErros();

    // Verificação de Segurança (Regex) antes de enviar
    if (!isSenhaValida(novaSenha.value)) {
      mostrarFeedback("A senha deve ter no mínimo 8 caracteres, com letras e números.", "danger");
      novaSenha.classList.add("is-invalid");
      return;
    }

    // Verificação se as duas senhas são idênticas
    if (novaSenha.value !== confirmarSenha.value) {
      mostrarFeedback("As senhas digitadas não coincidem.", "danger");
      confirmarSenha.classList.add("is-invalid");
      return;
    }

    try {
      // Faz o pedido PUT ao backend
      const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenSessao}` // Token de segurança da sessão
        },
        body: JSON.stringify({
          email: emailField.value.trim(),
          token: tokenField.value.trim(),
          senha: novaSenha.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao redefinir a senha.");
      }

      mostrarFeedback("Senha redefinida com sucesso!", "success");

      // Aguarda 2 segundos e redireciona
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 2000);

    } catch (error) {
      mostrarFeedback(error.message, "danger");
    }
  });

  // ==========================================
  // FUNÇÕES AUXILIARES
  // ==========================================
  function isSenhaValida(senha) {
    // Regex: Exige pelo menos uma letra, um número e 8 caracteres no total
    return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(senha);
  }

  function limparErros() {
    const anterior = document.getElementById("alerta-feedback");
    if (anterior) anterior.remove();
  }

  function mostrarFeedback(mensagem, tipo) {
    const alerta = document.createElement("div");
    alerta.id = "alerta-feedback";
    alerta.className = `alert alert-${tipo} mt-3 fw-bold`;
    alerta.setAttribute("role", "alert");
    alerta.textContent = mensagem;

    form.insertAdjacentElement("afterend", alerta);
    
    // Opcional: remove o alerta passados 5 segundos
    setTimeout(() => {
        if(alerta) alerta.remove();
    }, 5000);
  }
});