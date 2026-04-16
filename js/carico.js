/**
 * carico.js — v3.0
 * Campi Excel: Order# | Date ordered | Date delivered | Unique ID | Quantity | Price (USD) | Price incl transport (USD) | Unit price | VAT applied
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
    return [m.unique_id, m.color_name, m.lego_size, m.size_code ? `(${m.size_code})` : ''].filter(Boolean).join(' · ');
}

function findMateria(uid) {
    return materiePrime.find(m => m.unique_id === uid) || null;
}

// ── Righe ordine manuale ──────────────────────
function addOrderLine() {
    lineCount++;
    const id   = lineCount;
    const opts = materiePrime.map(m => `<option value="${m.unique_id}">${buildLabel(m)}</option>`).join('');
    const div  = document.createElement('div');
    div.className = 'order-line';
    div.id = `line-${id}`;
    div.innerHTML = `
        <div>
            <select id="mat-${id}" onchange="onMatChange(${id})">
                <option value="">— Seleziona materiale —</option>${opts}
            </select>
            <div id="mat-info-${id}" style="font-size:11px;color:var(--secondary-color);margin-top:3px;min-height:14px;"></div>
        </div>
        <input type="number" id="qty-${id}"    min="1"  step="1"    placeholder="pz"   oninput="updateSummary()">
        <input type="number" id="price-${id}"  min="0"  step="0.01" placeholder="$"    oninput="updateSummary()">
        <input type="number" id="transp-${id}" min="0"  step="0.01" placeholder="$ + tr." oninput="updateSummary()">
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
        const dot = m.color_ref ? `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${m.color_ref};border:1px solid #ccc;vertical-align:middle;margin-right:4px;"></span>` : '';
        info.innerHTML = `${dot}${m.color_ref || ''} · ID colore: ${m.color_id || '—'} · Stock: <strong id="stock-${id}">…</strong> pz`;
        API.getStockByCodice(uid).then(s => {
            const el = document.getElementById(`stock-${id}`);
            if (el) el.textContent = s ? s.quantita_disponibile : 0;
        }).catch(() => {});
    }
}

function updateSummary() {
    const vat = parseFloat(document.getElementById('ivaOrdine').value) || 0;
    let righe = 0, pezzi = 0, imponibile = 0, totTransp = 0;
    document.querySelectorAll('.order-line').forEach(line => {
        const id     = line.id.replace('line-', '');
        const mat    = document.getElementById(`mat-${id}`)?.value;
        const qty    = parseFloat(document.getElementById(`qty-${id}`)?.value)    || 0;
        const price  = parseFloat(document.getElementById(`price-${id}`)?.value)  || 0;
        const transp = parseFloat(document.getElementById(`transp-${id}`)?.value) || 0;
        if (mat) righe++;
        pezzi += qty; imponibile += price; totTransp += transp;
    });
    const vatAmt   = imponibile * vat / 100;
    const vatAmtTr = totTransp  * vat / 100;
    document.getElementById('summaryRighe').textContent        = righe;
    document.getElementById('summaryPezzi').textContent        = pezzi;
    document.getElementById('summaryImponibile').textContent   = formatUSD(imponibile);
    document.getElementById('summaryTransp').textContent       = formatUSD(totTransp);
    document.getElementById('summaryIva').textContent          = formatUSD(vatAmt);
    document.getElementById('summaryTotale').textContent       = formatUSD(imponibile + vatAmt);
    document.getElementById('summaryTotaleTransp').textContent = formatUSD(totTransp + vatAmtTr);
}

document.getElementById('ivaOrdine').addEventListener('input', updateSummary);
document.getElementById('addLineBtn').addEventListener('click', addOrderLine);

// ── Submit ordine manuale con conferma ────────
document.getElementById('submitOrdineBtn').addEventListener('click', async () => {
    const invoiceNo    = document.getElementById('invoiceNo').value.trim();
    const fornitore    = document.getElementById('fornitore').value.trim();
    const vat          = parseFloat(document.getElementById('ivaOrdine').value) || 0;
    const dateOrdered  = document.getElementById('dateOrdered').value;
    const dateDelivered = document.getElementById('dateDelivered').value;

    if (!invoiceNo)   { showMsg('message-manuale', '⚠️ Invoice # obbligatorio.', 'error'); return; }
    if (!dateOrdered) { showMsg('message-manuale', '⚠️ Data ordine obbligatoria.', 'error'); return; }

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

    if (righe.length === 0) { showMsg('message-manuale', '⚠️ Inserisci almeno una riga valida.', 'error'); return; }

    // ── Finestra di conferma ──
    const totale = righe.reduce((s, r) => s + r.prezzo, 0);
    const totaleTransp = righe.reduce((s, r) => s + r.prezzo_incl_transport, 0);
    const conferma = confirm(
        `Confermi il carico?\n\n` +
        `Invoice #: ${invoiceNo}\n` +
        `Data ordine: ${dateOrdered}\n` +
        `${dateDelivered ? 'Data consegna: ' + dateDelivered + '\n' : ''}` +
        `Righe: ${righe.length}  |  Pezzi totali: ${righe.reduce((s,r) => s+r.quantita, 0)}\n` +
        `Totale: $${totale.toFixed(2)}  |  Incl. trasporto: $${totaleTransp.toFixed(2)}\n` +
        `VAT: ${vat}%`
    );
    if (!conferma) return;

    const btn = document.getElementById('submitOrdineBtn');
    btn.disabled = true; btn.textContent = '⏳ Salvataggio...';
    try {
        await salvaCarichi(righe, { invoiceNo, fornitore, vat,
            dateOrdered: new Date(dateOrdered).toISOString(),
            dateDelivered: dateDelivered ? new Date(dateDelivered).toISOString() : null
        });
        showMsg('message-manuale', `✅ Carico confermato! ${righe.length} materiali aggiornati.`, 'success');
        document.getElementById('orderLines').innerHTML = '';
        lineCount = 0;
        ['invoiceNo','fornitore','dateOrdered','dateDelivered'].forEach(id => document.getElementById(id).value = '');
        addOrderLine(); updateSummary();
    } catch (err) {
        showMsg('message-manuale', '❌ Errore: ' + err.message, 'error');
    } finally {
        btn.disabled = false; btn.textContent = '✅ Conferma carico in magazzino';
    }
});

// ── Salvataggio righe ─────────────────────────
async function salvaCarichi(righe, { invoiceNo='', fornitore='', vat=0, dateOrdered=null, dateDelivered=null }) {
    // Recupera tasso di cambio USD/EUR per la data dell'ordine (una sola chiamata per tutto l'ordine)
    const dateForRate = dateOrdered || new Date().toISOString();
    const exchangeRate = await getExchangeRate(dateForRate);

    for (const riga of righe) {
        const vatRiga   = riga.vat_applied !== undefined ? riga.vat_applied : vat;
        const transp    = riga.prezzo_incl_transport || riga.prezzo;
        const unitPrice = riga.unit_price || (riga.quantita > 0 ? riga.prezzo / riga.quantita : 0);
        const puTransp  = riga.quantita > 0 ? transp / riga.quantita : 0;
        const prezzoMedio = await calcolaPrezzoMedioUid(riga.unique_id, riga.quantita, transp);

        // Valori EUR calcolati con il tasso storico
        const prezzoTotEur  = exchangeRate ? riga.prezzo * exchangeRate : null;
        const prezzoUnitEur = exchangeRate ? unitPrice   * exchangeRate : null;

        await API.createCarico({
            codice_materiale:          riga.unique_id,
            quantita:                  riga.quantita,
            prezzo_totale:             riga.prezzo,
            prezzo_incl_transport:     transp,
            iva_percentuale:           vatRiga,
            prezzo_unitario:           unitPrice,
            prezzo_unitario_transport: puTransp,
            invoice_number:            invoiceNo,
            fornitore:                 fornitore,
            data_carico:               dateOrdered || new Date().toISOString(),
            date_delivered:            dateDelivered,
            exchange_rate_usd_eur:     exchangeRate,
            prezzo_totale_eur:         prezzoTotEur,
            prezzo_unitario_eur:       prezzoUnitEur
        });
        await aggiornaStockUid(riga.unique_id, riga.quantita, prezzoMedio);
    }
}

// ── Prezzo medio ponderato ────────────────────
async function calcolaPrezzoMedioUid(uid, nuovaQty, nuovoPrezzo) {
    const stock = await API.getStockByCodice(uid);
    if (!stock || stock.quantita_disponibile === 0) return nuovaQty > 0 ? nuovoPrezzo / nuovaQty : 0;
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
        await API.createStock({ codice_materiale: uid, quantita_disponibile: quantita, prezzo_medio: prezzoMedio });
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
importInput.addEventListener('change', e => { if (e.target.files[0]) handleImportFile(e.target.files[0]); });

// Mapping colonne Excel → campi interni
const COL_MAP = {
    'order#':                    'invoice_number',
    'order #':                   'invoice_number',
    'invoice#':                  'invoice_number',
    'invoice #':                 'invoice_number',
    'invoice_number':            'invoice_number',
    'date ordered':              'date_ordered',
    'date_ordered':              'date_ordered',
    'date delivered':            'date_delivered',
    'date_delivered':            'date_delivered',
    'unique id':                 'unique_id',
    'unique_id':                 'unique_id',
    'quantity':                  'quantita',
    'quantita':                  'quantita',
    'qty':                       'quantita',
    'price (usd)':               'prezzo',
    'price(usd)':                'prezzo',
    'price':                     'prezzo',
    'prezzo':                    'prezzo',
    'price incl transport (usd)':'prezzo_incl_transport',
    'price incl transport':      'prezzo_incl_transport',
    'prezzo_incl_transport':     'prezzo_incl_transport',
    'unit price':                'unit_price',
    'unit_price':                'unit_price',
    'prezzo_unitario':           'unit_price',
    'vat applied':               'vat_applied',
    'vat_applied':               'vat_applied',
    'iva_percentuale':           'vat_applied',
    'iva':                       'vat_applied'
};

async function handleImportFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    let rows = [];
    try {
        if (ext === 'csv')                     rows = parseCSV(await file.text());
        else if (['xlsx','xls'].includes(ext)) rows = await parseExcel(file);
        else return alert('Formato non supportato. Usa .xlsx, .xls o .csv');
    } catch (err) { return alert('Errore lettura file: ' + err.message); }
    if (!rows.length) return alert('File vuoto o formato non riconosciuto.');

    // Filtra righe completamente vuote (nessun qty né prezzo) prima di processarle
    const rowsFiltrati = rows.filter(row => {
        const r = {};
        Object.keys(row).forEach(k => {
            const mapped = COL_MAP[k.toLowerCase().trim()];
            if (mapped) r[mapped] = row[k];
        });
        const qty   = r.quantita != null && r.quantita !== '' ? parseFloat(r.quantita) : null;
        const price = r.prezzo   != null && r.prezzo   !== '' ? parseFloat(r.prezzo)   : null;
        // Tieni la riga solo se ha almeno qty > 0 O prezzo > 0
        return (qty != null && qty > 0) || (price != null && price > 0);
    });

    importRows = rowsFiltrati.map((row) => {
        // Normalizza colonne con COL_MAP (case-insensitive, trim spazi)
        const r = {};
        Object.keys(row).forEach(k => {
            const mapped = COL_MAP[k.toLowerCase().trim()];
            if (mapped) r[mapped] = row[k];
        });

        // unique_id può essere numerico in Excel (es. 300578) → forza stringa
        const uid          = r.unique_id != null ? String(r.unique_id).trim() : '';
        const qty          = r.quantita  != null && r.quantita !== '' ? parseInt(r.quantita) : null;
        const prezzo       = r.prezzo    != null && r.prezzo   !== '' ? parseFloat(r.prezzo) : null;
        const transpRaw    = r.prezzo_incl_transport;
        const transp       = transpRaw != null && transpRaw !== '' ? parseFloat(transpRaw) : prezzo;
        // Unit price: usa quello del file se presente, altrimenti calcola
        const upRaw        = r.unit_price;
        const unitPrice    = upRaw != null && upRaw !== '' && parseFloat(upRaw) > 0
                                ? parseFloat(upRaw)
                                : (qty > 0 && prezzo != null ? prezzo / qty : 0);
        const vatApplied   = r.vat_applied != null && r.vat_applied !== ''
                                ? parseFloat(r.vat_applied) : undefined;
        const invoiceNo    = r.invoice_number != null ? String(r.invoice_number).trim() : '';
        // Date: SheetJS con cellDates:true restituisce oggetti Date
        const dateOrdered   = r.date_ordered   ? parseDataFlex(r.date_ordered)   : null;
        const dateDelivered = r.date_delivered  ? parseDataFlex(r.date_delivered)  : null;
        const materia       = findMateria(uid);

        let stato = 'ok', statoMsg = 'OK';
        if (!invoiceNo)              { stato = 'err';  statoMsg = 'Order# mancante'; }
        else if (!uid)               { stato = 'err';  statoMsg = 'Unique ID mancante'; }
        else if (!materia)           { stato = 'warn'; statoMsg = 'Non trovato nel DB'; }
        else if (!dateOrdered)       { stato = 'err';  statoMsg = 'Date ordered mancante'; }
        else if (!(qty > 0))         { stato = 'err';  statoMsg = 'Quantità non valida'; }
        else if (prezzo == null || isNaN(prezzo) || prezzo < 0) { stato = 'err'; statoMsg = 'Prezzo non valido'; }

        return { uid, qty: qty || 0, prezzo: prezzo || 0, transp: transp || 0,
                 unitPrice, vatApplied, invoiceNo,
                 dateOrdered, dateDelivered, materia, stato, statoMsg };
    });

    renderImportPreview();
}

function parseDataFlex(raw) {
    if (raw == null) return null;
    // SheetJS con cellDates:true → oggetto Date JS
    if (raw instanceof Date) return isNaN(raw) ? null : raw.toISOString();
    if (typeof raw === 'number') {
        // Excel serial date
        const d = new Date((raw - 25569) * 86400 * 1000);
        return isNaN(d) ? null : d.toISOString();
    }
    const s = String(raw).trim();
    const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmy) {
        const d = new Date(+dmy[3], +dmy[2]-1, +dmy[1]);
        return isNaN(d) ? null : d.toISOString();
    }
    const d = new Date(s);
    return isNaN(d) ? null : d.toISOString();
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g,''));
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
                // cellDates:true → date come oggetti JS Date (non serial number)
                // raw:true → numeri come numeri (non stringhe formattate)
                const wb   = XLSX.read(e.target.result, { type: 'array', cellDates: true, raw: true });
                const ws   = wb.Sheets[wb.SheetNames[0]];
                // defval:null → celle vuote restano null (non stringa vuota)
                const data = XLSX.utils.sheet_to_json(ws, { defval: null, raw: true });
                resolve(data.map(row => {
                    const n = {};
                    Object.keys(row).forEach(k => { n[k.trim()] = row[k]; });
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
            ? `<span style="display:inline-block;width:11px;height:11px;border-radius:2px;background:${r.materia.color_ref};border:1px solid #ccc;vertical-align:middle;margin-right:4px;"></span>` : '';
        const nome = r.materia ? `${dot}${r.materia.color_name||''} · ${r.materia.lego_size||''}` : '<em style="color:#999">non trovato</em>';
        const vatLabel = r.vatApplied !== undefined ? r.vatApplied+'%' : '<em style="color:#888">—</em>';
        const fmtDate = iso => iso ? new Date(iso).toLocaleDateString('it-IT') : '—';
        return `<tr class="${rc}">
            <td>${r.invoiceNo || '—'}</td>
            <td>${fmtDate(r.dateOrdered)}</td>
            <td>${fmtDate(r.dateDelivered)}</td>
            <td><strong>${r.uid || '—'}</strong></td>
            <td>${nome}</td>
            <td>${r.qty} pz</td>
            <td>${formatUSD(r.prezzo)}<br><small style="color:#64748b;">pu: ${formatUSD(r.unitPrice)}</small></td>
            <td>${r.transp !== r.prezzo ? formatUSD(r.transp) : '<em style="color:#94a3b8">= price</em>'}</td>
            <td>${vatLabel}</td>
            <td><span class="tag ${tc}">${r.statoMsg}</span></td>
        </tr>`;
    }).join('');

    document.getElementById('importPreview').innerHTML = `
        <div style="display:flex;gap:12px;margin-top:16px;margin-bottom:8px;font-size:14px;flex-wrap:wrap;">
            <span><strong>${importRows.length}</strong> righe totali</span>
            <span style="color:#065f46;">✅ ${okCnt} ok</span>
            ${warnCnt    ? `<span style="color:#92400e;">⚠️ ${warnCnt} attenzione</span>` : ''}
            ${errCnt ? `<span style="color:#991b1b;">❌ ${errCnt} errori (saltati)</span>` : ''}
        </div>
        <div class="import-preview-table">
            <table><thead><tr>
                <th>Order #</th><th>Date ordered</th><th>Date delivered</th>
                <th>Unique ID</th><th>Materiale</th><th>Qty</th>
                <th>Price (pu)</th><th>Price + transp.</th><th>VAT</th><th>Stato</th>
            </tr></thead><tbody>${tbody}</tbody></table>
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
    const righeValide = importRows.filter(r => r.stato !== 'err');
    if (!righeValide.length) { showMsg('message-import', '⚠️ Nessuna riga valida.', 'error'); return; }

    const vatGlobale = parseFloat(document.getElementById('importIva').value) || 0;

    // ── Finestra di conferma ──
    const totPezzi = righeValide.reduce((s, r) => s + r.qty, 0);
    const totPrezzo = righeValide.reduce((s, r) => s + r.prezzo, 0);
    const ordini = [...new Set(righeValide.map(r => r.invoiceNo))].join(', ');
    const conferma = confirm(
        `Confermi l'importazione?\n\n` +
        `Righe: ${righeValide.length}  |  Pezzi totali: ${totPezzi}\n` +
        `Totale: $${totPrezzo.toFixed(2)}\n` +
        `Order#: ${ordini}\n` +
        `${errCnt()} errori ignorati`
    );
    if (!conferma) return;

    const btn = document.getElementById('importConfirmBtn');
    btn.disabled = true; btn.textContent = '⏳ Caricamento in corso...';
    try {
        // Cache tasso di cambio: una sola chiamata API per data unica
        const rateCache = {};
        const getRate = async (dateISO) => {
            if (!dateISO) return null;
            const key = dateISO.split('T')[0];
            if (rateCache[key] === undefined) rateCache[key] = await getExchangeRate(dateISO);
            return rateCache[key];
        };

        for (const r of righeValide) {
            const vat          = r.vatApplied !== undefined ? r.vatApplied : vatGlobale;
            const exchangeRate = await getRate(r.dateOrdered);
            const prezzoMedio  = await calcolaPrezzoMedioUid(r.uid, r.qty, r.transp);
            await API.createCarico({
                codice_materiale:          r.uid,
                quantita:                  r.qty,
                prezzo_totale:             r.prezzo,
                prezzo_incl_transport:     r.transp,
                iva_percentuale:           vat,
                prezzo_unitario:           r.unitPrice,
                prezzo_unitario_transport: r.qty > 0 ? r.transp / r.qty : 0,
                invoice_number:            r.invoiceNo,
                data_carico:               r.dateOrdered || new Date().toISOString(),
                date_delivered:            r.dateDelivered,
                exchange_rate_usd_eur:     exchangeRate,
                prezzo_totale_eur:         exchangeRate ? r.prezzo    * exchangeRate : null,
                prezzo_unitario_eur:       exchangeRate ? r.unitPrice * exchangeRate : null
            });
            await aggiornaStockUid(r.uid, r.qty, prezzoMedio);
        }
        showMsg('message-import', `✅ Importazione completata! ${righeValide.length} righe caricate.`, 'success');
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

function errCnt() { return importRows.filter(r => r.stato === 'err').length; }

// ── Storico ───────────────────────────────────
async function loadCarichi(filterCodice='', filterData='', filterOrdine='') {
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
            (c.invoice_number || c.numero_ordine || '').toLowerCase().includes(filterOrdine.toLowerCase())
        );
        renderStoricoTable(filtered);
    } catch (err) {
        document.getElementById('carichiTable').innerHTML = '<p class="empty-state">Errore nel caricamento dati</p>';
    }
}

function renderStoricoTable(data) {
    const container = document.getElementById('carichiTable');
    if (!data.length) { container.innerHTML = '<p class="empty-state">Nessun carico registrato</p>'; return; }
    const fmtDate = val => {
        if (!val) return '—';
        return new Date(val).toLocaleDateString('it-IT', { day:'2-digit', month:'2-digit', year:'numeric' });
    };
    container.innerHTML = `<table>
        <thead><tr>
            <th>Order #</th><th>Date ordered</th><th>Date delivered</th><th>Fornitore</th>
            <th>Unique ID</th><th>Materiale</th><th>Qty</th>
            <th>Price</th><th>Price + transp.</th><th>Unit price</th><th>VAT %</th>
        </tr></thead>
        <tbody>${data.map(c => {
            const m   = findMateria(c.codice_materiale);
            const dot = m?.color_ref ? `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${m.color_ref};border:1px solid #ccc;vertical-align:middle;margin-right:4px;"></span>` : '';
            const nome = m ? `${dot}${m.color_name||''} · ${m.lego_size||''}` : c.codice_materiale;
            const hasTr = c.prezzo_incl_transport && c.prezzo_incl_transport !== c.prezzo_totale;
            const inv = c.invoice_number || c.numero_ordine || '—';
            return `<tr>
                <td><strong>${inv}</strong></td>
                <td>${fmtDate(c.data_carico)}</td>
                <td>${fmtDate(c.date_delivered)}</td>
                <td>${c.fornitore || '—'}</td>
                <td><strong>${c.codice_materiale}</strong></td>
                <td>${nome}</td>
                <td>${c.quantita} pz</td>
                <td>${formatUSD(c.prezzo_totale)}</td>
                <td>${hasTr ? formatUSD(c.prezzo_incl_transport) : '—'}</td>
                <td>${formatUSD(c.prezzo_unitario)}</td>
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
    ['filterCodice','filterData','filterOrdine'].forEach(id => { document.getElementById(id).value = ''; });
    loadCarichi();
});
document.getElementById('exportBtn').addEventListener('click', () => {
    if (!carichi.length) { alert('Nessun dato da esportare'); return; }
    const fmtDate = val => val ? new Date(val).toLocaleDateString('it-IT') : '';
    Utils.exportToCSV(carichi.map(c => ({
        invoice_number:            c.invoice_number || c.numero_ordine || '',
        date_ordered:              fmtDate(c.data_carico),
        date_delivered:            fmtDate(c.date_delivered),
        fornitore:                 c.fornitore || '',
        unique_id:                 c.codice_materiale,
        quantita:                  c.quantita,
        price_usd:                 c.prezzo_totale,
        price_incl_transport_usd:  c.prezzo_incl_transport || c.prezzo_totale,
        unit_price:                c.prezzo_unitario,
        vat_applied:               c.iva_percentuale || 0
    })), `carichi_magazzino_${new Date().toISOString().split('T')[0]}.csv`);
});

// ── Formato USD ───────────────────────────────
function formatUSD(amount) {
    if (amount === null || amount === undefined) return '$ 0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

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
