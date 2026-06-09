const API_BASE_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-recuperar-senha");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    if (!isEmailValido(email)) {
      mostrarFeedback("Por favor, informe um e-mail válido.", "danger");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao enviar token");
      }

      mostrarFeedback("Token enviado para o e-mail cadastrado.", "success");

      setTimeout(() => {
        window.location.href = "../../assets/pages/redefinir-senha.html";
      }, 2000);
    } catch (error) {
      mostrarFeedback(error.message, "danger");
    }
  });

  function isEmailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function mostrarFeedback(mensagem, tipo) {
    const anterior = document.getElementById("alerta-feedback");
    if (anterior) anterior.remove();

    const alerta = document.createElement("div");
    alerta.id = "alerta-feedback";
    alerta.className = `alert alert-${tipo} mt-3`;
    alerta.setAttribute("role", "alert");
    alerta.textContent = mensagem;

    form.insertAdjacentElement("afterend", alerta);
    setTimeout(() => alerta.remove(), 5000);
  }
});