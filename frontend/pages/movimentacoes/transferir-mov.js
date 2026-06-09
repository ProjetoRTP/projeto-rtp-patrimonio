// transferir-mov.js
const API_BASE_URL = "http://localhost:5000";
const token = sessionStorage.getItem("token_procape");
 
if (!token) {
    alert("Faça login primeiro.");
    window.location.href = "../../index.html";
}
 
// Mapas para resolver nome → ID na hora de enviar
let mapaEquipamentos = {}; // { "num_patrimonio": id }
let mapaSetores = {};      // { "nome do setor": id }
 
document.addEventListener("DOMContentLoaded", () => {
    carregarEquipamentos();
    carregarSetores();
 
    document.getElementById("btCancelar").addEventListener("click", () => {
        window.location.href = "../movimentacoes/movimentacoes.html";
    });
 
    configurarBotaoSalvar();
    configurarAutoPreenchimentoOrigem();
});
 
 
/* ─── Carregar Equipamentos (Todos os Tipos) ──────────────── */
async function carregarEquipamentos() {
    try {
        const endpoints = ["/computers", "/printer", "/peripherals", "/generics"];
        
        const promessas = endpoints.map(url => 
            fetch(`${API_BASE_URL}${url}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.ok ? res.json() : [])
            .catch(err => {
                console.warn(`Falha ao carregar ${url}:`, err);
                return [];
            })
        );
 
        const resultados = await Promise.all(promessas);
        const todosEquipamentos = resultados.flat();
        
        const datalist = document.getElementById("lista-equipamentos");
        if (!datalist) return;
 
        datalist.innerHTML = "";
        mapaEquipamentos = {};
 
        todosEquipamentos
            .filter(eq => eq.status?.toLowerCase() !== "inativo") // Filtra inativos
            .forEach(eq => {
                if (eq.num_patrimonio) {
                    mapaEquipamentos[eq.num_patrimonio] = eq;
                    const option = document.createElement("option");
                    option.value = eq.num_patrimonio;
                    option.label = eq.tipo ? eq.tipo.toUpperCase() : "";
                    datalist.appendChild(option);
                }
            });
        console.log(`Carregados ${Object.keys(mapaEquipamentos).length} equipamentos ativos para transferência.`);
 
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
 
        const equipObj         = mapaEquipamentos[equipamentoTexto];
        const equipamento_id   = equipObj ? equipObj.id : null;
        const setor_origem_id  = mapaSetores[setorOrigemTexto] ?? null;
        const setor_destino_id = mapaSetores[setorDestinoTexto] ?? null;
 
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
                window.location.href = "../movimentacoes/movimentacoes.html";
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
 
/* ─── Auto-preenchimento da Origem ────────────────────── */
function configurarAutoPreenchimentoOrigem() {
    const inputEquip = document.getElementById("equipamento");
    const inputOrigem = document.getElementById("setorOrigem");
 
    if (!inputEquip || !inputOrigem) return;
 
    inputEquip.addEventListener("input", () => {
        const val = inputEquip.value.trim();
        const equip = mapaEquipamentos[val];
 
        if (equip && equip.setor_nome) {
            inputOrigem.value = equip.setor_nome;
            inputOrigem.readOnly = true;
            inputOrigem.style.backgroundColor = "#f8f9fa";
        } else {
            inputOrigem.value = "";
            inputOrigem.readOnly = false;
            inputOrigem.style.backgroundColor = "";
        }
    });
}