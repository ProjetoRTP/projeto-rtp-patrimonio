const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// EXEMPLOO
const usuario = {
    nome: "Maria Silva",
    cpf: "123.456.789-00",
    email: "maria@email.com",
    dataNascimento: "1990-05-10",
    permissao: "Administrador"
};

// Preencher tela
document.getElementById("nome").value = usuario.nome;
document.getElementById("cpf").value = usuario.cpf;
document.getElementById("email").value = usuario.email;
document.getElementById("dataNascimento").value = usuario.dataNascimento;
document.getElementById("permissao").value = usuario.permissao;


