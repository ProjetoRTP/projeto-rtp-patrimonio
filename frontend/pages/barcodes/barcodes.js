const API_URL = 'http://localhost:5000';

function getHeaders() {
    const token = sessionStorage.getItem('token_procape');
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

function redirectLogin() {
    sessionStorage.clear();
    window.location.href = '../../index.html';
}

// ──────────────────────────────
// Estado
// ──────────────────────────────
let todosEquipamentos = [];
let blobAtual = null;
const POR_PAGINA = 10;
let paginaAtual = 1;

// ──────────────────────────────
// 1. Carregar equipamentos
// ──────────────────────────────
async function carregarEquipamentos() {
    const tbody = document.getElementById('tbody-equipamentos');
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Carregando...</td></tr>`;

    try {
        const rotas = [
            { url: '/computers/lista',   tipo: 'Computador' },
            { url: '/printer/lista',     tipo: 'Impressora' },
            { url: '/peripherals/lista', tipo: 'Periférico' },
            { url: '/generics/lista',    tipo: 'Genérico' }
        ];

        const resultados = await Promise.all(rotas.map(async r => {
            try {
                const resp = await fetch(`${API_URL}${r.url}`, { headers: getHeaders() });
                if (resp.status === 401) { redirectLogin(); return []; }
                if (!resp.ok) return [];
                const json = await resp.json();
                const lista = json.data ?? json ?? [];
                return lista.map((e, i) => ({ ...e, _tipo: r.tipo, _codigo: e.id }));
            } catch { return []; }
        }));

        todosEquipamentos = resultados.flat();
        renderizarPagina(1);

    } catch (erro) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Erro: ${erro.message}</td></tr>`;
    }
}

// ──────────────────────────────
// 2. Renderizar tabela (paginada)
// ──────────────────────────────
function renderizarPagina(pagina) {
    paginaAtual = pagina;
    const tbody = document.getElementById('tbody-equipamentos');
    const checkTodos = document.getElementById('check-todos');
    const inicio = (pagina - 1) * POR_PAGINA;
    const fatia = todosEquipamentos.slice(inicio, inicio + POR_PAGINA);

    if (!fatia.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Nenhum equipamento encontrado.</td></tr>`;
        renderizarPaginacao();
        return;
    }

    tbody.innerHTML = '';
    fatia.forEach((eq, idx) => {
        const tr = document.createElement('tr');
        tr.dataset.id = eq.id;

        tr.innerHTML = `
            <td><input type="checkbox" class="check-equip" data-id="${eq.id}"></td>
            <td style="text-align:center;">${eq._codigo}</td>
            <td style="text-align:center;">${eq.num_patrimonio ?? '-'}</td>
            <td style="font-size:0.78rem; color:#555;">${eq._tipo}</td>
            <td style="font-size:0.78rem; color:#555;">${eq.setor_nome ?? eq.setor ?? '-'}</td>
        `;

        // Clique na linha → carrega barcode
        tr.addEventListener('click', e => {
            if (e.target.type === 'checkbox') return;
            selecionarEquipamento(eq, tr);
        });

        tbody.appendChild(tr);
    });

    // checkbox "todos"
    checkTodos.checked = false;
    checkTodos.addEventListener('change', () => {
        tbody.querySelectorAll('.check-equip').forEach(c => c.checked = checkTodos.checked);
    });

    renderizarPaginacao();
}

// ──────────────────────────────
// 3. Paginação
// ──────────────────────────────
function renderizarPaginacao() {
    const total = Math.ceil(todosEquipamentos.length / POR_PAGINA);
    const container = document.getElementById('paginacao');
    container.innerHTML = '';

    const criar = (label, pagina, disabled = false, ativo = false) => {
        const btn = document.createElement('button');
        btn.innerHTML = label;
        if (ativo) btn.classList.add('ativo');
        btn.disabled = disabled;
        if (!disabled) btn.addEventListener('click', () => renderizarPagina(pagina));
        return btn;
    };

    container.appendChild(criar('⟨⟨', 1, paginaAtual === 1));
    container.appendChild(criar('⟨', paginaAtual - 1, paginaAtual === 1));

    const inicio = Math.max(1, paginaAtual - 2);
    const fim    = Math.min(total, inicio + 4);
    for (let i = inicio; i <= fim; i++) {
        container.appendChild(criar(i, i, false, i === paginaAtual));
    }

    container.appendChild(criar('⟩', paginaAtual + 1, paginaAtual === total));
    container.appendChild(criar('⟩⟩', total, paginaAtual === total));
}

// ──────────────────────────────
// 4. Selecionar → mostrar barcode
// ──────────────────────────────
async function selecionarEquipamento(eq, tr) {
    // Destaque visual
    document.querySelectorAll('#tbody-equipamentos tr').forEach(r => r.classList.remove('selecionado'));
    tr.classList.add('selecionado');

    const area = document.getElementById('barcode-area');
    const btnImprimir = document.getElementById('btn-imprimir');

    area.innerHTML = `<span class="text-muted" style="font-size:0.8rem;">Carregando...</span>`;
    btnImprimir.style.display = 'none';
    blobAtual = null;

    try {
        const resp = await fetch(`${API_URL}/barcode/generate/${eq.id}`, { headers: getHeaders() });

        if (resp.status === 401) { redirectLogin(); return; }

        if (!resp.ok) {
            area.innerHTML = `<span class="text-muted" style="font-size:0.78rem;">Sem código disponível</span>`;
            return;
        }

        blobAtual = await resp.blob();
        const imgUrl = URL.createObjectURL(blobAtual);
        area.innerHTML = `<img src="${imgUrl}" alt="Código de barras ${eq.num_patrimonio}">`;
        btnImprimir.style.display = 'block';

        btnImprimir.onclick = () => {
            const janela = window.open('', '_blank');
            janela.document.write(`
                <!DOCTYPE html><html><head><title>Barcode</title>
                <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif;}
                img{max-width:80%;border:1px solid #ddd;padding:12px;border-radius:8px;}
                p{color:#555;font-size:14px;}</style>
                </head><body>
                <img src="${imgUrl}" onload="window.print();window.close();" alt="Barcode">
                <p>Patrimônio: ${eq.num_patrimonio ?? '-'} | ${eq._tipo}</p>
                </body></html>
            `);
            janela.document.close();
        };

    } catch (err) {
        area.innerHTML = `<span class="text-danger" style="font-size:0.78rem;">Erro ao carregar</span>`;
    }
}

// ──────────────────────────────
// 5. Init
// ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token_procape');
    if (!token) { redirectLogin(); return; }
    carregarEquipamentos();
});
