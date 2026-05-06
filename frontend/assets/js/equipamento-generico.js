// equipamento-generico.js
const API_BASE = "http://localhost:5000";
let token;

document.addEventListener("DOMContentLoaded", () => {
    token = sessionStorage.getItem("token_procape");

    if (!token) {
        alert("Acesso negado. Por favor, inicie sessão.");
        window.location.href = "../index.html";
        return;
    }

    configurarFormulario();
});

// ===============================
// CONFIGURAR FORMULÁRIO
// ===============================
function configurarFormulario() {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await criarTipo();
    });
}

// ===============================
// CRIAR TIPO DE EQUIPAMENTO
// ===============================
async function criarTipo() {
    const nome      = document.getElementById("inp-nome").value.trim();
    const descricao = document.getElementById("inp-descricao").value.trim();

    if (!nome) {
        alert("Preencha o nome do tipo de equipamento.");
        return;
    }

    const btnSubmit = document.getElementById("btnSubmit");
    const textoOriginal = btnSubmit.innerText;
    btnSubmit.innerText = "Salvando...";
    btnSubmit.disabled = true;

    try {
        const resposta = await fetch(`${API_BASE}/generics/types`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ nome, descricao })
        });

        if (resposta.ok) {
            alert("Tipo de equipamento criado com sucesso!");
            window.location.href = "equipamentos.html";
        } else {
            const erro = await resposta.json();
            alert(`Erro: ${erro.erro || erro.error || "Falha ao criar tipo."}`);
        }

    } catch (erro) {
        console.error("Erro ao criar tipo:", erro);
        alert("Erro ao conectar com o servidor.");
    } finally {
        btnSubmit.innerText = textoOriginal;
        btnSubmit.disabled = false;
    }
}