// Dashboard Statistics
async function loadDashboardStats() {
    try {
        const [materiePrime, carichi, scarichi, stock] = await Promise.all([
            API.getMateriePrime(),
            API.getCarichi(),
            API.getScarichi(),
            API.getStock()
        ]);
        
        // Aggiorna statistiche
        document.getElementById('totalMaterie').textContent = materiePrime.total || 0;
        document.getElementById('totalCarichi').textContent = carichi.total || 0;
        document.getElementById('totalScarichi').textContent = scarichi.total || 0;
        
        // Calcola valore totale stock
        let valoreTotale = 0;
        if (stock.data && stock.data.length > 0) {
            valoreTotale = stock.data.reduce((sum, item) => {
                return sum + (item.quantita_disponibile * item.prezzo_medio);
            }, 0);
        }
        document.getElementById('valoreTotale').textContent = Utils.formatCurrency(valoreTotale);
        
        // Carica ultimi carichi
        loadUltimiCarichi(carichi.data.slice(0, 5));
        
        // Carica ultimi scarichi
        loadUltimiScarichi(scarichi.data.slice(0, 5));
        
        // Carica stock con giacenza bassa
        loadStockBasso(stock.data);
        
    } catch (error) {
        console.error('Errore caricamento dashboard:', error);
    }
}

function loadUltimiCarichi(carichi) {
    const container = document.getElementById('ultimiCarichi');
    
    if (!carichi || carichi.length === 0) {
        container.innerHTML = '<p class="empty-state">Nessun carico registrato</p>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Codice</th>
                    <th>Quantità</th>
                    <th>Prezzo Totale</th>
                    <th>Prezzo Unit.</th>
                </tr>
            </thead>
            <tbody>
                ${carichi.map(carico => `
                    <tr>
                        <td>${Utils.formatDate(carico.data_carico)}</td>
                        <td><strong>${carico.codice_materiale}</strong></td>
                        <td>${carico.quantita} pz</td>
                        <td>${Utils.formatCurrency(carico.prezzo_totale)}</td>
                        <td>${Utils.formatCurrency(carico.prezzo_unitario)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function loadUltimiScarichi(scarichi) {
    const container = document.getElementById('ultimiScarichi');
    
    if (!scarichi || scarichi.length === 0) {
        container.innerHTML = '<p class="empty-state">Nessuno scarico registrato</p>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Ordine</th>
                    <th>Codice</th>
                    <th>Quantità</th>
                </tr>
            </thead>
            <tbody>
                ${scarichi.map(scarico => `
                    <tr>
                        <td>${Utils.formatDate(scarico.data_scarico)}</td>
                        <td><strong>#${scarico.numero_ordine}</strong></td>
                        <td>${scarico.codice_materiale}</td>
                        <td>${scarico.quantita} pz</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function loadStockBasso(stockData) {
    const container = document.getElementById('stockBasso');
    
    // Filtra stock con quantità < 10
    const stockBasso = stockData.filter(item => item.quantita_disponibile < 10);
    
    if (!stockBasso || stockBasso.length === 0) {
        container.innerHTML = '<p class="empty-state">Nessun materiale con giacenza bassa</p>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Codice</th>
                    <th>Quantità Disponibile</th>
                    <th>Prezzo Medio</th>
                    <th>Stato</th>
                </tr>
            </thead>
            <tbody>
                ${stockBasso.map(item => {
                    const badgeClass = item.quantita_disponibile === 0 ? 'badge-danger' : 
                                      item.quantita_disponibile < 5 ? 'badge-warning' : 'badge-success';
                    const statoText = item.quantita_disponibile === 0 ? 'ESAURITO' : 
                                     item.quantita_disponibile < 5 ? 'CRITICO' : 'BASSO';
                    
                    return `
                        <tr>
                            <td><strong>${item.codice_materiale}</strong></td>
                            <td>${item.quantita_disponibile} pz</td>
                            <td>${Utils.formatCurrency(item.prezzo_medio)}</td>
                            <td><span class="badge ${badgeClass}">${statoText}</span></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// Carica dashboard al caricamento pagina
if (window.location.pathname.includes('dashboard.html')) {
    loadDashboardStats();
}
