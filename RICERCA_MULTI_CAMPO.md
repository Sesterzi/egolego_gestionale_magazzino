# ✅ Ricerca Multi-Campo Implementata

**Data**: 2026-01-28  
**Funzionalità**: Ricerca avanzata su Gestione Materie Prime

---

## 🎯 Cosa è Cambiato

### ✅ Prima (Ricerca Limitata)
- Campo: **"Cerca per Codice"**
- Ricerca solo su: `codice` e `part_number`

### ✅ Dopo (Ricerca Multi-Campo)
- Campo: **"Cerca"**
- Placeholder: *"Cerca per codice, part number, codice colore o colore..."*
- Ricerca su **4 campi**:
  1. ✅ **Codice** (es. MAT-001)
  2. ✅ **Part Number** (es. PN-12345)
  3. ✅ **Codice Colore** (es. RAL9005, 0)
  4. ✅ **Colore** (es. Nero, Bianco, Rosso)

---

## 🔍 Come Funziona

### Ricerca Case-Insensitive
La ricerca **NON** distingue tra maiuscole e minuscole:
- "nero" trova "Nero", "NERO", "NeRo"
- "ral9005" trova "RAL9005", "ral9005", "Ral9005"

### Ricerca Parziale
La ricerca trova corrispondenze parziali:
- "MAT" trova "MAT-001", "MAT-002", "MAT-999"
- "PN-12" trova "PN-12345", "PN-12999"
- "Ros" trova "Rosso"
- "0" trova codici colore "0", "RAL0", "C0"

### Ricerca Multi-Campo
Un singolo termine cerca in tutti e 4 i campi contemporaneamente:
- "9005" trova sia:
  - Codice colore: "RAL9005"
  - Part number: "PN-9005XXX" (se esiste)

---

## 📝 Esempi di Utilizzo

### Esempio 1: Cerca per Codice
```
Input: "MAT-001"
Risultato: Trova il materiale con codice "MAT-001"
```

### Esempio 2: Cerca per Part Number
```
Input: "PN-12345"
Risultato: Trova tutti i materiali con part number "PN-12345"
```

### Esempio 3: Cerca per Codice Colore
```
Input: "RAL9005"
Risultato: Trova tutti i materiali con codice colore "RAL9005"
```

### Esempio 4: Cerca per Nome Colore
```
Input: "Nero"
Risultato: Trova tutti i materiali neri
```

### Esempio 5: Cerca Parziale
```
Input: "Ros"
Risultato: Trova "Rosso", "Rosa", "Rosato" ecc.
```

### Esempio 6: Cerca Codice Colore "0"
```
Input: "0"
Risultato: Trova materiali con codice colore "0", "00", "C0", "RAL0" ecc.
```

---

## 🎮 Modalità di Ricerca

### 1. Click sul Pulsante "🔍 Cerca"
```
1. Digita nel campo di ricerca
2. Clicca "🔍 Cerca"
3. Risultati visualizzati
```

### 2. Premi Invio (NUOVO!)
```
1. Digita nel campo di ricerca
2. Premi "Invio" sulla tastiera
3. Risultati visualizzati (senza click)
```

### 3. Reset Ricerca
```
1. Clicca "🔄 Reset"
2. Campo di ricerca si svuota
3. Tutti i materiali visualizzati
```

---

## 💡 Casi d'Uso Pratici

### Scenario 1: Trova Materiale per Codice
```
Situazione: Devi verificare se il materiale "MAT-123" esiste
Azione: Digita "MAT-123" → Premi Invio
Risultato: Vedi se il materiale esiste o messaggio "Nessuna materia prima trovata"
```

### Scenario 2: Trova Tutti i Materiali Neri
```
Situazione: Vuoi vedere tutti i materiali di colore nero
Azione: Digita "Nero" → Clicca Cerca
Risultato: Lista di tutti i materiali con colore "Nero"
```

### Scenario 3: Trova per RAL
```
Situazione: Il cliente chiede materiali RAL9005
Azione: Digita "RAL9005" → Premi Invio
Risultato: Lista di tutti i materiali con quel codice RAL
```

### Scenario 4: Cerca Part Number Cliente
```
Situazione: Il cliente fornisce part number "PN-XYZ"
Azione: Digita "PN-XYZ" → Cerca
Risultato: Trova il materiale corrispondente
```

---

## 🔧 Implementazione Tecnica

### File Modificati

#### 1. `materie-prime.html`
```html
<!-- PRIMA -->
<label for="searchCodice">Cerca per Codice</label>
<input type="text" id="searchCodice" placeholder="Inserisci codice...">

<!-- DOPO -->
<label for="searchTerm">Cerca</label>
<input type="text" id="searchTerm" placeholder="Cerca per codice, part number, codice colore o colore...">
<small>La ricerca funziona su tutti i campi</small>
```

#### 2. `js/materie-prime.js`

**Funzione di Ricerca Aggiornata:**
```javascript
async function loadMateriePrime(searchTerm = '') {
    try {
        const result = await API.getMateriePrime();
        currentMaterie = result.data || [];
        
        // Filtra per tutti i campi
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
```

**Event Listeners Aggiornati:**
```javascript
// Click sul pulsante Cerca
document.getElementById('searchBtn').addEventListener('click', () => {
    const searchTerm = document.getElementById('searchTerm').value;
    loadMateriePrime(searchTerm);
});

// Tasto Invio nel campo di ricerca (NUOVO!)
document.getElementById('searchTerm').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const searchTerm = document.getElementById('searchTerm').value;
        loadMateriePrime(searchTerm);
    }
});

// Reset ricerca
document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('searchTerm').value = '';
    loadMateriePrime();
});
```

---

## ✅ Vantaggi

### 1. Ricerca Più Flessibile
- ✅ Non devi ricordare se un codice è nel campo "codice" o "part_number"
- ✅ Cerca liberamente e trovi comunque il materiale

### 2. Esperienza Utente Migliore
- ✅ Un solo campo invece di più filtri complicati
- ✅ Placeholder chiaro spiega cosa cercare
- ✅ Tasto Invio per ricerca veloce

### 3. Casi d'Uso Reali
- ✅ Cliente fornisce un codice generico → lo cerchi e lo trovi
- ✅ Vuoi materiali di un colore → scrivi il colore
- ✅ Cerchi codici RAL specifici → digita il RAL

### 4. Ricerca Intelligente
- ✅ Case-insensitive (maiuscole/minuscole)
- ✅ Ricerca parziale (trova anche corrispondenze parziali)
- ✅ Multi-campo (cerca ovunque)

---

## 🧪 Test Suggeriti

### Test 1: Ricerca per Codice
```
1. Importa esempio_import_materie_prime.csv (3 materiali)
2. Cerca: "MAT-004"
3. Risultato: 1 materiale (Rosso)
```

### Test 2: Ricerca per Colore
```
1. Cerca: "Rosso"
2. Risultato: Materiali con colore "Rosso"
```

### Test 3: Ricerca per RAL
```
1. Cerca: "RAL3020"
2. Risultato: Materiali con codice colore "RAL3020"
```

### Test 4: Ricerca Parziale
```
1. Cerca: "MAT"
2. Risultato: Tutti i materiali con codice che inizia per "MAT"
```

### Test 5: Ricerca Case-Insensitive
```
1. Cerca: "rosso" (minuscolo)
2. Risultato: Trova materiali con colore "Rosso" (maiuscolo)
```

### Test 6: Reset
```
1. Cerca qualcosa
2. Clicca "🔄 Reset"
3. Risultato: Tutti i materiali visualizzati
```

### Test 7: Invio Tastiera
```
1. Digita "Blu"
2. Premi "Invio" (senza click)
3. Risultato: Ricerca eseguita automaticamente
```

---

## 📊 Performance

### Ricerca Client-Side
- ✅ Veloce (filtro locale sui dati caricati)
- ✅ Nessuna chiamata API aggiuntiva
- ✅ Risposta istantanea

### Scalabilità
- ✅ Funziona bene fino a ~1000 materiali
- ✅ Per database più grandi, si potrebbe implementare ricerca server-side

---

## 🎉 Conclusione

La ricerca su Gestione Materie Prime ora è molto più potente e flessibile:

- ✅ **4 campi di ricerca**: codice, part_number, codice_colore, colore
- ✅ **Ricerca intelligente**: case-insensitive e parziale
- ✅ **UX migliorata**: tasto Invio, placeholder descrittivo
- ✅ **Flessibilità**: trova materiali indipendentemente da quale campo contiene il dato

**Pronta per l'uso!** 🚀

---

**Ultima modifica**: 2026-01-28  
**File modificati**: `materie-prime.html`, `js/materie-prime.js`
