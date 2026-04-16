/**
 * carico.js — v2.1
 * Ordini multi-riga + import Excel/CSV
 * Schema LEGO v4.0 (unique_id, color_name, color_ref, lego_size, size_code)
 *
 * Campi Excel supportati:
 *   unique_id | quantita | data | invoice_number | prezzo | prezzo_incl_transport
 * Calcolati automaticamente:
 *   prezzo_unitario = prezzo / quantita
 *   prezzo_unitario_incl_transport = prezzo_incl_transport / quantita
 */

let materiePrime = [];
let carichi      = [];
let lineCount    = 0;
let importRows   = [];

// ── Tabs ──────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        if (btn.dataset.tab === 'storico') loadCarichi();
    });
});

// ── Carica catalogo materie prime ─────────────
async function loadMateriePrime() {
    try {
        const result = await API.getMateriePrime(1, 5000);
        materiePrime = result.data || [];

        const filterSelect = document.getElementById('filterCodice');
        filterSelect.innerHTML = '<option value="">Tutti</option>';
        materiePrime.forEach(m => {
            filterSelect.innerHTML += `<option value="${m.unique_id}">${buildLabel(m)}</option>`;
        });

        addOrderLine();
    } catch (err) {
        showMsg('message-manuale', '❌ Impossibile caricare il catalogo: ' + err.message, 'error');
    }
}

function buildLabel(m) {
    if (!m) return '—';
    return [m.unique_id, m.color_name, m.lego_size, m.size_code ? `(${m.size_code})` : '']
        .filter(Boolean).join(' · ');
}

function findMateria(uid) {
    return materiePrime.find(m => m.unique_id === uid) || null;
}

// ── Righe ordine manuale ──────────────────────
function addOrderLine() {
    lineCount++;
    const id   = lineCount;
    const opts = materiePrime.map(m =>
        `<option value="${m.unique_id}">${buildLabel(m)}</option>`
    ).join('');

    const div = document.createElement('div');
    div.className = 'order-line';
    div.id = `line-${id}`;
    div.innerHTML = `
        <div>
            <select id="mat-${id}" onchange="onMatChange(${id})">
                <option value="">— Seleziona materiale —</option>${opts}
            </select>
            <div id="mat-info-${id}" style="font-size:11px;color:var(--secondary-color);margin-top:3px;min-height:14px;"></div>
        </div>
        <input type="number" id="qty-${id}"   min="1"  step="1"    placeholder="pz"    oninput="updateSummary()">
        <input type="number" id="price-${id}" min="0"  step="0.01" placeholder="€"     oninput="updateSummary()">
        <input type="number" id="transp-${id}" min="0" step="0.01" placeholder="€ + tr." oninput="updateSummary()">
        <button class="btn-remove-line" onclick="removeLine(${id})">🗑</button>`;
    document.getElementById('orderLines').appendChild(div);
    updateSummary();
}

function removeLine(id) {
    const el = document.getElementById(`line-${id}`);
    if (el) el.remove();
    updateSummary();
}

function onMatChange(id) {
    const uid  = document.getElementById(`mat-${id}`).value;
    const info = document.getElementById(`mat-info-${id}`);
    if (!uid) { info.innerHTML = ''; return; }
    const m = findMateria(uid);
    if (m) {
        const dot = m.color_ref
            ? `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${m.color_ref};border:1px solid #ccc;vertical-align:middle;margin-right:4px;"></span>`
            : '';
        info.innerHTML = `${dot}${m.color_ref || ''} · ID colore: ${m.color_id || '—'} · Stock: <strong id="stock-${id}">…</strong> pz`;
        API.getStockByCodice(uid).then(s => {
            const el = document.getElementById(`stock-${id}`);
            if (el) el.textContent = s ? s.quantita_disponibile : 0;
        }).catch(() => {});
    }
}

function updateSummary() {
    const iva = parseFloat(document.getElementById('ivaOrdine').value) || 0;
    let righe = 0, pezzi = 0, imponibile = 0, totTransp = 0;

    document.querySelectorAll('.order-line').forEach(line => {
        const id     = line.id.replace('line-', '');
        const mat    = document.getElementById(`mat-${id}`)?.value;
        const qty    = parseFloat(document.getElementById(`qty-${id}`)?.value)    || 0;
        const price  = parseFloat(document.getElementById(`price-${id}`)?.value)  || 0;
        const transp = parseFloat(document.getElementById(`transp-${id}`)?.value) || 0;
        if (mat) righe++;
        pezzi      += qty;
        imponibile += price;
        totTransp  += transp;
    });

    const ivaAmt      = imponibile * iva / 100;
    const ivaAmtTr    = totTransp  * iva / 100;
    document.getElementById('summaryRighe').textContent      = righe;
    document.getElementById('summaryPezzi').textContent      = pezzi;
    document.getElementById('summaryImponibile').textContent = Utils.formatCurrency(imponibile);
    document.getElementById('summaryTransp').textContent     = Utils.formatCurrency(totTransp);
    document.getElementById('summaryIva').textContent        = Utils.formatCurrency(ivaAmt);
    document.getElementById('summaryTotale').textContent     = Utils.formatCurrency(imponibile + ivaAmt);
    document.getElementById('summaryTotaleTransp').textContent = Utils.formatCurrency(totTransp + ivaAmtTr);
}

document.getElementById('ivaOrdine').addEventListener('input', updateSummary);
document.getElementById('addLineBtn').addEventListener('click', addOrderLine);

// ── Submit ordine manuale ─────────────────────
document.getElementById('submitOrdineBtn').addEventListener('click', async () => {
    const numeroOrdine  = document.getElementById('numeroOrdine').value.trim();
    const fornitore     = document.getElementById('fornitore').value.trim();
    const iva           = parseFloat(document.getElementById('ivaOrdine').value) || 0;
    const dataOrdineVal = document.getElementById('dataOrdine').value;
    const dataOrdine    = dataOrdineVal ? new Date(dataOrdineVal).getTime() : Date.now();

    const righe = [];
    document.querySelectorAll('.order-line').forEach(line => {
        const id     = line.id.replace('line-', '');
        const mat    = document.getElementById(`mat-${id}`)?.value;
        const qty    = parseInt(document.getElementById(`qty-${id}`)?.value);
        const price  = parseFloat(document.getElementById(`price-${id}`)?.value);
        const transp = parseFloat(document.getElementById(`transp-${id}`)?.value) || 0;
        if (mat && qty > 0 && !isNaN(price) && price >= 0) {
            righe.push({ unique_id: mat, quantita: qty, prezzo: price, prezzo_incl_transport: transp || price });
        }
    });

    if (righe.length === 0) {
        showMsg('message-manuale', '⚠️ Inserisci almeno una riga valida (materiale + quantità + prezzo).', 'error');
        return;
    }

    const btn = document.getElementById('submitOrdineBtn');
    btn.disabled = true; btn.textContent = '⏳ Salvataggio...';
    try {
        await salvaCarichi(righe, { numeroOrdine, fornitore, iva, dataOrdine });
        showMsg('message-manuale', `✅ Carico confermato! ${righe.length} materiali aggiornati in magazzino.`, 'success');
        document.getElementById('orderLines').innerHTML = '';
        lineCount = 0;
        document.getElementById('numeroOrdine').value = '';
        document.getElementById('fornitore').value    = '';
        document.getElementById('dataOrdine').value   = '';
        addOrderLine(); updateSummary();
    } catch (err) {
        showMsg('message-manuale', '❌ Errore: ' + err.message, 'error');
    } finally {
        btn.disabled = false; btn.textContent = '✅ Conferma carico in magazzino';
    }
});

// ── Salvataggio righe ─────────────────────────
async function salvaCarichi(righe, { numeroOrdine = '', fornitore = '', iva = 0, dataOrdine = null }) {
    for (const riga of righe) {
        const ivaRiga  = riga.iva_percentuale !== undefined ? riga.iva_percentuale : iva;
        const prezzo   = riga.prezzo;
        const transpTot = riga.prezzo_incl_transport;
        const puBase   = riga.quantita > 0 ? prezzo    / riga.quantita : 0;
        const puTransp = riga.quantita > 0 ? transpTot / riga.quantita : 0;

        // Il prezzo medio ponderato usa il prezzo incl. trasporto (costo reale di carico)
        const prezzoMedio = await calcolaPrezzoMedioUid(riga.unique_id, riga.quantita, transpTot);

        await API.createCarico({
            codice_materiale:          riga.unique_id,
            quantita:                  riga.quantita,
            prezzo_totale:             prezzo,
            prezzo_incl_transport:     transpTot,
            iva_percentuale:           ivaRiga,
            prezzo_unitario:           puBase,
            prezzo_unitario_transport: puTransp,
            numero_ordine:             numeroOrdine,
            fornitore:                 fornitore,
            data_carico:               dataOrdine || Date.now()
        });

        await aggiornaStockUid(riga.unique_id, riga.quantita, prezzoMedio);
    }
}

// ── Prezzo medio ponderato ────────────────────
async function calcolaPrezzoMedioUid(uid, nuovaQty, nuovoPrezzo) {
    const stock = await API.getStockByCodice(uid);
    if (!stock || stock.quantita_disponibile === 0) {
        return nuovaQty > 0 ? nuovoPrezzo / nuovaQty : 0;
    }
    const vecchioValore = stock.quantita_disponibile * (stock.prezzo_medio || 0);
    const totQty        = stock.quantita_disponibile + nuovaQty;
    return totQty > 0 ? (vecchioValore + nuovoPrezzo) / totQty : 0;
}

// ── Aggiorna stock ────────────────────────────
async function aggiornaStockUid(uid, quantita, prezzoMedio) {
    const stock = await API.getStockByCodice(uid);
    if (stock) {
        await API.updateStock(stock.id, {
            codice_materiale:     uid,
            quantita_disponibile: stock.quantita_disponibile + quantita,
            prezzo_medio:         prezzoMedio
        });
    } else {
        await API.createStock({
            codice_materiale:     uid,
            quantita_disponibile: quantita,
            prezzo_medio:         prezzoMedio
        });
    }
}

// ── Import Excel / CSV ────────────────────────
const importZone  = document.getElementById('importZone');
const importInput = document.getElementById('importFileInput');

importZone.addEventListener('dragover', e => { e.preventDefault(); importZone.classList.add('dragover'); });
importZone.addEventListener('dragleave', () => importZone.classList.remove('dragover'));
importZone.addEventListener('drop', e => {
    e.preventDefault(); importZone.classList.remove('dragover');
    if (e.dataTransfer.files[0]) handleImportFile(e.dataTransfer.files[0]);
});
importInput.addEventListener('change', e => {
    if (e.target.files[0]) handleImportFile(e.target.files[0]);
});

async function handleImportFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    let rows = [];
    try {
        if (ext === 'csv')                    rows = parseCSV(await file.text());
        else if (['xlsx','xls'].includes(ext)) rows = await parseExcel(file);
        else return alert('Formato non supportato. Usa .xlsx, .xls o .csv');
    } catch (err) { return alert('Errore lettura file: ' + err.message); }

    if (!rows.length) return alert('File vuoto o formato non riconosciuto.');

    importRows = rows.map(row => {
        const uid      = String(row.unique_id || '').trim();
        const qty      = parseInt(row.quantita || 0);
        const prezzo   = parseFloat(row.prezzo || 0);
        // prezzo_incl_transport: se mancante nel file, default = prezzo
        const transpRaw = row.prezzo_incl_transport;
        const transp   = (transpRaw !== undefined && transpRaw !== '') ? parseFloat(transpRaw) : prezzo;
        const invoiceNo = String(row.invoice_number || '').trim();
        const ivaR     = (row.iva_percentuale !== undefined && row.iva_percentuale !== '')
                            ? parseFloat(row.iva_percentuale) : undefined;

        // Data: accetta timestamp numerico, stringa ISO o formato GG/MM/AAAA
        let dataCarico = Date.now();
        if (row.data) {
            const d = parseDataFlex(row.data);
            if (d) dataCarico = d;
        }

        const materia = findMateria(uid);
        let stato = 'ok', statoMsg = 'OK';
        if (!uid)            { stato = 'err';  statoMsg = 'unique_id mancante'; }
        else if (!materia)   { stato = 'warn'; statoMsg = 'Non trovato nel DB'; }
        else if (!(qty > 0)) { stato = 'err';  statoMsg = 'Quantità non valida'; }
        else if (isNaN(prezzo) || prezzo < 0) { stato = 'err'; statoMsg = 'Prezzo non valido'; }

        const puBase   = qty > 0 ? prezzo  / qty : 0;
        const puTransp = qty > 0 ? transp  / qty : 0;

        return {
            unique_id: uid, quantita: qty,
            prezzo, prezzo_incl_transport: transp,
            prezzo_unitario: puBase, prezzo_unitario_transport: puTransp,
            invoice_number: invoiceNo, iva_percentuale: ivaR,
            data_carico: dataCarico,
            materia, stato, statoMsg
        };
    });

    renderImportPreview();
}

/** Parsing flessibile date: Excel serial, ISO, GG/MM/AAAA, MM/DD/AAAA */
function parseDataFlex(raw) {
    if (!raw && raw !== 0) return null;
    // Excel serial number
    if (typeof raw === 'number') {
        const d = new Date((raw - 25569) * 86400 * 1000);
        return isNaN(d) ? null : d.getTime();
    }
    const s = String(raw).trim();
    // GG/MM/AAAA
    const dmyMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmyMatch) {
        const d = new Date(+dmyMatch[3], +dmyMatch[2] - 1, +dmyMatch[1]);
        return isNaN(d) ? null : d.getTime();
    }
    // ISO o qualsiasi formato standard
    const d = new Date(s);
    return isNaN(d) ? null : d.getTime();
}

function parseCSV(text) {
    const lines   = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g,'').toLowerCase());
    return lines.slice(1).filter(l => l.trim()).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g,''));
        const obj  = {};
        headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
        return obj;
    });
}

function parseExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const wb   = XLSX.read(e.target.result, { type: 'array', cellDates: false });
                const ws   = wb.Sheets[wb.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
                resolve(data.map(row => {
                    const n = {};
                    Object.keys(row).forEach(k => { n[k.toLowerCase().trim()] = row[k]; });
                    return n;
                }));
            } catch (err) { reject(err); }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function renderImportPreview() {
    const okCnt   = importRows.filter(r => r.stato === 'ok').length;
    const warnCnt = importRows.filter(r => r.stato === 'warn').length;
    const errCnt  = importRows.filter(r => r.stato === 'err').length;

    const tbody = importRows.map(r => {
        const rc  = r.stato === 'ok' ? 'row-ok' : r.stato === 'warn' ? 'row-warn' : 'row-err';
        const tc  = r.stato === 'ok' ? 'tag-ok' : r.stato === 'warn' ? 'tag-warn' : 'tag-err';
        const dot = r.materia?.color_ref
            ? `<span style="display:inline-block;width:11px;height:11px;border-radius:2px;background:${r.materia.color_ref};border:1px solid #ccc;vertical-align:middle;margin-right:4px;"></span>`
            : '';
        const nome      = r.materia
            ? `${dot}${r.materia.color_name || ''} · ${r.materia.lego_size || ''}`
            : '<em style="color:#999">non trovato</em>';
        const ivaLabel  = r.iva_percentuale !== undefined ? r.iva_percentuale + '%' : '<em style="color:#888">globale</em>';
        const dataLabel = r.data_carico ? new Date(r.data_carico).toLocaleDateString('it-IT') : '—';
        const hasTransp = r.prezzo_incl_transport !== r.prezzo;

        return `<tr class="${rc}">
            <td>${dataLabel}</td>
            <td>${r.invoice_number || '—'}</td>
            <td><strong>${r.unique_id || '—'}</strong></td>
            <td>${nome}</td>
            <td>${r.quantita} pz</td>
            <td>${Utils.formatCurrency(r.prezzo)}<br><small style="color:#64748b;">pu: ${Utils.formatCurrency(r.prezzo_unitario)}</small></td>
            <td>${hasTransp ? Utils.formatCurrency(r.prezzo_incl_transport) : '<em style="color:#94a3b8">= prezzo</em>'}<br><small style="color:#64748b;">pu: ${Utils.formatCurrency(r.prezzo_unitario_transport)}</small></td>
            <td>${ivaLabel}</td>
            <td><span class="tag ${tc}">${r.statoMsg}</span></td>
        </tr>`;
    }).join('');

    document.getElementById('importPreview').innerHTML = `
        <div style="display:flex;gap:12px;margin-top:16px;margin-bottom:8px;font-size:14px;flex-wrap:wrap;">
            <span><strong>${importRows.length}</strong> righe totali</span>
            <span style="color:#065f46;">✅ ${okCnt} ok</span>
            ${warnCnt ? `<span style="color:#92400e;">⚠️ ${warnCnt} attenzione</span>` : ''}
            ${errCnt  ? `<span style="color:#991b1b;">❌ ${errCnt} errori (saltati)</span>` : ''}
        </div>
        <div class="import-preview-table">
            <table>
                <thead><tr>
                    <th>Data</th>
                    <th>Invoice N°</th>
                    <th>Unique ID</th>
                    <th>Materiale</th>
                    <th>Quantità</th>
                    <th>Prezzo (pu)</th>
                    <th>Prezzo + trasp. (pu)</th>
                    <th>IVA</th>
                    <th>Stato</th>
                </tr></thead>
                <tbody>${tbody}</tbody>
            </table>
        </div>`;

    document.getElementById('importMeta').style.display = 'block';
    const actEl = document.getElementById('importActions');
    const valid = okCnt + warnCnt;
    actEl.style.display = valid > 0 ? 'block' : 'none';
    if (valid > 0) {
        document.getElementById('importConfirmBtn').textContent =
            `✅ Carica ${valid} righe in magazzino${errCnt ? ` (${errCnt} errori ignorati)` : ''}`;
    }
}

document.getElementById('importConfirmBtn').addEventListener('click', async () => {
    const righeValide  = importRows.filter(r => r.stato !== 'err');
    if (!righeValide.length) { showMsg('message-import', '⚠️ Nessuna riga valida.', 'error'); return; }

    const numeroOrdine = document.getElementById('importNumeroOrdine').value.trim();
    const fornitore    = document.getElementById('importFornitore').value.trim();
    const ivaGlobale   = parseFloat(document.getElementById('importIva').value) || 0;

    const btn = document.getElementById('importConfirmBtn');
    btn.disabled = true; btn.textContent = '⏳ Caricamento in corso...';
    try {
        // Ogni riga può avere la propria data e invoice number dal file
        for (const r of righeValide) {
            const ivaRiga  = r.iva_percentuale !== undefined ? r.iva_percentuale : ivaGlobale;
            const prezzoMedio = await calcolaPrezzoMedioUid(r.unique_id, r.quantita, r.prezzo_incl_transport);

            await API.createCarico({
                codice_materiale:          r.unique_id,
                quantita:                  r.quantita,
                prezzo_totale:             r.prezzo,
                prezzo_incl_transport:     r.prezzo_incl_transport,
                iva_percentuale:           ivaRiga,
                prezzo_unitario:           r.prezzo_unitario,
                prezzo_unitario_transport: r.prezzo_unitario_transport,
                numero_ordine:             r.invoice_number || numeroOrdine,
                fornitore:                 fornitore,
                data_carico:               r.data_carico || Date.now()
            });
            await aggiornaStockUid(r.unique_id, r.quantita, prezzoMedio);
        }
        showMsg('message-import', `✅ Importazione completata! ${righeValide.length} materiali caricati.`, 'success');
        document.getElementById('importPreview').innerHTML = '';
        document.getElementById('importMeta').style.display = 'none';
        document.getElementById('importActions').style.display = 'none';
        importRows = []; importInput.value = '';
    } catch (err) {
        showMsg('message-import', '❌ Errore: ' + err.message, 'error');
    } finally {
        btn.disabled = false; btn.textContent = '✅ Conferma e carica tutto in magazzino';
    }
});

// ── Storico ───────────────────────────────────
async function loadCarichi(filterCodice = '', filterData = '', filterOrdine = '') {
    try {
        const result = await API.getCarichi(1, 1000);
        carichi = result.data || [];
        let filtered = [...carichi];
        if (filterCodice) filtered = filtered.filter(c => c.codice_materiale === filterCodice);
        if (filterData) {
            const fd = new Date(filterData).toDateString();
            filtered = filtered.filter(c => new Date(c.data_carico).toDateString() === fd);
        }
        if (filterOrdine) filtered = filtered.filter(c =>
            (c.numero_ordine || '').toLowerCase().includes(filterOrdine.toLowerCase())
        );
        renderStoricoTable(filtered);
    } catch (err) {
        document.getElementById('carichiTable').innerHTML = '<p class="empty-state">Errore nel caricamento dati</p>';
    }
}

function renderStoricoTable(data) {
    const container = document.getElementById('carichiTable');
    if (!data.length) { container.innerHTML = '<p class="empty-state">Nessun carico registrato</p>'; return; }

    container.innerHTML = `<table>
        <thead><tr>
            <th>Data</th><th>Invoice N°</th><th>Fornitore</th>
            <th>Unique ID</th><th>Materiale</th><th>Quantità</th>
            <th>Prezzo</th><th>Prezzo + trasp.</th>
            <th>P.U.</th><th>P.U. + trasp.</th><th>IVA %</th>
        </tr></thead>
        <tbody>${data.map(c => {
            const m   = findMateria(c.codice_materiale);
            const dot = m?.color_ref
                ? `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${m.color_ref};border:1px solid #ccc;vertical-align:middle;margin-right:4px;"></span>`
                : '';
            const nome   = m ? `${dot}${m.color_name || ''} · ${m.lego_size || ''}` : c.codice_materiale;
            const hasTr  = c.prezzo_incl_transport && c.prezzo_incl_transport !== c.prezzo_totale;
            return `<tr>
                <td>${Utils.formatDate(c.data_carico)}</td>
                <td>${c.numero_ordine || '—'}</td>
                <td>${c.fornitore || '—'}</td>
                <td><strong>${c.codice_materiale}</strong></td>
                <td>${nome}</td>
                <td>${c.quantita} pz</td>
                <td>${Utils.formatCurrency(c.prezzo_totale)}</td>
                <td>${hasTr ? Utils.formatCurrency(c.prezzo_incl_transport) : '—'}</td>
                <td>${Utils.formatCurrency(c.prezzo_unitario)}</td>
                <td>${c.prezzo_unitario_transport ? Utils.formatCurrency(c.prezzo_unitario_transport) : '—'}</td>
                <td>${c.iva_percentuale || 0}%</td>
            </tr>`;
        }).join('')}</tbody></table>`;
}

document.getElementById('filterBtn').addEventListener('click', () => {
    loadCarichi(
        document.getElementById('filterCodice').value,
        document.getElementById('filterData').value,
        document.getElementById('filterOrdine').value
    );
});
document.getElementById('resetBtn').addEventListener('click', () => {
    ['filterCodice','filterData','filterOrdine'].forEach(id => {
        document.getElementById(id).value = '';
    });
    loadCarichi();
});
document.getElementById('exportBtn').addEventListener('click', () => {
    if (!carichi.length) { alert('Nessun dato da esportare'); return; }
    Utils.exportToCSV(carichi.map(c => ({
        data_carico:               Utils.formatDate(c.data_carico),
        invoice_number:            c.numero_ordine || '',
        fornitore:                 c.fornitore || '',
        unique_id:                 c.codice_materiale,
        quantita:                  c.quantita,
        prezzo:                    c.prezzo_totale,
        prezzo_incl_transport:     c.prezzo_incl_transport || c.prezzo_totale,
        iva_percentuale:           c.iva_percentuale || 0,
        prezzo_unitario:           c.prezzo_unitario,
        prezzo_unitario_transport: c.prezzo_unitario_transport || c.prezzo_unitario
    })), `carichi_magazzino_${new Date().toISOString().split('T')[0]}.csv`);
});

// ── Utility messaggi ──────────────────────────
function showMsg(id, msg, type = 'success') {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent   = msg;
    el.className     = type === 'success' ? 'success-message' : 'error-message';
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 6000);
}

// ── Init ──────────────────────────────────────
loadMateriePrime();
