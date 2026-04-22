// URL base da API
const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. VERIFICAÇÃO DE SEGURANÇA
    const token = sessionStorage.getItem('token_procape');
    if (!token) {
        alert("Acesso negado. Por favor, faça o login.");
        window.location.href = 'index.html';
        return; 
    }

    // 2. FUNÇÃO PARA CARREGAR OS SETORES
    async function carregarSetores() {
        const tbody = document.getElementById('tbody-setores');
        
        try {
            // Faz a requisição GET para o back-end (Rota: /api/setores)
            const resposta = await fetch(`${API_BASE_URL}/setores`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (resposta.ok) {
                const setores = await resposta.json();
                tbody.innerHTML = ''; // Limpa a mensagem de "Carregando..."

                // Se não houver setores cadastrados
                if (setores.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="2" class="text-center py-4">Nenhum setor cadastrado ainda.</td></tr>';
                    return;
                }

                // Cria uma linha na tabela para cada setor recebido do banco
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
            console.error('Erro de conexão:', erro);
            // Mensagem amigável caso o back-end esteja desligado enquanto vocês desenvolvem
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-danger py-4">Não foi possível conectar ao servidor. Verifique o Back-end.</td></tr>';
        }
    }

    // Executa a função ao abrir a tela
    carregarSetores();
});

// Funções vazias para preparar os botões de ação
function editarSetor(id) {
    // Redireciona para a tela de edição passando o ID na URL
    window.location.href = `cadastro-setor.html?id=${id}`;
}

function verInfoSetor(id) {
    alert(`Abrindo modal de informações do setor ID: ${id}`);
}