// URL base da API
const API_BASE_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. VERIFICAÇÃO DE SEGURANÇA
       const token = sessionStorage.getItem('token_procape');
       if (!token) {
           alert("Acesso negado. Por favor, faça o login.");
         window.location.href = 'index.html';
         return; 
     }

    // 2. AÇÃO DO BOTÃO CANCELAR
    const btnCancelar = document.getElementById('btn-cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            window.location.href = '../pages/setores.html'; // Volta para a listagem
        });
    }

    // 3. LÓGICA DE CADASTRO (Envio do Formulário)
    const formCadastro = document.getElementById('form-cadastro-setor');
    
    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o reload da página

            // Captura os dados dos inputs
            const nomeSetor = document.getElementById('inp-nome-setor').value.trim();
            const descricaoSetor = document.getElementById('inp-descricao-setor').value.trim();

            // Desativa o botão temporariamente
            const btnSalvar = document.getElementById('btn-salvar-setor');
            const textoOriginal = btnSalvar.innerText;
            btnSalvar.innerText = 'Salvando...';
            btnSalvar.disabled = true;

            try {
                // Requisição POST para criar o setor
                const resposta = await fetch(`${API_BASE_URL}/sectors`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nome: nomeSetor,
                        descricao: descricaoSetor
                    })
                });

                if (resposta.ok) {
                    alert('Setor cadastrado com sucesso!');
                    window.location.href = 'setores.html'; // Retorna para a lista atualizada
                } else {
                    const erro = await resposta.json();
                    alert(`Erro ao cadastrar: ${erro.mensagem || 'Falha no servidor'}`);
                }

            } catch (erro) {
                console.error('Erro:', erro);
                alert('Erro de conexão com o servidor.');
            } finally {
                // Restaura o botão caso dê erro (se for sucesso a tela vai redirecionar)
                btnSalvar.innerText = textoOriginal;
                btnSalvar.disabled = false;
            }
        });
    }
});