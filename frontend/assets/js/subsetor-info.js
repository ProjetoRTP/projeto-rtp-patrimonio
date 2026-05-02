const API_BASE = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("token_procape");
    const id = new URLSearchParams(window.location.search).get("id");

    if (!id) return window.location.href = "subsetores.html";

    try {
        const res = await fetch(`${API_BASE}/subsectors/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            const sub = await res.json();
            document.getElementById("info-nome").value = sub.nome;
            document.getElementById("info-descricao").value = sub.descricao || "Sem descrição";
            document.getElementById("info-setor-pai").value = sub.setor_nome || "Setor não encontrado";
            document.getElementById("btn-editar-subsetor").href = `cadastro-subsetor.html?id=${id}`;
        }
    } catch (err) { console.error(err); }
});