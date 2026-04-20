document.addEventListener("DOMContentLoaded", () => {
    // Define o tempo do loading em milissegundos (2500ms = 2.5 segundos)
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        const loginScreen = document.getElementById('login-screen');
        
        // Inicia o fade out (suaviza a saída do loading)
        loadingScreen.style.opacity = '0';
        
        // Após a transição do CSS terminar (500ms), remove a tela e mostra o login
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loginScreen.style.display = 'block';
            
            // Libera a rolagem da página que estava travada
            document.body.style.overflow = 'auto'; 
        }, 500); 
        
    }, 2500); 
});