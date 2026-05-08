const API_BASE = "http://localhost:5000";
const API_COMPUTERS = `${API_BASE}/computers`;
const API_PRINTERS = `${API_BASE}/printer`;
const API_PERIPHERALS = `${API_BASE}/peripherals`;
const API_SECTORS = `${API_BASE}/sectors`;
const API_SUBSECTORS = `${API_BASE}/subsectors`;
const API_GENERIC = `${API_BASE}/generics`;
const API_GENERIC_TYPES = `${API_BASE}/generics/types`;

document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token_procape");
  if (!token) {
    alert("Acesso negado. Por favor, faça o login.");
    window.location.href = "index.html";
    return;
  }

  const btnVoltar = document.getElementById("btnCancelarLink");
  if (btnVoltar) {
    btnVoltar.addEventListener("click", () => {
        window.history.back();
    });
  }

  const params = new URLSearchParams(window.location.search);
const equipmentId = params.get("id");
const tipoParam = params.get("tipo");
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
          const inativo = tipo.ativo === false || tipo.ativo === 0;
          const option = document.createElement("option");
          option.value = tipo.id;
          option.textContent = tipo.nome + (inativo ? " (Inativo)" : "");
          
          if (inativo) {
              // Deixa a opção oculta e desabilitada para que não apareça nem seja escolhida em novos cadastros.
              option.hidden = true;
              option.disabled = true;
          }
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
    const camposGenerico   = document.getElementById("campos-generico");

    // Esconde todos primeiro
    camposComputador.classList.add("d-none");
    camposImpressora.classList.add("d-none");
    camposGenerico.classList.add("d-none");

    // Mostra só o correto
    if (tipoEquipamento.value === "1") {
        camposComputador.classList.remove("d-none");
    } else if (tipoEquipamento.value === "2") {
        camposImpressora.classList.remove("d-none");
    } else if (tipoEquipamento.value === "3") {
        camposGenerico.classList.remove("d-none");
    }
  }

  tipoEquipamento.addEventListener("change", mostrarCamposPorTipo);

  // 1.3 CARREGAR ATRIBUTOS DO TIPO GENÉRICO SELECIONADO
  async function loadAtributosDinamicos(tipoId, valoresExistentes = null) {
      const containerAtributos = document.getElementById("container-atributos-genericos");
      if (!containerAtributos) return;
      
      containerAtributos.innerHTML = ""; // Limpa os campos antigos
      if (!tipoId) return;

      try {
          const res = await fetch(`${API_GENERIC_TYPES}/${tipoId}/atributos`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              data.atributos.forEach(attr => {
                  const divCol = document.createElement('div');
                  divCol.className = 'col-md-6';
                  
                  const label = document.createElement('label');
                  label.className = 'label-azul d-block';
                  label.innerText = attr.label + (attr.obrigatorio ? ' *' : '');
                  divCol.appendChild(label);
                  
                  let input;
                  if (attr.tipo_dado === 'lista' || attr.tipo_dado === 'booleano') {
                      input = document.createElement('select');
                      input.className = 'form-select input-vermelho atributo-dinamico-input';
                      input.add(new Option('Selecione...', ''));
                      
                      if (attr.tipo_dado === 'booleano') {
                          input.add(new Option('Sim', 'true'));
                          input.add(new Option('Não', 'false'));
                      } else if (attr.opcoes) {
                          attr.opcoes.forEach(opt => input.add(new Option(opt, opt)));
                      }
                  } else {
                      input = document.createElement('input');
                      input.className = 'form-control input-vermelho w-100 atributo-dinamico-input';
                      input.type = attr.tipo_dado === 'numero' ? 'number' : (attr.tipo_dado === 'data' ? 'date' : 'text');
                  }
                  
                  input.id = `dinamico_${attr.chave}`;
                  input.dataset.chave = attr.chave;
                  if (attr.obrigatorio) input.required = true;
                  
                  if (valoresExistentes && valoresExistentes[attr.chave] !== undefined) {
                      input.value = valoresExistentes[attr.chave];
                  }
                  
                  divCol.appendChild(input);
                  containerAtributos.appendChild(divCol);
              });
          }
      } catch (err) {
          console.error("Erro ao buscar atributos do tipo:", err);
      }
  }

  const selectTipoGenerico = document.getElementById("tipo-generico");
  if (selectTipoGenerico) {
      selectTipoGenerico.addEventListener("change", (e) => loadAtributosDinamicos(e.target.value));
  }

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

    const campoStatus = document.getElementById("campo-status");
    if (campoStatus) campoStatus.style.display = "block";

    if (tipoParam === "computador") {
        tipoEquipamento.value = "1";
    } else if (tipoParam === "impressora") {
        tipoEquipamento.value = "2";
    } else if (tipoParam === "generico") {
        tipoEquipamento.value = "3";
    }

    mostrarCamposPorTipo();

    let rotaEdicao = "";
    if (tipoParam === "computador")      rotaEdicao = `${API_COMPUTERS}/${equipmentId}`;
    else if (tipoParam === "impressora") rotaEdicao = `${API_PRINTERS}/${equipmentId}`;
    else if (tipoParam === "generico")   rotaEdicao = `${API_GENERIC}/${equipmentId}`;

    try {
      const res = await fetch(rotaEdicao, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Dados carregados para edição:", data);

        if (document.getElementById("status")) {
            document.getElementById("status").value = data.status || "ativo";
        }

        mostrarCamposPorTipo();


  /*  if (equipmentId) {
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
*/
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

        // ==========================================
        // PREENCHER CAMPOS DO COMPUTADOR
        // ==========================================
        if (document.getElementById("tombamento-computador")) {
          document.getElementById("tombamento-computador").value = data.num_patrimonio || data.tombamento || "";
        }
        if (document.getElementById("sistema")) {
          document.getElementById("sistema").value = data.sistema_operacional || data.os || "";
        }
        if (document.getElementById("memoria-interna")) {
          document.getElementById("memoria-interna").value = data.memoria_interna || data.mem_cpu || "";
        }
        if (document.getElementById("memoria-ram")) {
          document.getElementById("memoria-ram").value = data.memoria_ram || data.mem_ram || "";
        }
        if (document.getElementById("armazenamento")) {
          document.getElementById("armazenamento").value = data.armazenamento || "";
        }
        if (document.getElementById("numero-ip")) {
          document.getElementById("numero-ip").value = data.endereco_ip || "";
        }
        if (document.getElementById("observacoes")) {
          document.getElementById("observacoes").value = data.observacao || "";
        }
        if (document.getElementById("data_aquisicao_comp")) {
          document.getElementById("data_aquisicao_comp").value = data.data_aquisicao || "";
        }

        // ==========================================
        // PREENCHER CAMPOS DA IMPRESSORA
        // ==========================================
      // ==========================================
        // PREENCHER CAMPOS DA IMPRESSORA
        // ==========================================
        if (document.getElementById("tombamento-impressora")) {
          document.getElementById("tombamento-impressora").value = data.num_patrimonio || data.tombamento || "";
        }
        // Novo campo Modelo!
        if (document.getElementById("modelo")) {
          document.getElementById("modelo").value = data.modelo || "";
        }
        if (document.getElementById("tipo")) {
          // toLowerCase garante que "Laser" e "laser" são tratados de forma igual
          document.getElementById("tipo").value = data.tipo_imp ? data.tipo_imp.toLowerCase() : "";
        }
        if (document.getElementById("coloracao")) {
          document.getElementById("coloracao").value = data.coloracao ? data.coloracao.toLowerCase() : "";
        }
        if (document.getElementById("conectividade")) {
          document.getElementById("conectividade").value = data.conectividade || "";
        }
        if (document.getElementById("endereco-ip")) {
          document.getElementById("endereco-ip").value = data.endereco_ip || "";
        }
        if (document.getElementById("insumo")) {
          document.getElementById("insumo").value = data.insumo || "";
        }
        if (document.getElementById("data_aquisicao_imp")) {
          // Previne erros se a base de dados mandar a data num formato longo com horas (ex: 2024-05-10T00:00:00Z)
          let dataAquisicao = data.data_aquisicao;
          if (dataAquisicao && dataAquisicao.includes("T")) {
              dataAquisicao = dataAquisicao.split("T")[0];
          }
          document.getElementById("data_aquisicao_imp").value = dataAquisicao || "";
        }
        
        // ==========================================
        // PREENCHER CAMPOS GENÉRICO
        // ==========================================
        if (document.getElementById("tombamento-generico")) {
            document.getElementById("tombamento-generico").value = data.num_patrimonio || "";
        }
        if (document.getElementById("tipo-generico")) {
            const selectGenerico = document.getElementById("tipo-generico");
            selectGenerico.value = data.tipo_id || "";
            
            // Garantir que a opção atual, mesmo inativa, possa ser mantida ao editar
            if (selectGenerico.options[selectGenerico.selectedIndex]) {
                selectGenerico.options[selectGenerico.selectedIndex].disabled = false;
                selectGenerico.options[selectGenerico.selectedIndex].hidden = false;
            }

            if (data.tipo_id) {
                const attrs = typeof data.atributos_dinamicos === 'string' ? JSON.parse(data.atributos_dinamicos) : data.atributos_dinamicos;
                await loadAtributosDinamicos(data.tipo_id, attrs);
            }
        }
        if (document.getElementById("ip-generico")) {
            document.getElementById("ip-generico").value = data.endereco_ip || "";
        }
        if (document.getElementById("observacao-generico")) {
            document.getElementById("observacao-generico").value = data.observacao || "";
        }
        if (document.getElementById("data_aquisicao_gen")) {
          document.getElementById("data_aquisicao_gen").value = data.data_aquisicao || "";
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

      const statusValue = document.getElementById("status")?.value || "ativo";
      const metodo = equipmentId ? "PUT" : "POST";

      let rotaBase = "";
      if (tipo === "1") {
        rotaBase = API_COMPUTERS;
      } else if (tipo === "2") {
        rotaBase = API_PRINTERS;
      } else if (tipo === "3") {
        rotaBase = API_GENERIC;
      }

      if (!rotaBase) {
        alert("Selecione o tipo de equipamento.");
        return;
      }

      const urlFinal = equipmentId ? `${rotaBase}/${equipmentId}` : rotaBase;

/*    let payload = {
        tipo: tipo === "1" ? "computador" : "impressora",
        setor_id: setor_id,
        subsetor_id: subsetor_id,
      };
*/ 
      let payload = {
        tipo: tipo === "1" ? "computador" : "impressora",
        setor_id: setor_id,
        subsetor_id: subsetor_id,
        status: statusValue,
      };



      // Adicionar campos específicos
      if (tipo === "1") {
        payload = {
          ...payload,
          data_aquisicao: document.getElementById("data_aquisicao_comp")?.value || null,
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
          data_aquisicao: document.getElementById("data_aquisicao_imp")?.value || null,
          num_patrimonio: document.getElementById("tombamento-impressora")?.value || "",
          modelo: document.getElementById("modelo")?.value || "",
          tipo_imp: document.getElementById("tipo")?.value || "",
          coloracao: document.getElementById("coloracao")?.value || "",
          conectividade: document.getElementById("conectividade")?.value || "",
          endereco_ip: document.getElementById("endereco-ip")?.value || "",
          insumo: document.getElementById("insumo")?.value || "",
        };
      } else if (tipo === "3") {
        const tipoIdElement = document.getElementById("tipo-generico");
        const tombamentoElement = document.getElementById("tombamento-generico");
        
        if (!tipoIdElement?.value || !tombamentoElement?.value) {
            alert("Para equipamentos genéricos, o Tipo e o Tombamento são obrigatórios.");
            return;
        }
        
        const ipValue = document.getElementById("ip-generico")?.value.trim();
        
        // Coletar campos dinâmicos JSON
        const atributosDinamicos = {};
        document.querySelectorAll('.atributo-dinamico-input').forEach(input => {
            atributosDinamicos[input.dataset.chave] = input.value;
        });

        payload = {
          ...payload,
          data_aquisicao: document.getElementById("data_aquisicao_gen")?.value || null,
          num_patrimonio: tombamentoElement.value,
          tipo_id: parseInt(tipoIdElement.value, 10), 
          endereco_ip: ipValue || null,
          observacao: document.getElementById("observacao-generico")?.value || "",
          atributos_dinamicos: atributosDinamicos,
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
          
          let redirectUrl = "equipamentos.html";
          if(tipo === "2") redirectUrl = "impressoras.html"; // Mantive apontado para a página de impressoras baseando-me na sua intenção original
          else if(tipo === "3") redirectUrl = "equipamentos.html";

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