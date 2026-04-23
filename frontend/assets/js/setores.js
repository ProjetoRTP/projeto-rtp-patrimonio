const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', () => {

    // 1. VERIFICAÇÃO DE SEGURANÇA
    const token = sessionStorage.getItem('token_procape');
    if (!token) {
        alert("Acesso negado. Por favor, inicie sessão.");
        window.location.href = 'index.html';
        return;
    }

    // 2. FUNÇÃO PARA CARREGAR A TABELA DE SETORES
    // A função agora aceita uma query string de filtros (ex: ?setor_id=1&equipamento_id=5)
    async function carregarSetores(filtros = '') {
        const tbody = document.getElementById('tbody-setores');
        tbody.innerHTML = '<tr><td colspan="2" class="text-center py-4 text-muted">A carregar setores...</td></tr>';

        try {
            const resposta = await fetch(`${API_BASE_URL}/setores${filtros}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resposta.ok) {
                const setores = await resposta.json();
                tbody.innerHTML = '';

                if (setores.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="2" class="text-center py-4">Nenhum setor encontrado.</td></tr>';
                    return;
                }

                setores.forEach(setor => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${setor.nome}</td>
                        <td class="text-end">
                            <button class="btn-acao btn-editar me-2" onclick="editarSetor(${setor.id})" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn-acao btn-info-red" onclick="verInfoSetor(${setor.id})" title="Informações">
                                <i class="bi bi-info-circle"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="2" class="text-center text-danger py-4">Erro ao buscar setores.</td></tr>';
            }

        } catch (erro) {
            console.error('Erro de ligação:', erro);
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-danger py-4">Não foi possível ligar ao servidor.</td></tr>';
        }
    }

    // 3. LÓGICA DA BARRA DE FILTROS
    const formFiltros = document.getElementById('form-filtros');
    const btnLimpar = document.getElementById('btn-limpar-filtros');

    if (formFiltros) {
        formFiltros.addEventListener('submit', (e) => {
            e.preventDefault();

            // Captura o que o utilizador escolheu nos dropdowns
            const setor = document.getElementById('filtro-setor').value;
            const subsetor = document.getElementById('filtro-subsetor').value;
            const equipamento = document.getElementById('filtro-equipamento').value;

            // Monta os parâmetros para enviar ao back-end
            let queryParams = [];
            if (setor) queryParams.push(`setor_id=${setor}`);
            if (subsetor) queryParams.push(`subsetor_id=${subsetor}`);
            if (equipamento) queryParams.push(`equipamento_id=${equipamento}`);

            const stringFiltro = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

            // Recarrega a tabela aplicando os filtros
            carregarSetores(stringFiltro);
        });
    }

    // Ação do botão "Limpar"
    if (btnLimpar) {
        btnLimpar.addEventListener('click', () => {
            document.getElementById('filtro-setor').value = '';
            document.getElementById('filtro-subsetor').value = '';
            document.getElementById('filtro-equipamento').value = '';

            // Recarrega a tabela sem filtros
            carregarSetores('');
        });
    }

    // Carrega a tabela inicialmente sem filtros
    carregarSetores('');
});

function editarSetor(id) {
    window.location.href = `cadastro-setor.html?id=${id}`;
}

function verInfoSetor(id) {
    alert(`A abrir informações do setor ID: ${id}`);
}