# Guia Definitivo de Implementação: Equipamentos Genéricos

Este é o documento técnico completo para a execução e integração da feature em um prazo de **48 horas**. Ele contém os contratos de API, os scripts de banco de dados e exemplos práticos de código (focados no Frontend) para destravar a equipe imediatamente.

---

## 1. Planejamento da Sprint e Paralelismo

Para que os 4 desenvolvedores trabalhem em paralelo, o desenvolvimento foi dividido em duas "camadas" que se encontram no final do Dia 2:
* **Camada de Configuração:** Criar os tipos e regras (Dev 1 e Dev 3).
* **Camada de Operação:** O cadastro de equipamentos em si (Dev 2 e Dev 4).

### Cronograma:
* **Dia 1 (Manhã):** Reunião de alinhamento dos contratos JSON descritos abaixo.
* **Dia 1 (Tarde):** Backends focam no CRUD e validações. Frontends montam o HTML/CSS e usam Mocks (dados fixos) para o Javascript.
* **Dia 2 (Manhã):** Retirada dos Mocks e conexão real das requisições FETCH. Testes de criação.
* **Dia 2 (Tarde):** Testes de erro (ex: tentar salvar sem um campo obrigatório), ajustes finos e deploy.

---

## 2. Os Contratos de Integração (Acordo Front 🤝 Back)

Para que o Front e o Back programem sem um bloquear o outro, as requisições devem seguir estritamente o formato abaixo.

### A. O Front pede os atributos de um Tipo (Ex: "Roteador")
**Endpoint:** `GET /api/tipos-equipamento/2/atributos`
**Resposta esperada do Backend:**
```json
{
  "tipo_id": 2,
  "nome_tipo": "Roteador",
  "atributos": [
    { "chave": "ip_lan", "label": "IP LAN", "tipo_dado": "ip", "obrigatorio": false, "opcoes": null },
    { "chave": "uso_equip", "label": "Uso", "tipo_dado": "lista", "obrigatorio": true, "opcoes": ["Servidor", "Uso Pessoal"] },
    { "chave": "equip_vinc_id", "label": "Equipamento Vinculado", "tipo_dado": "patrimonio", "obrigatorio": false, "opcoes": null }
  ]
}
```

### B. O Front envia o Equipamento para salvar
**Endpoint:** `POST /api/equipamentos`
**Payload que o Frontend enviará:**
```json
{
  "num_patrimonio": "PAT-00123",
  "tipo_equipamento_id": 2, 
  "setor_id": 1,
  "status": "ativo",
  "observacao": "Roteador da sala de reuniões",
  "atributos_dinamicos": {
    "ip_lan": "192.168.1.1",
    "uso_equip": "Uso Pessoal",
    "equip_vinc_id": null
  }
}
```

---

## 3. Guia Prático por Desenvolvedor

### 🧑‍💻 DEV 1: Banco de Dados e APIs de Configuração (Backend)
Sua missão é dar a base estrutural. O Front 3 dependerá das suas rotas.

**Script de Banco de Dados (MySQL 8):**
```sql
-- 1. Afrouxar o tipo atual e adicionar a coluna JSON
ALTER TABLE equipamentos 
MODIFY COLUMN tipo VARCHAR(50) NULL,
ADD COLUMN tipo_equipamento_id INT NULL AFTER tipo,
ADD COLUMN atributos_dinamicos JSON NULL,
ADD CONSTRAINT fk_tipo_equipamento FOREIGN KEY (tipo_equipamento_id) REFERENCES tipos_equipamento(id);

-- 2. Tabela de Tipos
CREATE TABLE tipos_equipamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Atributos (O mapa de regras)
CREATE TABLE atributos_tipo_equipamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_equipamento_id INT NOT NULL,
    chave VARCHAR(50) NOT NULL, 
    label VARCHAR(100) NOT NULL,
    tipo_dado ENUM('texto', 'numero', 'data', 'booleano', 'lista', 'ip', 'patrimonio') NOT NULL,
    obrigatorio BOOLEAN DEFAULT FALSE,
    opcoes JSON NULL,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (tipo_equipamento_id) REFERENCES tipos_equipamento(id),
    UNIQUE(tipo_equipamento_id, chave)
);
```
**Suas Rotas:**
1. `GET /api/tipos-equipamento` (Lista tipos ativos).
2. `POST /api/tipos-equipamento` (Cria novo tipo e seus atributos em lote).
3. `GET /api/tipos-equipamento/:id/atributos` (Traz o JSON de contrato A para o Dev 4).

---

### 🧑‍💻 DEV 2: O Motor do Backend (Validação e Rotas Core)
Sua missão é processar a requisição complexa do Contrato B.

**Fluxo de Validação no POST/PUT Equipamento:**
1. Recebeu o payload? Extraia o `tipo_equipamento_id` e o objeto `atributos_dinamicos`.
2. Vá no banco (tabela `atributos_tipo_equipamento`) e busque TODAS as regras para esse `tipo_equipamento_id`.
3. **Validação Dinâmica:** Faça um loop nas regras do banco:
   - Se a regra diz que `chave` é obrigatória, verifique se ela existe e não está nula no JSON recebido.
   - Se a regra diz que o tipo é `ip`, aplique um Regex no valor do JSON recebido.
   - Se a regra diz que o tipo é `lista`, verifique se o valor enviado está contido na coluna `opcoes` do banco.
4. Se passar em tudo, faça o `INSERT/UPDATE` na tabela `equipamentos` injetando o JSON diretamente na coluna `atributos_dinamicos`.

---

### 🧑‍💻 DEV 3: Frontend Administrativo
Sua missão é criar a tela de Configurações onde o Administrador "constrói" os tipos.
* **UI:** A tela precisa de um input para o nome do Tipo e um botão "Adicionar Campo".
* Ao clicar em "Adicionar Campo", aparece uma linha com inputs: Nome do Campo, Tipo do Dado (Select) e Obrigatório (Checkbox).
* Se no Select ele escolher "Lista de Opções", exiba um textarea para ele digitar as opções (separadas por vírgula).
* No final, envie um JSON unificado para o Dev 1 salvar.

---

### 🧑‍💻 DEV 4: Frontend Formulário Dinâmico (Guia Completo de Integração)
Sua missão é a mais visual. Você precisa fazer o formulário atual "mudar de forma" usando Vanilla JS (Javascript puro).

**A. Estrutura HTML Básica:**
No HTML atual de cadastro de equipamento, adicione um container vazio onde os campos dinâmicos vão nascer.
```html
<!-- Campos padrão já existentes -->
<select id="tipo_equipamento_select">
   <option value="">Selecione o Tipo...</option>
   <!-- As opções virão da API do Dev 1 -->
</select>

<!-- Div onde a "mágica" vai acontecer -->
<div id="container_campos_dinamicos"></div>
```

**B. Como renderizar os campos (Javascript Puro):**
```javascript
const selectTipo = document.getElementById('tipo_equipamento_select');
const containerDinamico = document.getElementById('container_campos_dinamicos');

// Escuta a mudança do Select
selectTipo.addEventListener('change', async (event) => {
    const tipoId = event.target.value;
    containerDinamico.innerHTML = ''; // Limpa os campos antigos
    
    if(!tipoId) return;

    // Faz a chamada na API (Mock ou Real - Contrato A)
    const response = await fetch(`/api/tipos-equipamento/${tipoId}/atributos`);
    const data = await response.json();

    // Loop para construir o HTML de cada atributo
    data.atributos.forEach(attr => {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group mb-3';

        // Cria o Label
        const label = document.createElement('label');
        label.innerText = attr.label + (attr.obrigatorio ? ' *' : '');
        wrapper.appendChild(label);

        let inputElement;

        // Se for um tipo Select (Lista)
        if (attr.tipo_dado === 'lista') {
            inputElement = document.createElement('select');
            inputElement.className = 'form-select atributo-dinamico-input';
            
            // Adiciona option em branco
            inputElement.add(new Option('Selecione...', ''));
            
            // Adiciona as opções vindas do banco
            attr.opcoes.forEach(opt => {
                inputElement.add(new Option(opt, opt));
            });
        } 
        // Se for Booleano (Sim/Não)
        else if (attr.tipo_dado === 'booleano') {
             inputElement = document.createElement('select');
             inputElement.className = 'form-select atributo-dinamico-input';
             inputElement.add(new Option('Selecione...', ''));
             inputElement.add(new Option('Sim', 'true'));
             inputElement.add(new Option('Não', 'false'));
        }
        // Se for texto, IP, número, etc.
        else {
            inputElement = document.createElement('input');
            inputElement.className = 'form-control atributo-dinamico-input';
            inputElement.type = attr.tipo_dado === 'numero' ? 'number' : 'text';
            if (attr.tipo_dado === 'data') inputElement.type = 'date';
        }

        // Configurações comuns a todos os inputs
        inputElement.id = `dinamico_${attr.chave}`;
        inputElement.dataset.chave = attr.chave; // Guarda a chave original no dataset
        if (attr.obrigatorio) inputElement.required = true;

        wrapper.appendChild(inputElement);
        containerDinamico.appendChild(wrapper);
    });
});
```

**C. Como montar o Payload para o Backend (O momento de Salvar):**
Quando o usuário clicar em "Salvar Equipamento", seu JS precisa varrer a tela e juntar as informações.
```javascript
document.getElementById('form_equipamento').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Pega os campos padrão (exemplo resumido)
    const payload = {
        num_patrimonio: document.getElementById('patrimonio').value,
        tipo_equipamento_id: document.getElementById('tipo_equipamento_select').value,
        atributos_dinamicos: {} // Objeto que vai guardar a parte dinâmica
    };

    // Varre todos os inputs dinâmicos que criamos no Passo B
    const camposDinamicos = document.querySelectorAll('.atributo-dinamico-input');
    
    camposDinamicos.forEach(input => {
        const chave = input.dataset.chave; // Pega a chave que salvamos no dataset
        const valor = input.value;
        payload.atributos_dinamicos[chave] = valor;
    });

    // Dispara para a API do DEV 2 (Contrato B)
    const response = await fetch('/api/equipamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if(response.ok) {
        alert('Equipamento Salvo com Sucesso!');
    } else {
        alert('Erro ao validar os campos no servidor.');
    }
});
```

Com esse passo a passo, o DEV 4 tem todo o raciocínio pronto. Ele não precisará adivinhar como capturar os dados, basta adaptar as classes CSS (`form-select`, `form-control`) ao design atual da aplicação.
