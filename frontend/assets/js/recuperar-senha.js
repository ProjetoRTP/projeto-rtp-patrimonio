
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-recuperar-senha");

  form.addEventListener("submit", (e) => {
    const email = document.getElementById("email").value.trim();

    if (!isEmailValido(email)) {
      e.preventDefault(); // só bloqueia se inválido
      mostrarFeedback("Por favor, informe um e-mail válido.", "danger");
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