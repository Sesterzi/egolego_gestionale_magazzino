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
                (m.unique_id && m.unique_id.toLowerCase().includes(search)) ||
                (m.color_name && m.color_name.toLowerCase().includes(search)) ||
                (m.color_id && m.color_id.toLowerCase().includes(search)) ||
                (m.lego_size && m.lego_size.toLowerCase().includes(search)) ||
                (m.size_code && m.size_code.toLowerCase().includes(search))
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
                    <th>Unique ID</th>
                    <th>Colore</th>
                    <th style="width: 60px;">HEX</th>
                    <th>LEGO Size</th>
                    <th>Size Code</th>
                    <th>Azioni</th>
                </tr>
            </thead>
            <tbody>
                ${materie.map(materia => `
                    <tr>
                        <td>
                            ${materia.picture_url ? 
                                `<img src="${materia.picture_url}" class="image-preview" alt="${materia.unique_id}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENO IMG%3C/text%3E%3C/svg%3E'">` 
                                : '<div class="image-preview" style="background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #94a3b8;">📦</div>'}
                        </td>
                        <td><strong>${materia.unique_id}</strong></td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 24px; height: 24px; border-radius: 4px; border: 1px solid #ddd; background: ${materia.color_ref || '#ccc'};"></div>
                                <div>
                                    <div><strong>${materia.color_name || '-'}</strong></div>
                                    <small style="color: #666;">ID: ${materia.color_id || '-'}</small>
                                </div>
                            </div>
                        </td>
                        <td><code style="font-size: 11px;">${materia.color_ref || '-'}</code></td>
                        <td>${materia.lego_size || '-'}</td>
                        <td><strong>${materia.size_code || '-'}</strong></td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-primary btn-icon" onclick="editMateria('${materia.id}')" title="Modifica">✏️</button>
                                <button class="btn btn-sm btn-danger btn-icon" onclick="deleteMateria('${materia.id}', '${materia.unique_id}')" title="Elimina">🗑️</button>
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
        document.getElementById('uniqueId').value = materia.unique_id || '';
        document.getElementById('colorName').value = materia.color_name || '';
        document.getElementById('colorRef').value = materia.color_ref || '';
        document.getElementById('colorId').value = materia.color_id || '';
        document.getElementById('legoSize').value = materia.lego_size || '';
        document.getElementById('sizeCode').value = materia.size_code || '';
        document.getElementById('pictureUrl').value = materia.picture_url || '';
        
        if (materia.picture_url) {
            showPreview(materia.picture_url);
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
document.getElementById('pictureUrl').addEventListener('input', (e) => {
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
        unique_id: document.getElementById('uniqueId').value.trim(),
        color_name: document.getElementById('colorName').value.trim(),
        color_ref: document.getElementById('colorRef').value.trim(),
        color_id: document.getElementById('colorId').value.trim(),
        lego_size: document.getElementById('legoSize').value.trim(),
        size_code: document.getElementById('sizeCode').value.trim(),
        picture_url: document.getElementById('pictureUrl').value.trim()
    };
    
    try {
        if (id) {
            await API.updateMateriaPrima(id, data);
            Utils.showMessage('message', 'Materia prima aggiornata con successo!', 'success');
        } else {
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
        console.error('Errore caricamento:', error);
        alert('Errore nel caricamento della materia prima');
    }
}

// Delete materia
async function deleteMateria(id, uniqueId) {
    if (!confirm(`Sei sicuro di voler eliminare la materia prima "${uniqueId}"?\\n\\nATTENZIONE: Verifica che non ci siano carichi o stock associati.`)) {
        return;
    }
    
    try {
        await API.deleteMateriaPrima(id);
        Utils.showMessage('message', 'Materia prima eliminata con successo!', 'success');
        loadMateriePrime();
    } catch (error) {
        console.error('Errore eliminazione:', error);
        Utils.showMessage('message', 'Errore durante l\\'eliminazione', 'error');
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

// Preview CSV
document.getElementById('csvFile').addEventListener('change', previewCSV);

async function previewCSV() {
    const file = document.getElementById('csvFile').files[0];
    
    if (!file) {
        alert('Seleziona un file CSV o Excel');
        return;
    }
    
    document.getElementById('importPreview').style.display = 'none';
    document.getElementById('importConfirmBtn').style.display = 'none';
    document.getElementById('importMessage').style.display = 'none';
    csvData = [];
    
    const reader = new FileReader();
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    
    if (isExcel) {
        // Leggi Excel
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, {header: 1});
                
                processImportData(jsonData);
                
            } catch (error) {
                console.error('Errore lettura Excel:', error);
                alert('Errore nella lettura del file Excel: ' + error.message);
            }
        };
        
        reader.readAsArrayBuffer(file);
        
    } else {
        // Leggi CSV
        reader.onload = function(e) {
            try {
                const text = e.target.result;
                const lines = text.split('\\n').filter(line => line.trim());
                
                if (lines.length < 2) {
                    alert('Il file CSV deve contenere almeno l\\'intestazione e una riga di dati');
                    return;
                }
                
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

function processImportData(jsonData) {
    try {
        const headers = jsonData[0].map(h => String(h).trim().toLowerCase());
        const expectedHeaders = ['color_name', 'color_ref', 'color_id', 'lego_size', 'size_code', 'picture_url', 'unique_id'];
        
        // Verifica headers
        const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            alert(`Il file deve contenere tutte le colonne: ${expectedHeaders.join(', ')}\\n\\nColonne mancanti: ${missingHeaders.join(', ')}\\n\\nColonne trovate: ${headers.join(', ')}`);
            return;
        }
        
        csvData = [];
        const errors = [];
        
        // Trova indici delle colonne
        const colorNameIdx = headers.indexOf('color_name');
        const colorRefIdx = headers.indexOf('color_ref');
        const colorIdIdx = headers.indexOf('color_id');
        const legoSizeIdx = headers.indexOf('lego_size');
        const sizeCodeIdx = headers.indexOf('size_code');
        const pictureUrlIdx = headers.indexOf('picture_url');
        const uniqueIdIdx = headers.indexOf('unique_id');
        
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            
            // Salta righe vuote
            if (!row || row.length === 0 || (row[uniqueIdIdx] === null || row[uniqueIdIdx] === undefined)) continue;
            
            const unique_id = String(row[uniqueIdIdx] ?? '').trim();
            const color_name = String(row[colorNameIdx] ?? '').trim();
            const color_ref = String(row[colorRefIdx] ?? '').trim();
            const color_id = String(row[colorIdIdx] ?? '').trim();
            const lego_size = String(row[legoSizeIdx] ?? '').trim();
            const size_code = String(row[sizeCodeIdx] ?? '').trim();
            const picture_url = String(row[pictureUrlIdx] ?? '').trim();
            
            // Validazione campi obbligatori
            if (unique_id === '') {
                errors.push(`Riga ${i + 1}: unique_id mancante`);
                continue;
            }
            if (color_name === '') {
                errors.push(`Riga ${i + 1}: color_name mancante`);
                continue;
            }
            if (color_ref === '') {
                errors.push(`Riga ${i + 1}: color_ref mancante`);
                continue;
            }
            if (color_id === '') {
                errors.push(`Riga ${i + 1}: color_id mancante`);
                continue;
            }
            if (lego_size === '') {
                errors.push(`Riga ${i + 1}: lego_size mancante`);
                continue;
            }
            if (size_code === '') {
                errors.push(`Riga ${i + 1}: size_code mancante`);
                continue;
            }
            if (picture_url === '') {
                errors.push(`Riga ${i + 1}: picture_url mancante`);
                continue;
            }
            
            // Valida formato HEX
            if (color_ref && !color_ref.match(/^#[0-9A-Fa-f]{6}$/)) {
                errors.push(`Riga ${i + 1}: color_ref non valido (deve essere #RRGGBB)`);
                continue;
            }
            
            csvData.push({
                unique_id,
                color_name,
                color_ref,
                color_id,
                lego_size,
                size_code,
                picture_url
            });
        }
        
        if (errors.length > 0) {
            alert('Errori di validazione:\\n\\n' + errors.join('\\n'));
            return;
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
        alert('Errore nell\\'elaborazione dei dati: ' + error.message);
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
                    <th>Unique ID</th>
                    <th>Colore</th>
                    <th>HEX</th>
                    <th>LEGO Size</th>
                    <th>Size Code</th>
                    <th>Picture</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        <td><strong>${row.unique_id}</strong></td>
                        <td>${row.color_name} (ID: ${row.color_id})</td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 4px;">
                                <div style="width: 16px; height: 16px; border: 1px solid #ddd; background: ${row.color_ref};"></div>
                                <code style="font-size: 11px;">${row.color_ref}</code>
                            </div>
                        </td>
                        <td>${row.lego_size}</td>
                        <td><strong>${row.size_code}</strong></td>
                        <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${row.picture_url}">✅ URL</td>
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
        // Ricarica dati dal database prima dell'import
        const freshData = await API.getMateriePrime();
        const existingIds = new Set(freshData.data.map(m => m.unique_id));
        
        let imported = 0;
        let skipped = 0;
        const errors = [];
        
        for (let row of csvData) {
            try {
                if (existingIds.has(row.unique_id)) {
                    skipped++;
                    errors.push(`${row.unique_id}: già esistente (saltato)`);
                    continue;
                }
                
                await API.createMateriaPrima(row);
                existingIds.add(row.unique_id);
                imported++;
                
            } catch (error) {
                errors.push(`${row.unique_id}: ${error.message}`);
            }
        }
        
        let message = `✅ Importazione completata!\\n\\n`;
        message += `Importati: ${imported}\\n`;
        if (skipped > 0) message += `Saltati (duplicati): ${skipped}\\n`;
        if (errors.length > 0) {
            message += `\\nErrori/Avvisi:\\n${errors.join('\\n')}`;
        }
        
        Utils.showMessage('importMessage', message.replace(/\\n/g, '<br>'), 'success');
        
        await loadMateriePrime();
        
        setTimeout(() => {
            closeImportModal();
        }, 3000);
        
    } catch (error) {
        console.error('Errore importazione:', error);
        Utils.showMessage('importMessage', 'Errore durante l\\'importazione: ' + error.message, 'error');
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
        unique_id: m.unique_id,
        color_name: m.color_name || '',
        color_ref: m.color_ref || '',
        color_id: m.color_id || '',
        lego_size: m.lego_size || '',
        size_code: m.size_code || '',
        picture_url: m.picture_url || '',
        data_creazione: Utils.formatDate(m.created_at)
    }));
    
    Utils.exportToCSV(exportData, `materie_prime_lego_${new Date().toISOString().split('T')[0]}.csv`);
});

// Carica dati all'avvio
loadMateriePrime();
