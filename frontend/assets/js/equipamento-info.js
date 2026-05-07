const API_BASE = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Recupera as informações essenciais
    const token = sessionStorage.getItem("token_procape");
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const tipo = params.get("tipo"); // Puxando o tipo que vem da URL

    const btnEditar = document.getElementById("btn-editar-equip");
    
    // Configura o botão de editar para levar o ID e o Tipo corretos
    if (btnEditar && id && tipo) {
        btnEditar.href = `cadastro-equipamentos.html?id=${id}&tipo=${tipo}`;
    }

    // 2. Funções de formatação visual
    const formatDate = (dateString) => {
        if (!dateString) return "";
        // Usamos UTC para evitar que a data volte um dia por causa do fuso horário
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined || value === "") return "";
        // Se vier como string do banco, transforma em número para formatar certinho
        const floatValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
        if (isNaN(floatValue)) return value;
        
        return floatValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // 3. Validações de segurança
    if (!token) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "../index.html";
        return;
    }

    if (!id || !tipo) {
        alert("Informações do equipamento incompletas (Falta ID ou Tipo). Retornando para a lista.");
        window.location.href = "equipamentos.html";
        return;
    }

    // 4. Direcionamento dinâmico de Rotas (Mágica acontece aqui)
    let endpoint = "";
    if (tipo === "computador") {
        endpoint = `/computers/${id}`;
    } else if (tipo === "impressora") {
        endpoint = `/printer/${id}`;
    } else if (tipo === "periferico") {
        endpoint = `/peripherals/${id}`;
    } else if (tipo === "generico") {
        endpoint = `/generics/${id}`; 
    } else {
        alert("Tipo de equipamento não reconhecido.");
        window.location.href = "equipamentos.html";
        return;
    }

    // 5. Requisição ao Servidor Python
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            alert(`Não foi possível buscar o equipamento. Erro do servidor: ${res.status}`);
            window.location.href = "equipamentos.html";
            return;
        }

        const data = await res.json();
        
        // DEPURADOR: Mostra no console (F12) o que o Python devolveu. Útil se algum campo vier vazio!
        console.log(`Dados do ${tipo} recebidos:`, data);

        // Helper para injetar o texto no input HTML
        const setValue = (elementId, value) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.value = value ?? "Não informado";
            }
        };

        // Formata a primeira letra do tipo para maiúscula (computador -> Computador)
        const tipoFormatado = tipo.charAt(0).toUpperCase() + tipo.slice(1);

        // 6. Preenche a tela
        setValue("info-tipo", tipoFormatado);
        setValue("info-setor", data.setor_nome || data.setor);
        setValue("info-subsetor", data.subsetor_nome || data.subsetor);
        setValue("info-tombamento", data.num_patrimonio || data.tombamento);
        setValue("info-data-aquisicao", formatDate(data.data_aquisicao));
        setValue("info-valor", formatCurrency(data.valor));
        setValue("info-observacao", data.observacao);

        // Renderizar atributos dinâmicos se for genérico
        if (tipo === "generico" && data.atributos_dinamicos) {
            const container = document.getElementById("container-atributos-info");
            if (container) {
                const attrs = typeof data.atributos_dinamicos === "string"
                    ? JSON.parse(data.atributos_dinamicos)
                    : data.atributos_dinamicos;

                // Mostrar tipo genérico nome se tiver
                if (data.tipo_id) {
                    try {
                        const tipoRes = await fetch(`http://localhost:5000/generics/types/${data.tipo_id}/atributos`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (tipoRes.ok) {
                            const tipoData = await tipoRes.json();
                            if (tipoData.nome) {
                                setValue("info-tipo", `Genérico — ${tipoData.nome}`);
                            }
                        }
                    } catch(e) { /* silencia */ }
                }

                Object.entries(attrs).forEach(([chave, valor]) => {
                    const div = document.createElement("div");
                    div.className = "col-md-6";
                    const label = chave.charAt(0).toUpperCase() + chave.slice(1).replace(/_/g, " ");
                    div.innerHTML = `
                        <label class="fw-bold mb-1" style="color:#274D8A;">${label}</label>
                        <input type="text" class="form-control fw-medium" disabled
                               value="${valor ?? 'Não informado'}"
                               style="background-color:#EAEAEA; border:1px solid #CCCCCC; color:#555;">
                    `;
                    container.appendChild(div);
                });
            }
        }

    } catch (err) {
        console.error("Erro de conexão com a API:", err);
        alert("Erro fatal de conexão com o servidor. Verifique se o backend Python está rodando.");
        window.location.href = "equipamentos.html";
    }
});