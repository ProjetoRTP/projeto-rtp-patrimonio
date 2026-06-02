// ── Seleção de Elementos do DOM ──
const selectMetodo = document.getElementById('select-metodo');
const grupoImagem  = document.getElementById('grupo-imagem');
const grupoScanner = document.getElementById('grupo-scanner');
const hrMetodo     = document.getElementById('hr-metodo');
const inputImagem  = document.getElementById('input-imagem');
const nomeArquivo  = document.getElementById('nome-arquivo');
const btnBuscar    = document.getElementById('btn-buscar');
const inputScanner = document.getElementById('input-scanner');

// ── Alternar telas conforme o método selecionado ──
selectMetodo.addEventListener('change', () => {
    const metodo = selectMetodo.value;

    grupoImagem.style.display  = 'none';
    grupoScanner.style.display = 'none';
    hrMetodo.style.display     = 'none';

    if (metodo === 'imagem') {
        hrMetodo.style.display    = 'block';
        grupoImagem.style.display = 'block';
    } else if (metodo === 'scanner') {
        hrMetodo.style.display     = 'block';
        grupoScanner.style.display = 'block';
    }
});

// ── Upload Automático da Imagem ao Selecionar o Arquivo ──
inputImagem.addEventListener('change', () => {
    const file = inputImagem.files[0];
    
    if (!file) {
        nomeArquivo.textContent = 'Procurar arquivo';
        return;
    }

    nomeArquivo.textContent = file.name;

    // Criando o FormData para enviar o arquivo físico
    const formData = new FormData();
    formData.append('barcode_image', file);

    // Envia para o backend Flask (Ajuste a URL se houver prefixo no Blueprint)
    // ... dentro do inputImagem.addEventListener('change', () => { ...

    fetch('/upload', { 
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            // Caso o OpenCV não ache códigos, cai aqui (status 422)
            return response.json().then(err => { throw new Error(err.message) });
        }
        return response.json();
    })
    .then(data => {
        console.log('Sucesso:', data);
        
        // Pega o primeiro código retornado do array do Python
        const codigoDetectado = data.codigos[0]; 
        
        // Exemplo: Se quiser jogar o código lido direto no input do scanner para simular a busca:
        document.getElementById('input-scanner').value = codigoDetectado;
        
        // Ativa o botão de busca já que agora tem um código válido ali
        document.getElementById('btn-buscar').disabled = false;

        alert(`Código detectado com sucesso: ${codigoDetectado}`);
    })
    .catch(error => {
        console.error('Erro:', error);
        alert(error.message || 'Erro ao processar imagem.');
    });
});

// ── Validação do Scanner (Limite de caracteres para EAN-13) ──
btnBuscar.disabled = true;

inputScanner.addEventListener('input', () => {
    const valor = inputScanner.value.trim();
    
    // Habilita o botão apenas se tiver exatamente 13 dígitos (padrão comercial EAN-13)
    // Se quiser aceitar qualquer tamanho contanto que não seja vazio, mude para: valor.length > 0
    if (valor.length === 13) {
        btnBuscar.disabled = false;
    } else {
        btnBuscar.disabled = true;
    }
});