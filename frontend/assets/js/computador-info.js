const API_BASE = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token_procape");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!token || !id) {
    window.location.href = "computadores.html";
    return;
  }

  try {
    console.log("Buscando equipamento:", id);
    const res = await fetch(`${API_BASE}/computers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const comp = await res.json();
      console.log("Dados recebidos:", comp);

      // Preencher campos com os dados do banco
      document.getElementById("info-tombamento").value =
        comp.num_patrimonio || comp.tombamento || "N/A";
      document.getElementById("info-serie").value =
        comp.serie || "Não informado";
      document.getElementById("info-modelo").value =
        comp.modelo || "Não informado";
      document.getElementById("info-subsetor").value =
        comp.subsetor_nome || comp.setor_nome || "Não alocado";

      // Configura o link do botão editar
      const btnEditar = document.getElementById("btn-editar-comp");
      if (btnEditar) {
        btnEditar.href = `cadastro-equipamentos.html?id=${id}`;
      }
    } else {
      console.error("Erro na resposta:", res.status, res.statusText);
      const erro = await res.json().catch(() => ({}));
      alert(
        "Não foi possível encontrar este equipamento: " +
          (erro.erro || "Erro desconhecido"),
      );
      window.location.href = "computadores.html";
    }
  } catch (err) {
    console.error("Erro de conexão:", err);
    alert("Erro de conexão: Verifique se o servidor Python está ligado!");
    window.location.href = "computadores.html";
  }
});
