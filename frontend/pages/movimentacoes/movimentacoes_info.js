// movimentacoes-info.js
const API_BASE_URL = 'http://localhost:5000/movements';

document.addEventListener('DOMContentLoaded', async () => {

    // 1. VERIFICAÇÃO DE SEGURANÇA E PARÂMETROS
    const token = sessionStorage.getItem('token_procape');
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const divCarregando = document.getElementById('carregando');
    const divConteudo  = document.getElementById('conteudo');
    const divErro      = document.getElementById('erro');

    if (!token) {
        window.location.href = '../../index.html';
        return;
    }

    if (!id) {
        exibirErro("ID da movimentação não fornecido.");
        return;
    }

    // Campos do formulário
    const inputId            = document.getElementById('movimentacao-id');
    const inputData          = document.getElementById('dataTransferencia');
    const inputEquipamento   = document.getElementById('equipamento');
    const inputSetorOrigem   = document.getElementById('setorOrigem');
    const inputSetorDestino  = document.getElementById('setorDestino');
    const inputObservacao    = document.getElementById('observacao');

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
            const mov = await resposta.json();

            // 3. PREENCHE OS CAMPOS
            if (inputId)           inputId.value           = String(mov.id).padStart(7, '0');
            if (inputData)         inputData.value         = mov.data_movimentacao?.split('T')[0] ?? '';
            if (inputEquipamento)  inputEquipamento.value  = mov.equipamento_id   ?? '';
            if (inputSetorOrigem)  inputSetorOrigem.value  = mov.setor_origem_nome  ?? '';
            if (inputSetorDestino) inputSetorDestino.value = mov.setor_destino_nome ?? '';
            if (inputObservacao)   inputObservacao.value   = mov.observacao       ?? '';

            // 4. ALTERAÇÃO VISUAL: Troca de d-none
            divCarregando.classList.add('d-none');
            divConteudo.classList.remove('d-none');

        } else {
            const erroDados = await resposta.json();
            exibirErro(erroDados.error || "Erro ao carregar informações da movimentação.");
        }

    } catch (erro) {
        console.error("Erro na requisição:", erro);
        exibirErro("Não foi possível conectar ao servidor.");
    }
    function exibirErro(mensagem) {
        // Esconde o loading e mostra o erro usando classes do Bootstrap
        if (divCarregando) divCarregando.classList.add('d-none');
        if (divErro) {
            divErro.innerText = mensagem;
            divErro.classList.remove('d-none');
        }

    }
});