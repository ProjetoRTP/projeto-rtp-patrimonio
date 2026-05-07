document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("token_procape");

    if (!token) {
        alert("Acesso negado. Por favor, inicie sessão.");
        window.location.href = "../index.html";
        return;
    }

    // Verifica se é uma edição (se existe um ID na URL)
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("id");
    const isEdicao = !!userId;

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
    // CADASTRAR / ATUALIZAR
    // ===============================
    document.getElementById("btCadastrar").addEventListener("click", async (event) => {
        event.preventDefault();

        const perfil         = document.getElementById("permissao").value;
        const nome           = document.getElementById("nome").value.trim();
        const cpf            = document.getElementById("cpf").value.replace(/\D/g, ""); // remove formatação
        const dataNascimento = document.getElementById("dataNascimento").value;
        const email          = document.getElementById("email").value.trim();
        const senha          = document.getElementById("senha").value;

        // ===============================
        // VALIDAÇÃO DE CAMPOS GERAIS
        // ===============================
        if (!perfil || !nome || !cpf || !dataNascimento || !email) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        if (cpf.length !== 11) {
            alert("CPF inválido. Digite os 11 dígitos.");
            return;
        }

        // ===============================
        // VALIDAÇÃO DE SENHA (A TAREFA DO TRELLO)
        // ===============================
        
        // 1. Se for CRIAÇÃO de um novo utilizador, a senha não pode estar vazia
        if (!isEdicao && !senha) {
            alert("A senha é obrigatória para novos usuários.");
            return;
        }

        // 2. Se a senha foi preenchida (seja na criação ou na edição), valida a força
        if (senha) {
            if (!isSenhaValida(senha)) {
                alert("A senha deve ter no mínimo 8 caracteres, contendo letras e números.");
                document.getElementById("senha").classList.add("is-invalid");
                return;
            }
            document.getElementById("senha").classList.remove("is-invalid");
        }

        // Monta o pacote de dados base
        const pacoteDados = {
            perfil,
            nome,
            cpf,
            data_nascimento: dataNascimento,
            email
        };

        // Adiciona a senha ao pacote APENAS se ela foi preenchida
        if (senha) {
            pacoteDados.senha = senha;
        }

        try {
            // Define o método e a rota consoante seja criação (POST) ou edição (PUT)
            const urlFinal = isEdicao ? `http://localhost:5000/users/${userId}` : "http://localhost:5000/users";
            const metodo = isEdicao ? "PUT" : "POST";

            const resposta = await fetch(urlFinal, {
                method: metodo,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(pacoteDados)
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                alert(isEdicao ? "Usuário atualizado com sucesso." : "Usuário cadastrado com sucesso.");
                window.location.href = "usuario.html";
            } else {
                alert("Erro: " + (resultado.erro || "Falha ao salvar."));
            }

        } catch (erro) {
            console.error("Erro na requisição:", erro);
            alert("Não foi possível conectar ao servidor.");
        }
    });

    // ===============================
    // FUNÇÃO DE VALIDAÇÃO DE FORÇA DA SENHA
    // ===============================
    function isSenhaValida(senha) {
        // Exige no mínimo 8 caracteres, contendo pelo menos uma letra e um número
        return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(senha);
    }
});