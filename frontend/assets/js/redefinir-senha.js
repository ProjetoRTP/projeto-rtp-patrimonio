// Página 2 - redefinir-senha.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-redefinir-senha");
  const novaSenha = document.getElementById("nova-senha");
  const confirmarSenha = document.getElementById("confirmar-senha");

  form.addEventListener("submit", (e) => {
    limparErros();

    if (!isSenhaValida(novaSenha.value)) {
      e.preventDefault();
      mostrarFeedback("A senha deve ter no mínimo 8 caracteres, com letras e números.", "danger");
      novaSenha.classList.add("is-invalid");
      return;
    }

    if (novaSenha.value !== confirmarSenha.value) {
      e.preventDefault();
      mostrarFeedback("As senhas não coincidem.", "danger");
      confirmarSenha.classList.add("is-invalid");
      return;
    }

    // Se tudo ok, o form envia normalmente para o backend
  });

  [novaSenha, confirmarSenha].forEach((campo) => {
    campo.addEventListener("input", () => campo.classList.remove("is-invalid"));
  });

  function isSenhaValida(senha) {
    return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(senha);
  }

  function limparErros() {
    const anterior = document.getElementById("alerta-feedback");
    if (anterior) anterior.remove();
  }

  function mostrarFeedback(mensagem, tipo) {
    const alerta = document.createElement("div");
    alerta.id = "alerta-feedback";
    alerta.className = `alert alert-${tipo} mt-3`;
    alerta.setAttribute("role", "alert");
    alerta.textContent = mensagem;

    form.insertAdjacentElement("afterend", alerta);
    setTimeout(() => alerta.remove(), 5000);
  }
});