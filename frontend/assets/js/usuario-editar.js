document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("token_procape");

    if (!token) {
        alert("Acesso negado. Por favor, inicie sessão.");
        window.location.href = "../index.html";
        return;
    }

    //  Pega o ID da URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        alert("Usuário não identificado.");
        window.location.href = "usuario.html";
        return;
    }

    document.getElementById("btSalvar").addEventListener("click", async function (e) {
        e.preventDefault();

        const usuarioAtualizado = {
            nome:             document.getElementById("nome").value,
            cpf:              document.getElementById("cpf").value,
            email:            document.getElementById("email").value,
            data_nascimento:  document.getElementById("dataNascimento").value, 
            perfil:           document.getElementById("permissao").value,      
        };

        try {
            const response = await fetch(`http://localhost:5000/users/${id}`, { 
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(usuarioAtualizado)
            });

            if (!response.ok) {
                const erro = await response.json();
                alert("Erro ao atualizar: " + (erro.erro || "Falha desconhecida"));
                return;
            }

            alert("Usuário atualizado com sucesso!");
            window.location.href = "usuario.html"; 

        } catch (erro) {
            console.error("Erro na requisição:", erro);
            alert("Não foi possível conectar ao servidor.");
        }
    });
});