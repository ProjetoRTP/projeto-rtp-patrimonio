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

  const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
  };

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
        element.value = value ?? "N/A";
      }
    };

    // Preencher campos principais
    setValue("info-tombamento", data.num_patrimonio || "N/A");
    setValue("info-status", data.status || "N/A");
    setValue("info-os", data.os || "N/A");
    setValue("info-ram", data.mem_ram || "N/A");
    setValue("info-cpu", data.mem_cpu || "N/A");
    setValue("info-armazenamento", data.armazenamento || "N/A");
    setValue("info-ip", data.endereco_ip || "Sem IP");
    setValue("info-setor", data.setor_nome || "N/A");
    setValue("info-subsetor", data.subsetor_nome || "N/A");
    setValue("info-data-cadastro", formatDate(data.data_cadastro));

    // Preencher observação (textarea)
    const obs = document.getElementById("info-observacao");
    if (obs) {
      obs.value = data.observacao || "";
    }
  } catch (err) {
    console.error("Erro de conexão:", err);
    alert(
      "Erro de conexão com o servidor. Verifique se o backend está rodando.",
    );
    window.location.href = "computadores.html";
  }
});
