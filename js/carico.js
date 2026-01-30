let materiePrime = [];
let carichi = [];

// Carica materie prime per il dropdown
async function loadMateriePrime() {
    try {
        const result = await API.getMateriePrime();
        materiePrime = result.data || [];
        
        const select = document.getElementById('codiceMateriale');
        const filterSelect = document.getElementById('filterCodice');
        
        select.innerHTML = '<option value="">Seleziona...</option>';
        filterSelect.innerHTML = '<option value="">Tutti</option>';
        
        materiePrime.forEach(materia => {
            select.innerHTML += `<option value="${materia.codice}">${materia.codice} - ${materia.colore}</option>`;
            filterSelect.innerHTML += `<option value="${materia.codice}">${materia.codice}</option>`;
        });
    } catch (error) {
        console.error('Errore caricamento materie prime:', error);
    }
}

// Mostra info materiale quando selezionato
document.getElementById('codiceMateriale').addEventListener('change', (e) => {
    const codice = e.target.value;
    const info = document.getElementById('materialeInfo');
    
    if (!codice) {
        info.style.display = 'none';
        return;
    }
    
    const materia = materiePrime.find(m => m.codice === codice);
    if (materia) {
        document.getElementById('materialeInfoColore').textContent = materia.colore;
        document.getElementById('materialeInfoPartNumber').textContent = materia.part_number || '-';
        
        const foto = document.getElementById('materialeInfoFoto');
        if (materia.foto_url) {
            foto.src = materia.foto_url;
            foto.style.display = 'block';
        } else {
            foto.style.display = 'none';
        }
        
        info.style.display = 'block';
    }
});

// Calcolo automatico prezzi
function updateCalcoli() {
    const quantita = parseFloat(document.getElementById('quantita').value) || 0;
    const prezzoTotale = parseFloat(document.getElementById('prezzoTotale').value) || 0;
    const ivaPerc = parseFloat(document.getElementById('ivaPercentuale').value) || 0;
    
    const prezzoUnitario = quantita > 0 ? prezzoTotale / quantita : 0;
    const importoIva = (prezzoTotale * ivaPerc) / 100;
    const totaleConIva = prezzoTotale + importoIva;
    
    document.getElementById('prezzoUnitarioCalc').textContent = Utils.formatCurrency(prezzoUnitario);
    document.getElementById('importoIvaCalc').textContent = Utils.formatCurrency(importoIva);
    document.getElementById('totaleConIvaCalc').textContent = Utils.formatCurrency(totaleConIva);
}

document.getElementById('quantita').addEventListener('input', updateCalcoli);
document.getElementById('prezzoTotale').addEventListener('input', updateCalcoli);
document.getElementById('ivaPercentuale').addEventListener('input', updateCalcoli);

// Form submit
document.getElementById('caricoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const codice = document.getElementById('codiceMateriale').value;
    const quantita = parseInt(document.getElementById('quantita').value);
    const prezzoTotale = parseFloat(document.getElementById('prezzoTotale').value);
    const ivaPerc = parseFloat(document.getElementById('ivaPercentuale').value) || 0;
    const prezzoUnitario = prezzoTotale / quantita;
    
    try {
        // Calcola il prezzo medio ponderato
        const prezzoMedio = await Utils.calcolaPrezzoMedio(codice, quantita, prezzoTotale);
        
        // Crea il carico
        await API.createCarico({
            codice_materiale: codice,
            quantita: quantita,
            prezzo_totale: prezzoTotale,
            iva_percentuale: ivaPerc,
            prezzo_unitario: prezzoUnitario,
            data_carico: Date.now()
        });
        
        // Aggiorna lo stock
        await Utils.aggiornaStockCarico(codice, quantita, prezzoMedio);
        
        Utils.showMessage('message', `✅ Carico effettuato! Prezzo medio aggiornato: ${Utils.formatCurrency(prezzoMedio)}`, 'success');
        
        // Reset form
        document.getElementById('caricoForm').reset();
        document.getElementById('materialeInfo').style.display = 'none';
        updateCalcoli();
        
        // Ricarica tabella
        loadCarichi();
        
    } catch (error) {
        console.error('Errore carico:', error);
        Utils.showMessage('message', 'Errore durante il carico: ' + error.message, 'error');
    }
});

// Carica storico carichi
async function loadCarichi(filterCodice = '', filterData = '') {
    try {
        const result = await API.getCarichi(1, 1000);
        carichi = result.data || [];
        
        // Applica filtri
        let filteredCarichi = [...carichi];
        
        if (filterCodice) {
            filteredCarichi = filteredCarichi.filter(c => c.codice_materiale === filterCodice);
        }
        
        if (filterData) {
            const filterDate = new Date(filterData).toDateString();
            filteredCarichi = filteredCarichi.filter(c => {
                const caricoDate = new Date(c.data_carico).toDateString();
                return caricoDate === filterDate;
            });
        }
        
        renderTable(filteredCarichi);
    } catch (error) {
        console.error('Errore caricamento carichi:', error);
        document.getElementById('carichiTable').innerHTML = 
            '<p class="empty-state">Errore nel caricamento dei dati</p>';
    }
}

function renderTable(carichiData) {
    const container = document.getElementById('carichiTable');
    
    if (!carichiData || carichiData.length === 0) {
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
                    <th>IVA %</th>
                    <th>Prezzo Unitario</th>
                    <th>Totale con IVA</th>
                </tr>
            </thead>
            <tbody>
                ${carichiData.map(carico => {
                    const totaleConIva = carico.prezzo_totale * (1 + carico.iva_percentuale / 100);
                    return `
                        <tr>
                            <td>${Utils.formatDate(carico.data_carico)}</td>
                            <td><strong>${carico.codice_materiale}</strong></td>
                            <td>${carico.quantita} pz</td>
                            <td>${Utils.formatCurrency(carico.prezzo_totale)}</td>
                            <td>${carico.iva_percentuale}%</td>
                            <td>${Utils.formatCurrency(carico.prezzo_unitario)}</td>
                            <td><strong>${Utils.formatCurrency(totaleConIva)}</strong></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// Filtri
document.getElementById('filterBtn').addEventListener('click', () => {
    const codice = document.getElementById('filterCodice').value;
    const data = document.getElementById('filterData').value;
    loadCarichi(codice, data);
});

document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('filterCodice').value = '';
    document.getElementById('filterData').value = '';
    loadCarichi();
});

// Export CSV
document.getElementById('exportBtn').addEventListener('click', () => {
    if (carichi.length === 0) {
        alert('Nessun dato da esportare');
        return;
    }
    
    const exportData = carichi.map(c => ({
        data_carico: Utils.formatDate(c.data_carico),
        codice_materiale: c.codice_materiale,
        quantita: c.quantita,
        prezzo_totale: c.prezzo_totale,
        iva_percentuale: c.iva_percentuale,
        prezzo_unitario: c.prezzo_unitario,
        totale_con_iva: c.prezzo_totale * (1 + c.iva_percentuale / 100)
    }));
    
    Utils.exportToCSV(exportData, `carichi_magazzino_${new Date().toISOString().split('T')[0]}.csv`);
});

// Carica dati all'avvio
loadMateriePrime();
loadCarichi();
