const API_BASE = "http://localhost:5000";
const API_COMPUTERS = `${API_BASE}/computers`;
const API_PRINTERS = `${API_BASE}/printer`;
const API_PERIPHERALS = `${API_BASE}/peripherals`;
const API_SECTORS = `${API_BASE}/sectors`;
const API_SUBSECTORS = `${API_BASE}/subsectors`;
const API_GENERIC = `${API_BASE}/generics`;
const API_GENERIC_TYPES = `${API_BASE}/types`; //Alterar assim que a rota para genéricos for definida

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

  // 1.2 CARREGAR TIPOS GENÉRICOS
  async function carregarTiposGenericos() {
    const selectTipoGenerico = document.getElementById("tipo-generico");
    if (!selectTipoGenerico) return; 

    try {
      const res = await fetch(API_GENERIC_TYPES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const tipos = await res.json();
        selectTipoGenerico.innerHTML = '<option value="">Selecione um tipo</option>';
        
        tipos.forEach((tipo) => {
          const option = document.createElement("option");
          option.value = tipo.id;
          option.textContent = tipo.nome;
          selectTipoGenerico.appendChild(option);
        });
      }
    } catch (err) {
      console.error("Erro ao carregar tipos genéricos:", err);
    }
  }

  // 2. MOSTRAR/OCULTAR CAMPOS POR TIPO
  function mostrarCamposPorTipo() {
    const camposComputador = document.getElementById("campos-computador");
    const camposImpressora = document.getElementById("campos-impressora");
    const camposGenerico = document.getElementById("campos-generico");

    if (tipoEquipamento.value === "1") {
      camposComputador.classList.remove("d-none");
      camposImpressora.classList.add("d-none");
      if (btnCancelarLink) btnCancelarLink.href = "computadores.html";
    } else if (tipoEquipamento.value === "2") {
      camposComputador.classList.add("d-none");
      camposImpressora.classList.remove("d-none");
      if (btnCancelarLink) btnCancelarLink.href = "impressoras.html";
    }
    // Preencher quando tiver as divs do front bem definidas
    if (tipoEquipamento.value === "3") {

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

  // Carregar setores e tipos de genéricos no início
  await carregarSetores();
  await carregarTiposGenericos();

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

      if (!res.ok) {
        res = await fetch(`${API_GENERIC}/${equipmentId}`, { headers: { Authorization: `Bearer ${token}` } });
      }

      if (res.ok) {
        const data = await res.json();
        console.log("Dados carregados para edição:", data);

        // Detectar tipo baseado no que foi retornado
        if (res.url.includes("/computers")) {
          tipoEquipamento.value = "1";
        } else if (res.url.includes("/printer")) {
          tipoEquipamento.value = "2";
        } else if (res.url.includes("/generics")) {
          tipoEquipamento.value = "3";
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
       if (document.getElementById("tombamento")) {
          document.getElementById("tombamento").value =
            data.num_patrimonio || data.tombamento || "";
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
        
        // Preencher campos genérico
        if (document.getElementById("tombamento-generico")) {
            document.getElementById("tombamento-generico").value = data.num_patrimonio || "";
        }
        if (document.getElementById("tipo-generico")) {
            document.getElementById("tipo-generico").value = data.tipo_id || "";
        }
        if (document.getElementById("ip-generico")) {
            document.getElementById("ip-generico").value = data.endereco_ip || "";
        }
        if (document.getElementById("observacao-generico")) {
            document.getElementById("observacao-generico").value = data.observacao || "";
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
      } else if (tipo === "3") {
        rotabase = API_GENERIC;
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
          num_patrimonio: document.getElementById("tombamento-computador")?.value || "",
          os: document.getElementById("sistema")?.value || "",
          mem_cpu: document.getElementById("memoria-interna")?.value || "",
          mem_ram: document.getElementById("memoria-ram")?.value || "",
          armazenamento: document.getElementById("armazenamento")?.value || "",
          endereco_ip: document.getElementById("numero-ip")?.value || "",
          observacao: document.getElementById("observacoes")?.value || "",
        };
      } else if (tipo === "2") {
        payload = {
          ...payload,
          num_patrimonio: document.getElementById("tombamento-impressora")?.value || "",
          modelo: document.getElementById("modelo")?.value || "",
          tipo_imp: document.getElementById("tipo")?.value || "",
          coloracao: document.getElementById("coloracao")?.value || "",
          conectividade: document.getElementById("conectividade")?.value || "",
          endereco_ip: document.getElementById("endereco-ip")?.value || "",
          insumo: document.getElementById("insumo")?.value || "",
        };
      } else if (tipo === "3") {
        if (!tipoIdElement.value || !tombamentoElement.value) {
            alert("Para equipamentos genéricos, o Tipo e o Tombamento são obrigatórios.");
            return;
        }
        const ipValue = document.getElementById("ip-generico")?.value.trim();
        payload = {
          ...payload,
          num_patrimonio: document.getElementById("tombamento-generico")?.value || "",
          tipo_id: parseInt(document.getElementById("tipo-generico")?.value, 10) || null, // Chave estrangeira NOT NULL
          endereco_ip: document.getElementById("ip-generico")?.value || null,
          observacao: document.getElementById("observacao-generico")?.value || "",
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
          alert(equipmentId ? "Equipamento atualizado!" : "Equipamento cadastrado!");
          
          let redirectUrl = "computadores.html";
          if(tipo === "2") redirectUrl = "impressoras.html";
          else if(tipo === "3") redirectUrl = "genericos.html"; // Tela de listagem correspondente

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
