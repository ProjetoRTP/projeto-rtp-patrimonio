// URL base da API
const API_BASE_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {
  // 1. VERIFICAÇÃO DE SEGURANÇA
  const token = sessionStorage.getItem("token_procape");
  if (!token) {
    alert("Acesso negado. Por favor, faça o login.");
    window.location.href = "index.html";
    return;
  }

  // 2. PREENCHER O DROPDOWN (CAIXA DE SELEÇÃO) COM OS SETORES
  async function carregarSetoresParaDropdown() {
    const selectSetor = document.getElementById("sel-setor-pai");

    try {
      const resposta = await fetch(`${API_BASE_URL}/setores`, {
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

  carregarSetoresParaDropdown();

  // 3. AÇÃO DO BOTÃO CANCELAR
  const btnCancelar = document.getElementById("btn-cancelar");
  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      window.location.href = "subsetores.html";
    });
  }

  // 4. LÓGICA DE CADASTRO (Envio do Formulário)
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

      const btnSalvar = document.getElementById("btn-salvar-subsetor");
      const textoOriginal = btnSalvar.innerText;
      btnSalvar.innerText = "Salvando...";
      btnSalvar.disabled = true;

      try {
        const resposta = await fetch(`${API_BASE_URL}/subsetores`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            setor_id: parseInt(setorId),
            nome: nomeSubsetor,
            descricao: descricaoSubsetor,
          }),
        });

        if (resposta.ok) {
          alert("Subsetor cadastrado com sucesso!");
          window.location.href = "subsetores.html";
        } else {
          const erro = await resposta.json();
          alert(`Erro ao cadastrar: ${erro.mensagem || "Falha no servidor"}`);
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
});
