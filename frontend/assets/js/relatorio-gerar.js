// gerar-relatorio.js
const API_BASE_URL = "http://localhost:5000";
const token = sessionStorage.getItem("token_procape");

if (!token) {
    alert("Acesso negado. Por favor, faça o login.");
    window.location.href = "../index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    carregarSetores();
    configurarPeriodo();

    document.getElementById("btCancelar").addEventListener("click", () => {
        window.location.href = "relatorios.html";
    });

    document.getElementById("form-relatorio").addEventListener("submit", async (e) => {
        e.preventDefault();
        await gerarRelatorio();
    });
});

// ===============================
// MOSTRA/ESCONDE DATAS PERSONALIZADAS
// ===============================
function configurarPeriodo() {
    const selectPeriodo = document.getElementById("periodo");
    const camposPersonalizados = document.getElementById("campos-data-personalizada");

    selectPeriodo.addEventListener("change", () => {
        if (selectPeriodo.value === "personalizado") {
            camposPersonalizados.classList.remove("d-none");
        } else {
            camposPersonalizados.classList.add("d-none");
        }
    });
}

// ===============================
// CARREGAR SETORES
// ===============================
async function carregarSetores() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/sectors`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!resposta.ok) return;

        const setores = await resposta.json();
        const select = document.getElementById("filtro-setor");

        setores.forEach(setor => {
            const option = document.createElement("option");
            option.value = setor.id;
            option.textContent = setor.nome;
            select.appendChild(option);
        });

    } catch (erro) {
        console.error("Erro ao carregar setores:", erro);
    }
}

// ===============================
// CALCULAR DATAS DO PERÍODO
// ===============================
function calcularDatas(periodo) {
    const hoje = new Date();
    let dataInicio, dataFim;

    dataFim = hoje.toISOString().split("T")[0];

    if (periodo === "hoje") {
        dataInicio = dataFim;

    } else if (periodo === "semana") {
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        dataInicio = inicioSemana.toISOString().split("T")[0];

    } else if (periodo === "mes") {
        dataInicio = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-01`;

    } else if (periodo === "personalizado") {
        dataInicio = document.getElementById("data-inicio").value;
        dataFim    = document.getElementById("data-fim").value;

        if (!dataInicio || !dataFim) {
            alert("Preencha as datas de início e fim.");
            return null;
        }

        if (dataInicio > dataFim) {
            alert("A data de início não pode ser maior que a data fim.");
            return null;
        }
    }

    return { dataInicio, dataFim };
}

// ===============================
// GERAR RELATÓRIO
// ===============================
async function gerarRelatorio() {
    const tipo    = document.getElementById("tipo-relatorio").value;
    const periodo = document.getElementById("periodo").value;
    const setor   = document.getElementById("filtro-setor").value;
    const equip   = document.getElementById("filtro-equipamento").value.trim();

    if (!tipo) {
        alert("Selecione o tipo de relatório.");
        return;
    }

    if (!periodo) {
        alert("Selecione o período.");
        return;
    }

    const datas = calcularDatas(periodo);
    if (!datas) return;

    // Monta os parâmetros e redireciona para a página de resultado
    const params = new URLSearchParams({
        tipo,
        dataInicio: datas.dataInicio,
        dataFim:    datas.dataFim,
    });

    if (setor)  params.append("setor", setor);
    if (equip)  params.append("equipamento", equip);

    window.location.href = `relatorio-resultado.html?${params.toString()}`;
}