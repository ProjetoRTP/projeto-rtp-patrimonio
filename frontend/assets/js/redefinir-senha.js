const API_BASE_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-redefinir-senha");
  const emailField = document.getElementById("email");
  const tokenField = document.getElementById("token");
  const novaSenha = document.getElementById("nova-senha");
  const confirmarSenha = document.getElementById("confirmar-senha");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    limparErros();

    if (!isSenhaValida(novaSenha.value)) {
      mostrarFeedback("A senha deve ter no mínimo 8 caracteres, com letras e números.", "danger");
      novaSenha.classList.add("is-invalid");
      return;
    }

    if (novaSenha.value !== confirmarSenha.value) {
      mostrarFeedback("As senhas não coincidem.", "danger");
      confirmarSenha.classList.add("is-invalid");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailField.value.trim(),
          token: tokenField.value.trim(),
          senha: novaSenha.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao redefinir senha");
      }

      mostrarFeedback("Senha redefinida com sucesso!", "success");

      setTimeout(() => {
        window.location.href = "../index.html";
      }, 2000);
    } catch (error) {
      mostrarFeedback(error.message, "danger");
    }
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