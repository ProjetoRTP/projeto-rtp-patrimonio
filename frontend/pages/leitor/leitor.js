document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("token_procape");

    if (!token) {
        alert("Acesso negado. Por favor, inicie sessão.");
        window.location.href = "../../index.html";
        return;
    }
});

const API_URL = 'http://localhost:5000';

const inputScanner = document.getElementById('input-scanner');
const btnBuscar    = document.getElementById('btn-buscar');
const detalheItem  = document.getElementById('detalhe-item');
const barcodeArea  = document.getElementById('barcode-area');
const btnImprimir  = document.getElementById('btn-imprimir');


// ── Token JWT salvo no login ──
function getHeaders() {
    const token = sessionStorage.getItem('token_procape');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// ══════════════════════════════════════
// HABILITA BOTÃO MAIS DE 8 CARACTERES NO INPUT
// ══════════════════════════════════════
inputScanner.addEventListener('input', () => {
    const valor = inputScanner.value.trim();
    btnBuscar.disabled = valor.length < 8 || valor.length > 14; 
});

// ══════════════════════════════════════
// BUSCAR PRODUTO PELO CÓDIGO DE BARRAS
// ══════════════════════════════════════
btnBuscar.addEventListener('click', async () => {
    const barcode = inputScanner.value.trim();
    if (!barcode) return;

    detalheItem.innerHTML = '<span style="color:#adb5bd; font-size:0.85rem;">Buscando produto...</span>';
    barcodeArea.innerHTML = '';           
    btnImprimir.style.display = 'none';

    try {

        const resposta = await fetch(`${API_URL}/barcode/${barcode}`, {
            headers: getHeaders()
        });

        // Redireciona para login se token expirado
        if (resposta.status === 401) {
            window.location.href = '../../index.html';
            return;
        }

        if (resposta.status === 404) {
            detalheItem.innerHTML = '<span style="color:#B44848; font-size:0.85rem;">Equipamento não encontrado.</span>';
            return;
        }

        if (!resposta.ok) throw new Error('Erro ao buscar equipamento');

        //envio de etiqueta para o telegram
        const json = await resposta.json();
        const equipamento = json.data;

        detalheItem.innerHTML = `
            Patrimônio: ${equipamento.num_patrimonio ?? '-'}<br>
            Setor: ${equipamento.setor_nome ?? '-'} / ${equipamento.subsetor_nome ?? '-'}
        `;

        // ── Envia etiqueta ao Telegram ──
        if (equipamento.id) {
            try {
                const telegramResposta = await fetch(`${API_URL}/telegram/send-equipment-tag/${equipamento.id}`, {
                    method: 'POST',
                    headers: getHeaders()
                });

                const telegramJson = await telegramResposta.json();

                if (telegramResposta.ok && telegramJson.success) {
                    alert('✅ Etiqueta de patrimônio enviada ao Telegram com sucesso!');
                } else {
                    alert(`⚠️ Equipamento encontrado, mas falha ao enviar ao Telegram:\n${telegramJson.error ?? 'Erro desconhecido'}`);
                }

            } catch {
                alert('⚠️ Equipamento encontrado, mas não foi possível contactar o Telegram.');
            }
        }

        await carregarBarcode(equipamento.id); 


    } catch (erro) {
        detalheItem.innerHTML = `<span style="color:#B44848; font-size:0.85rem;">Erro: ${erro.message}</span>`;
    }
});

// ══════════════════════════════════════
// CARREGAR IMAGEM DO BARCODE
// ══════════════════════════════════════
async function carregarBarcode(id) {
    try {

        const resposta = await fetch(`${API_URL}/barcode/generate/${id}`, {
            headers: getHeaders()
        });

        if (!resposta.ok) {
            barcodeArea.innerHTML = '<span style="color:#adb5bd; font-size:0.8rem;">Sem imagem de código de barras.</span>';
            return;
        }

        const blob   = await resposta.blob();
        const imgUrl = URL.createObjectURL(blob);

        barcodeArea.innerHTML = `<img src="${imgUrl}" style="max-width:100%; height:auto;">`;
        btnImprimir.style.display = 'inline-flex';

        btnImprimir.onclick = () => {
            const janela = window.open('', '_blank');
            janela.document.write(`<img src="${imgUrl}" onload="window.print();window.close();">`);
        };

    } catch (erro) {
        barcodeArea.innerHTML = '<span style="color:#adb5bd; font-size:0.8rem;">Erro ao carregar código de barras.</span>';
    }
}