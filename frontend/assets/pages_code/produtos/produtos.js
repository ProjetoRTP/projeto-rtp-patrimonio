// ══════════════════════════════════════
// produtos.js — Lógica da página Produtos
// ══════════════════════════════════════

const API_URL = 'http://localhost:5000';

const checkTodos  = document.getElementById('check-todos');
const tbody       = document.getElementById('tbody-produtos');
const detalheDiv  = document.getElementById('detalhe-produto');
const barcodeArea = document.getElementById('barcode-area');
const btnImprimir = document.getElementById('btn-imprimir');

// ── Token ──
function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// ══════════════════════════════════════
// 1. CARREGAR PRODUTOS DA API
// ══════════════════════════════════════
async function carregarProdutos() {
    tbody.innerHTML = `
        <tr class="linha-vazia">
            <td colspan="4">Carregando produtos...</td>
        </tr>`;

    try {
        const resposta = await fetch(`${API_URL}/products`, {
            headers: getHeaders()
        });

        if (resposta.status === 401) {
            window.location.href = '../login/login.html';
            return;
        }

        if (!resposta.ok) throw new Error('Erro ao buscar produtos');

        const produtos = await resposta.json();

        if (!produtos || produtos.length === 0) {
            tbody.innerHTML = `
                <tr class="linha-vazia">
                    <td colspan="4">Nenhum produto encontrado.</td>
                </tr>`;
            return;
        }

        tbody.innerHTML = '';
        produtos.forEach(produto => {
            const tr = document.createElement('tr');
            tr.dataset.id      = produto.cd_produto;
            tr.dataset.codigo  = produto.cd_produto;
            tr.dataset.nome    = produto.ds_produto;
            tr.dataset.estoque = produto.qt_estoque_atual ?? '-';

            tr.innerHTML = `
                <td class="col-check"><input type="checkbox"></td>
                <td>${produto.cd_produto}</td>
                <td>${produto.ds_produto}</td>
                <td>${produto.qt_estoque_atual ?? '-'}</td>
            `;
            tbody.appendChild(tr);
        });

        configurarCheckboxes();
        configurarSelecaoLinha();
        atualizarPainel();

    } catch (erro) {
        tbody.innerHTML = `
            <tr class="linha-vazia">
                <td colspan="4">Erro ao carregar produtos: ${erro.message}</td>
            </tr>`;
    }
}

// ══════════════════════════════════════
// 2. CHECKBOXES
// ══════════════════════════════════════
function configurarCheckboxes() {

    checkTodos.addEventListener('change', () => {
        tbody.querySelectorAll('input[type="checkbox"]')
            .forEach(c => c.checked = checkTodos.checked);
        atualizarPainel();
    });

    tbody.addEventListener('change', (e) => {
        if (e.target.type !== 'checkbox') return;

        const checks        = [...tbody.querySelectorAll('input[type="checkbox"]')];
        const totalMarcados = checks.filter(c => c.checked).length;

        checkTodos.checked       = totalMarcados === checks.length;
        checkTodos.indeterminate = totalMarcados > 0 && totalMarcados < checks.length;

        atualizarPainel();
    });
}

// ══════════════════════════════════════
// 3. CLIQUE NA LINHA → SELECIONA CHECKBOX
// ══════════════════════════════════════
function configurarSelecaoLinha() {
    tbody.addEventListener('click', (e) => {
        const tr = e.target.closest('tr');
        if (!tr) return;

        const checkbox = tr.querySelector('input[type="checkbox"]');
        if (e.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}

// ══════════════════════════════════════
// 4. PAINEL DIREITO — detalhes + barcode
// ══════════════════════════════════════
async function atualizarPainel() {
    const selecionados = [...tbody.querySelectorAll('input[type="checkbox"]:checked')]
        .map(c => c.closest('tr'));

    // Nenhum selecionado
    if (selecionados.length === 0) {
        detalheDiv.innerHTML = `
            <span style="color:#adb5bd; font-size:0.85rem;">
                Nenhum item ainda foi selecionado.
            </span>`;
        barcodeArea.innerHTML = '';
        btnImprimir.style.display = 'none';
        return;
    }

    // Mais de um selecionado
    if (selecionados.length > 1) {
        detalheDiv.innerHTML = `
            <span style="color:#adb5bd; font-size:0.85rem;">
                ${selecionados.length} itens selecionados.
            </span>`;
        barcodeArea.innerHTML = `
            <button class="btn-outline-vermelho w-100" id="btn-gerar-lote">
                GERAR CÓDIGO DE BARRAS EM LOTE
            </button>`;
        btnImprimir.style.display = 'none';
        return;
    }

    // Exatamente um selecionado
    const tr      = selecionados[0];
    const id      = tr.dataset.id;
    const codigo  = tr.dataset.codigo;
    const nome    = tr.dataset.nome;
    const estoque = tr.dataset.estoque;

    detalheDiv.innerHTML = `
        Código: ${codigo}<br>
        Produto: ${nome}<br>
        Estoque: ${estoque}
    `;

    await carregarBarcode(id);
}

async function carregarBarcode(id) {
    barcodeArea.innerHTML = '<span style="color:#adb5bd; font-size:0.8rem;">Carregando código de barras...</span>';
    btnImprimir.style.display = 'none';

    try {
        const resposta = await fetch(`${API_URL}/products/${id}/barcode`, {
            headers: getHeaders()
        });

        if (resposta.status === 401) {
            window.location.href = '../login/login.html';
            return;
        }

        if (!resposta.ok) {
            barcodeArea.innerHTML = `
                <button class="btn-outline-vermelho w-100" id="btn-gerar-barcode" data-id="${id}">
                    GERAR CÓDIGO DE BARRAS
                </button>`;
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
        barcodeArea.innerHTML = `
            <button class="btn-outline-vermelho w-100" id="btn-gerar-barcode" data-id="${id}">
                GERAR CÓDIGO DE BARRAS
            </button>`;
    }
}

// ══════════════════════════════════════
// 5. INICIALIZA
// ══════════════════════════════════════
carregarProdutos();