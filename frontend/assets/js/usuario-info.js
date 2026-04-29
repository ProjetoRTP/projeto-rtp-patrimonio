// ===============================
// CONFIGURAÇÃO
// ===============================
const API_URL = "http://localhost:5000/users";

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("token_procape");

    if (!token) {
        alert("Acesso negado. Por favor, inicie sessão.");
        window.location.href = "../index.html";
        return;
    }

    // Pega o ID da URL (?id=3)
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        alert("Usuário não identificado.");
        window.location.href = "usuario.html";
        return;
    }

    await carregarUsuario(token, id);

    // ===============================
    // BOTÃO VOLTAR
    // ===============================
    document.querySelector(".btn-cancelar").addEventListener("click", () => {
        window.location.href = "usuario.html";
    });

    // ===============================
    // BOTÃO EDITAR — corrige o href dinâmico
    // ===============================
    const btnEditar = document.querySelector(".btn-cadastrar");
    if (btnEditar) {
        btnEditar.href = `usuario-editar.html?id=${id}`; 
    }
});

// ===============================
// BUSCAR USUÁRIO (GET)
// ===============================
async function carregarUsuario(token, id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error(`Erro ${response.status}`);

        const user = await response.json();
        preencherFormulario(user);

    } catch (erro) {
        console.error("Erro ao carregar usuário:", erro);
        alert("Erro ao carregar dados do usuário.");
    }
}

// ===============================
// PREENCHER FORMULÁRIO
// ===============================
function preencherFormulario(user) {
    document.getElementById("nome").value          = user.nome          || "";
    document.getElementById("cpf").value           = user.cpf           || "";
    document.getElementById("email").value         = user.email         || "";
    document.getElementById("dataNascimento").value = user.data_nascimento || ""; 
    document.getElementById("senha").value         = ""; 
    
    const select = document.getElementById("permissao");
    if (select) select.value = user.perfil || "usuario";
}


