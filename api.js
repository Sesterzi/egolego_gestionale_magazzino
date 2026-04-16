// ============================================================
//  api.js — Supabase REST API wrapper
//  Tutte le chiamate al DB passano da qui
// ============================================================

const SUPABASE_URL = 'https://zbvwqlvzpschsmivjksd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_cyWgsj6ErELpuqbEZccezg_8oNtDKqM';

const HEADERS = {
    'Content-Type':  'application/json',
    'apikey':        SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Prefer':        'return=representation'   // ritorna il record dopo INSERT/UPDATE
};

// ── Helper base ───────────────────────────────────────────
async function sbFetch(path, options = {}) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        ...options,
        headers: { ...HEADERS, ...(options.headers || {}) }
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.hint || `HTTP ${res.status}`);
    }
    // DELETE e alcune chiamate ritornano body vuoto
    const text = await res.text();
    return text ? JSON.parse(text) : [];
}

// ── Wrapper compatibile con il vecchio formato { data: [...] } ──
function wrap(rows) {
    const arr = Array.isArray(rows) ? rows : [rows];
    return { data: arr, total: arr.length };
}

// ============================================================
//  API Object  (stessa interfaccia di prima)
// ============================================================
const API = {

    // ── Materie Prime ──────────────────────────────────────
    async getMateriePrime(page = 1, limit = 1000) {
        const offset = (page - 1) * limit;
        const rows = await sbFetch(
            `materie_prime?select=*&order=unique_id.asc&limit=${limit}&offset=${offset}`
        );
        return wrap(rows);
    },

    async getMateriaPrima(id) {
        const rows = await sbFetch(`materie_prime?id=eq.${id}&select=*`);
        return rows[0] || null;
    },

    async createMateriaPrima(data) {
        const rows = await sbFetch('materie_prime', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return Array.isArray(rows) ? rows[0] : rows;
    },

    async updateMateriaPrima(id, data) {
        const rows = await sbFetch(`materie_prime?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return Array.isArray(rows) ? rows[0] : rows;
    },

    async deleteMateriaPrima(id) {
        await sbFetch(`materie_prime?id=eq.${id}`, { method: 'DELETE' });
    },

    // ── Carichi Magazzino ──────────────────────────────────
    async getCarichi(page = 1, limit = 1000) {
        const offset = (page - 1) * limit;
        const rows = await sbFetch(
            `carichi_magazzino?select=*&order=data_carico.desc&limit=${limit}&offset=${offset}`
        );
        return wrap(rows);
    },

    async createCarico(data) {
        // Converti data_carico da timestamp ms a ISO se necessario
        if (typeof data.data_carico === 'number') {
            data = { ...data, data_carico: new Date(data.data_carico).toISOString() };
        }
        const rows = await sbFetch('carichi_magazzino', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return Array.isArray(rows) ? rows[0] : rows;
    },

    // ── Scarichi Magazzino ─────────────────────────────────
    async getScarichi(page = 1, limit = 1000) {
        const offset = (page - 1) * limit;
        const rows = await sbFetch(
            `scarichi_magazzino?select=*&order=data_scarico.desc&limit=${limit}&offset=${offset}`
        );
        return wrap(rows);
    },

    async createScarico(data) {
        if (typeof data.data_scarico === 'number') {
            data = { ...data, data_scarico: new Date(data.data_scarico).toISOString() };
        }
        const rows = await sbFetch('scarichi_magazzino', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return Array.isArray(rows) ? rows[0] : rows;
    },

    // ── Stock ──────────────────────────────────────────────
    async getStock(page = 1, limit = 1000) {
        const offset = (page - 1) * limit;
        const rows = await sbFetch(
            `stock?select=*&order=codice_materiale.asc&limit=${limit}&offset=${offset}`
        );
        return wrap(rows);
    },

    async getStockByCodice(codice) {
        const rows = await sbFetch(
            `stock?codice_materiale=eq.${encodeURIComponent(codice)}&select=*`
        );
        return rows[0] || null;
    },

    async updateStock(id, data) {
        const rows = await sbFetch(`stock?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return Array.isArray(rows) ? rows[0] : rows;
    },

    async createStock(data) {
        const rows = await sbFetch('stock', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return Array.isArray(rows) ? rows[0] : rows;
    }
};

// ============================================================
//  Utils  (invariato)
// ============================================================
const Utils = {
    formatDate(val) {
        if (!val) return '—';
        const date = typeof val === 'number' ? new Date(val) : new Date(val);
        return date.toLocaleDateString('it-IT', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    },

    formatCurrency(amount) {
        if (amount === null || amount === undefined) return '€ 0,00';
        return new Intl.NumberFormat('it-IT', {
            style: 'currency', currency: 'EUR'
        }).format(amount);
    },

    showMessage(elementId, message, type = 'success') {
        const element = document.getElementById(elementId);
        if (!element) return;
        element.textContent = message;
        element.className   = type === 'success' ? 'success-message' : 'error-message';
        element.style.display = 'block';
        setTimeout(() => { element.style.display = 'none'; }, 5000);
    },

    exportToCSV(data, filename) {
        if (!data || data.length === 0) { alert('Nessun dato da esportare'); return; }
        const headers    = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row =>
                headers.map(h => {
                    let cell = row[h];
                    if (cell === null || cell === undefined) cell = '';
                    cell = String(cell);
                    if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                        cell = '"' + cell.replace(/"/g, '""') + '"';
                    }
                    return cell;
                }).join(',')
            )
        ].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href     = URL.createObjectURL(blob);
        link.download = filename;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // Prezzo medio ponderato (usato da scarico.js)
    async calcolaPrezzoMedio(codice_materiale, nuovaQuantita, nuovoPrezzo) {
        const stock = await API.getStockByCodice(codice_materiale);
        if (!stock || stock.quantita_disponibile === 0) return nuovoPrezzo / nuovaQuantita;
        const vecchioValore  = stock.quantita_disponibile * (stock.prezzo_medio || 0);
        const quantitaTotale = stock.quantita_disponibile + nuovaQuantita;
        return (vecchioValore + nuovoPrezzo) / quantitaTotale;
    },

    async aggiornaStockCarico(codice_materiale, quantita, prezzoMedio) {
        const stock = await API.getStockByCodice(codice_materiale);
        if (stock) {
            await API.updateStock(stock.id, {
                codice_materiale:     stock.codice_materiale,
                quantita_disponibile: stock.quantita_disponibile + quantita,
                prezzo_medio:         prezzoMedio
            });
        } else {
            await API.createStock({ codice_materiale, quantita_disponibile: quantita, prezzo_medio: prezzoMedio });
        }
    },

    async aggiornaStockScarico(codice_materiale, quantita) {
        const stock = await API.getStockByCodice(codice_materiale);
        if (!stock)                               throw new Error('Materiale non trovato in stock');
        if (stock.quantita_disponibile < quantita) throw new Error('Quantità insufficiente in stock');
        await API.updateStock(stock.id, {
            codice_materiale:     stock.codice_materiale,
            quantita_disponibile: stock.quantita_disponibile - quantita,
            prezzo_medio:         stock.prezzo_medio
        });
    }
};
