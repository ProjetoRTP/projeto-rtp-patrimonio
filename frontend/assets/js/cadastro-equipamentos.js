const API_BASE = "http://localhost:5000";
const API_COMPUTERS = `${API_BASE}/computers`;
const API_PRINTERS = `${API_BASE}/printer`;
const API_PERIPHERALS = `${API_BASE}/peripherals`;
const API_SECTORS = `${API_BASE}/sectors`;
const API_SUBSECTORS = `${API_BASE}/subsectors`;

document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token_procape");
  if (!token) {
    alert("Acesso negado. Por favor, faça o login.");
    window.location.href = "index.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const equipmentId = params.get("id");
  console.log("equipmentId do query string:", equipmentId);

  const titulo = document.querySelector("h2");
  const btnSalvar = document.querySelector('button[type="submit"]');
  const btnCancelarLink = document.getElementById("btnCancelarLink");
  const tipoEquipamento = document.getElementById("tipoEquipamento");
  const setorSelect = document.getElementById("setor");
  const subsetorSelect = document.getElementById("subsetor");
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

  // 1.1 CARREGAR SUBSETORES POR SETOR
  async function carregarSubSetores(setorId) {
    if (!setorId) {
      subsetorSelect.innerHTML = '<option value="">Selecione um subsetor</option>';
      subsetorSelect.disabled = true;
      return;
    }

    try {
      const res = await fetch(`${API_SUBSECTORS}/sector/${setorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const subsetores = await res.json();
        subsetorSelect.innerHTML = '<option value="">Selecione um subsetor</option>';
        subsetores.forEach((subsetor) => {
          const option = document.createElement("option");
          option.value = subsetor.id;
          option.textContent = subsetor.nome;
          subsetorSelect.appendChild(option);
        });
        subsetorSelect.disabled = false;
      }
    } catch (err) {
      console.error("Erro ao carregar subsetores:", err);
      subsetorSelect.innerHTML = '<option value="">Erro ao carregar</option>';
      subsetorSelect.disabled = true;
    }
  }

  // 2. MOSTRAR/OCULTAR CAMPOS POR TIPO
  function mostrarCamposPorTipo() {
    const camposComputador = document.getElementById("campos-computador");
    const camposImpressora = document.getElementById("campos-impressora");

    if (tipoEquipamento.value === "1") {
      camposComputador.classList.remove("d-none");
      camposImpressora.classList.add("d-none");
      if (btnCancelarLink) btnCancelarLink.href = "computadores.html";
    } else if (tipoEquipamento.value === "2") {
      camposComputador.classList.add("d-none");
      camposImpressora.classList.remove("d-none");
      if (btnCancelarLink) btnCancelarLink.href = "impressoras.html";
    } else {
      camposComputador.classList.add("d-none");
      camposImpressora.classList.add("d-none");
      if (btnCancelarLink) btnCancelarLink.href = "computadores.html";
    }
  }

  tipoEquipamento.addEventListener("change", mostrarCamposPorTipo);

  // Event listener para carregar subsetores quando setor muda
  setorSelect.addEventListener("change", (e) => {
    const setorId = e.target.value;
    carregarSubSetores(setorId);
  });

  // Carregar setores no início
  await carregarSetores();

  // 3. SE FOR EDIÇÃO, CARREGAR DADOS
  if (equipmentId) {
    if (titulo) titulo.innerText = "Editar Equipamento";
    if (btnSalvar) btnSalvar.innerText = "Atualizar";

    try {
      // Tentar buscar como computador primeiro
      let res = await fetch(`${API_COMPUTERS}/${equipmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Se não encontrar, tentar impressora
      if (!res.ok) {
        res = await fetch(`${API_PRINTERS}/${equipmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Se ainda não encontrar, tentar periférico
      if (!res.ok) {
        res = await fetch(`${API_PERIPHERALS}/${equipmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (res.ok) {
        const data = await res.json();
        console.log("Dados carregados para edição:", data);

        // Detectar tipo baseado no que foi retornado
        if (res.url.includes("/computers")) {
          tipoEquipamento.value = "1";
        } else if (res.url.includes("/printer")) {
          tipoEquipamento.value = "2";
        }

        mostrarCamposPorTipo();

        if (tipoEquipamento.value === "2" && btnCancelarLink) {
          btnCancelarLink.href = "impressoras.html";
        }

        // Preencher setor e subsetor
        if (data.setor_id) {
          setorSelect.value = data.setor_id;
          // Carregar subsetores do setor selecionado
          await carregarSubSetores(data.setor_id);
          
          // Preencher subsetor após carregar as opções
          if (data.subsetor_id) {
            subsetorSelect.value = data.subsetor_id;
          }
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
          document.getElementById("tipo").value = data.tipo_imp || "";
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
      const subsetor_id = subsetorSelect.value ? parseInt(subsetorSelect.value, 10) : null;

      if (!tipo || !setor_id) {
        alert("Selecione tipo e setor");
        return;
      }

      const metodo = equipmentId ? "PUT" : "POST";

      let rotaBase = "";
      if (tipo === "1") {
        rotaBase = API_COMPUTERS;
      } else if (tipo === "2") {
        rotaBase = API_PRINTERS;
      }

      if (!rotaBase) {
        alert("Selecione o tipo de equipamento.");
        return;
      }

      const urlFinal = equipmentId ? `${rotaBase}/${equipmentId}` : rotaBase;

      let payload = {
        tipo: tipo === "1" ? "computador" : "impressora",
        setor_id: setor_id,
        subsetor_id: subsetor_id,
      };

      // Adicionar campos específicos
      if (tipo === "1") {
        payload = {
          ...payload,
          num_patrimonio: document.getElementById("tombamento")?.value || "",
          os: document.getElementById("sistema")?.value || "",
          mem_cpu:
            document.getElementById("memoria-interna")?.value || "",
          mem_ram: document.getElementById("memoria-ram")?.value || "",
          armazenamento: document.getElementById("armazenamento")?.value || "",
          endereco_ip: document.getElementById("numero-ip")?.value || "",
          observacao: document.getElementById("observacoes")?.value || "",
        };
      } else if (tipo === "2") {
        payload = {
          ...payload,
          modelo: document.getElementById("modelo")?.value || "",
          tipo_imp: document.getElementById("tipo")?.value || "",
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
          const redirectUrl =
            tipo === "1" ? "computadores.html" : "impressoras.html";
          window.location.href = redirectUrl;
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
