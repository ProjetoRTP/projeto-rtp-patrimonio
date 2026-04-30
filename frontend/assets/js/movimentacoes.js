const API_BASE_URL = 'http://localhost:5000/movements';

document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token_procape');
    if (!token) {
        window.location.href = '../index.html';
        return;
    }

    /* ─── Filtros ─────────────────────────────────────────── */
    const filtroSetor  = document.getElementById('filtro-setor');
    const filtroStatus = document.getElementById('filtro-status');

    document.getElementById('btn-limpar').addEventListener('click', () => {
        filtroSetor.selectedIndex  = 0;
        filtroStatus.selectedIndex = 0;
        carregarMovimentacoes();
    });

    document.getElementById('btn-aplicar').addEventListener('click', () => {
        const setor  = filtroSetor.value;
        const status = filtroStatus.value;

        if (!setor && !status) {
            alert("Por favor, escolha pelo menos um filtro antes de aplicar!");
            return;
        }

        carregarMovimentacoes({ setor, status });
    });

    /* ─── Carregamento da tabela ──────────────────────────── */
    async function carregarMovimentacoes(filtros = {}) {
        const tbody = document.getElementById('tabela-manutencoes');
        if (!tbody) return;

        try {
            const params = new URLSearchParams();
            if (filtros.setor)  params.append('setor',  filtros.setor);
            if (filtros.status) params.append('status', filtros.status);

            const url = `${API_BASE_URL}${params.toString() ? '?' + params.toString() : ''}`;

            const resposta = await fetch(url, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resposta.ok) {
                const movimentacoes = await resposta.json();

                if (movimentacoes.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="3" class="text-center text-muted py-4">
                                Nenhuma movimentação encontrada.
                            </td>
                        </tr>`;
                    return;
                }

                tbody.innerHTML = movimentacoes.map(mov => `
                    <tr style="border-bottom: 1px solid #f1f1f1;">
                        <td style="color: #1D4587; padding: 15px 0; font-weight: 500;">
                            ${String(mov.id).padStart(7, '0')}
                        </td>
                        <td style="color: #1D4587; padding: 15px 0; text-align: center; font-weight: 500;">
                            ${mov.descricao || `Equipamento #${mov.equipamento_id}`}
                        </td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-outline-danger" onclick="verInfoMovimentacao(${mov.id})">
                                <i class="bi bi-info-circle"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }

        } catch (erro) {
            console.error('Erro ao carregar movimentações:', erro);
        }
    }

    carregarMovimentacoes();
});

function verInfoMovimentacao(id) { window.location.href = `movimentacoes-info.html?id=${id}`; }