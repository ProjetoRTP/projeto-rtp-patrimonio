

const btCriar = document.getElementById('btCriar');

btCriar.addEventListener('click', (event) => {
    event.preventDefault();

    alert("Movimentação salva com sucesso!");
    window.location.href='movimentacoes-certa.html';
});