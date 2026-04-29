document.addEventListener("DOMContentLoaded", () => {
    configurarTipoEquipamento();
    carregarSetores();
    configurarSubmit();
});


// MOSTRAR / ESCONDER CAMPOS
function configurarTipoEquipamento() {
    const tipo = document.getElementById("tipoEquipamento");
    const computador = document.getElementById("campos-computador");
    const impressora = document.getElementById("campos-impressora");

    tipo.addEventListener("change", () => {
        if (tipo.value == "1") {
            computador.classList.remove("d-none");
            impressora.classList.add("d-none");
        } 
        else if (tipo.value == "2") {
            impressora.classList.remove("d-none");
            computador.classList.add("d-none");
        } 
        else {
            computador.classList.add("d-none");
            impressora.classList.add("d-none");
        }
    });
}


//  CARREGAR SETORES (GET)
async function carregarSetores() {
    try {
        const resposta = await fetch("http://localhost:5000/sectors");
        const setores = await resposta.json();

        const lista = document.getElementById("lista-setores");
        lista.innerHTML = "";

        setores.forEach(setor => {
            lista.innerHTML += `<option value="${setor.nome}">`;
        });

    } catch (erro) {
        console.error("Erro ao carregar setores:", erro);
    }
}


//  ENVIAR FORMULÁRIO (POST)
function configurarSubmit() {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const tipo = document.getElementById("tipoEquipamento").value;
        const setor = document.getElementById("setor").value;

        let dados = {
            tipoEquipamento: tipo,
            setor: setor
        };

        // FORMULARIO COMPUTADOR
        if (tipo == "1") {
            dados = {
                ...dados,
                tombamento: document.getElementById("tombamento").value,
                sistema: document.getElementById("sistema").value,
                memoriaInterna: document.getElementById("memoria-interna").value,
                memoriaRam: document.getElementById("memoria-ram").value,
                armazenamento: document.getElementById("armazenamento").value,
                numeroIp: document.getElementById("numero-ip").value,
                observacoes: document.getElementById("observacoes").value
            };
        }

        // FORMULARIO IMPRESSORA
        else if (tipo == "2") {
            dados = {
                ...dados,
                modelo: document.getElementById("modelo").value,
                tipoImpressora: document.getElementById("tipo").value,
                coloracao: document.getElementById("coloracao").value,
                conectividade: document.getElementById("conectividade").value,
                enderecoIp: document.getElementById("endereco-ip").value,
                insumo: document.getElementById("insumo").value
            };
        }

        try {
            const resposta = await fetch("http://localhost:5000/equipments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            });

            if (resposta.ok) {
                alert("Equipamento cadastrado com sucesso!");
                form.reset();
            } else {
                alert("Erro ao cadastrar equipamento");
            }

        } catch (erro) {
            console.error("Erro:", erro);
            alert("Erro ao conectar com o servidor");
        }
    });
}