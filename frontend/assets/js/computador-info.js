const API_BASE = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token_procape");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const btnEditar = document.getElementById("btn-editar-comp");
  if (btnEditar && id) {
    btnEditar.href = `cadastro-equipamentos.html?id=${id}`;
    console.log("Edit link definido para:", btnEditar.href);
  }

  if (!token || !id) {
    window.location.href = "computadores.html";
    return;
  }

  try {
    console.log("Buscando equipamento:", id);
    const res = await fetch(`${API_BASE}/computers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Resposta não OK:", res.status, res.statusText);
      alert("Não foi possível buscar o equipamento. Retornando para a lista.");
      window.location.href = "computadores.html";
      return;
    }

    const data = await res.json();
    console.log("JSON recebido da API:", data);

    const setValue = (id, value) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value ?? "";
      }
    };

    setValue(
      "info-tombamento",
      data.num_patrimonio || data.tombamento || "Não informado",
    );
    setValue(
      "info-serie",
      data.serie || data.numero_serie || data.serial || "Não informado",
    );
    setValue("info-modelo", data.modelo || "Não informado");
    setValue(
      "info-subsetor",
      data.subsetor_nome || data.setor_nome || "Não alocado",
    );
  } catch (err) {
    console.error("Erro de conexão:", err);
    alert(
      "Erro de conexão com o servidor. Verifique se o backend está rodando.",
    );
    window.location.href = "computadores.html";
  }
});
