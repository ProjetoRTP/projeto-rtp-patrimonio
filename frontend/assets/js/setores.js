const API_BASE_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {

    // 1. VERIFICAÇÃO DE SEGURANÇA
    const token = sessionStorage.getItem('token_procape');
    if (!token) {
        alert("Acesso negado. Por favor, inicie sessão.");
        window.location.href = '../index.html';
        return;
    }

    // 2. FUNÇÃO PARA CARREGAR OS DADOS NOS DROPDOWNS (COMENTADA - filtro desativado)
    /* async function carregarFiltros() {
        try {
            // Carregar setores
            const resposta = await fetch(`${API_BASE_URL}/sectors`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resposta.ok) {
                const setores = await resposta.json();
                const selectSetor = document.getElementById('filtro-setor');
                
                setores.forEach(setor => {
                    const option = document.createElement('option');
                    option.value = setor.id;
                    option.textContent = setor.nome;
                    selectSetor.appendChild(option);
                });
            }
        } catch (erro) {
            console.error('Erro ao carregar filtros:', erro);
        }
    } */

    // 3. FUNÇÃO PARA CARREGAR A TABELA DE SETORES
    async function carregarSetores(filtros = '') {
        const tbody = document.getElementById('tbody-setores');
        tbody.innerHTML = '<tr><td colspan="2" class="text-center py-4 text-muted">A carregar setores...</td></tr>';

        try {
            const resposta = await fetch(`${API_BASE_URL}/sectors${filtros}`, {
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

    // 4. LÓGICA DA BARRA DE FILTROS (COMENTADA - filtro desativado)
    /* const formFiltros = document.getElementById('form-filtros');
    const btnLimpar = document.getElementById('btn-limpar-filtros');

    if (formFiltros) {
        formFiltros.addEventListener('submit', (e) => {
            e.preventDefault();

            // Captura o que o utilizador escolheu nos dropdowns
            const setor = document.getElementById('filtro-setor').value;

            // Monta os parâmetros para enviar ao back-end
            let queryParams = [];
            if (setor) queryParams.push(`setor_id=${setor}`);

            const stringFiltro = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

            // Recarrega a tabela aplicando os filtros
            carregarSetores(stringFiltro);
        });
    }

    // Ação do botão "Limpar"
    if (btnLimpar) {
        btnLimpar.addEventListener('click', () => {
            document.getElementById('filtro-setor').value = '';

            // Recarrega a tabela sem filtros
            carregarSetores('');
        });
    }

    // Carrega os dados dos filtros e a tabela inicialmente
    carregarFiltros();
    carregarSetores(''); */
    
    // Carrega apenas a tabela (sem filtros)
    carregarSetores('');
});

function editarSetor(id) {
    window.location.href = `cadastro-setor.html?id=${id}`;
}

function verInfoSetor(id) {
    window.location.href = `setor-info.html?id=${id}`;
}