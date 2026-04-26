document.addEventListener("DOMContentLoaded", () => {

    // Pegar ID da URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        console.error("ID não encontrado na URL");
        return;
    }

    // FUNÇÃO para preencher os campos
    function preencherCampos(impressora) {
        document.getElementById("modelo").value = impressora.modelo || "";
        document.getElementById("tipo").value = impressora.tipo || "";
        document.getElementById("coloracao").value = impressora.coloracao || "";
        document.getElementById("conectividade").value = impressora.conectividade || "";
        document.getElementById("ip").value = impressora.ip || "";
        document.getElementById("insumo").value = impressora.insumo || "";
    }

    //  MOCK
    const impressorasMock = [
        {
            id: "1",
            modelo: "HP LaserJet",
            tipo: "Laser",
            coloracao: "Monocromática",
            conectividade: "Wi-Fi",
            ip: "192.168.0.10",
            insumo: "Toner"
        },
        {
            id: "2",
            modelo: "Epson EcoTank",
            tipo: "Jato de tinta",
            coloracao: "Colorida",
            conectividade: "USB",
            ip: "192.168.0.20",
            insumo: "Tinta"
        }
    ];

    // BUSCAR DO BACKEND
    fetch(`http://localhost:3000/impressoras/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro no backend");
            }
            return response.json();
        })
        .then(data => {
            console.log("Dados do backend:", data);
            preencherCampos(data);
        })
        .catch(error => {
            console.warn("Usando mock por erro no backend:", error);

            // 🔹 fallback pro mock
            const impressora = impressorasMock.find(i => i.id === id);

            if (impressora) {
                preencherCampos(impressora);
            } else {
                console.error("Impressora não encontrada");
            }
        });

});




const btnEditar = document.getElementById("btnEditar");

if (btnEditar) {
    btnEditar.href = `usuario-editar.html?id=${id}`;
}
