let currentMaterie = [];
let csvData = [];

// Carica materie prime
async function loadMateriePrime(searchTerm = '') {
    try {
        const result = await API.getMateriePrime();
        currentMaterie = result.data || [];
        
        // Filtra per tutti i campi se necessario
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            currentMaterie = currentMaterie.filter(m => 
                (m.codice && m.codice.toLowerCase().includes(search)) ||
                (m.part_number && m.part_number.toLowerCase().includes(search)) ||
                (m.codice_colore && m.codice_colore.toLowerCase().includes(search)) ||
                (m.colore && m.colore.toLowerCase().includes(search))
            );
        }
        
        renderTable(currentMaterie);
    } catch (error) {
        console.error('Errore caricamento materie prime:', error);
        document.getElementById('materiePrimeTable').innerHTML = 
            '<p class="empty-state">Errore nel caricamento dei dati</p>';
    }
}

function renderTable(materie) {
    const container = document.getElementById('materiePrimeTable');
    
    if (!materie || materie.length === 0) {
        container.innerHTML = '<p class="empty-state">Nessuna materia prima trovata. Clicca su "Nuova Materia Prima" o "Importa CSV" per aggiungerne.</p>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Foto</th>
                    <th>Codice</th>
                    <th>Part Number</th>
                    <th>Codice Colore</th>
                    <th>Colore</th>
                    <th>Azioni</th>
                </tr>
            </thead>
            <tbody>
                ${materie.map(materia => `
                    <tr>
                        <td>
                            ${materia.foto_url ? 
                                `<img src="${materia.foto_url}" class="image-preview" alt="${materia.codice}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENO IMG%3C/text%3E%3C/svg%3E'">` 
                                : '<div class="image-preview" style="background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #94a3b8;">📦</div>'}
                        </td>
                        <td><strong>${materia.codice}</strong></td>
                        <td>${materia.part_number || '-'}</td>
                        <td>${materia.codice_colore || '-'}</td>
                        <td>${materia.colore}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-primary btn-icon" onclick="editMateria('${materia.id}')" title="Modifica">✏️</button>
                                <button class="btn btn-sm btn-danger btn-icon" onclick="deleteMateria('${materia.id}', '${materia.codice}')" title="Elimina">🗑️</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// Modal gestione
function openModal(materia = null) {
    const modal = document.getElementById('materiaPrimaModal');
    const form = document.getElementById('materiaPrimaForm');
    const title = document.getElementById('modalTitle');
    
    form.reset();
    document.getElementById('fotoPreview').style.display = 'none';
    
    if (materia) {
        title.textContent = 'Modifica Materia Prima';
        document.getElementById('materiaId').value = materia.id;
        document.getElementById('codice').value = materia.codice;
        document.getElementById('partNumber').value = materia.part_number || '';
        document.getElementById('codiceColore').value = materia.codice_colore || '';
        document.getElementById('colore').value = materia.colore;
        document.getElementById('fotoUrl').value = materia.foto_url || '';
        
        if (materia.foto_url) {
            showPreview(materia.foto_url);
        }
    } else {
        title.textContent = 'Nuova Materia Prima';
        document.getElementById('materiaId').value = '';
    }
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('materiaPrimaModal').classList.remove('active');
}

// Preview foto
document.getElementById('fotoUrl').addEventListener('input', (e) => {
    const url = e.target.value;
    if (url) {
        showPreview(url);
    } else {
        document.getElementById('fotoPreview').style.display = 'none';
    }
});

function showPreview(url) {
    const preview = document.getElementById('fotoPreview');
    const img = document.getElementById('previewImage');
    img.src = url;
    img.onerror = () => {
        preview.style.display = 'none';
    };
    img.onload = () => {
        preview.style.display = 'block';
    };
}

// Form submit
document.getElementById('materiaPrimaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('materiaId').value;
    const data = {
        codice: document.getElementById('codice').value.trim(),
        part_number: document.getElementById('partNumber').value.trim(),
        codice_colore: document.getElementById('codiceColore').value.trim(),
        colore: document.getElementById('colore').value.trim(),
        foto_url: document.getElementById('fotoUrl').value.trim()
    };
    
    try {
        if (id) {
            await API.updateMateriaPrima(id, data);
            Utils.showMessage('message', 'Materia prima aggiornata con successo!', 'success');
        } else {
            // Verifica che il codice non esista già
            const existing = currentMaterie.find(m => m.codice === data.codice);
            if (existing) {
                alert('Codice materiale già esistente. Inserisci un codice univoco.');
                return;
            }
            
            await API.createMateriaPrima(data);
            Utils.showMessage('message', 'Materia prima creata con successo!', 'success');
        }
        
        closeModal();
        loadMateriePrime();
    } catch (error) {
        console.error('Errore salvataggio:', error);
        Utils.showMessage('message', 'Errore durante il salvataggio', 'error');
    }
});

// Edit materia
async function editMateria(id) {
    try {
        const materia = await API.getMateriaPrima(id);
        openModal(materia);
    } catch (error) {
        console.error('Errore caricamento materia:', error);
        alert('Errore nel caricamento della materia prima');
    }
}

// Delete materia
async function deleteMateria(id, codice) {
    if (!confirm(`Sei sicuro di voler eliminare la materia prima "${codice}"?\n\nATTENZIONE: Verifica che non ci siano carichi o stock associati.`)) {
        return;
    }
    
    try {
        await API.deleteMateriaPrima(id);
        Utils.showMessage('message', 'Materia prima eliminata con successo!', 'success');
        loadMateriePrime();
    } catch (error) {
        console.error('Errore eliminazione:', error);
        Utils.showMessage('message', 'Errore durante l\'eliminazione', 'error');
    }
}

// ===== IMPORT CSV =====

function openImportModal() {
    document.getElementById('importModal').classList.add('active');
    document.getElementById('csvFile').value = '';
    document.getElementById('importPreview').style.display = 'none';
    document.getElementById('importConfirmBtn').style.display = 'none';
    document.getElementById('importMessage').style.display = 'none';
    csvData = [];
}

function closeImportModal() {
    document.getElementById('importModal').classList.remove('active');
    document.getElementById('csvFile').value = '';
    document.getElementById('importPreview').style.display = 'none';
    document.getElementById('importConfirmBtn').style.display = 'none';
    document.getElementById('importMessage').style.display = 'none';
    csvData = [];
}

function previewCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Seleziona un file CSV o Excel');
        return;
    }
    
    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    const isCSV = fileName.endsWith('.csv');
    
    if (!isExcel && !isCSV) {
        alert('Formato file non supportato. Usa CSV, XLSX o XLS');
        return;
    }
    
    const reader = new FileReader();
    
    if (isExcel) {
        // Leggi Excel come binario
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Prendi il primo foglio
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Converti in array di oggetti
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                if (jsonData.length < 2) {
                    alert('Il file Excel deve contenere almeno l\'intestazione e una riga di dati');
                    return;
                }
                
                processImportData(jsonData);
                
            } catch (error) {
                console.error('Errore lettura Excel:', error);
                alert('Errore nella lettura del file Excel: ' + error.message);
            }
        };
        
        reader.readAsArrayBuffer(file);
        
    } else {
        // Leggi CSV come testo
        reader.onload = function(e) {
            try {
                const text = e.target.result;
                const lines = text.split('\n').filter(line => line.trim());
                
                if (lines.length < 2) {
                    alert('Il file CSV deve contenere almeno l\'intestazione e una riga di dati');
                    return;
                }
                
                // Converti CSV in array di array
                const jsonData = lines.map(line => parseCSVLine(line));
                
                processImportData(jsonData);
                
            } catch (error) {
                console.error('Errore parsing CSV:', error);
                alert('Errore nella lettura del file CSV: ' + error.message);
            }
        };
        
        reader.readAsText(file, 'UTF-8');
    }
}

// Funzione unificata per processare i dati (da CSV o Excel)
function processImportData(jsonData) {
    try {
        const headers = jsonData[0].map(h => String(h).trim().toLowerCase());
        const expectedHeaders = ['codice', 'part_number', 'codice_colore', 'foto_url', 'colore'];
        
        // Verifica headers
        if (!headers.includes('codice') || !headers.includes('part_number') || !headers.includes('codice_colore') || !headers.includes('foto_url') || !headers.includes('colore')) {
            alert(`Il file deve contenere tutte le colonne: codice, part_number, codice_colore, foto_url, colore\n\nColonne trovate: ${headers.join(', ')}`);
            return;
        }
        
        csvData = [];
        const errors = [];
        
        // Trova indici delle colonne
        const codiceIdx = headers.indexOf('codice');
        const partNumberIdx = headers.indexOf('part_number');
        const codiceColoreIdx = headers.indexOf('codice_colore');
        const fotoUrlIdx = headers.indexOf('foto_url');
        const coloreIdx = headers.indexOf('colore');
        
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            
            // Salta righe vuote o senza dati
            if (!row || row.length === 0 || (row[codiceIdx] === null || row[codiceIdx] === undefined)) continue;
            
            const codice = String(row[codiceIdx] ?? '').trim();
            const part_number = String(row[partNumberIdx] ?? '').trim();
            const codice_colore = String(row[codiceColoreIdx] ?? '').trim();
            const foto_url = String(row[fotoUrlIdx] ?? '').trim();
            const colore = String(row[coloreIdx] ?? '').trim();
            
            // Validazione - Usa === '' per permettere "0" come valore valido
            if (codice === '') {
                errors.push(`Riga ${i + 1}: codice mancante`);
                continue;
            }
            if (part_number === '') {
                errors.push(`Riga ${i + 1}: part_number mancante`);
                continue;
            }
            if (codice_colore === '') {
                errors.push(`Riga ${i + 1}: codice_colore mancante`);
                continue;
            }
            if (foto_url === '') {
                errors.push(`Riga ${i + 1}: foto_url mancante`);
                continue;
            }
            if (colore === '') {
                errors.push(`Riga ${i + 1}: colore mancante`);
                continue;
            }
            
            csvData.push({
                codice: codice,
                part_number: part_number,
                codice_colore: codice_colore,
                colore: colore,
                foto_url: foto_url
            });
        }
        
        if (errors.length > 0) {
            alert('Errori di validazione:\n\n' + errors.join('\n'));
        }
        
        if (csvData.length === 0) {
            alert('Nessun dato valido trovato nel file');
            return;
        }
        
        // Mostra anteprima
        renderPreview(csvData.slice(0, 5));
        document.getElementById('totalRows').textContent = csvData.length;
        document.getElementById('importPreview').style.display = 'block';
        document.getElementById('importConfirmBtn').style.display = 'inline-flex';
        
    } catch (error) {
        console.error('Errore processamento dati:', error);
        alert('Errore nell\'elaborazione dei dati: ' + error.message);
    }
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

function renderPreview(data) {
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Codice</th>
                    <th>Part Number</th>
                    <th>Codice Colore</th>
                    <th>Colore</th>
                    <th>Foto URL</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        <td><strong>${row.codice}</strong></td>
                        <td>${row.part_number}</td>
                        <td>${row.codice_colore}</td>
                        <td>${row.colore}</td>
                        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${row.foto_url}">✅ ${row.foto_url}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    document.getElementById('previewTable').innerHTML = html;
}

async function confirmImport() {
    if (csvData.length === 0) {
        alert('Nessun dato da importare');
        return;
    }
    
    const confirmBtn = document.getElementById('importConfirmBtn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = '⏳ Importazione in corso...';
    
    try {
        // ✅ FIX: Ricarica i dati dal database prima di controllare duplicati
        const freshData = await API.getMateriePrime();
        const existingCodes = new Set(freshData.data.map(m => m.codice));
        
        let imported = 0;
        let skipped = 0;
        const errors = [];
        
        for (let row of csvData) {
            try {
                // ✅ FIX: Verifica contro i dati freschi dal database
                if (existingCodes.has(row.codice)) {
                    skipped++;
                    errors.push(`${row.codice}: già esistente (saltato)`);
                    continue;
                }
                
                await API.createMateriaPrima(row);
                // ✅ Aggiungi il codice appena importato al Set per evitare duplicati nel batch corrente
                existingCodes.add(row.codice);
                imported++;
                
            } catch (error) {
                errors.push(`${row.codice}: ${error.message}`);
            }
        }
        
        let message = `✅ Importazione completata!\n\n`;
        message += `Importati: ${imported}\n`;
        if (skipped > 0) message += `Saltati (duplicati): ${skipped}\n`;
        if (errors.length > 0) {
            message += `\nErrori/Avvisi:\n${errors.join('\n')}`;
        }
        
        Utils.showMessage('importMessage', message.replace(/\n/g, '<br>'), 'success');
        
        // Ricarica tabella
        await loadMateriePrime();
        
        setTimeout(() => {
            closeImportModal();
        }, 3000);
        
    } catch (error) {
        console.error('Errore importazione:', error);
        Utils.showMessage('importMessage', 'Errore durante l\'importazione: ' + error.message, 'error');
        confirmBtn.disabled = false;
        confirmBtn.textContent = '✅ Importa Tutto';
    }
}

// Event listeners
document.getElementById('addBtn').addEventListener('click', () => openModal());
document.getElementById('importBtn').addEventListener('click', openImportModal);

document.getElementById('searchBtn').addEventListener('click', () => {
    const searchTerm = document.getElementById('searchTerm').value;
    loadMateriePrime(searchTerm);
});

document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('searchTerm').value = '';
    loadMateriePrime();
});

// Ricerca con tasto Invio
document.getElementById('searchTerm').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const searchTerm = document.getElementById('searchTerm').value;
        loadMateriePrime(searchTerm);
    }
});

document.getElementById('exportBtn').addEventListener('click', () => {
    if (currentMaterie.length === 0) {
        alert('Nessun dato da esportare');
        return;
    }
    
    const exportData = currentMaterie.map(m => ({
        codice: m.codice,
        part_number: m.part_number || '',
        codice_colore: m.codice_colore || '',
        colore: m.colore,
        foto_url: m.foto_url || '',
        data_creazione: Utils.formatDate(m.created_at)
    }));
    
    Utils.exportToCSV(exportData, `materie_prime_${new Date().toISOString().split('T')[0]}.csv`);
});

// Carica dati all'avvio
loadMateriePrime();
