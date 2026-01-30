// Test API functions
async function testGetStock() {
    showTestResult('Caricamento stock...');
    
    try {
        const response = await fetch('/tables/stock?page=1&limit=10');
        const data = await response.json();
        
        const formatted = {
            status: response.status,
            statusText: response.statusText,
            data: data
        };
        
        showTestResult(JSON.stringify(formatted, null, 2));
    } catch (error) {
        showTestResult(`Errore: ${error.message}`, true);
    }
}

async function testGetMaterie() {
    showTestResult('Caricamento materie prime...');
    
    try {
        const response = await fetch('/tables/materie_prime?page=1&limit=10');
        const data = await response.json();
        
        const formatted = {
            status: response.status,
            statusText: response.statusText,
            data: data
        };
        
        showTestResult(JSON.stringify(formatted, null, 2));
    } catch (error) {
        showTestResult(`Errore: ${error.message}`, true);
    }
}

async function testGetCarichi() {
    showTestResult('Caricamento carichi...');
    
    try {
        const response = await fetch('/tables/carichi_magazzino?page=1&limit=10&sort=-created_at');
        const data = await response.json();
        
        const formatted = {
            status: response.status,
            statusText: response.statusText,
            data: data
        };
        
        showTestResult(JSON.stringify(formatted, null, 2));
    } catch (error) {
        showTestResult(`Errore: ${error.message}`, true);
    }
}

async function testGetScarichi() {
    showTestResult('Caricamento scarichi...');
    
    try {
        const response = await fetch('/tables/scarichi_magazzino?page=1&limit=10&sort=-created_at');
        const data = await response.json();
        
        const formatted = {
            status: response.status,
            statusText: response.statusText,
            data: data
        };
        
        showTestResult(JSON.stringify(formatted, null, 2));
    } catch (error) {
        showTestResult(`Errore: ${error.message}`, true);
    }
}

function showTestResult(result, isError = false) {
    const resultDiv = document.getElementById('testResult');
    const output = document.getElementById('testOutput');
    
    resultDiv.style.display = 'block';
    output.textContent = result;
    
    if (isError) {
        output.style.borderLeft = '4px solid var(--danger-color)';
        output.style.background = '#fee2e2';
        output.style.color = '#991b1b';
    } else {
        output.style.borderLeft = '4px solid var(--success-color)';
        output.style.background = '#1e293b';
        output.style.color = '#e2e8f0';
    }
    
    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
