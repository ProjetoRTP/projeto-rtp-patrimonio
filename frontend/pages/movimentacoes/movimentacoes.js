const API_BASE_URL = 'http://localhost:5000/movements';
const API_BASE = 'http://localhost:5000';
const tbody = document.getElementById("tabela-manutencoes");
const token = sessionStorage.getItem('token_procape');
 
document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = '../../index.html';
        return;
    }
    carregarSetores();
    carregarMovimentacoes();
 
    /* ─── Filtros ─────────────────────────────────────────── */
    const filtroSetor = document.getElementById('filtro-setor');
    const filtroEquip = document.getElementById('filtro-equip');
 
    document.getElementById('btn-limpar').addEventListener('click', () => {
        filtroSetor.value = "";
        filtroEquip.value = "";
        carregarMovimentacoes();
    });
 
    document.getElementById('btn-aplicar').addEventListener('click', () => {
        const setor = filtroSetor.value;
        const equip = filtroEquip.value;
 
        if (!setor && !equip) {
            alert("Por favor, escolha pelo menos um filtro antes de aplicar!");
            return;
        }
 
        carregarMovimentacoes(setor, equip);
    });
});
 
 
/* ─── Carregamento da tabela ──────────────────────────── */
 
async function carregarMovimentacoes(setorFiltro = "", equipFiltro = "") {
    mostrarLoading();
 
    const equip = equipFiltro || document.getElementById("filtro-Equip")?.value || "";
    const setor = setorFiltro || document.getElementById("filtro-setor")?.value || "";
 
    const query = new URLSearchParams();
 
    if (equip) query.append("equip", equip);
    if (setor) query.append("setor", setor);
 
    const qs = query.toString();
    
    try {
        const res = await fetch(`${API_BASE_URL}/lista?${qs}`, {
            headers: {
                Authorization: `Bearer ${token}`, 
                "Content-Type": "application/json",
            },
        });
 
        if (!res.ok) throw new Error(`Erro ${res.status}`);
 
        let dados = await res.json();
 
        // Filtra equipamentos inativos antes de renderizar
        dados = dados.filter(mov => mov.equipamento_status?.toLowerCase() !== 'inativo');
 
        renderizarTabela(dados);
    } catch (erro) {
        console.error("Erro ao carregar as movimentações:", erro);
        mostrarErro();
    }
}
 
function mostrarLoading() {
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">Buscando movimentações...</td></tr>`;
    }
}
 
function mostrarErro() {
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-danger">Erro ao buscar movimentações.</td></tr>`;
    }
}
 
async function carregarSetores() {
    const setorSelect = document.getElementById("filtro-setor");
    if (!setorSelect) return;
 
    try {
        const res = await fetch(`${API_BASE}/sectors`, {
            headers: { Authorization: `Bearer ${token}` }
        });
 
        if (!res.ok) return;
 
        const setores = await res.json();
 
        setorSelect.innerHTML = '<option value="">Todos os setores</option>';
 
        setores.forEach(setor => {
            const option = document.createElement("option");
            option.value = setor.id;
            option.textContent = setor.nome;
            setorSelect.appendChild(option);
        });
    } catch (err) {
        console.error("Erro ao carregar setores:", err);
    }
}
 
function verInfoMovimentacao(id) { 
    window.location.href = `movimentacoes-info.html?id=${id}`; 
}
 
// ===============================
// RENDERIZAÇÃO DA TABELA
// ===============================
function renderizarTabela(lista) {
    if (!tbody) return;
 
    if (!lista || lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4 text-muted">
                    Nenhuma movimentação encontrada
                </td>
            </tr>
        `;
        return;
    }
 
    tbody.innerHTML = lista.map(mov => `
        <tr style="border-bottom: 1px solid #f1f1f1;">
            <td>${mov.id}</td>
            <td style="color: #1D4587; font-weight: 500;">
                Equipamento #${mov.equipamento_id}
            </td>
            <td>Setor Origem: ${mov.setor_origem_nome ?? mov.setor_origem_id} ➔ Destino: ${mov.setor_destino_nome ?? mov.setor_destino_id}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary" onclick="verInfoMovimentacao(${mov.id})">
                    <i class="bi bi-info-circle"></i> Detalhes
                </button>
            </td>
        </tr>
    `).join("");
}
 