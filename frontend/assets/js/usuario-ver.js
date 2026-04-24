document.addEventListener("DOMContentLoaded", () => {

  const btnEditar = document.querySelector(".btn-editar");
  const inputs = document.querySelectorAll("input");

  let editando = false;

  // 🔒 Começa bloqueado
  inputs.forEach(input => {
    input.setAttribute("disabled", true);
  });

  btnEditar.addEventListener("click", (e) => {
    e.preventDefault();

    editando = !editando;

    if (editando) {
      // 🔓 liberar edição
      inputs.forEach(input => {
        input.removeAttribute("disabled");
      });

      btnEditar.textContent = "Salvar";
      btnEditar.classList.add("btn-success");
      btnEditar.classList.remove("btn-editar");

    } else {
      // 💾 salvar (simulado)
      inputs.forEach(input => {
        input.setAttribute("disabled", true);
      });

      btnEditar.textContent = "Editar";
      btnEditar.classList.remove("btn-success");
      btnEditar.classList.add("btn-editar");

      mostrarToast("Dados salvos com sucesso!");
    }
  });

});


// 🔔 Feedback bonito (toast simples)
function mostrarToast(msg) {
  const toast = document.createElement("div");

  toast.textContent = msg;
  toast.className = "toast-custom";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}