document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("token_procape");

    if (!token) {
        alert("Acesso negado. Por favor, inicie sessão.");
        window.location.href = "../index.html";
        return;
    }

    // ===============================
    // PREENCHE O SELECT DE PERFIL
    // ===============================
    const selectPermissao = document.getElementById("permissao");
    selectPermissao.innerHTML = `
        <option value="">Selecione tipo</option>
        <option value="admin">Administrador</option>
        <option value="gerente">Gerente</option>
    `;

    // ===============================
    // FORMATAÇÃO DO CPF (visual only)
    // ===============================
    const campoCpf = document.getElementById("cpf");

    campoCpf.addEventListener("input", () => {
        let valor = campoCpf.value.replace(/\D/g, "").slice(0, 11);

        if (valor.length > 9) {
            valor = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
        } else if (valor.length > 6) {
            valor = valor.replace(/^(\d{3})(\d{3})(\d{1,3})$/, "$1.$2.$3");
        } else if (valor.length > 3) {
            valor = valor.replace(/^(\d{3})(\d{1,3})$/, "$1.$2");
        }

        campoCpf.value = valor;
    });

    // ===============================
    // CANCELAR
    // ===============================
    document.getElementById("btCancelar").addEventListener("click", () => {
        window.location.href = "usuario.html";
    });

    // ===============================
    // CADASTRAR
    // ===============================
    document.getElementById("btCadastrar").addEventListener("click", async (event) => {
        event.preventDefault();

        const perfil         = document.getElementById("permissao").value;
        const nome           = document.getElementById("nome").value.trim();
        const cpf            = document.getElementById("cpf").value.replace(/\D/g, ""); // ✅ remove formatação
        const dataNascimento = document.getElementById("dataNascimento").value;
        const email          = document.getElementById("email").value.trim();
        const senha          = document.getElementById("senha").value;

        // ===============================
        // VALIDAÇÃO
        // ===============================
        if (!perfil || !nome || !cpf || !dataNascimento || !email || !senha) {
            alert("Preencha todos os campos.");
            return;
        }

        if (cpf.length !== 11) {
            alert("CPF inválido. Digite os 11 dígitos.");
            return;
        }

        const pacoteDados = {
            perfil,                        // ✅ nome correto para o banco
            nome,
            cpf,
            data_nascimento: dataNascimento, // ✅ nome correto para o banco
            email,
            senha
        };

        try {
            const resposta = await fetch("http://localhost:5000/users", { // ✅ URL correta
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // ✅ token obrigatório
                },
                body: JSON.stringify(pacoteDados)
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                alert("Usuário cadastrado com sucesso.");
                window.location.href = "usuario.html";
            } else {
                alert("Erro: " + (resultado.erro || "Falha ao cadastrar."));
            }

        } catch (erro) {
            console.error("Erro na requisição:", erro);
            alert("Não foi possível conectar ao servidor.");
        }
    });
});
