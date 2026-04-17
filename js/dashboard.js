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
        // Carica dati Supabase e tasso in parallelo, con fallback indipendenti
        const [matRes, carichiRes, stockRes] = await Promise.all([
            API.getMateriePrime(1, 5000),
            API.getCarichi(1, 5000),
            API.getStock(1, 5000)
        ]);

        allMaterie = matRes.data     || [];
        allCarichi = carichiRes.data || [];
        allStock   = stockRes.data   || [];

        // Tasso di cambio separato — non blocca il resto se fallisce
        try {
            currentRate = await getExchangeRate(new Date().toISOString());
        } catch (e) {
            currentRate = null;
        }

        // Banner tasso
        const rateBanner = document.getElementById('rateBanner');
        if (rateBanner) {
            if (currentRate) {
                const today = new Date().toLocaleDateString('it-IT');
                rateBanner.innerHTML = `💱 Tasso USD/EUR oggi (${today}): <strong>1 USD = ${currentRate.toFixed(4)} EUR</strong> &nbsp;·&nbsp; <em style="opacity:.7;">Fonte: BCE via frankfurter.dev</em>`;
            } else {
                rateBanner.innerHTML = '⚠️ Tasso di cambio non disponibile — visualizzazione solo in USD.';
                rateBanner.style.background = '#fef3c7';
                rateBanner.style.borderColor = '#fbbf24';
                rateBanner.style.color = '#92400e';
            }
        }

        renderKPI();
        renderCharts();
        renderAlerts();
        addCalcLine();

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
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function renderKPI() {
    // SKU
    setText('kpiSku', allMaterie.length);

    // Valore magazzino (weighted avg)
    const valoreUSD = allStock.reduce((s, i) => s + i.quantita_disponibile * (i.prezzo_medio || 0), 0);
    setText('kpiValore', fmt(valoreUSD));
    setText('kpiValoreSub', currentCurrency === 'EUR' && currentRate
        ? `≈ al cambio odierno (${currentRate.toFixed(4)})`
        : 'weighted average');

    // Pezzi totali
    const pezziTot = allStock.reduce((s, i) => s + i.quantita_disponibile, 0);
    setText('kpiPezzi', pezziTot.toLocaleString('it-IT'));

    // Ordini unici
    const ordiniUnici = new Set(allCarichi.map(c => c.invoice_number || c.numero_ordine).filter(Boolean));
    setText('kpiOrdini', ordiniUnici.size);
    setText('kpiOrdiniSub', `${allCarichi.length} righe totali`);

    // Spesa totale
    const spesaTot = allCarichi.reduce((s, c) => s + (c.prezzo_totale || 0), 0);
    setText('kpiSpesa', fmt(spesaTot));

    // Alert stock
    const sottoSoglia = allStock.filter(i => i.quantita_disponibile < 100).length;
    setText('kpiAlert', sottoSoglia);
}

// ── Grafici ───────────────────────────────────
function renderCharts() {
    renderChartSpesa();
    renderChartStock();
}

function renderChartSpesa() {
    if (!document.getElementById('chartSpesa')) return;

    // Genera sempre gli ultimi 12 mesi come asse fisso
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
    }

    // Aggrega spesa per mese
    const byMonth = {};
    months.forEach(m => { byMonth[m] = 0; }); // inizializza tutti a 0
    allCarichi.forEach(c => {
        const d = new Date(c.data_carico);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        if (byMonth[key] !== undefined) { // solo se nel range 12 mesi
            const val = currentCurrency === 'EUR' && c.prezzo_totale_eur
                ? c.prezzo_totale_eur
                : (currentCurrency === 'EUR' && currentRate
                    ? (c.prezzo_totale || 0) * currentRate
                    : (c.prezzo_totale || 0));
            byMonth[key] += val;
        }
    });

    const values = months.map(k => byMonth[k]);
    const symbol = currentCurrency === 'EUR' ? '€' : '$';

    // Colori: mesi con spesa in blu, mesi vuoti in grigio chiaro
    const colors = values.map(v => v > 0
        ? 'rgba(37, 99, 235, 0.75)'
        : 'rgba(203, 213, 225, 0.5)');

    const ctx = document.getElementById('chartSpesa').getContext('2d');
    if (chartSpesa) chartSpesa.destroy();
    chartSpesa = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months.map(l => {
                const [y, m] = l.split('-');
                return new Date(+y, +m-1).toLocaleDateString('it-IT', { month:'short', year:'2-digit' });
            }),
            datasets: [{
                label: `Spesa (${currentCurrency})`,
                data: values,
                backgroundColor: colors,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: v => symbol + v.toLocaleString() }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function renderChartStock() {
    if (!document.getElementById('chartStock')) return;
    const ok      = allStock.filter(i => i.quantita_disponibile >= 100).length;
    const basso   = allStock.filter(i => i.quantita_disponibile >= 50 && i.quantita_disponibile < 100).length;
    const critico = allStock.filter(i => i.quantita_disponibile > 0  && i.quantita_disponibile < 50).length;
    const esaurito= allStock.filter(i => i.quantita_disponibile === 0).length;

    const ctx = document.getElementById('chartStock').getContext('2d');
    if (chartStock) chartStock.destroy();
    chartStock = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['OK (≥100)', 'Basso (50–99)', 'Critico (<50)', 'Esaurito'],
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
    const critico = allStock.filter(i => i.quantita_disponibile > 0 && i.quantita_disponibile < 50);
    const basso   = allStock.filter(i => i.quantita_disponibile >= 50 && i.quantita_disponibile < 100);
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
