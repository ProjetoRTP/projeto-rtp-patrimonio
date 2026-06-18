document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:5000";
  const token = sessionStorage.getItem("token_procape");

  const inputScanner = document.getElementById("input-scanner");
  const btnBuscar = document.getElementById("btn-buscar");
  const detalheItem = document.getElementById("detalhe-item");
  const barcodeArea = document.getElementById("barcode-area");
  const btnImprimir = document.getElementById("btn-imprimir");
  const btnTelegram = document.getElementById("btn-telegram");



const alertaTelegram = document.getElementById("alerta-telegram");
const alertaTelegramTexto = document.getElementById("alerta-telegram-texto");
const alertaTelegramIcone = document.getElementById("alerta-telegram-icone");
const btnFecharAlerta = document.getElementById("btn-fechar-alerta");
let alertaTelegramTimeout = null;

function mostrarAlertaTelegram(tipo, mensagem) {
  if (!alertaTelegram) return;

  alertaTelegram.classList.remove("alert-procape-success", "alert-procape-error", "d-none");
  alertaTelegram.classList.add(tipo === "sucesso" ? "alert-procape-success" : "alert-procape-error");
  alertaTelegramTexto.textContent = mensagem;

  if (alertaTelegramIcone) {
    alertaTelegramIcone.className = tipo === "sucesso"
      ? "bi bi-check-circle-fill"
      : "bi bi-exclamation-triangle-fill";
  }

  clearTimeout(alertaTelegramTimeout);
  alertaTelegramTimeout = setTimeout(() => {
    alertaTelegram.classList.add("d-none");
  }, 8000);
}

if (btnFecharAlerta) {
  btnFecharAlerta.addEventListener("click", () => {
    alertaTelegram.classList.add("d-none");
    clearTimeout(alertaTelegramTimeout);
  });
}





  if (!token) {
    alert("Acesso negado. Por favor, inicie sessão.");
    window.location.href = "../../index.html";
    return;
  }

  if (!inputScanner || !btnBuscar || !detalheItem || !barcodeArea || !btnImprimir) {
    return;
  }

  let currentBarcode = null;
  let currentEquipamento = null;

  function getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  inputScanner.addEventListener("input", () => {
    const valor = inputScanner.value.trim();
    btnBuscar.disabled = valor.length < 8 || valor.length > 14;
  });

  btnBuscar.addEventListener("click", async () => {
    const barcode = inputScanner.value.trim();
    if (!barcode) return;

    btnBuscar.disabled = true;
    btnBuscar.innerText = "BUSCANDO...";
    detalheItem.innerHTML = '<span style="color:#adb5bd; font-size:0.85rem;">Buscando produto...</span>';
    barcodeArea.innerHTML = "";
    btnImprimir.disabled = true;
    if (btnTelegram) btnTelegram.disabled = true;

    try {
      const response = await fetch(`${API_URL}/barcode/${encodeURIComponent(barcode)}`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "../../index.html";
          return;
        }
        if (response.status === 404) throw new Error("Equipamento não encontrado.");
        throw new Error("Falha ao buscar equipamento.");
      }

      const json = await response.json();
      currentEquipamento = json.data || json;
      currentBarcode = barcode;

      const patrimonio = currentEquipamento.num_patrimonio || "-";
      const tipo = currentEquipamento.tipo || "-";
      const setor = currentEquipamento.setor_nome || currentEquipamento.setor || "-";
      const observacao = currentEquipamento.observacao || "Nenhuma";

      detalheItem.innerHTML = `
        <div class="alert-procape alert-procape-success justify-content-start mb-2" style="padding: 0.65rem 1rem 0.65rem 1rem; display: inline-flex !important;">
          <strong>PRODUTO ENCONTRADO</strong>
          <i class="bi bi-check-circle-fill"></i>
        </div>
        <p class="mb-1"><strong>PATRIMÔNIO:</strong> ${patrimonio}</p>
        <p class="mb-1"><strong>SETOR:</strong> ${setor}</p>
        <p class="mb-1"><strong>TIPO:</strong> ${tipo}</p>
        <p class="mb-0"><strong>OBSERVAÇÃO:</strong> ${observacao}</p>
      `;

      await carregarBarcode(currentEquipamento.id);

    } catch (erro) {
      detalheItem.innerHTML = `<span style="color:#B44848; font-size:0.85rem;">${erro.message}</span>`;
      currentEquipamento = null;
      currentBarcode = null;
    } finally {
      btnBuscar.disabled = false;
      btnBuscar.innerText = "BUSCAR PRODUTO";
    }
  });

  async function carregarBarcode(id) {
    try {
      const resposta = await fetch(`${API_URL}/barcode/generate/${id}`, {
        headers: getHeaders(),
      });

      if (!resposta.ok) {
        barcodeArea.innerHTML = '<span style="color:#adb5bd; font-size:0.8rem;">Sem imagem de código de barras.</span>';
        return;
      }

      const blob = await resposta.blob();
      const imgUrl = URL.createObjectURL(blob);

      barcodeArea.innerHTML = `<img src="${imgUrl}" style="max-width:100%; height:auto;">`;

      btnImprimir.disabled = false;
      btnImprimir.onclick = () => {
        const janela = window.open("", "_blank");
        janela.document.write(`<img src="${imgUrl}" onload="window.print();window.close();">`);
      };

      if (btnTelegram) {
        btnTelegram.disabled = false;
        btnTelegram.onclick = async () => {
          try {
            btnTelegram.disabled = true;
            const resposta = await fetch(`${API_URL}/telegram/send-equipment-tag/${id}`, {
              method: "POST",
              headers: getHeaders(),
            });
            if (!resposta.ok) throw new Error("Falha ao notificar no Telegram.");
              mostrarAlertaTelegram("sucesso", "Enviado ao Telegram com sucesso!");
          } catch (erro) {
            mostrarAlertaTelegram("erro", `Ocorreu um erro: ${erro.message}`);
          } finally {
            btnTelegram.disabled = false;
          }
        };
      }

    } catch (erro) {
      barcodeArea.innerHTML = `<span style="color:#B44848; font-size:0.8rem;">Erro ao carregar código de barras.</span>`;
    }
  }
});