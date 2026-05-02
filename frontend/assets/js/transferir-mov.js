// transferir-mov.js
const API_BASE_URL = "http://localhost:5000";
const token = sessionStorage.getItem("token_procape");

if (!token) {
    alert("Faça login primeiro.");
    window.location.href = "../index.html";
}

// Mapas para resolver nome → ID na hora de enviar
let mapaEquipamentos = {}; // { "num_patrimonio": id }
let mapaSetores = {};      // { "nome do setor": id }

document.addEventListener("DOMContentLoaded", () => {
    carregarEquipamentos();
    carregarSetores();

    document.getElementById("btCancelar").addEventListener("click", () => {
        window.location.href = "movimentacoes.html";
    });

    configurarBotaoSalvar();
});


/* ─── Carregar Equipamentos ───────────────────────────── */
async function carregarEquipamentos() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/computers`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const dados = await resposta.json();
        const datalist = document.getElementById("lista-equipamentos");

        if (!datalist) return;

        // Limpa e preenche o datalist com o num_patrimonio como texto visível
        datalist.innerHTML = "";
        dados.forEach(eq => {
            mapaEquipamentos[eq.num_patrimonio] = eq.id;
            const option = document.createElement("option");
            option.value = eq.num_patrimonio;
            datalist.appendChild(option);
        });

    } catch (erro) {
        console.error("Erro ao carregar equipamentos:", erro);
    }
}


/* ─── Carregar Setores (preenche origem E destino) ────── */
async function carregarSetores() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/sectors`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const dados = await resposta.json();
        const datalistOrigem = document.getElementById("lista-setores-origem");
        const datalistDestino = document.getElementById("lista-setores-destino");

        if (!datalistOrigem || !datalistDestino) return;

        datalistOrigem.innerHTML = "";
        datalistDestino.innerHTML = "";

        dados.forEach(setor => {
            mapaSetores[setor.nome] = setor.id;

            const optOrigem = document.createElement("option");
            optOrigem.value = setor.nome;
            datalistOrigem.appendChild(optOrigem);

            const optDestino = document.createElement("option");
            optDestino.value = setor.nome;
            datalistDestino.appendChild(optDestino);
        });

    } catch (erro) {
        console.error("Erro ao carregar setores:", erro);
    }
}


/* ─── Botão Salvar ────────────────────────────────────── */
function configurarBotaoSalvar() {
    const btCriar = document.getElementById("btCriar");

    if (!btCriar) {
        console.error("Botão btCriar não encontrado");
        return;
    }

    btCriar.addEventListener("click", async (event) => {
        event.preventDefault();

        const equipamentoTexto   = document.getElementById("equipamento")?.value.trim();
        const setorOrigemTexto   = document.getElementById("setorOrigem")?.value.trim();
        const setorDestinoTexto  = document.getElementById("setorDestino")?.value.trim();
        const observacao         = document.getElementById("observacao")?.value || "";

        // Resolve os IDs a partir do texto digitado
        const equipamento_id   = mapaEquipamentos[equipamentoTexto] ?? null;
        const setor_origem_id  = mapaSetores[setorOrigemTexto] ?? null;
        const setor_destino_id = mapaSetores[setorDestinoTexto] ?? null;

        // Validações
        if (!equipamento_id) {
            alert("Equipamento não encontrado. Selecione um da lista.");
            return;
        }

        if (!setor_destino_id) {
            alert("Setor de destino não encontrado. Selecione um da lista.");
            return;
        }

        const dados = {
            equipamento_id,
            setor_origem_id,
            setor_destino_id,
            observacao
        };

        const btCriarBtn = document.getElementById("btCriar");
        const textoOriginal = btCriarBtn.innerText;
        btCriarBtn.innerText = "Salvando...";
        btCriarBtn.disabled = true;

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
        } finally {
            btCriarBtn.innerText = textoOriginal;
            btCriarBtn.disabled = false;
        }
    });
}