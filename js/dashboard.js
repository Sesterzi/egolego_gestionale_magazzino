/**
 * dashboard.js — v2.0
 * KPI, grafici mensili, calcolatore costo item, alert stock
 * Supporto USD/EUR con tasso di cambio live
 */

let allCarichi     = [];
let allStock       = [];
let allMaterie     = [];
let currentRate    = null;   // tasso USD→EUR corrente
let currentCurrency = 'USD';
let chartSpesa     = null;
let chartStock     = null;
let calcLineCount  = 0;

// ── Init ──────────────────────────────────────
async function initDashboard() {
    try {
        // Carica tutto in parallelo + tasso corrente
        const [matRes, carichiRes, stockRes, rate] = await Promise.all([
            API.getMateriePrime(1, 5000),
            API.getCarichi(1, 5000),
            API.getStock(1, 5000),
            getExchangeRate(new Date().toISOString())
        ]);

        allMaterie  = matRes.data    || [];
        allCarichi  = carichiRes.data || [];
        allStock    = stockRes.data   || [];
        currentRate = rate;

        // Banner tasso
        const rateBanner = document.getElementById('rateBanner');
        if (currentRate) {
            const today = new Date().toLocaleDateString('it-IT');
            rateBanner.innerHTML = `💱 Tasso USD/EUR oggi (${today}): <strong>1 USD = ${currentRate.toFixed(4)} EUR</strong> &nbsp;·&nbsp; <em style="opacity:.7;">Fonte: Banca Centrale Europea via frankfurter.app</em>`;
        } else {
            rateBanner.innerHTML = '⚠️ Tasso di cambio non disponibile — i valori EUR potrebbero non essere aggiornati.';
            rateBanner.style.background = '#fef3c7';
            rateBanner.style.borderColor = '#fbbf24';
            rateBanner.style.color = '#92400e';
        }

        renderKPI();
        renderCharts();
        renderAlerts();
        addCalcLine(); // prima riga calcolatore

    } catch (err) {
        console.error('Errore dashboard:', err);
    }
}

// ── Toggle valuta ─────────────────────────────
function setCurrency(cur) {
    currentCurrency = cur;
    document.getElementById('btnUSD').classList.toggle('active', cur === 'USD');
    document.getElementById('btnEUR').classList.toggle('active', cur === 'EUR');
    renderKPI();
    renderCharts();
    updateCalc();
}

function fmt(usdAmount) {
    if (usdAmount == null) return '—';
    if (currentCurrency === 'EUR' && currentRate) {
        return new Intl.NumberFormat('it-IT', { style:'currency', currency:'EUR' }).format(usdAmount * currentRate);
    }
    return new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(usdAmount);
}

// ── KPI ───────────────────────────────────────
function renderKPI() {
    // SKU
    document.getElementById('kpiSku').textContent = allMaterie.length;

    // Valore magazzino (weighted avg)
    const valoreUSD = allStock.reduce((s, i) => s + i.quantita_disponibile * (i.prezzo_medio || 0), 0);
    document.getElementById('kpiValore').textContent = fmt(valoreUSD);
    document.getElementById('kpiValoreSub').textContent = currentCurrency === 'EUR' && currentRate
        ? `≈ al cambio odierno (${currentRate.toFixed(4)})`
        : 'weighted average';

    // Pezzi totali
    const pezziTot = allStock.reduce((s, i) => s + i.quantita_disponibile, 0);
    document.getElementById('kpiPezzi').textContent = pezziTot.toLocaleString('it-IT');

    // Ordini unici
    const ordiniUnici = new Set(allCarichi.map(c => c.invoice_number || c.numero_ordine).filter(Boolean));
    document.getElementById('kpiOrdini').textContent = ordiniUnici.size;
    document.getElementById('kpiOrdiniSub').textContent = `${allCarichi.length} righe totali`;

    // Spesa totale
    const spesaTot = allCarichi.reduce((s, c) => s + (c.prezzo_totale || 0), 0);
    document.getElementById('kpiSpesa').textContent = fmt(spesaTot);

    // Alert stock
    const sottoSoglia = allStock.filter(i => i.quantita_disponibile < 10).length;
    document.getElementById('kpiAlert').textContent = sottoSoglia;
}

// ── Grafici ───────────────────────────────────
function renderCharts() {
    renderChartSpesa();
    renderChartStock();
}

function renderChartSpesa() {
    // Aggrega spesa per mese
    const byMonth = {};
    allCarichi.forEach(c => {
        const d = new Date(c.data_carico);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        const val = currentCurrency === 'EUR' && c.prezzo_totale_eur
            ? c.prezzo_totale_eur
            : (currentCurrency === 'EUR' && currentRate
                ? (c.prezzo_totale || 0) * currentRate
                : (c.prezzo_totale || 0));
        byMonth[key] = (byMonth[key] || 0) + val;
    });

    const labels = Object.keys(byMonth).sort();
    const values = labels.map(k => byMonth[k]);
    const symbol = currentCurrency === 'EUR' ? '€' : '$';

    const ctx = document.getElementById('chartSpesa').getContext('2d');
    if (chartSpesa) chartSpesa.destroy();
    chartSpesa = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(l => {
                const [y, m] = l.split('-');
                return new Date(+y, +m-1).toLocaleDateString('it-IT', { month:'short', year:'2-digit' });
            }),
            datasets: [{
                label: `Spesa (${currentCurrency})`,
                data: values,
                backgroundColor: 'rgba(37, 99, 235, 0.7)',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { ticks: { callback: v => symbol + v.toLocaleString() } }
            }
        }
    });
}

function renderChartStock() {
    const ok      = allStock.filter(i => i.quantita_disponibile >= 10).length;
    const basso   = allStock.filter(i => i.quantita_disponibile >= 5 && i.quantita_disponibile < 10).length;
    const critico = allStock.filter(i => i.quantita_disponibile > 0  && i.quantita_disponibile < 5).length;
    const esaurito= allStock.filter(i => i.quantita_disponibile === 0).length;

    const ctx = document.getElementById('chartStock').getContext('2d');
    if (chartStock) chartStock.destroy();
    chartStock = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['OK (≥10)', 'Basso (5–9)', 'Critico (<5)', 'Esaurito'],
            datasets: [{
                data: [ok, basso, critico, esaurito],
                backgroundColor: ['#10b981','#f59e0b','#ef4444','#6b7280'],
                borderWidth: 2, borderColor: '#fff'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
            cutout: '65%'
        }
    });
}

// ── Alert stock ───────────────────────────────
function renderAlerts() {
    const critico = allStock.filter(i => i.quantita_disponibile > 0 && i.quantita_disponibile < 5);
    const basso   = allStock.filter(i => i.quantita_disponibile >= 5 && i.quantita_disponibile < 10);
    const esaurito= allStock.filter(i => i.quantita_disponibile === 0);

    const allCritico = [...esaurito, ...critico];

    const renderList = (items, containerId, emptyMsg) => {
        const el = document.getElementById(containerId);
        if (!items.length) { el.innerHTML = `<p class="empty-state">${emptyMsg}</p>`; return; }
        el.innerHTML = items.map(i => {
            const m = allMaterie.find(m => m.unique_id === i.codice_materiale);
            const dot = m?.color_ref ? `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${m.color_ref};border:1px solid #ddd;margin-right:5px;vertical-align:middle;"></span>` : '';
            const nome = m ? `${dot}${m.color_name || ''} · ${m.lego_size || ''}` : i.codice_materiale;
            const badge = i.quantita_disponibile === 0
                ? `<span class="badge badge-danger">ESAURITO</span>`
                : `<span class="badge badge-danger">${i.quantita_disponibile} pz</span>`;
            return `<div class="alert-item"><span>${nome}<br><small style="color:#94a3b8;">${i.codice_materiale}</small></span>${badge}</div>`;
        }).join('');
    };

    renderList(allCritico, 'alertCritico', '✅ Nessun materiale critico');
    renderList(basso,      'alertBasso',   '✅ Nessun materiale con stock basso');
}

// ── Calcolatore costo item ────────────────────
function addCalcLine() {
    calcLineCount++;
    const id   = calcLineCount;
    const opts = allMaterie.map(m => `<option value="${m.unique_id}">${m.unique_id} · ${m.color_name || ''} · ${m.lego_size || ''}</option>`).join('');
    const div  = document.createElement('div');
    div.className = 'calc-line';
    div.id = `calc-line-${id}`;
    div.innerHTML = `
        <select id="calc-mat-${id}" onchange="updateCalc()">
            <option value="">— Seleziona materiale —</option>${opts}
        </select>
        <input type="number" id="calc-qty-${id}" min="1" value="1" oninput="updateCalc()">
        <button onclick="removeCalcLine(${id})" style="background:#fee2e2;color:#991b1b;border:none;border-radius:5px;padding:7px;cursor:pointer;">🗑</button>`;
    document.getElementById('calcLines').appendChild(div);
    updateCalc();
}

function removeCalcLine(id) {
    const el = document.getElementById(`calc-line-${id}`);
    if (el) el.remove();
    updateCalc();
}

function updateCalc() {
    let costoTotUSD = 0;
    let pezziTot    = 0;
    let componenti  = 0;

    document.querySelectorAll('[id^="calc-line-"]').forEach(line => {
        const id  = line.id.replace('calc-line-', '');
        const uid = document.getElementById(`calc-mat-${id}`)?.value;
        const qty = parseInt(document.getElementById(`calc-qty-${id}`)?.value) || 0;
        if (!uid || !qty) return;

        const stock = allStock.find(s => s.codice_materiale === uid);
        if (!stock) return;

        costoTotUSD += (stock.prezzo_medio || 0) * qty;
        pezziTot    += qty;
        componenti++;
    });

    const result = document.getElementById('calcResult');
    if (componenti === 0) { result.style.display = 'none'; return; }
    result.style.display = 'block';

    document.getElementById('calcUSD').textContent = new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(costoTotUSD);
    document.getElementById('calcEUR').textContent = currentRate
        ? new Intl.NumberFormat('it-IT', { style:'currency', currency:'EUR' }).format(costoTotUSD * currentRate)
        : '— (tasso non disponibile)';
    document.getElementById('calcPezzi').textContent      = pezziTot.toLocaleString('it-IT');
    document.getElementById('calcComponenti').textContent = componenti;
}

// ── Start ─────────────────────────────────────
initDashboard();
