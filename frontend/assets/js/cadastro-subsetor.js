const API_BASE_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token_procape");
  const params = new URLSearchParams(window.location.search);
  const subsectorId = params.get("id");

  // Capturando os elementos - Garanta que esses IDs existam no HTML!
  const selectSetor = document.getElementById("sel-setor-pai");
  const inputNome = document.getElementById("inp-nome-subsetor");
  const inputDescricao = document.getElementById("inp-descricao-subsetor");
  const formCadastro = document.getElementById("form-cadastro-subsetor");

  async function carregarSetores() {
    try {
      const resposta = await fetch(`${API_BASE_URL}/sectors`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resposta.ok) {
        const setores = await resposta.json();
        console.log("Setores recebidos do banco:", setores); // Veja isso no Console (F12)

        if (!selectSetor) {
            console.error("ERRO: Não encontrei o elemento 'sel-setor-pai' no HTML!");
            return;
        }

        selectSetor.innerHTML = '<option value="" disabled selected>Selecione</option>';
        
        setores.forEach((setor) => {
          const option = document.createElement("option");
          // Garante que pega o ID e NOME independente de ser maiúsculo ou minúsculo
          option.value = setor.id || setor.ID;
          option.textContent = setor.nome || setor.NOME;
          selectSetor.appendChild(option);
        });
      }
    } catch (erro) {
      console.error("Erro ao carregar setores:", erro);
    }
  }

  // Inicia o carregamento
  await carregarSetores();

  // Se for edição, busca os dados do subsetor
  if (subsectorId) {
    // ... resto da sua lógica de edição ...
  }
});