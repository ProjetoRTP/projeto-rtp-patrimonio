const API_BASE_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
    // 1. VERIFICAÇÃO DE SEGURANÇA
    const token = sessionStorage.getItem('token_procape');
    if (!token) {
        alert("Acesso negado. Por favor, inicie sessão.");
        window.location.href = '../index.html';
        return;
    }

    // 2. OBTER ID DO SETOR A PARTIR DA URL
    const params = new URLSearchParams(window.location.search);
    const setorId = params.get('id');

    if (!setorId) {
        mostrarErro('ID do setor não fornecido na URL.');
        return;
    }

    // 3. CARREGAR OS DADOS DO SETOR
    async function carregarSetor() {
        try {
            const resposta = await fetch(`${API_BASE_URL}/sectors/${setorId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!resposta.ok) {
                throw new Error('Erro ao buscar setor. Status: ' + resposta.status);
            }

            const setor = await resposta.json();

            // Preencher os campos do formulário
            document.getElementById('setor-id').value = setor.id;
            document.getElementById('setor-nome').value = setor.nome;
            document.getElementById('setor-descricao').value = setor.descricao || '';
            document.getElementById('setor-status').value = setor.ativo ? 'Ativo' : 'Inativo';

            // Atualizar link do botão editar
            document.getElementById('btn-editar').href = `cadastro-setor.html?id=${setor.id}`;

            // Mostrar conteúdo e esconder carregamento
            document.getElementById('carregando').style.display = 'none';
            document.getElementById('conteudo').style.display = 'block';

        } catch (erro) {
            console.error('Erro:', erro);
            mostrarErro('Não foi possível carregar as informações do setor.');
        }
    }

    // 4. FUNÇÃO PARA MOSTRAR ERRO
    function mostrarErro(mensagem) {
        document.getElementById('carregando').style.display = 'none';
        document.getElementById('conteudo').style.display = 'none';
        document.getElementById('erro').textContent = mensagem;
        document.getElementById('erro').style.display = 'block';
    }

    // Carregar dados do setor
    carregarSetor();
});
