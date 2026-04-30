// transferir-mov.js
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

/* ─── Carregar Equipamentos ───────────────────────────── */
async function carregarEquipamentos() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/equipments`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const dados = await resposta.json();

        const lista = document.getElementById("lista-equipamentos");
        lista.innerHTML = dados.map(eq =>
            `<option value="${eq.id}" data-nome="${eq.num_patrimonio}">${eq.num_patrimonio}</option>`
        ).join('');

    } catch (erro) {
        console.error("Erro ao carregar equipamentos:", erro);
    }
}

/* ─── Carregar Colaboradores ──────────────────────────── */
async function carregarColaboradores() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/collaborators`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const dados = await resposta.json();

        const lista = document.getElementById("lista-colaboradores");
        lista.innerHTML = dados.map(col =>
            `<option value="${col.id}" data-nome="${col.nome}">${col.nome}</option>`
        ).join('');

    } catch (erro) {
        console.error("Erro ao carregar colaboradores:", erro);
    }
}

/* ─── Carregar Setores ────────────────────────────────── */
async function carregarSetores() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/sectors`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const dados = await resposta.json();

        const listaOrigem  = document.getElementById("lista-setores-origem");
        const listaDestino = document.getElementById("lista-setores-destino");

        const options = dados.map(setor =>
            `<option value="${setor.id}">${setor.nome}</option>`
        ).join('');

        if (listaOrigem)  listaOrigem.innerHTML  = options;
        if (listaDestino) listaDestino.innerHTML = options;

    } catch (erro) {
        console.error("Erro ao carregar setores:", erro);
    }
}

/* ─── Botão Salvar ────────────────────────────────────── */
function configurarBotaoSalvar() {
    const btCriar = document.getElementById('btCriar');

    btCriar.addEventListener('click', async (event) => {
        event.preventDefault();

        const equipamento_id    = document.getElementById("equipamento").value;
        const colaborador_id    = document.getElementById("colaborador").value;
        const setor_origem_id   = document.getElementById("setor-origem").value;
        const setor_destino_id  = document.getElementById("setor-destino").value;
        const observacao        = document.getElementById("observacao")?.value || "";

        if (!equipamento_id) {
            alert("Selecione um equipamento.");
            return;
        }

        if (!setor_destino_id) {
            alert("Selecione o setor de destino.");
            return;
        }

        const dados = {
            equipamento_id:   parseInt(equipamento_id),
            colaborador_id:   colaborador_id  ? parseInt(colaborador_id)   : null,
            setor_origem_id:  setor_origem_id ? parseInt(setor_origem_id)  : null,
            setor_destino_id: parseInt(setor_destino_id),
            observacao
        };

        try {
            const resposta = await fetch(`${API_BASE_URL}/movements`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(dados)
            });

            if (resposta.ok) {
                alert("Movimentação registrada com sucesso!");
                window.location.href = "movimentacoes.html";
            } else {
                const erro = await resposta.json();
                alert(`Erro: ${erro.error || "Não foi possível salvar a movimentação."}`);
            }

        } catch (erro) {
            console.error("Erro:", erro);
            alert("Erro ao conectar com o servidor.");
        }
    });
}
