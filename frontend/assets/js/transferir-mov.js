const API_BASE_URL = "http://localhost:5000";
const token = sessionStorage.getItem("token_procape");

if (!token) {
    alert("Faça login primeiro.");
    window.location.href = "../index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    carregarEquipamentos();
    carregarColaboradores();
    carregarSetores();

    configurarBotaoSalvar();
});


// CARREGAR EQUIPAMENTOS - Quando começa a digitar

async function carregarEquipamentos() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/equipments`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const dados = await resposta.json();

        const lista = document.getElementById("lista-equipamentos");
        lista.innerHTML = "";

        dados.forEach(eq => {
            lista.innerHTML += `<option value="${eq.nome}">`;
        });

    } catch (erro) {
        console.error("Erro ao carregar equipamentos:", erro);
    }
}


// CARREGAR COLABORADORES  - Quando começa a digitar

async function carregarColaboradores() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/collaborators`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const dados = await resposta.json();

        const lista = document.getElementById("lista-colaboradores");
        lista.innerHTML = "";

        dados.forEach(col => {
            lista.innerHTML += `<option value="${col.nome}">`;
        });

    } catch (erro) {
        console.error("Erro ao carregar colaboradores:", erro);
    }
}



// CARREGAR SETORES - Quando começa a digitar

async function carregarSetores() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/sectors`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const dados = await resposta.json();

        const lista = document.getElementById("lista-setores");
        lista.innerHTML = "";

        dados.forEach(setor => {
            lista.innerHTML += `<option value="${setor.nome}">`;
        });

    } catch (erro) {
        console.error("Erro ao carregar setores:", erro);
    }
}






// BOTÃO SALVAR

function configurarBotaoSalvar() {
    const btCriar = document.getElementById('btCriar');

    btCriar.addEventListener('click', async (event) => {
        event.preventDefault();

        // Pegando dados do formulário
        const equipamento = document.getElementById("equipamento").value;
        const colaborador = document.getElementById("colaborador").value;
        const setor = document.getElementById("setor").value;
        const tipo = document.getElementById("tipo").value;

        const dados = {
            equipamento,
            colaborador,
            setor,
            tipo
        };

        try {
            const resposta = await fetch(`${API_BASE_URL}/maintenances`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(dados)
            });

            if (resposta.ok) {
                alert("Movimentação salva com sucesso!");
                window.location.href = "movimentacoes-certa.html";
            } else {
                alert("Erro ao salvar movimentação");
            }

        } catch (erro) {
            console.error("Erro:", erro);
            alert("Erro ao conectar com o servidor");
        }
    });
}

