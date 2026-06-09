// setores.js
const API_BASE_URL = 'http://localhost:5000/sectors'; // url_prefix já inclui /sectors

document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token_procape');
    if (!token) {
        window.location.href = '../../index.html';
        return;
    }
    document.getElementById("inativo").addEventListener("click", () => carregarSetores())

    async function carregarSetores() {
        const tbody = document.getElementById('tbody-setores');
        if (!tbody) return;
        const inativo = document.getElementById("inativo");
        const query = new URLSearchParams();
        
        if (inativo.checked) {
        query.append("inativo", "True")
        }
        const qs = query.toString();
        console.log(qs)
        try{ 
        const resposta = await fetch(`${API_BASE_URL}?${qs}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        });

            if (resposta.ok) {
                const setores = await resposta.json();
                
                tbody.innerHTML = setores.map(setor => `
                    <tr style="border-bottom: 1px solid #f1f1f1;">
                        <td style="color: #1D4587; padding: 15px 0; font-weight: 500;">${setor.nome}</td>
                        <td class="text-end">
                            <div class="d-flex justify-content-end gap-2">
                                <button class="btn btn-sm btn-outline-primary" onclick="editarSetor(${setor.id})">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="verInfoSetor(${setor.id})">
                                    <i class="bi bi-info-circle"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (erro) {
            console.error('Erro:', erro);
        }
    }

    carregarSetores();
});

function editarSetor(id) { window.location.href = `cadastro-setor.html?id=${id}`; }
function verInfoSetor(id) { window.location.href = `setor-info.html?id=${id}`; }