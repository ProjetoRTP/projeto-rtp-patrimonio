// URL base da API
const API_BASE_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("token_procape");
  if (!token) {
    alert("Acesso negado. Por favor, faça o login.");
    window.location.href = "index.html";
    return;
  }

  const subsectorId = new URLSearchParams(window.location.search).get("id");
  const selectSetor = document.getElementById("sel-setor-pai");
  const btnSalvar = document.getElementById("btn-salvar-subsetor");

  async function carregarSetoresParaDropdown(selectedSetorId = null) {
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
          if (selectedSetorId && String(setor.id) === String(selectedSetorId)) {
            option.selected = true;
          }
          selectSetor.appendChild(option);
        });

        if (selectedSetorId && !selectSetor.value) {
          selectSetor.innerHTML +=
            '<option value="" disabled selected>Setor atual não encontrado</option>';
        }
      } else {
        selectSetor.innerHTML =
          '<option value="" disabled>Erro ao carregar setores</option>';
      }
    } catch (erro) {
      console.error("Erro ao buscar setores:", erro);
      selectSetor.innerHTML =
        '<option value="" disabled>Falha de conexão com o servidor</option>';
    }
  }

  async function carregarDadosSubsetor(id) {
    try {
      const resposta = await fetch(`${API_BASE_URL}/subsectors/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resposta.ok) {
        const subsector = await resposta.json();
        document.getElementById("inp-nome-subsetor").value =
          subsector.nome || "";
        document.getElementById("inp-descricao-subsetor").value =
          subsector.descricao || "";
        await carregarSetoresParaDropdown(subsector.setor_id);
        btnSalvar.innerText = "Atualizar";
      } else {
        alert("Não foi possível carregar o subsetor para edição.");
        window.location.href = "subsetores.html";
      }
    } catch (erro) {
      console.error("Erro ao carregar subsetor:", erro);
      alert("Erro de conexão ao carregar subsetor.");
      window.location.href = "subsetores.html";
    }
  }

  async function inicializarFormulario() {
    if (subsectorId) {
      await carregarDadosSubsetor(subsectorId);
    } else {
      await carregarSetoresParaDropdown();
    }
  }

  const btnCancelar = document.getElementById("btn-cancelar");
  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      window.location.href = "subsetores.html";
    });
  }

  const formCadastro = document.getElementById("form-cadastro-subsetor");
  if (formCadastro) {
    formCadastro.addEventListener("submit", async (e) => {
      e.preventDefault();

      const setorId = document.getElementById("sel-setor-pai").value;
      const nomeSubsetor = document
        .getElementById("inp-nome-subsetor")
        .value.trim();
      const descricaoSubsetor = document
        .getElementById("inp-descricao-subsetor")
        .value.trim();

      const textoOriginal = btnSalvar.innerText;
      btnSalvar.innerText = subsectorId ? "Atualizando..." : "Salvando...";
      btnSalvar.disabled = true;

      const metodo = subsectorId ? "PUT" : "POST";
      const url = subsectorId
        ? `${API_BASE_URL}/subsectors/${subsectorId}`
        : `${API_BASE_URL}/subsectors`;

      try {
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

        if (resposta.ok) {
          alert(
            subsectorId
              ? "Subsetor atualizado com sucesso!"
              : "Subsetor cadastrado com sucesso!",
          );
          window.location.href = "subsetores.html";
        } else {
          const erro = await resposta.json();
          alert(`Erro: ${erro.erro || erro.mensagem || "Falha no servidor"}`);
        }
      } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro de conexão com o servidor.");
      } finally {
        btnSalvar.innerText = textoOriginal;
        btnSalvar.disabled = false;
      }
    });
  }

  inicializarFormulario();
});
