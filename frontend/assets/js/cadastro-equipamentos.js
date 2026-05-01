document.addEventListener("DOMContentLoaded", () => {
  configurarTipoEquipamento();
  carregarSetores();
  configurarSubmit();
});

// MOSTRAR / ESCONDER CAMPOS
function configurarTipoEquipamento() {
  const tipo = document.getElementById("tipoEquipamento");
  const computador = document.getElementById("campos-computador");
  const impressora = document.getElementById("campos-impressora");

  tipo.addEventListener("change", () => {
    if (tipo.value == "1") {
      computador.classList.remove("d-none");
      impressora.classList.add("d-none");
      gerarNumPatrimonio("PC");
    } else if (tipo.value == "2") {
      impressora.classList.remove("d-none");
      computador.classList.add("d-none");
      gerarNumPatrimonio("PRN");
    } else {
      computador.classList.add("d-none");
      impressora.classList.add("d-none");
      document.getElementById("num_patrimonio").value = "";
    }
  });
}

// GERAR NÚMERO DE PATRIMÔNIO AUTOMATICAMENTE
function gerarNumPatrimonio(prefixo) {
  const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos do timestamp
  const numPatrimonio = `${prefixo}-${timestamp}`;
  document.getElementById("num_patrimonio").value = numPatrimonio;
}

//  CARREGAR SETORES (GET)
async function carregarSetores() {
  const token = sessionStorage.getItem("token_procape");

  if (!token) {
    console.error("Token não encontrado. Faça login primeiro.");
    return;
  }

  try {
    const resposta = await fetch("http://localhost:5000/sectors", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!resposta.ok) {
      console.error("Erro na resposta:", resposta.status, resposta.statusText);
      return;
    }

    const setores = await resposta.json();

    const selectSetor = document.getElementById("setor");
    // Limpar opções existentes, mantendo apenas a primeira
    selectSetor.innerHTML = '<option value="">Selecione um setor</option>';

    setores.forEach((setor) => {
      const option = document.createElement("option");
      option.value = setor.nome;
      option.textContent = setor.nome;
      selectSetor.appendChild(option);
    });
  } catch (erro) {
    console.error("Erro ao carregar setores:", erro);
  }
}

//  ENVIAR FORMULÁRIO (POST)
function configurarSubmit() {
  const form = document.querySelector("form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const token = sessionStorage.getItem("token_procape");

    if (!token) {
      alert("Token não encontrado. Faça login primeiro.");
      return;
    }

    const tipo = document.getElementById("tipoEquipamento").value;
    const setor = document.getElementById("setor").value;
    const numPatrimonio = document.getElementById("num_patrimonio").value;

    let dados = {
      tipoEquipamento: tipo,
      setor: setor,
      num_patrimonio: numPatrimonio,
    };

    let url = "";

    // FORMULARIO COMPUTADOR
    if (tipo == "1") {
      dados = {
        ...dados,
        os: document.getElementById("sistema").value,
        mem_cpu: document.getElementById("memoria-interna").value,
        mem_ram: document.getElementById("memoria-ram").value,
        armazenamento: document.getElementById("armazenamento").value,
        endereco_ip: document.getElementById("numero-ip").value,
        observacao: document.getElementById("observacoes").value,
      };
      url = "http://localhost:5000/computers";
    }

    // FORMULARIO IMPRESSORA
    else if (tipo == "2") {
      dados = {
        ...dados,
        modelo: document.getElementById("modelo").value,
        tipo_imp: document.getElementById("tipo").value,
        coloracao: document.getElementById("coloracao").value,
        conectividade: document.getElementById("conectividade").value,
        endereco_ip: document.getElementById("endereco-ip").value,
        insumo: document.getElementById("insumo").value,
      };
      url = "http://localhost:5000/printer";
    }

    try {
      const resposta = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dados),
      });

      if (resposta.ok) {
        alert("Equipamento cadastrado com sucesso!");
        form.reset();
        // Resetar select do setor para a opção padrão
        document.getElementById("setor").value = "";
        // Esconder campos após reset
        document.getElementById("campos-computador").classList.add("d-none");
        document.getElementById("campos-impressora").classList.add("d-none");
        document.getElementById("tipoEquipamento").value = "Selecione";
      } else {
        const erro = await resposta.json();
        alert(
          "Erro ao cadastrar equipamento: " +
            (erro.erro || "Erro desconhecido"),
        );
      }
    } catch (erro) {
      console.error("Erro:", erro);
      alert("Erro ao conectar com o servidor");
    }
  });
}
