const API_URL = 'http://localhost:5000';

const inputScanner = document.getElementById('input-scanner');
const btnBuscar    = document.getElementById('btn-buscar');
const detalheItem  = document.getElementById('detalhe-item');
//const barcodeArea  = document.getElementById('barcode-area');
//const btnImprimir  = document.getElementById('btn-imprimir');

// ── Token JWT salvo no login ──
function getHeaders() {
    const token = localStorage.getItem('token');
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
    //barcodeArea.innerHTML = '';           
    //btnImprimir.style.display = 'none';

    try {

        const resposta = await fetch(`${API_URL}/products/barcode/${barcode}`, {
            headers: getHeaders()
        });

        // Redireciona para login se token expirado
        if (resposta.status === 401) {
            window.location.href = '../login/login.html';
            return;
        }

        if (resposta.status === 404) {
            detalheItem.innerHTML = '<span style="color:#B44848; font-size:0.85rem;">Produto não encontrado.</span>';
            return;
        }

        if (!resposta.ok) throw new Error('Erro ao buscar produto');


        //envio de etiqueta para o telegram
        const json = await resposta.json();
        const produto = json.data[0];

        detalheItem.innerHTML = `
            Produto: ${produto.ds_produto ?? '-'}<br>
            Estoque: ${produto.qt_estoque_atual ?? '-'}
        `;

        // ── Envia etiqueta ao Telegram ──
        if (produto.cd_produto) {
            fetch(`${API_URL}/telegram/send-product-tag/${produto.cd_produto}`, {
                method: 'POST',
                headers: getHeaders()
            }).catch(() => {});
        }

//      await carregarBarcode(produto.cd_produto); 
// O backend ainda não retorna cd_produto.


    } catch (erro) {
        detalheItem.innerHTML = `<span style="color:#B44848; font-size:0.85rem;">Erro: ${erro.message}</span>`;
    }
});

// ══════════════════════════════════════
// CARREGAR IMAGEM DO BARCODE
// ══════════════════════════════════════
async function carregarBarcode(id) {
    try {

        const resposta = await fetch(`${API_URL}/products/${id}/barcode`, {
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