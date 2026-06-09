const API_BASE = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token_procape");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const btnEditar = document.getElementById("btnEditar");
  if (btnEditar && id) {
    btnEditar.href = `../equipamentos/cadastro-equipamentos.html?id=${id}`;
  }

  if (!token || !id) {
    window.location.href = "../impressoras/impressoras.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/printer/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error(
        "Resposta não OK ao buscar impressora:",
        res.status,
        res.statusText,
      );
      alert("Não foi possível buscar a impressora. Retornando para a lista.");
      window.location.href = "../impressoras/impressoras.html";
      return;
    }

    const data = await res.json();
    console.log("Dados da impressora:", data);

    const formatCurrency = (value) => {
        if (value === null || value === undefined || value === "") return "";
        const floatValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
        if (isNaN(floatValue)) return value;
        return floatValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const setValue = (id, value) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value ?? "";
      }
    };

    setValue("modelo", data.modelo || "Não informado");
    setValue("tipo", data.tipo_imp || "Não informado");
    setValue("coloracao", data.coloracao || "Não informado");
    setValue("conectividade", data.conectividade || "Não informado");
    setValue("ip", data.endereco_ip || "Não informado");
    setValue("insumo", data.insumo || "Não informado");
    setValue("info-valor", formatCurrency(data.valor) || "Não informado");
  } catch (err) {
    console.error("Erro ao carregar impressora:", err);
    alert("Erro de conexão com o servidor.");
    window.location.href = "../impressoras/impressoras.html";
  }
});
