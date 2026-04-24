

const btCancelar = document.getElementById('btCancelar');
const btCadastrar = document.getElementById('btCadastrar');

btCancelar.addEventListener('click', (event) => {
    event.preventDefault();

    window.location.href = 'usuario.html';
});

btCadastrar.addEventListener('click', (event) => {
    event.preventDefault();

    // Capturar os valores digitados
    const permissaoEscolhida = document.getElementById('permissao').value;
    const nomeDigitado = document.getElementById('nome').value;
    const cpfDigitado = document.getElementById('cpf').value;
    const dataDigitada = document.getElementById('dataNascimento').value;
    const emailDigitado = document.getElementById('email').value;
    const senhaDigitada = document.getElementById('senha').value;

    // criando o objeto
    const pacoteDados = {
        permissao: permissaoEscolhida,
        nome: nomeDigitado,
        cpf: cpfDigitado,
        dataNascimento: dataDigitada,
        email: emailDigitado,
        senha: senhaDigitada
    };

    // COLOCAR O LINK DA API AQ
    const linkAPI = "";

    fetch(linkAPI, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pacoteDados)
    })
    .then(respostaDoServidor => {
        if(respostaDoServidor.ok) {
            alert("Usuario cadastrado com sucesso.");
            window.location.href = 'usuario.html'
        } else {
            alert("Algo deu errado no cadastro.");
        }
    })
    .catch(erro => {
        console.error("Erro na viagem dos dados: " + erro);
        alert("Não conseguimos nos comunicar com o servidor");
    });
});

    // formatação do cpf
    const campoCpf = document.getElementById('cpf');
    
    campoCpf.addEventListener('input', (event) => {
        let valor = campoCpf.value

        valor = valor.replace(/\D/g, "");

        if (valor.length > 11) {
            valor = valor.slice(0, 11);
        }

        if (valor.length > 3) {
            valor = valor.replace(/^(\d{3})(\d)/, "$1.$2");
        }

        if (valor.length > 6) {
            valor = valor.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
        }

        if (valor.length > 9) {
            valor = valor.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
        }

        campoCpf.value = valor;
    })

