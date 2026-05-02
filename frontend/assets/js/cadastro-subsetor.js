// URL base da API
const API_BASE_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token_procape");
  if (!token) {
    alert("Acesso negado. Por favor, faça o login.");
    window.location.href = "index.html";
    return;
  }

  // 1. DETECTAR SE É EDIÇÃO
  const params = new URLSearchParams(window.location.search);
  const subsectorId = params.get("id");

  const formCadastro = document.getElementById("form-cadastro-subsetor");
  const btnSalvar = document.getElementById("btn-salvar-subsetor");
  const selectSetor = document.getElementById("sel-setor-pai");
  const inputNome = document.getElementById("inp-nome-subsetor");
  const inputDescricao = document.getElementById("inp-descricao-subsetor");
  const tituloPagina = document.querySelector("h2");

  // 2. CARREGAR SETORES NO DROPDOWN
  async function carregarSetores() {
    try {
      const resposta = await fetch(`${API_BASE_URL}/sectors`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resposta.ok) {
        const setores = await resposta.json();
        selectSetor.innerHTML =
          '<option value="" disabled selected>Selecione</option>';
        setores.forEach((setor) => {
          const option = document.createElement("option");
          option.value = setor.id;
          option.textContent = setor.nome;
          selectSetor.appendChild(option);
        });
      }
    } catch (erro) {
      console.error("Erro ao carregar setores:", erro);
      alert("Erro ao carregar setores");
    }
  }

  // 3. SE FOR EDIÇÃO, CARREGAR DADOS DO SUBSETOR
  if (subsectorId) {
    if (tituloPagina) tituloPagina.innerText = "Editar Subsetor";
    if (btnSalvar) btnSalvar.innerText = "Atualizar";

    try {
      const resposta = await fetch(
        `${API_BASE_URL}/subsectors/${subsectorId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (resposta.ok) {
        const subsector = await resposta.json();
        inputNome.value = subsector.nome || "";
        inputDescricao.value = subsector.descricao || "";

        // Carregar setores e marcar o setor pai
        await carregarSetores();
        selectSetor.value = subsector.setor_id;
      } else {
        alert("Erro ao carregar subsetor para edição");
        window.location.href = "subsetores.html";
      }
    } catch (erro) {
      console.error("Erro ao carregar subsetor:", erro);
      alert("Erro de conexão ao carregar subsetor");
      window.location.href = "subsetores.html";
    }
  } else {
    // 4. SE FOR CADASTRO, APENAS CARREGAR SETORES
    await carregarSetores();
  }

  // 5. BOTÃO CANCELAR
  const btnCancelar = document.getElementById("btn-cancelar");
  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      window.location.href = "subsetores.html";
    });
  }

  // 6. LÓGICA DE SALVAR (POST ou PUT)
  if (formCadastro) {
    formCadastro.addEventListener("submit", async (e) => {
      e.preventDefault();

      const setorId = selectSetor.value;
      const nomeSubsetor = inputNome.value.trim();
      const descricaoSubsetor = inputDescricao.value.trim();

      if (!setorId) {
        alert("Selecione um setor");
        return;
      }

      const textoOriginal = btnSalvar.innerText;
      btnSalvar.innerText = subsectorId ? "Atualizando..." : "Salvando...";
      btnSalvar.disabled = true;

      try {
        const url = subsectorId
          ? `${API_BASE_URL}/subsectors/${subsectorId}`
          : `${API_BASE_URL}/subsectors`;
        const metodo = subsectorId ? "PUT" : "POST";

        const resposta = await fetch(url, {
          method: metodo,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            setor_id: parseInt(setorId, 10),
            nome: nomeSubsetor,
            descricao: descricaoSubsetor,
          }),
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
          alert(
            subsectorId
              ? "Subsetor atualizado com sucesso!"
              : "Subsetor cadastrado com sucesso!",
          );
          window.location.href = "subsetores.html";
        } else {
          const msgErro =
            resultado.erro || resultado.mensagem || "Falha na operação";
          alert(`Erro: ${msgErro}`);
        }
      } catch (erro) {
        console.error("Erro na requisição:", erro);
        alert("Erro de conexão com o servidor");
      } finally {
        btnSalvar.innerText = textoOriginal;
        btnSalvar.disabled = false;
      }
    });
  }
});
