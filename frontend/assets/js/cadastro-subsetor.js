const API_BASE_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token_procape");
  const params = new URLSearchParams(window.location.search);
  const subsectorId = params.get("id");

  if (!token) {
    alert("Acesso negado. Faça login novamente.");
    window.location.href = "../index.html";
    return;
  }

  const selectSetor = document.getElementById("sel-setor-pai");
  const inputNome = document.getElementById("inp-nome-subsetor");
  const inputDescricao = document.getElementById("inp-descricao-subsetor");
  const formCadastro = document.getElementById("form-cadastro-subsetor");
  const btnCancelar = document.getElementById("btn-cancelar");
  const btnSalvar = document.getElementById("btn-salvar-subsetor");
  const titulo = document.querySelector("h2");

  async function carregarSetores() {
    try {
      const resposta = await fetch(`${API_BASE_URL}/sectors`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resposta.ok) {
        throw new Error(`Falha ao carregar setores: ${resposta.status}`);
      }

      const setores = await resposta.json();
      selectSetor.innerHTML =
        '<option value="" disabled selected>Selecione</option>';

      setores.forEach((setor) => {
        const option = document.createElement("option");
        option.value = setor.id;
        option.textContent = setor.nome;
        selectSetor.appendChild(option);
      });
    } catch (erro) {
      console.error("Erro ao carregar setores:", erro);
      alert("Não foi possível carregar os setores. Recarregue a página.");
    }
  }

  async function carregarSubsetor(id) {
    try {
      const resposta = await fetch(`${API_BASE_URL}/subsectors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resposta.ok) {
        throw new Error(`Subsetor não encontrado: ${resposta.status}`);
      }

      const subsetor = await resposta.json();
      inputNome.value = subsetor.nome || "";
      inputDescricao.value = subsetor.descricao || "";
      selectSetor.value = subsetor.setor_id || "";
      if (titulo) titulo.innerText = "Editar Subsetor";
      if (btnSalvar) btnSalvar.innerText = "Salvar alterações";
    } catch (erro) {
      console.error("Erro ao carregar subsetor:", erro);
      alert("Não foi possível carregar o subsetor. Voltando para a lista.");
      window.location.href = "subsetores.html";
    }
  }

  btnCancelar?.addEventListener("click", () => {
    window.location.href = "subsetores.html";
  });

  formCadastro?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = inputNome?.value?.trim();
    const descricao = inputDescricao?.value?.trim();
    const setorId = selectSetor?.value;

    if (!setorId || !nome) {
      alert("Selecione o setor e informe o nome do subsetor.");
      return;
    }

    const payload = {
      nome,
      descricao,
      setor_id: parseInt(setorId, 10),
    };

    try {
      const url = subsectorId
        ? `${API_BASE_URL}/subsectors/${subsectorId}`
        : `${API_BASE_URL}/subsectors`;
      const method = subsectorId ? "PUT" : "POST";

      const resposta = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const resultado = await resposta.json();
      if (!resposta.ok) {
        throw new Error(resultado.erro || "Falha ao salvar subsetor.");
      }

      alert(
        subsectorId
          ? "Subsetor atualizado com sucesso!"
          : "Subsetor cadastrado com sucesso!",
      );
      window.location.href = "subsetores.html";
    } catch (erro) {
      console.error("Erro ao salvar subsetor:", erro);
      alert(
        "Não foi possível salvar o subsetor. Veja o console para mais detalhes.",
      );
    }
  });

  await carregarSetores();

  if (subsectorId) {
    await carregarSubsetor(subsectorId);
  }
});
