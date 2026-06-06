// ── Seleção de Elementos do DOM ──
const selectMetodo = document.getElementById('select-metodo');
const grupoScanner = document.getElementById('grupo-scanner');
const hrMetodo     = document.getElementById('hr-metodo');
const btnBuscar    = document.getElementById('btn-buscar');
const inputScanner = document.getElementById('input-scanner');

// ── Alternar tela conforme o método selecionado ──
selectMetodo.addEventListener('change', () => {
    const metodo = selectMetodo.value;

    grupoScanner.style.display = 'none';
    hrMetodo.style.display     = 'none';

    if (metodo === 'scanner') {
        hrMetodo.style.display     = 'block';
        grupoScanner.style.display = 'block';
    }
});

// ── Validação do Scanner (EAN-13) ──
btnBuscar.disabled = true;

inputScanner.addEventListener('input', () => {
    const valor = inputScanner.value.trim();
    btnBuscar.disabled = valor.length !== 13;
});