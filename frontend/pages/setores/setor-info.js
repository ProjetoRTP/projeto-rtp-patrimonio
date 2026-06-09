const API_BASE_URL = 'http://localhost:5000/sectors';

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. VERIFICAÇÃO DE SEGURANÇA E PARÂMETROS
    const token = sessionStorage.getItem('token_procape');
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!token) {
        window.location.href = '../../index.html';
        return;
    }

    if (!id) {
        exibirErro("ID do setor não fornecido.");
        return;
    }

    // Elementos da interface
    const divCarregando = document.getElementById('carregando');
    const divConteudo = document.getElementById('conteudo');
    const divErro = document.getElementById('erro');
    
    // Campos do formulário
    const inputId = document.getElementById('setor-id');
    const inputNome = document.getElementById('setor-nome');
    const inputDescricao = document.getElementById('setor-descricao');
    const inputStatus = document.getElementById('setor-status');
    const btnEditar = document.getElementById('btn-editar');

    try {
        // 2. BUSCA OS DADOS NO BACKEND
        const resposta = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (resposta.ok) {
            const setor = await resposta.json();

            // 3. PREENCHE OS CAMPOS
            inputId.value = setor.id;
            inputNome.value = setor.nome;
            inputDescricao.value = setor.descricao || "Sem descrição disponível.";
            
            // Lógica de status (baseada em soft delete ou campo ativo)
            inputStatus.value = setor.ativo === false ? "Inativo" : "Ativo";

            // Atualiza o link do botão editar com o ID correto
            btnEditar.href = `cadastro-setor.html?id=${setor.id}`;

            // Mostra o conteúdo e esconde o loading
            divCarregando.style.display = 'none';
            divConteudo.style.display = 'block';

        } else {
            const erroDados = await resposta.json();
            exibirErro(erroDados.erro || "Erro ao carregar informações do setor.");
        }

    } catch (erro) {
        console.error("Erro na requisição:", erro);
        exibirErro("Não foi possível conectar ao servidor.");
    }

    function exibirErro(mensagem) {
        divCarregando.style.display = 'none';
        divErro.innerText = mensagem;
        divErro.style.display = 'block';
    }
});