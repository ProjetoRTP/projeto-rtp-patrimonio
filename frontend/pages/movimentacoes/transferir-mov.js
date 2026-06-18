// transferir-mov.js
const API_BASE_URL = "http://localhost:5000";
const token = sessionStorage.getItem("token_procape");
 
if (!token) {
    alert("Faça login primeiro.");
    window.location.href = "../../index.html";
}
 
// Mapa para resolver código lido → objeto do equipamento (preenchido dinamicamente)
let mapaEquipamentos = {}; // { "codigo_barras": { id, tipo, setor_nome, ... } }
let mapaSetores = {};      // { "nome do setor": id }
 
document.addEventListener("DOMContentLoaded", () => {
    carregarSetores();
    configurarLeituraBarcode();
 
    document.getElementById("btCancelar").addEventListener("click", () => {
        window.location.href = "../movimentacoes/movimentacoes.html";
    });
 
    configurarBotaoSalvar();
});
 
 
/* ─── Leitura de Código de Barras ─────────────────────── */
function configurarLeituraBarcode() {
    const inputEquip = document.getElementById("equipamento");
    const inputOrigem = document.getElementById("setorOrigem");
    const feedback = document.getElementById("equip-feedback");
 
    if (!inputEquip) return;
 
    inputEquip.addEventListener("keydown", async (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
 
        const codigo = inputEquip.value.trim();
        if (!codigo) return;
 
        feedback.textContent = "Buscando...";
        feedback.style.color = "gray";
 
        // Limpa estado anterior
        mapaEquipamentos = {};
        inputOrigem.value = "";
        inputOrigem.readOnly = false;
        inputOrigem.style.backgroundColor = "";
 
        try {
            const res = await fetch(`${API_BASE_URL}/barcode/${encodeURIComponent(codigo)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
 
            if (res.status === 401) {
                window.location.href = "../../index.html";
                return;
            }
 
            if (!res.ok) {
                feedback.textContent = "❌ Equipamento não encontrado.";
                feedback.style.color = "#B44848";
                return;
            }
 
            const json = await res.json();
            const equip = json.data || json;
 
            // Salva no mapa — chave é o código digitado pelo leitor
            mapaEquipamentos[codigo] = equip;
 
            feedback.textContent = `✓ ${equip.tipo?.toUpperCase() || "Equipamento"} — Patrimônio ${equip.num_patrimonio}`;
            feedback.style.color = "green";
 
            // Auto-preenche setor de origem
            if (equip.setor_nome) {
                inputOrigem.value = equip.setor_nome;
                inputOrigem.readOnly = true;
                inputOrigem.style.backgroundColor = "#f8f9fa";
            }
 
        } catch (err) {
            console.error("Erro ao buscar equipamento pelo código de barras:", err);
            feedback.textContent = "❌ Erro ao conectar com o servidor.";
            feedback.style.color = "#B44848";
        }
    });
        // Dispara a busca também quando o campo perde o foco
        inputEquip.addEventListener("blur", async () => {
            const codigo = inputEquip.value.trim();
        if (!codigo || mapaEquipamentos[codigo]) return; 
        // Simula o mesmo comportamento do Enter
        inputEquip.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        });
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
 
        const equipamentoTexto  = document.getElementById("equipamento")?.value.trim();
        const setorOrigemTexto  = document.getElementById("setorOrigem")?.value.trim();
        const setorDestinoTexto = document.getElementById("setorDestino")?.value.trim();
        const observacao        = document.getElementById("observacao")?.value || "";
 
        const equipObj         = mapaEquipamentos[equipamentoTexto];
        const equipamento_id   = equipObj ? equipObj.id : null;
        const setor_origem_id  = mapaSetores[setorOrigemTexto] ?? null;
        const setor_destino_id = mapaSetores[setorDestinoTexto] ?? null;
 
        if (!equipamento_id) {
            alert("Nenhum equipamento carregado. Aponte o leitor para o código de barras e aguarde a confirmação.");
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
 
        btCriar.innerText = "Salvando...";
        btCriar.disabled = true;
 
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
                window.location.href = "../movimentacoes/movimentacoes.html";
            } else {
                const erro = await resposta.json();
                alert(`Erro: ${erro.error || "Não foi possível salvar a movimentação."}`);
            }
 
        } catch (erro) {
            console.error("Erro:", erro);
            alert("Erro ao conectar com o servidor.");
        } finally {
            btCriar.innerText = "Transferir";
            btCriar.disabled = false;
        }
    });
}