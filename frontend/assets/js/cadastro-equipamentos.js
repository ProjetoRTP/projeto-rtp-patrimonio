const API_URL = "http://localhost:5000/equipments";
const API_BASE = "http://localhost:5000";
const API_SECTORS = "http://localhost:5000/sectors";

document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token_procape");
  if (!token) {
    alert("Acesso negado. Por favor, faça o login.");
    window.location.href = "index.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const equipmentId = params.get("id");

  const titulo = document.querySelector("h2");
  const btnSalvar = document.querySelector('button[type="submit"]');
  const tipoEquipamento = document.getElementById("tipoEquipamento");
  const setorSelect = document.getElementById("setor");
  const formCadastro = document.querySelector("form");

  // 1. CARREGAR SETORES
  async function carregarSetores() {
    try {
      const res = await fetch(API_SECTORS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const setores = await res.json();
        setorSelect.innerHTML = '<option value="">Selecione um setor</option>';
        setores.forEach((setor) => {
          const option = document.createElement("option");
          option.value = setor.id;
          option.textContent = setor.nome;
          setorSelect.appendChild(option);
        });
      }
    } catch (err) {
      console.error("Erro ao carregar setores:", err);
    }
  }

  // 2. MOSTRAR/OCULTAR CAMPOS POR TIPO
  function mostrarCamposPorTipo() {
    const camposComputador = document.getElementById("campos-computador");
    const camposImpressora = document.getElementById("campos-impressora");

    if (tipoEquipamento.value === "1") {
      camposComputador.classList.remove("d-none");
      camposImpressora.classList.add("d-none");
    } else if (tipoEquipamento.value === "2") {
      camposComputador.classList.add("d-none");
      camposImpressora.classList.remove("d-none");
    } else {
      camposComputador.classList.add("d-none");
      camposImpressora.classList.add("d-none");
    }
  }

  tipoEquipamento.addEventListener("change", mostrarCamposPorTipo);

  // Carregar setores no início
  await carregarSetores();

  // 3. SE FOR EDIÇÃO, CARREGAR DADOS
  if (equipmentId) {
    if (titulo) titulo.innerText = "Editar Equipamento";
    if (btnSalvar) btnSalvar.innerText = "Atualizar";

    try {
      // Tentar buscar como computador primeiro
      let res = await fetch(`${API_BASE}/computers/${equipmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Se não encontrar, tentar impressora
      if (!res.ok) {
        res = await fetch(`${API_BASE}/printers/${equipmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Se ainda não encontrar, tentar periférico
      if (!res.ok) {
        res = await fetch(`${API_BASE}/peripherals/${equipmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (res.ok) {
        const data = await res.json();
        console.log("Dados carregados para edição:", data);

        // Detectar tipo baseado no que foi retornado
        if (res.url.includes("/computers")) {
          tipoEquipamento.value = "1";
        } else if (res.url.includes("/printers")) {
          tipoEquipamento.value = "2";
        }

        mostrarCamposPorTipo();

        // Preencher setor
        if (data.setor_id) {
          setorSelect.value = data.setor_id;
        }

        // Preencher campos do computador
        if (document.getElementById("tombamento")) {
          document.getElementById("tombamento").value =
            data.num_patrimonio || data.tombamento || "";
        }
        if (document.getElementById("sistema")) {
          document.getElementById("sistema").value =
            data.sistema_operacional || "";
        }
        if (document.getElementById("memoria-interna")) {
          document.getElementById("memoria-interna").value =
            data.memoria_interna || "";
        }
        if (document.getElementById("memoria-ram")) {
          document.getElementById("memoria-ram").value = data.memoria_ram || "";
        }
        if (document.getElementById("armazenamento")) {
          document.getElementById("armazenamento").value =
            data.armazenamento || "";
        }
        if (document.getElementById("numero-ip")) {
          document.getElementById("numero-ip").value = data.endereco_ip || "";
        }
        if (document.getElementById("observacoes")) {
          document.getElementById("observacoes").value = data.observacao || "";
        }

        // Preencher campos da impressora
        if (document.getElementById("modelo")) {
          document.getElementById("modelo").value = data.modelo || "";
        }
        if (document.getElementById("tipo")) {
          document.getElementById("tipo").value = data.tipo_impressora || "";
        }
        if (document.getElementById("coloracao")) {
          document.getElementById("coloracao").value = data.coloracao || "";
        }
        if (document.getElementById("conectividade")) {
          document.getElementById("conectividade").value =
            data.conectividade || "";
        }
        if (document.getElementById("endereco-ip")) {
          document.getElementById("endereco-ip").value = data.endereco_ip || "";
        }
        if (document.getElementById("insumo")) {
          document.getElementById("insumo").value = data.insumo || "";
        }
      }
    } catch (err) {
      console.error("Erro ao carregar equipamento para edição:", err);
    }
  }

  // 4. LÓGICA DE SALVAR
  if (formCadastro) {
    formCadastro.addEventListener("submit", async (e) => {
      e.preventDefault();

      const tipo = tipoEquipamento.value;
      const setor_id = parseInt(setorSelect.value, 10);

      if (!tipo || !setor_id) {
        alert("Selecione tipo e setor");
        return;
      }

      const metodo = equipmentId ? "PUT" : "POST";

      // Determinar a rota correta baseado no tipo
      let rotaBase = API_URL; // fallback padrão
      if (tipo === "1") {
        rotaBase = `${API_BASE}/computers`;
      } else if (tipo === "2") {
        rotaBase = `${API_BASE}/printers`;
      }

      const urlFinal = equipmentId ? `${rotaBase}/${equipmentId}` : rotaBase;

      let payload = {
        tipo: tipo === "1" ? "computador" : "impressora",
        setor_id: setor_id,
      };

      // Adicionar campos específicos
      if (tipo === "1") {
        payload = {
          ...payload,
          tombamento: document.getElementById("tombamento")?.value || "",
          sistema_operacional: document.getElementById("sistema")?.value || "",
          memoria_interna:
            document.getElementById("memoria-interna")?.value || "",
          memoria_ram: document.getElementById("memoria-ram")?.value || "",
          armazenamento: document.getElementById("armazenamento")?.value || "",
          endereco_ip: document.getElementById("numero-ip")?.value || "",
          observacao: document.getElementById("observacoes")?.value || "",
        };
      } else if (tipo === "2") {
        payload = {
          ...payload,
          modelo: document.getElementById("modelo")?.value || "",
          tipo_impressora: document.getElementById("tipo")?.value || "",
          coloracao: document.getElementById("coloracao")?.value || "",
          conectividade: document.getElementById("conectividade")?.value || "",
          endereco_ip: document.getElementById("endereco-ip")?.value || "",
          insumo: document.getElementById("insumo")?.value || "",
        };
      }

      try {
        const res = await fetch(urlFinal, {
          method: metodo,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          alert(
            equipmentId ? "Equipamento atualizado!" : "Equipamento cadastrado!",
          );
          window.location.href = "computadores.html";
        } else {
          const erro = await res.json();
          alert(`Erro: ${erro.erro || "Falha ao salvar"}`);
        }
      } catch (err) {
        console.error("Erro ao salvar:", err);
        alert("Erro de conexão ao salvar");
      }
    });
  }
});
