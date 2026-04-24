
const dados = [
    {
        tomb: "00128",
        tipo: "Monitor",
        modelo: "Dell i5",
        patrimonio: "45678",
        status: "Em uso",
        entrada: "01/01/1980",
        ultima: "02/02/1990"
    },
    {
        tomb: "00129",
        tipo: "CPU",
        modelo: "Dell i7",
        patrimonio: "45679",
        status: "Manutenção",
        entrada: "05/01/1980",
        ultima: "10/02/1990"
    },
    {
        tomb: "00130",
        tipo: "Impressora",
        modelo: "HP",
        patrimonio: "45680",
        status: "Estoque",
        entrada: "07/01/1980",
        ultima: "12/02/1990"
    }
];

function getStatusClass(status) {
    if (status === "Em uso") return "status status-uso";
    if (status === "Manutenção") return "status status-manut";
    return "status status-estoque";
}

function renderTabela() {
    const tbody = document.getElementById("tabela-equipamentos");
    tbody.innerHTML = "";

    dados.forEach(item => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.tomb}</td>
            <td>${item.tipo}</td>
            <td>${item.modelo}</td>
            <td>${item.patrimonio}</td>
            <td class="${getStatusClass(item.status)}">${item.status}</td>
            <td>${item.entrada}</td>
            <td>${item.ultima}</td>
        `;

        tbody.appendChild(tr);
    });
}

renderTabela();

