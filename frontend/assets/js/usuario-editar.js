document.getElementById("btSalvar").addEventListener("click", function(e) {
    e.preventDefault();

    const usuarioAtualizado = {
        nome: document.getElementById("nome").value,
        cpf: document.getElementById("cpf").value,
        email: document.getElementById("email").value,
        dataNascimento: document.getElementById("dataNascimento").value,
        permissao: document.getElementById("permissao").value
    };

    console.log("Enviando pro backend:", usuarioAtualizado);

    /////// COM API //////
    /*
    
    fetch(`/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioAtualizado)
    })

    */

    alert("Usuário atualizado com sucesso!");
});