// equipamento-generico.js
const API_BASE = "http://localhost:5000";
let token;

document.addEventListener("DOMContentLoaded", () => {
    token = sessionStorage.getItem("token_procape");

    if (!token) {
        alert("Acesso negado. Por favor, inicie sessão.");
        window.location.href = "../../index.html";
        return;
    }

    const perfil = sessionStorage.getItem("usuario_perfil");
    if (perfil === "gerente") {
        alert("Acesso negado. Gerentes não podem criar tipos de equipamentos.");
        window.location.href = "./equipamentos-modelos.html";
        return;
    }

    configurarFormulario();
});

// ===============================
// CONFIGURAR FORMULÁRIO
// ===============================
function configurarFormulario() {
    const form = document.querySelector("form");
    const btnAddCampo = document.getElementById("btn-add-campo");

    if (btnAddCampo) {
        btnAddCampo.addEventListener("click", adicionarCampoUI);
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await criarTipo();
    });
}

// ===============================
// ADICIONAR CAMPO DINÂMICO UI
// ===============================
function adicionarCampoUI() {
    const container = document.getElementById("container-campos");
    const idx = container.children.length;

    const descricoesTipos = {
        texto: "Ideal para nomes, modelos ou observações curtas.",
        numero: "Permite apenas números (ex: Voltagem, Potência).",
        data: "Abre um calendário para seleção de datas.",
        booleano: "Cria uma caixa de seleção para Sim ou Não.",
        lista: "Permite criar um menu suspenso com opções fixas.",
        ip: "Valida automaticamente o formato de endereço IP."
    };

    const divRow = document.createElement("div");
    divRow.className = "col-12 d-flex flex-wrap gap-3 align-items-end p-3 border rounded mb-2 shadow-sm bg-white campo-item";
    divRow.style.borderColor = "#f4cccc !important";

    divRow.innerHTML = `
        <div class="flex-grow-1" style="min-width: 200px;">
            <label class="label-azul fw-bold mb-1" style="font-size: 0.9rem;">Nome do Campo</label>
            <input type="text" class="form-control input-vermelho val-label" placeholder="Ex: Resolução, IP, BTUs" required>
        </div>
        <div class="flex-grow-1" style="min-width: 150px; max-width: 220px;">
            <label class="label-azul fw-bold mb-1 d-flex align-items-center gap-1" style="font-size: 0.9rem;">
                Tipo do Dado
                <i class="bi bi-info-circle info-tipo-icon" style="cursor: pointer; font-size: 0.8rem; color: #1D4587;" title="${descricoesTipos.texto}"></i>
            </label>
            <select class="form-select input-vermelho val-tipo" required>
                <option value="texto">Texto Curto</option>
                <option value="numero">Número</option>
                <option value="data">Data</option>
                <option value="booleano">Sim/Não</option>
                <option value="lista">Lista de Opções</option>
                <option value="ip">Endereço IP</option>
            </select>
        </div>
        <div class="flex-grow-1 d-none div-opcoes" style="min-width: 200px;">
            <label class="label-azul fw-bold mb-1" style="font-size: 0.9rem;">Opções (separe por vírgula)</label>
            <input type="text" class="form-control input-vermelho val-opcoes" placeholder="Opção 1, Opção 2">
        </div>
        <div class="d-flex align-items-center gap-3 mb-1">
            <div class="form-check m-0 d-flex align-items-center gap-2">
                <input class="form-check-input val-obrigatorio m-0" type="checkbox" id="check_${idx}">
                <label class="form-check-label" style="color: #1D4587; font-size: 0.9rem;" for="check_${idx}">Obrigatório</label>
            </div>
            <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.closest('.campo-item').remove()" title="Remover Campo">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;

    // Lógica para mostrar/esconder o campo de opções se for 'lista'
    const selectTipo = divRow.querySelector('.val-tipo');
    const divOpcoes = divRow.querySelector('.div-opcoes');
    const inputOpcoes = divRow.querySelector('.val-opcoes');
    const iconInfo = divRow.querySelector('.info-tipo-icon');

    // Mostrar info ao clicar
    iconInfo.addEventListener('click', () => {
        const msg = iconInfo.getAttribute('title');
        alert(msg);
    });

    selectTipo.addEventListener('change', (e) => {
        const val = e.target.value;
        iconInfo.setAttribute('title', descricoesTipos[val] || "");

        if (val === 'lista') {
            divOpcoes.classList.remove('d-none');
            inputOpcoes.required = true;
        } else {
            divOpcoes.classList.add('d-none');
            inputOpcoes.required = false;
        }
    });

    container.appendChild(divRow);
}

// Transformar label "Endereço IP" em chave "endereco_ip"
function gerarChave(label) {
    return label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

// ===============================
// CRIAR TIPO DE EQUIPAMENTO (SALVAR)
// ===============================
async function criarTipo() {
    const nome      = document.getElementById("inp-nome").value.trim();
    const descricao = document.getElementById("inp-descricao").value.trim();
    if (!nome) {
        alert("Preencha o nome do tipo de equipamento.");
        return;
    }

    // Coletar campos dinâmicos
    const atributos = [];
    const camposUI = document.querySelectorAll('.campo-item');
    let hasError = false;

    camposUI.forEach(item => {
        const label = item.querySelector('.val-label').value.trim();
        const tipo_dado = item.querySelector('.val-tipo').value;
        const obrigatorio = item.querySelector('.val-obrigatorio').checked;
        
        if (!label) hasError = true;

        const attr = {
            chave: gerarChave(label),
            label: label,
            tipo_dado: tipo_dado,
            obrigatorio: obrigatorio
        };

        if (tipo_dado === 'lista') {
            const opcoesText = item.querySelector('.val-opcoes').value.trim();
            if (!opcoesText) hasError = true;
            attr.opcoes = opcoesText.split(',').map(s => s.trim()).filter(s => s);
        }

        atributos.push(attr);
    });

    if (hasError) {
        alert("Preencha corretamente todos os campos personalizados adicionados.");
        return;
    }

    const payload = {
        nome,
        descricao,
        atributos
    };
    console.log(payload)

    const btnSubmit = document.getElementById("btnSubmit");
    const textoOriginal = btnSubmit.innerText;
    btnSubmit.innerText = "Salvando...";
    btnSubmit.disabled = true;

    try {
        const resposta = await fetch(`${API_BASE}/generics/types`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (resposta.ok) {
            alert("Tipo de equipamento criado com sucesso!");
            window.location.href = "./equipamentos.html";
        } else {
            const erro = await resposta.json();
            alert(`Erro: ${erro.erro || erro.error || "Falha ao criar tipo."}`);
        }

    } catch (erro) {
        console.error("Erro ao criar tipo:", erro);
        alert("Erro ao conectar com o servidor.");
    } finally {
        btnSubmit.innerText = textoOriginal;
        btnSubmit.disabled = false;
    }
}