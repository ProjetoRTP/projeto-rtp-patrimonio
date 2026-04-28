// ===============================
// CONFIGURAÇÃO
// ===============================
// Ajuste a URL conforme a rota definida no seu 'user_routes.py'
const API_URL = "http://localhost:5000/users"; 

// ===============================
// ELEMENTOS DO DOM
// ===============================
const tbody = document.getElementById("tbody-usuarios");

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    carregarUsuarios();
});

// ===============================
// BUSCAR USUÁRIOS (GET)
// ===============================
async function carregarUsuarios() {
    try {
        tbody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-muted">Buscando usuários...</td></tr>`;

        const response = await fetch(API_URL);
        
        if (!response.ok) throw new Error("Erro ao acessar servidor");

        const usuarios = await response.json();
        renderizarTabela(usuarios);

    } catch (erro) {
        console.error("Erro na integração:", erro);
        tbody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-danger">Erro ao carregar usuários. Verifique se o backend está rodando!</td></tr>`;
    }
}

// ===============================
// RENDERIZAÇÃO
// ===============================
function renderizarTabela(lista) {
    const tbody = document.getElementById("tbody-usuarios");

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-muted">Nenhum usuário encontrado.</td></tr>`;
        return;
    }

    // Gerando o HTML dinâmico com base no seu molde
    tbody.innerHTML = lista.map(user => `
        <tr style="border-bottom: 1px solid #f1f1f1;">
            <td style="color: #1D4587; padding-top: 15px; padding-bottom: 15px;">
                <a href="#" data-bs-toggle="modal" data-bs-target="#modalHistorico"
                   style="color: #1D4587; text-decoration: none; font-weight: 500;">
                    ${user.username || user.nome} </a>
            </td>
            <td class="text-end">
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-outline-primary px-2 py-1" onclick="editarUsuario(${user.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="window.location.href='usuario-info.html?id=${user.id}'"
                            class="btn btn-sm btn-outline-danger px-2 py-1">
                        <i class="bi bi-info"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ===============================
// AÇÕES
// ===============================
function editarUsuario(id) {
    window.location.href = `cadastro-usuario.html?id=${id}`;
}

function verInfo(id) {
    window.location.href = `usuario-info.html?id=${id}`;
}

