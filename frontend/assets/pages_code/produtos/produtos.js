const API_URL = 'http://localhost:5000';

const checkTodos = document.getElementById('check-todos');
const tbody = document.getElementById('tbody-produtos');
const barcodeArea = document.getElementById('barcode-area');
const btnImprimir = document.getElementById('btn-imprimir');

// ── Estado da paginação ──
const PRODUTOS_POR_PAGINA = 100;
let paginaAtual = 1;
let totalProdutos = 0;
let totalPaginas = 1;

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
let todosProdutos = []; // cache local

async function carregarProdutos(pagina = 1) {
    // Só busca da API na primeira vez
    if (todosProdutos.length === 0) {
        tbody.innerHTML = `<tr class="linha-vazia"><td colspan="4">Carregando produtos...</td></tr>`;

        try {
            const resposta = await fetch(`${API_URL}/products`, { headers: getHeaders() });

            if (resposta.status === 401) { window.location.href = '../login/login.html'; return; }
            if (!resposta.ok) throw new Error('Erro ao buscar produtos');

            const json = await resposta.json();
            todosProdutos = json.data ?? [];

        } catch (erro) {
            tbody.innerHTML = `<tr class="linha-vazia"><td colspan="4">Erro: ${erro.message}</td></tr>`;
            return;
        }
    }

    // Calcula paginação local
    totalProdutos = todosProdutos.length;
    totalPaginas  = Math.max(1, Math.ceil(totalProdutos / PRODUTOS_POR_PAGINA));
    paginaAtual   = pagina;

    const inicio  = (pagina - 1) * PRODUTOS_POR_PAGINA;
    const fatia   = todosProdutos.slice(inicio, inicio + PRODUTOS_POR_PAGINA);

    tbody.innerHTML = '';
    fatia.forEach(produto => {
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

    atualizarPainel();
    renderizarPaginacao();
    } 


// ══════════════════════════════════════
// 2. PAGINAÇÃO
// ══════════════════════════════════════

/**
 * Gera a janela de 5 páginas ao redor da página atual.
 * Ex: total=20, atual=10  →  [8, 9, 10, 11, 12]
 */
function janelaDePaginas(atual, total, janela = 5) {
    const metade = Math.floor(janela / 2);
    let inicio = Math.max(1, atual - metade);
    let fim    = Math.min(total, inicio + janela - 1);

    // Ajusta se ficou menor que a janela no final
    if (fim - inicio + 1 < janela) {
        inicio = Math.max(1, fim - janela + 1);
    }

    const paginas = [];
    for (let i = inicio; i <= fim; i++) paginas.push(i);
    return paginas;
}

function renderizarPaginacao() {
    const container = document.getElementById('paginacao-container');
    if (!container) return;

    container.innerHTML = '';

    const isFirst = paginaAtual === 1;
    const isLast  = paginaAtual === totalPaginas;

    // |< Primeira
    container.appendChild(criarBtnPaginacao('|&lt;', 1, isFirst, 'nav'));

    // < Anterior
    container.appendChild(criarBtnPaginacao('&lt;', paginaAtual - 1, isFirst, 'nav'));

    // Reticências iniciais
    const paginas = janelaDePaginas(paginaAtual, totalPaginas);
    if (paginas[0] > 1) {
        container.appendChild(criarEticencias());
    }

    // Números
    paginas.forEach(p => {
        container.appendChild(criarBtnPaginacao(p, p, false, p === paginaAtual ? 'ativo' : 'numero'));
    });

    // Reticências finais
    if (paginas[paginas.length - 1] < totalPaginas) {
        container.appendChild(criarEticencias());
    }

    // > Próxima
    container.appendChild(criarBtnPaginacao('&gt;', paginaAtual + 1, isLast, 'nav'));

    // >| Última
    container.appendChild(criarBtnPaginacao('&gt;|', totalPaginas, isLast, 'nav'));
}

function criarBtnPaginacao(label, pagina, desativado, tipo) {
    const btn = document.createElement('button');
    btn.innerHTML = label;

    if (tipo === 'ativo') {
        btn.className = 'pag-btn pag-btn--ativo';
    } else if (tipo === 'nav') {
        btn.className = 'pag-btn pag-btn--nav';
    } else {
        btn.className = 'pag-btn pag-btn--numero';
    }

    if (desativado) {
        btn.disabled = true;
        btn.classList.add('pag-btn--desativado');
    } else {
        btn.addEventListener('click', () => {
            if (pagina >= 1 && pagina <= totalPaginas) {
                carregarProdutos(pagina);
                // Sobe suavemente ao topo da tabela
                document.querySelector('.col-tabela')?.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    return btn;
}

function criarEticencias() {
    const span = document.createElement('span');
    span.className = 'pag-ellipsis';
    span.textContent = '...';
    return span;
}


// ══════════════════════════════════════
// 3. CHECKBOXES
// ══════════════════════════════════════
function configurarCheckboxes() {
    checkTodos.addEventListener('change', () => {
        tbody.querySelectorAll('input[type="checkbox"]')
            .forEach(c => c.checked = checkTodos.checked);
        atualizarPainel();
    });

    tbody.addEventListener('change', (e) => {
        if (e.target.type !== 'checkbox') return;

        const checks = [...tbody.querySelectorAll('input[type="checkbox"]')];
        const totalMarcados = checks.filter(c => c.checked).length;

        checkTodos.checked       = totalMarcados === checks.length;
        checkTodos.indeterminate = totalMarcados > 0 && totalMarcados < checks.length;

        atualizarPainel();
    });
}


// ══════════════════════════════════════
// 4. CLIQUE NA LINHA → SELECIONA CHECKBOX
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
// 5. PAINEL DIREITO
// ══════════════════════════════════════
async function atualizarPainel() {
    const selecionados = [...tbody.querySelectorAll('input[type="checkbox"]:checked')]
        .map(c => c.closest('tr'));

    if (selecionados.length === 0) {
        barcodeArea.innerHTML = '<span style="color:#adb5bd; font-size:0.85rem;">Nenhum item selecionado.</span>';
        btnImprimir.style.display = 'none';
        return;
    }

    const id = selecionados[0].dataset.id;
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
// 6. INICIALIZA
// ══════════════════════════════════════
configurarCheckboxes();
configurarSelecaoLinha();
carregarProdutos(1);