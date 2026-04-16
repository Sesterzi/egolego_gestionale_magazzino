let stockData    = [];
let materiePrime = [];

// ── Carica dati ───────────────────────────────
async function loadMateriePrime() {
    try {
        const result = await API.getMateriePrime(1, 5000);
        materiePrime = result.data || [];
    } catch (err) {
        console.error('Errore caricamento materie prime:', err);
    }
}

async function loadStock(searchTerm = '', filterStatus = '') {
    try {
        const result = await API.getStock(1, 5000);
        let data = result.data || [];

        // Ricerca su unique_id, color_name, lego_size, size_code
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            data = data.filter(stock => {
                const m = findMateria(stock.codice_materiale);
                return stock.codice_materiale.toLowerCase().includes(s)
                    || (m?.color_name  || '').toLowerCase().includes(s)
                    || (m?.lego_size   || '').toLowerCase().includes(s)
                    || (m?.size_code   || '').toLowerCase().includes(s);
            });
        }

        // Filtro stato
        if (filterStatus) {
            data = data.filter(s => {
                const qty = s.quantita_disponibile;
                if (filterStatus === 'ok')      return qty >= 10;
                if (filterStatus === 'basso')   return qty < 10 && qty >= 5;
                if (filterStatus === 'critico') return qty < 5  && qty > 0;
                if (filterStatus === 'esaurito')return qty === 0;
                return true;
            });
        }

        stockData = data;
        updateStats(data);
        renderTable(data);
    } catch (err) {
        console.error('Errore caricamento stock:', err);
        document.getElementById('stockTable').innerHTML =
            '<p class="empty-state">Errore nel caricamento dei dati</p>';
    }
}

function findMateria(uid) {
    return materiePrime.find(m => m.unique_id === uid) || null;
}

// ── Stats ─────────────────────────────────────
function updateStats(data) {
    const totaleSku   = data.length;
    const totalePezzi = data.reduce((s, i) => s + i.quantita_disponibile, 0);
    const valoreTot   = data.reduce((s, i) => s + i.quantita_disponibile * (i.prezzo_medio || 0), 0);
    const stockBasso  = data.filter(i => i.quantita_disponibile < 10).length;

    document.getElementById('totaleSku').textContent    = totaleSku;
    document.getElementById('totalePezzi').textContent  = totalePezzi.toLocaleString('it-IT');
    document.getElementById('valoreTotale').textContent = formatUSD(valoreTot);
    document.getElementById('stockBasso').textContent   = stockBasso;
}

// ── Tabella ───────────────────────────────────
function renderTable(data) {
    const container = document.getElementById('stockTable');
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="empty-state">Nessun stock disponibile</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Foto</th>
                    <th>Unique ID</th>
                    <th>Colore</th>
                    <th>LEGO Size</th>
                    <th>Quantità</th>
                    <th>Prezzo medio (USD)</th>
                    <th>Valore stock (USD)</th>
                    <th>Stato</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(stock => {
                    const m   = findMateria(stock.codice_materiale);
                    const qty = stock.quantita_disponibile;
                    const pm  = stock.prezzo_medio || 0;
                    const val = qty * pm;

                    // Immagine dal catalogo materie prime
                    const imgUrl = m?.picture_url || '';
                    const imgHtml = imgUrl
                        ? `<img src="${imgUrl}" class="image-preview" alt="${stock.codice_materiale}"
                               onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                           <div class="image-preview" style="display:none;background:#f1f5f9;align-items:center;justify-content:center;color:#94a3b8;">📦</div>`
                        : `<div class="image-preview" style="background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#94a3b8;">📦</div>`;

                    // Pallino colore HEX
                    const dot = m?.color_ref
                        ? `<span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${m.color_ref};border:1px solid #ddd;vertical-align:middle;margin-right:5px;"></span>`
                        : '';

                    // Badge stato
                    let badgeClass, statoText;
                    if (qty === 0)      { badgeClass = 'badge-danger';  statoText = 'ESAURITO'; }
                    else if (qty < 5)   { badgeClass = 'badge-danger';  statoText = 'CRITICO'; }
                    else if (qty < 10)  { badgeClass = 'badge-warning'; statoText = 'BASSO'; }
                    else                { badgeClass = 'badge-success'; statoText = 'OK'; }

                    return `
                        <tr>
                            <td>${imgHtml}</td>
                            <td><strong>${stock.codice_materiale}</strong></td>
                            <td>
                                ${dot}${m?.color_name || '—'}
                                ${m?.color_id ? `<br><small style="color:#94a3b8;">ID: ${m.color_id}</small>` : ''}
                            </td>
                            <td>${m?.lego_size || '—'}<br><small style="color:#94a3b8;">${m?.size_code || ''}</small></td>
                            <td><strong style="font-size:18px;">${qty.toLocaleString('it-IT')}</strong> pz</td>
                            <td>${formatUSD(pm)}</td>
                            <td><strong>${formatUSD(val)}</strong></td>
                            <td><span class="badge ${badgeClass}">${statoText}</span></td>
                        </tr>`;
                }).join('')}
            </tbody>
        </table>`;
}

// ── Formato USD ───────────────────────────────
function formatUSD(amount) {
    if (amount == null) return '$ 0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// ── Event listeners ───────────────────────────
document.getElementById('filterBtn').addEventListener('click', () => {
    loadStock(
        document.getElementById('searchCodice').value,
        document.getElementById('filterStatus').value
    );
});

document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('searchCodice').value  = '';
    document.getElementById('filterStatus').value  = '';
    loadStock();
});

document.getElementById('exportBtn').addEventListener('click', () => {
    if (!stockData.length) { alert('Nessun dato da esportare'); return; }
    Utils.exportToCSV(stockData.map(s => {
        const m = findMateria(s.codice_materiale);
        return {
            unique_id:            s.codice_materiale,
            color_name:           m?.color_name  || '',
            color_ref:            m?.color_ref   || '',
            lego_size:            m?.lego_size   || '',
            size_code:            m?.size_code   || '',
            quantita_disponibile: s.quantita_disponibile,
            prezzo_medio_usd:     s.prezzo_medio || 0,
            valore_stock_usd:     s.quantita_disponibile * (s.prezzo_medio || 0)
        };
    }), `stock_magazzino_${new Date().toISOString().split('T')[0]}.csv`);
});

// ── Init ──────────────────────────────────────
loadMateriePrime().then(() => loadStock());
