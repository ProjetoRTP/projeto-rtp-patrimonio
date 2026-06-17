document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:5000";
  const token = sessionStorage.getItem("token_procape");
 
  const inputScanner = document.getElementById("input-scanner");
  const btnBuscar = document.getElementById("btn-buscar");
  const detalheItem = document.getElementById("detalhe-item");
  const barcodeArea = document.getElementById("barcode-area");
  const btnImprimir = document.getElementById("btn-imprimir");
 
  const confirmacaoModalElement = document.getElementById("confirmacaoModal");
  const dadosConfirmacaoDiv = document.getElementById("dados-confirmacao");
  const btnConfirmarEnvio = document.getElementById("btn-confirmar-envio");
 
  if (!token) {
    alert("Acesso negado. Por favor, inicie sessão.");
    window.location.href = "../../index.html";
    return;
  }
 
  if (
    !inputScanner ||
    !btnBuscar ||
    !detalheItem ||
    !barcodeArea ||
    !btnImprimir ||
    !confirmacaoModalElement ||
    !dadosConfirmacaoDiv ||
    !btnConfirmarEnvio
  ) {
    return;
  }
 
  const confirmacaoModal = new bootstrap.Modal(confirmacaoModalElement);
  let currentBarcode = null;
  let currentEquipamento = null;
 
  function getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }
 
  const getDadosEquipamentoDaTela = () => {
    const num_patrimonio =
      document.getElementById("num_patrimonio")?.value || "PAT-N/A";
    const tipoSelect = document.getElementById("tipo_equipamento_select");
    const tipo = tipoSelect
      ? tipoSelect.options[tipoSelect.selectedIndex].text
      : "N/A";
    const setorSelect = document.getElementById("setor_id");
    const setor = setorSelect
      ? setorSelect.options[setorSelect.selectedIndex].text
      : "N/A";
    const observacao = document.getElementById("observacao")?.value || "";
    const equipamentoId = document.getElementById("equipamento_id")?.value;
 
    return {
      id: equipamentoId,
      num_patrimonio,
      tipo,
      setor,
      observacao,
    };
  };
 
  inputScanner.addEventListener("input", () => {
    const valor = inputScanner.value.trim();
    btnBuscar.disabled = valor.length < 8 || valor.length > 14;
  });
 
  btnBuscar.addEventListener("click", async () => {
    const barcode = inputScanner.value.trim();
    if (!barcode) return;
 
    btnBuscar.disabled = true;
    btnBuscar.innerText = "BUSCANDO...";
    detalheItem.innerHTML =
      '<span style="color:#adb5bd; font-size:0.85rem;">Buscando produto...</span>';
    barcodeArea.innerHTML = "";
    btnImprimir.style.display = "none";
 
    try {
      const equipamentoData = getDadosEquipamentoDaTela();
      const response = await fetch(
        `${API_URL}/barcode/${encodeURIComponent(barcode)}`,
        {
          headers: getHeaders(),
        },
      );
 
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "../../index.html";
          return;
        }
        if (response.status === 404) {
          throw new Error("Equipamento não encontrado.");
        }
        throw new Error("Falha ao buscar equipamento.");
      }
 
      const json = await response.json();
      currentEquipamento = json.data || json;
      currentBarcode = barcode;
 
      const patrimonio =
        currentEquipamento.num_patrimonio ||
        equipamentoData.num_patrimonio ||
        "-";
      const tipo = currentEquipamento.tipo || equipamentoData.tipo || "-";
      const setor =
        currentEquipamento.setor_nome ||
        currentEquipamento.setor ||
        equipamentoData.setor ||
        "-";
      const observacao =
        currentEquipamento.observacao ||
        equipamentoData.observacao ||
        "Nenhuma";
 
      dadosConfirmacaoDiv.innerHTML = `
        <p class="mb-1"><strong>Patrimônio:</strong> ${patrimonio}</p>
        <p class="mb-1"><strong>Tipo:</strong> ${tipo}</p>
        <p class="mb-1"><strong>Setor:</strong> ${setor}</p>
        <p class="mb-0"><strong>Observação:</strong> ${observacao}</p>
      `;
 
      detalheItem.innerHTML = `
        <p class="mb-1"><strong>Produto encontrado:</strong></p>
        <p class="mb-1"><strong>Patrimônio:</strong> ${patrimonio}</p>
        <p class="mb-1"><strong>Setor:</strong> ${setor}</p>
      `;
 
      confirmacaoModal.show();
    } catch (erro) {
      detalheItem.innerHTML = `<span style="color:#B44848; font-size:0.85rem;">${erro.message}</span>`;
      currentEquipamento = null;
      currentBarcode = null;
    } finally {
      btnBuscar.disabled = false;
      btnBuscar.innerText = "BUSCAR PRODUTO";
    }
  });
 
  btnConfirmarEnvio.addEventListener("click", async () => {
    if (!currentBarcode || !currentEquipamento) {
      alert("Nenhum equipamento selecionado para enviar.");
      return;
    }
 
    btnConfirmarEnvio.disabled = true;
    btnConfirmarEnvio.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';
 
    try {
      const equipamentoData = getDadosEquipamentoDaTela();
      const equipamentoId = currentEquipamento.id || equipamentoData.id;
      if (!equipamentoId) {
        throw new Error("ID do equipamento não encontrado.");
      }
 
      const generatedBarcode = currentBarcode;
 
      const telegramMessage = `Novo equipamento cadastrado:\n- Patrimônio: ${equipamentoData.num_patrimonio}\n- Tipo: ${equipamentoData.tipo}\n- Código de Barras: ${generatedBarcode}`;
      const telegramResponse = await fetch(
      `${API_URL}/telegram/send-equipment-tag/${equipamentoId}`,
      {
          method: "POST",
          headers: getHeaders(),
      },
      );
 
      if (!telegramResponse.ok) {
        throw new Error("Falha ao notificar no Telegram.");
      }
 
      alert("✅ Dados confirmados e enviados ao Telegram com sucesso!");
      confirmacaoModal.hide();
      await carregarBarcode(equipamentoId);
    } catch (error) {
      console.error("Erro no processo:", error);
      alert(`Ocorreu um erro: ${error.message}`);
    } finally {
      btnConfirmarEnvio.disabled = false;
      btnConfirmarEnvio.innerText = "Confirmar e Enviar";
    }
  });
 
  async function carregarBarcode(id) {
    try {
      const resposta = await fetch(`${API_URL}/barcode/generate/${id}`, {
        headers: getHeaders(),
      });
 
      if (!resposta.ok) {
        barcodeArea.innerHTML =
          '<span style="color:#adb5bd; font-size:0.8rem;">Sem imagem de código de barras.</span>';
        return;
      }
 
      const blob = await resposta.blob();
      const imgUrl = URL.createObjectURL(blob);
 
      barcodeArea.innerHTML = `<img src="${imgUrl}" style="max-width:100%; height:auto;">`;
      btnImprimir.style.display = "inline-flex";
      btnImprimir.onclick = () => {
        const janela = window.open("", "_blank");
        janela.document.write(
          `<img src="${imgUrl}" onload="window.print();window.close();">`,
        );
      };
    } catch (erro) {
      barcodeArea.innerHTML =
        '<span style="color:#adb5bd; font-size:0.8rem;">Erro ao carregar código de barras.</span>';
    }
  }
});