// Credenziali statiche
const CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Verifica se l'utente è autenticato
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('authenticated') === 'true';
    
    // Se siamo sulla pagina di login e siamo autenticati, vai alla dashboard
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        if (isAuthenticated) {
            window.location.href = 'dashboard.html';
        }
        return;
    }
    
    // Se non siamo sulla pagina di login e non siamo autenticati, vai al login
    if (!isAuthenticated) {
        window.location.href = 'index.html';
    }
}

// Login form handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        
        if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
            sessionStorage.setItem('authenticated', 'true');
            window.location.href = 'dashboard.html';
        } else {
            errorMessage.textContent = 'Username o password non corretti';
            errorMessage.style.display = 'block';
        }
    });
}

// Logout handler
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('authenticated');
        window.location.href = 'index.html';
    });
}

// Controlla l'autenticazione al caricamento della pagina
checkAuth();
