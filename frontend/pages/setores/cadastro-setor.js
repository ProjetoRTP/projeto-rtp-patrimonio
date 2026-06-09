const API_BASE_URL = 'http://localhost:5000/sectors';

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. VERIFICAÇÃO DE SEGURANÇA
    const token = sessionStorage.getItem('token_procape');
    if (!token) {
        alert("Acesso negado. Por favor, faça o login.");
        window.location.href = '../../index.html';
        return; 
    }

    // 2. DETECTAR SE É EDIÇÃO (Busca ID na URL)
    const params = new URLSearchParams(window.location.search);
    const sectorId = params.get('id'); 
    
    const formCadastro = document.getElementById('form-cadastro-setor');
    const btnSalvar = document.getElementById('btn-salvar-setor');
    const tituloPagina = document.querySelector('h2');
    const inputNome = document.getElementById('inp-nome-setor');
    const inputDescricao = document.getElementById('inp-descricao-setor');

    // Se houver ID, entramos no modo EDIÇÃO
    if (sectorId) {
        if (tituloPagina) tituloPagina.innerText = 'Editar Setor';
        if (btnSalvar) btnSalvar.innerText = 'Atualizar';
        
        document.getElementById("delete-btn").classList.remove("d-none")
        try {
            const resposta = await fetch(`${API_BASE_URL}/${sectorId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (resposta.ok) {
                const setor = await resposta.json();
                inputNome.value = setor.nome || '';
                // Preenche a descrição se o seu backend retornar esse campo
                inputDescricao.value = setor.descricao || '';
            }
        } catch (erro) {
            console.error('Erro ao carregar dados para edição:', erro);
        }
    }
    
    const deletar = document.getElementById('delete-btn')
    deletar.addEventListener("click", async () =>{
        const resposta = await fetch(`${API_BASE_URL}/${sectorId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
    });

    // 3. AÇÃO DO BOTÃO CANCELAR
    const btnCancelar = document.getElementById('btn-cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            window.location.href = '../setores/setores.html';
        });
    }

    // 4. LÓGICA DE SALVAR (POST ou PUT)
    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nomeSetor = inputNome.value.trim();
            const descricaoSetor = inputDescricao.value.trim();

            const textoOriginal = btnSalvar.innerText;
            btnSalvar.innerText = 'Salvando...';
            btnSalvar.disabled = true;

            try {
                // Define se vai para /sectors (POST) ou /sectors/ID (PUT)
                const url = sectorId ? `${API_BASE_URL}/${sectorId}` : API_BASE_URL;
                const metodo = sectorId ? 'PUT' : 'POST';

                const resposta = await fetch(url, {
                    method: metodo,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nome: nomeSetor,
                        descricao: descricaoSetor // O backend precisa tratar esse campo
                    })
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    alert(sectorId ? 'Setor atualizado com sucesso!' : 'Setor cadastrado com sucesso!');
                    window.location.href = '../setores/setores.html';
                } else {
                    const msgErro = resultado.erro || resultado.msg || 'Falha na operação';
                    alert(`Erro: ${msgErro}`);
                }

            } catch (erro) {
                console.error('Erro na requisição:', erro);
                alert('Erro de conexão com o servidor. O backend está rodando?');
            } finally {
                btnSalvar.innerText = textoOriginal;
                btnSalvar.disabled = false;
            }
        });
    }
});