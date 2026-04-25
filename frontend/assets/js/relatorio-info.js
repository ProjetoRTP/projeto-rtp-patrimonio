//  ID do relatório da URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Requisição pro backend
fetch(`http://localhost:3000/relatorios/${id}`)
  .then(res => res.json())
  .then(data => {

    // 🔹 Dados principais
    document.getElementById("data").textContent = data.data;
    document.getElementById("setor").textContent = data.setor;

    // 🔹 Resumo
    document.getElementById("total").textContent = data.total;
    document.getElementById("uso").textContent = data.emUso;
    document.getElementById("manut").textContent = data.manutencao;
    document.getElementById("estoque").textContent = data.estoque;

    // 🔹 Tabela
    const tabela = document.getElementById("tabela-equipamentos");
    tabela.innerHTML = "";

    data.equipamentos.forEach(eq => {
      tabela.innerHTML += `
        <tr>
          <td>${eq.tombamento}</td>
          <td>${eq.tipo}</td>
          <td>${eq.modelo}</td>
          <td>${eq.patrimonio}</td>
          <td>${formatarStatus(eq.status)}</td>
          <td>${formatarData(eq.dataEntrada)}</td>
          <td>${formatarData(eq.ultimaMov)}</td>
        </tr>
      `;
    });

  })
  .catch(err => {
    console.error("Erro ao carregar relatório:", err);
  });


// 🔥 Função pra deixar status bonito
function formatarStatus(status) {
  if (status === "Em uso") return `<span class="badge bg-success">${status}</span>`;
  if (status === "Manutenção") return `<span class="badge bg-warning text-dark">${status}</span>`;
  if (status === "Estoque") return `<span class="badge bg-secondary">${status}</span>`;
  return status;
}

// 🔥 Função pra formatar data
function formatarData(data) {
  if (!data) return "-";
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR");
}