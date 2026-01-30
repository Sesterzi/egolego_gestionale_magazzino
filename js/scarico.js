let materiePrime = [];
let stockData = [];
let scarichi = [];

// Carica materie prime e stock
async function loadData() {
    try {
        const [materiePrimeResult, stockResult] = await Promise.all([
            API.getMateriePrime(),
            API.getStock(1, 1000)
        ]);
        
        materiePrime = materiePrimeResult.data || [];
        stockData = stockResult.data || [];
        
        populateSelects();
    } catch (error) {
        console.error('Errore caricamento dati:', error);
    }
}

function populateSelects() {
    const select = document.getElementById('codiceMateriale');
    const filterSelect = document.getElementById('filterCodice');
    
    select.innerHTML = '<option value="">Seleziona...</option>';
    filterSelect.innerHTML = '<option value="">Tutti</option>';
    
    stockData.forEach(stock => {
        const materia = materiePrime.find(m => m.codice === stock.codice_materiale);
        const label = materia ? `${stock.codice_materiale} - ${materia.colore} (${stock.quantita_disponibile} pz)` : stock.codice_materiale;
        
        select.innerHTML += `<option value="${stock.codice_materiale}">${label}</option>`;
        filterSelect.innerHTML += `<option value="${stock.codice_materiale}">${stock.codice_materiale}</option>`;
    });
}

// Mostra info stock quando selezionato
document.getElementById('codiceMateriale').addEventListener('change', (e) => {
    const codice = e.target.value;
    const info = document.getElementById('stockInfo');
    
    if (!codice) {
        info.style.display = 'none';
        return;
    }
    
    const materia = materiePrime.find(m => m.codice === codice);
    const stock = stockData.find(s => s.codice_materiale === codice);
    
    if (materia && stock) {
        document.getElementById('stockInfoColore').textContent = materia.colore;
        document.getElementById('stockInfoPartNumber').textContent = materia.part_number || '-';
        document.getElementById('stockInfoQty').textContent = stock.quantita_disponibile;
        
        const foto = document.getElementById('stockInfoFoto');
        if (materia.foto_url) {
            foto.src = materia.foto_url;
            foto.style.display = 'block';
        } else {
            foto.style.display = 'none';
        }
        
        info.style.display = 'block';
    }
});

// Controlla quantità disponibile
document.getElementById('quantita').addEventListener('input', (e) => {
    const codice = document.getElementById('codiceMateriale').value;
    const quantita = parseInt(e.target.value);
    const warning = document.getElementById('qtyWarning');
    
    if (!codice) {
        warning.style.display = 'none';
        return;
    }
    
    const stock = stockData.find(s => s.codice_materiale === codice);
    
    if (stock && quantita > stock.quantita_disponibile) {
        warning.style.display = 'block';
    } else {
        warning.style.display = 'none';
    }
});

// Form submit
document.getElementById('scaricoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const numeroOrdine = document.getElementById('numeroOrdine').value.trim();
    const codice = document.getElementById('codiceMateriale').value;
    const quantita = parseInt(document.getElementById('quantita').value);
    const note = document.getElementById('note').value.trim();
    
    try {
        // Crea lo scarico
        await API.createScarico({
            numero_ordine: numeroOrdine,
            codice_materiale: codice,
            quantita: quantita,
            note: note,
            data_scarico: Date.now()
        });
        
        // Aggiorna lo stock
        await Utils.aggiornaStockScarico(codice, quantita);
        
        Utils.showMessage('message', '✅ Scarico effettuato con successo!', 'success');
        
        // Reset form
        document.getElementById('scaricoForm').reset();
        document.getElementById('stockInfo').style.display = 'none';
        document.getElementById('qtyWarning').style.display = 'none';
        
        // Ricarica dati
        await loadData();
        loadScarichi();
        
    } catch (error) {
        console.error('Errore scarico:', error);
        Utils.showMessage('message', 'Errore durante lo scarico: ' + error.message, 'error');
    }
});

// Carica storico scarichi
async function loadScarichi(filterOrdine = '', filterCodice = '', filterData = '') {
    try {
        const result = await API.getScarichi(1, 1000);
        scarichi = result.data || [];
        
        // Applica filtri
        let filteredScarichi = [...scarichi];
        
        if (filterOrdine) {
            filteredScarichi = filteredScarichi.filter(s => 
                s.numero_ordine.toLowerCase().includes(filterOrdine.toLowerCase())
            );
        }
        
        if (filterCodice) {
            filteredScarichi = filteredScarichi.filter(s => s.codice_materiale === filterCodice);
        }
        
        if (filterData) {
            const filterDate = new Date(filterData).toDateString();
            filteredScarichi = filteredScarichi.filter(s => {
                const scaricoDate = new Date(s.data_scarico).toDateString();
                return scaricoDate === filterDate;
            });
        }
        
        renderTable(filteredScarichi);
    } catch (error) {
        console.error('Errore caricamento scarichi:', error);
        document.getElementById('scarichiTable').innerHTML = 
            '<p class="empty-state">Errore nel caricamento dei dati</p>';
    }
}

function renderTable(scarichiData) {
    const container = document.getElementById('scarichiTable');
    
    if (!scarichiData || scarichiData.length === 0) {
        container.innerHTML = '<p class="empty-state">Nessuno scarico registrato</p>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Numero Ordine</th>
                    <th>Codice Materiale</th>
                    <th>Quantità</th>
                    <th>Note</th>
                </tr>
            </thead>
            <tbody>
                ${scarichiData.map(scarico => `
                    <tr>
                        <td>${Utils.formatDate(scarico.data_scarico)}</td>
                        <td><strong>#${scarico.numero_ordine}</strong></td>
                        <td>${scarico.codice_materiale}</td>
                        <td>${scarico.quantita} pz</td>
                        <td>${scarico.note || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// Filtri
document.getElementById('filterBtn').addEventListener('click', () => {
    const ordine = document.getElementById('filterOrdine').value;
    const codice = document.getElementById('filterCodice').value;
    const data = document.getElementById('filterData').value;
    loadScarichi(ordine, codice, data);
});

document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('filterOrdine').value = '';
    document.getElementById('filterCodice').value = '';
    document.getElementById('filterData').value = '';
    loadScarichi();
});

// Export CSV
document.getElementById('exportBtn').addEventListener('click', () => {
    if (scarichi.length === 0) {
        alert('Nessun dato da esportare');
        return;
    }
    
    const exportData = scarichi.map(s => ({
        data_scarico: Utils.formatDate(s.data_scarico),
        numero_ordine: s.numero_ordine,
        codice_materiale: s.codice_materiale,
        quantita: s.quantita,
        note: s.note || ''
    }));
    
    Utils.exportToCSV(exportData, `scarichi_magazzino_${new Date().toISOString().split('T')[0]}.csv`);
});

// ===== SCARICO MULTIPLO =====

function openMultiploModal() {
    document.getElementById('scaricoMultiploModal').classList.add('active');
    populateMultiploSelects();
}

function closeMultiploModal() {
    document.getElementById('scaricoMultiploModal').classList.remove('active');
    document.getElementById('scaricoMultiploForm').reset();
    
    // Reset distinte container
    const container = document.getElementById('distinteContainer');
    container.innerHTML = `
        <div class="distinta-row" style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 12px; margin-bottom: 12px;">
            <div class="form-group" style="margin: 0;">
                <select class="materiale-select" required>
                    <option value="">Seleziona materiale...</option>
                </select>
            </div>
            <div class="form-group" style="margin: 0;">
                <input type="number" class="quantita-input" required min="1" placeholder="Quantità">
            </div>
            <button type="button" class="btn btn-sm btn-danger" onclick="removeDistintaRow(this)" style="visibility: hidden;">🗑️</button>
        </div>
    `;
    
    populateMultiploSelects();
}

function populateMultiploSelects() {
    const selects = document.querySelectorAll('.materiale-select');
    
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Seleziona materiale...</option>';
        
        stockData.forEach(stock => {
            const materia = materiePrime.find(m => m.codice === stock.codice_materiale);
            const label = materia ? `${stock.codice_materiale} - ${materia.colore} (${stock.quantita_disponibile} pz)` : stock.codice_materiale;
            select.innerHTML += `<option value="${stock.codice_materiale}">${label}</option>`;
        });
        
        if (currentValue) select.value = currentValue;
    });
}

document.getElementById('addDistintaBtn').addEventListener('click', () => {
    const container = document.getElementById('distinteContainer');
    const newRow = document.createElement('div');
    newRow.className = 'distinta-row';
    newRow.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr auto; gap: 12px; margin-bottom: 12px;';
    
    newRow.innerHTML = `
        <div class="form-group" style="margin: 0;">
            <select class="materiale-select" required>
                <option value="">Seleziona materiale...</option>
            </select>
        </div>
        <div class="form-group" style="margin: 0;">
            <input type="number" class="quantita-input" required min="1" placeholder="Quantità">
        </div>
        <button type="button" class="btn btn-sm btn-danger" onclick="removeDistintaRow(this)">🗑️</button>
    `;
    
    container.appendChild(newRow);
    populateMultiploSelects();
});

function removeDistintaRow(button) {
    button.closest('.distinta-row').remove();
}

document.getElementById('scaricoMultiploBtn').addEventListener('click', openMultiploModal);

document.getElementById('scaricoMultiploForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const numeroOrdine = document.getElementById('numeroOrdineMultiplo').value.trim();
    const rows = document.querySelectorAll('.distinta-row');
    
    const distinta = [];
    for (let row of rows) {
        const codice = row.querySelector('.materiale-select').value;
        const quantita = parseInt(row.querySelector('.quantita-input').value);
        
        if (codice && quantita > 0) {
            distinta.push({ codice, quantita });
        }
    }
    
    if (distinta.length === 0) {
        alert('Inserisci almeno un materiale nella distinta');
        return;
    }
    
    try {
        // Verifica stock disponibile per tutti i materiali
        for (let item of distinta) {
            const stock = stockData.find(s => s.codice_materiale === item.codice);
            if (!stock || stock.quantita_disponibile < item.quantita) {
                throw new Error(`Stock insufficiente per ${item.codice}`);
            }
        }
        
        // Esegui tutti gli scarichi
        for (let item of distinta) {
            await API.createScarico({
                numero_ordine: numeroOrdine,
                codice_materiale: item.codice,
                quantita: item.quantita,
                note: 'Scarico multiplo',
                data_scarico: Date.now()
            });
            
            await Utils.aggiornaStockScarico(item.codice, item.quantita);
        }
        
        Utils.showMessage('multiploMessage', `✅ Scarico multiplo completato! ${distinta.length} materiali scaricati.`, 'success');
        
        setTimeout(() => {
            closeMultiploModal();
            loadData();
            loadScarichi();
        }, 2000);
        
    } catch (error) {
        console.error('Errore scarico multiplo:', error);
        Utils.showMessage('multiploMessage', 'Errore: ' + error.message, 'error');
    }
});

// Carica dati all'avvio
loadData();
loadScarichi();
