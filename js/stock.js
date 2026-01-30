let stockData = [];
let materiePrime = [];

// Carica materie prime per avere le informazioni complete
async function loadMateriePrime() {
    try {
        const result = await API.getMateriePrime();
        materiePrime = result.data || [];
    } catch (error) {
        console.error('Errore caricamento materie prime:', error);
    }
}

// Carica stock
async function loadStock(searchTerm = '', filterStatus = '') {
    try {
        const result = await API.getStock(1, 1000);
        stockData = result.data || [];
        
        // Filtra per codice
        if (searchTerm) {
            stockData = stockData.filter(s => 
                s.codice_materiale.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Filtra per stato
        if (filterStatus) {
            stockData = stockData.filter(s => {
                const qty = s.quantita_disponibile;
                switch (filterStatus) {
                    case 'ok': return qty >= 10;
                    case 'basso': return qty < 10 && qty >= 5;
                    case 'critico': return qty < 5 && qty > 0;
                    case 'esaurito': return qty === 0;
                    default: return true;
                }
            });
        }
        
        updateStats(stockData);
        renderTable(stockData);
    } catch (error) {
        console.error('Errore caricamento stock:', error);
        document.getElementById('stockTable').innerHTML = 
            '<p class="empty-state">Errore nel caricamento dei dati</p>';
    }
}

function updateStats(data) {
    const totaleSku = data.length;
    const totalePezzi = data.reduce((sum, item) => sum + item.quantita_disponibile, 0);
    const valoreTotale = data.reduce((sum, item) => sum + (item.quantita_disponibile * item.prezzo_medio), 0);
    const stockBasso = data.filter(item => item.quantita_disponibile < 10).length;
    
    document.getElementById('totaleSku').textContent = totaleSku;
    document.getElementById('totalePezzi').textContent = totalePezzi;
    document.getElementById('valoreTotale').textContent = Utils.formatCurrency(valoreTotale);
    document.getElementById('stockBasso').textContent = stockBasso;
}

function renderTable(data) {
    const container = document.getElementById('stockTable');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="empty-state">Nessun stock disponibile</p>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Foto</th>
                    <th>Codice</th>
                    <th>Colore</th>
                    <th>Quantità</th>
                    <th>Prezzo Medio</th>
                    <th>Valore Stock</th>
                    <th>Stato</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(stock => {
                    const materia = materiePrime.find(m => m.codice === stock.codice_materiale);
                    const qty = stock.quantita_disponibile;
                    const valore = qty * stock.prezzo_medio;
                    
                    let badgeClass, statoText;
                    if (qty === 0) {
                        badgeClass = 'badge-danger';
                        statoText = 'ESAURITO';
                    } else if (qty < 5) {
                        badgeClass = 'badge-danger';
                        statoText = 'CRITICO';
                    } else if (qty < 10) {
                        badgeClass = 'badge-warning';
                        statoText = 'BASSO';
                    } else {
                        badgeClass = 'badge-success';
                        statoText = 'OK';
                    }
                    
                    return `
                        <tr>
                            <td>
                                ${materia && materia.foto_url ? 
                                    `<img src="${materia.foto_url}" class="image-preview" alt="${stock.codice_materiale}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENO IMG%3C/text%3E%3C/svg%3E'">` 
                                    : '<div class="image-preview" style="background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #94a3b8;">📦</div>'}
                            </td>
                            <td><strong>${stock.codice_materiale}</strong></td>
                            <td>${materia ? materia.colore : '-'}</td>
                            <td><strong style="font-size: 18px;">${qty}</strong> pz</td>
                            <td>${Utils.formatCurrency(stock.prezzo_medio)}</td>
                            <td><strong>${Utils.formatCurrency(valore)}</strong></td>
                            <td><span class="badge ${badgeClass}">${statoText}</span></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// Event listeners
document.getElementById('filterBtn').addEventListener('click', () => {
    const searchTerm = document.getElementById('searchCodice').value;
    const filterStatus = document.getElementById('filterStatus').value;
    loadStock(searchTerm, filterStatus);
});

document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('searchCodice').value = '';
    document.getElementById('filterStatus').value = '';
    loadStock();
});

document.getElementById('exportBtn').addEventListener('click', () => {
    if (stockData.length === 0) {
        alert('Nessun dato da esportare');
        return;
    }
    
    const exportData = stockData.map(s => {
        const materia = materiePrime.find(m => m.codice === s.codice_materiale);
        return {
            codice: s.codice_materiale,
            colore: materia ? materia.colore : '',
            part_number: materia ? materia.part_number : '',
            quantita_disponibile: s.quantita_disponibile,
            prezzo_medio: s.prezzo_medio,
            valore_stock: s.quantita_disponibile * s.prezzo_medio
        };
    });
    
    Utils.exportToCSV(exportData, `stock_magazzino_${new Date().toISOString().split('T')[0]}.csv`);
});

// Carica dati all'avvio
loadMateriePrime().then(() => loadStock());
