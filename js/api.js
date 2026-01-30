// API Helper per comunicare con il database
const API = {
    // Materie Prime
    async getMateriePrime(page = 1, limit = 100) {
        const response = await fetch(`tables/materie_prime?page=${page}&limit=${limit}`);
        return await response.json();
    },
    
    async getMateriaPrima(id) {
        const response = await fetch(`tables/materie_prime/${id}`);
        return await response.json();
    },
    
    async createMateriaPrima(data) {
        const response = await fetch('tables/materie_prime', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    
    async updateMateriaPrima(id, data) {
        const response = await fetch(`tables/materie_prime/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    
    async deleteMateriaPrima(id) {
        await fetch(`tables/materie_prime/${id}`, {
            method: 'DELETE'
        });
    },
    
    // Carichi Magazzino
    async getCarichi(page = 1, limit = 100) {
        const response = await fetch(`tables/carichi_magazzino?page=${page}&limit=${limit}&sort=-created_at`);
        return await response.json();
    },
    
    async createCarico(data) {
        const response = await fetch('tables/carichi_magazzino', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    
    // Scarichi Magazzino
    async getScarichi(page = 1, limit = 100) {
        const response = await fetch(`tables/scarichi_magazzino?page=${page}&limit=${limit}&sort=-created_at`);
        return await response.json();
    },
    
    async createScarico(data) {
        const response = await fetch('tables/scarichi_magazzino', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    
    // Stock
    async getStock(page = 1, limit = 100) {
        const response = await fetch(`tables/stock?page=${page}&limit=${limit}`);
        return await response.json();
    },
    
    async getStockByCodice(codice) {
        const response = await fetch(`tables/stock?search=${codice}`);
        const data = await response.json();
        return data.data.find(s => s.codice_materiale === codice);
    },
    
    async updateStock(id, data) {
        const response = await fetch(`tables/stock/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    
    async createStock(data) {
        const response = await fetch('tables/stock', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        return await response.json();
    }
};

// Utility Functions
const Utils = {
    formatDate(timestamp) {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        return date.toLocaleDateString('it-IT', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    formatCurrency(amount) {
        if (amount === null || amount === undefined) return '€ 0,00';
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    },
    
    showMessage(elementId, message, type = 'success') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.textContent = message;
        element.className = type === 'success' ? 'success-message' : 'error-message';
        element.style.display = 'block';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    },
    
    // Export to CSV
    exportToCSV(data, filename) {
        if (!data || data.length === 0) {
            alert('Nessun dato da esportare');
            return;
        }
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    let cell = row[header];
                    if (cell === null || cell === undefined) cell = '';
                    if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
                        cell = '"' + cell.replace(/"/g, '""') + '"';
                    }
                    return cell;
                }).join(',')
            )
        ].join('\n');
        
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    
    // Calcolo prezzo medio ponderato
    async calcolaPrezzoMedio(codice_materiale, nuovaQuantita, nuovoPrezzo) {
        const stock = await API.getStockByCodice(codice_materiale);
        
        if (!stock || stock.quantita_disponibile === 0) {
            // Primo carico
            return nuovoPrezzo / nuovaQuantita;
        }
        
        const vecchioValore = stock.quantita_disponibile * stock.prezzo_medio;
        const nuovoValore = nuovoPrezzo;
        const quantitaTotale = stock.quantita_disponibile + nuovaQuantita;
        
        return (vecchioValore + nuovoValore) / quantitaTotale;
    },
    
    // Aggiorna stock dopo carico
    async aggiornaStockCarico(codice_materiale, quantita, prezzoMedio) {
        const stock = await API.getStockByCodice(codice_materiale);
        
        if (stock) {
            // Aggiorna stock esistente
            await API.updateStock(stock.id, {
                codice_materiale: stock.codice_materiale,
                quantita_disponibile: stock.quantita_disponibile + quantita,
                prezzo_medio: prezzoMedio
            });
        } else {
            // Crea nuovo stock
            await API.createStock({
                codice_materiale: codice_materiale,
                quantita_disponibile: quantita,
                prezzo_medio: prezzoMedio
            });
        }
    },
    
    // Aggiorna stock dopo scarico
    async aggiornaStockScarico(codice_materiale, quantita) {
        const stock = await API.getStockByCodice(codice_materiale);
        
        if (!stock) {
            throw new Error('Materiale non trovato in stock');
        }
        
        if (stock.quantita_disponibile < quantita) {
            throw new Error('Quantità insufficiente in stock');
        }
        
        await API.updateStock(stock.id, {
            codice_materiale: stock.codice_materiale,
            quantita_disponibile: stock.quantita_disponibile - quantita,
            prezzo_medio: stock.prezzo_medio
        });
    }
};
