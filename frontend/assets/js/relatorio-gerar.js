// relatorio-gerar.js
const API_BASE_URL = "http://localhost:5000";
let token;

document.addEventListener("DOMContentLoaded", () => {
    token = sessionStorage.getItem("token_procape");

    if (!token) {
        alert("Acesso negado. Por favor, faça o login.");
        window.location.href = "../index.html";
        return;
    }

    const perfil = sessionStorage.getItem("usuario_perfil");
    if (perfil === "gerente") {
        alert("Acesso negado. Gerentes não podem gerar novos relatórios.");
        window.location.href = "relatorios.html";
        return;
    }

    carregarSetores();
    configurarPeriodo();

    document.getElementById("btCancelar").addEventListener("click", () => {
        window.location.href = "relatorios.html";
    });

    document.getElementById("form-relatorio").addEventListener("submit", (e) => {
        e.preventDefault();
        gerarRelatorio();
    });
});

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

async function gerarRelatorio() {
    const tipo    = document.getElementById("tipo-relatorio").value;
    const periodo = document.getElementById("periodo").value;
    const setor   = document.getElementById("filtro-setor").value;
    const equip   = document.getElementById("filtro-equipamento").value.trim();

    if (!tipo)    { alert("Selecione o tipo de relatório."); return; }
    if (!periodo) { alert("Selecione o período."); return; }

    const datas = calcularDatas(periodo);
    if (!datas) return;

    const btGerar = document.getElementById("btGerar");
    btGerar.disabled  = true;
    btGerar.innerText = "Gerando...";

    try {
        const payload = {
            tipo,
            periodo,
            data_inicio: datas.dataInicio,
            data_fim:    datas.dataFim,
        };

        if (setor) payload.setor_id    = parseInt(setor);
        if (equip) payload.equipamento = equip;

        const resposta = await fetch(`${API_BASE_URL}/reports`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            alert(`Erro ao salvar relatório: ${erro.erro || "Falha no servidor"}`);
            return;
        }

        const resultado = await resposta.json();

        const params = new URLSearchParams({
            id:         resultado.id,
            tipo,
            dataInicio: datas.dataInicio,
            dataFim:    datas.dataFim,
        });

        if (setor) params.append("setor", setor);
        if (equip) params.append("equipamento", equip);

        window.location.href = `relatorio-info.html?${params.toString()}`;

    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao conectar com o servidor.");
    } finally {
        btGerar.disabled  = false;
        btGerar.innerText = "Gerar";
    }
}