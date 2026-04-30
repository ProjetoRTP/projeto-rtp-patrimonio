// transferir-mov.js
const API_BASE_URL = "http://localhost:5000/movement";
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

        if (!lista) return;

        lista.innerHTML = dados.map(eq =>
            `<option value="${eq.id}">${eq.num_patrimonio}</option>`
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

        if (!lista) return;

        lista.innerHTML = dados.map(col =>
            `<option value="${col.id}">${col.nome}</option>`
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
        const lista = document.getElementById("lista-setores");

        if (!lista) return;

        lista.innerHTML = dados.map(setor =>
            `<option value="${setor.id}">${setor.nome}</option>`
        ).join('');

    } catch (erro) {
        console.error("Erro ao carregar setores:", erro);
    }
}

/* ─── Botão Salvar ────────────────────────────────────── */
function configurarBotaoSalvar() {
    const btCriar = document.getElementById('btCriar');

    if (!btCriar) {
        console.error("Botão btCriar não encontrado");
        return;
    }

    btCriar.addEventListener('click', async (event) => {
        event.preventDefault();

        const equipamento_id    = document.getElementById("equipamento")?.value;
        const colaborador_id    = document.getElementById("colaborador")?.value;
        const setor_origem_id   = document.getElementById("setorOrigem")?.value;
        const setor_destino_id  = document.getElementById("setorDestino")?.value;
        const observacao        = document.getElementById("observacao")?.value || "";

        console.log({
            equipamento_id,
            colaborador_id,
            setor_origem_id,
            setor_destino_id
        });

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