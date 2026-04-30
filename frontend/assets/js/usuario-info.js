const API_URL = "http://localhost:5000/users";

document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("token_procape");
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    // 1. Configura o botão Voltar (usando o ID do seu HTML)
    const btnVoltar = document.getElementById("btn-voltar");
    if (btnVoltar) {
        btnVoltar.onclick = () => window.location.href = "usuario.html";
    }

    if (!token || !id) {
        console.error("Token ou ID não encontrados na URL");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const user = await response.json();
            
            // Log para você ver no F12 se o nome é 'data_nascimento' ou outro
            console.log("Dados do usuário:", user);

            // Preenche os campos
            document.getElementById("nome").value = user.nome || "";
            document.getElementById("cpf").value = user.cpf || "";
            document.getElementById("email").value = user.email || "";
            document.getElementById("permissao").value = user.perfil || "gerente";

            // TRATAMENTO DA DATA
            // No Python/MySQL geralmente vem como 'data_nascimento'
            const campoData = user.data_nascimento || user.dataNascimento; 
            
            if (campoData) {
                // Pega apenas YYYY-MM-DD e limpa qualquer espaço
                const dataLimpa = campoData.substring(0, 10).trim();
                document.getElementById("dataNascimento").value = dataLimpa;
            }

            // Ajusta o link de editar
            const btnEditar = document.getElementById("btn-editar-link");
            if (btnEditar) {
                btnEditar.href = `usuario-editar.html?id=${id}`;
            }
        }
    } catch (error) {
        console.error("Erro ao carregar:", error);
    }
});