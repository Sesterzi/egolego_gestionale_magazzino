# 🚀 Guida Rapida - Gestionale Magazzino

## 📌 Accesso Rapido

**URL di accesso:** `index.html`

**Credenziali:**
- Username: `admin`
- Password: `admin123`

---

## ⚡ 5 Minuti per Iniziare

### 1️⃣ Primo Login (30 secondi)
1. Apri `index.html`
2. Inserisci: `admin` / `admin123`
3. Clicca "Accedi"
4. Sarai reindirizzato alla Dashboard

### 2️⃣ Dashboard - Panoramica (1 minuto)
La dashboard mostra:
- 📦 Totale materie prime catalogate
- 📈 Numero di carichi effettuati
- 📉 Numero di scarichi effettuati
- 💰 Valore totale del magazzino
- ⚠️ Alert per stock bassi

**Già presente:** 5 materie prime di esempio!

### 3️⃣ Primo Carico (2 minuti)
1. Vai su **Carico** (menu in alto)
2. Seleziona un materiale (es. MP001 - Rosso)
3. Inserisci:
   - Quantità: `50`
   - Prezzo totale: `500`
   - IVA: `22` (opzionale)
4. Clicca "Carica in Magazzino"
5. ✅ Il sistema calcola automaticamente il prezzo medio!

### 4️⃣ Primo Scarico (1.5 minuti)
1. Vai su **Scarico** (menu in alto)
2. Inserisci:
   - Numero ordine: `ORD-2024-100`
   - Seleziona materiale: `MP001`
   - Quantità: `10`
3. Clicca "Scarica da Magazzino"
4. ✅ Lo stock viene aggiornato automaticamente!

---

## 📊 Funzionalità Principali

### Materie Prime
- ➕ Aggiungi nuove materie prime manualmente
- 📤 **Import CSV/Excel massivo** (nuovo!)
  - Supporta CSV, XLSX, XLS
  - Template incluso: `esempio_import_materie_prime.csv`
  - Vedi `COME_CREARE_EXCEL.md` per creare file Excel
  - Importa centinaia di materiali in un click
  - Anteprima prima dell'import
  - Gestione automatica duplicati
- ✏️ Modifica dati esistenti
- 🗑️ Elimina (attenzione: verifica prima stock e movimenti)
- 🔍 Cerca per codice o part number
- 📥 Esporta tutto in CSV

### Carico Magazzino
- 📦 Registra nuovi arrivi
- 💶 Calcolo automatico prezzo unitario
- 📊 Calcolo automatico prezzo medio ponderato
- 🔄 Aggiornamento automatico stock
- 📋 Storico completo con filtri
- 📥 Export CSV

### Scarico Magazzino
- 📤 Scarico singolo per ordine
- 📋 Scarico multiplo (distinta parti)
- ⚠️ Controllo automatico disponibilità
- 📝 Note per ogni movimento
- 🔍 Filtri per ordine/codice/data
- 📥 Export CSV

### Stock
- 👀 Visione completa giacenze
- 🚦 Indicatori stato (OK/BASSO/CRITICO/ESAURITO)
- 💰 Calcolo valore totale
- 📊 Statistiche aggregate
- 🔍 Filtri multipli
- 📥 Export CSV

---

## 🎯 Casi d'Uso Comuni

### Scenario 0: Import Massivo Materie Prime (NUOVO!)
```
OPZIONE A - Da Excel (Consigliato):
1. Apri Excel/Google Sheets
2. Prima riga: codice | part_number | codice_colore | colore | foto_url
3. Righe successive: compila con i tuoi dati
4. Salva come .xlsx (o esporta CSV UTF-8)
5. Materie Prime → "📤 Importa CSV/Excel"
6. Seleziona file → "👁️ Anteprima"
7. "✅ Importa Tutto"
8. ✅ Fatto in pochi secondi!

OPZIONE B - Da CSV:
1. Usa template: esempio_import_materie_prime.csv
2. Modifica con i tuoi dati
3. Salva come CSV UTF-8
4. Importa come sopra
```

**⚠️ Importante:** 
- Formati supportati: CSV, XLSX, XLS
- Tutti i 5 campi sono **OBBLIGATORI**: codice, part_number, codice_colore, colore, foto_url
- Codice colore supporta "0" come valore valido (es. Trasparente)
- **Duplicati:** Materiali con codice già esistente vengono **saltati** (non sovrascritti)

### Scenario 1: Nuovo Arrivo Merce
```
1. Carico → Seleziona materiale
2. Inserisci quantità e prezzo
3. Clicca "Carica"
4. Vai su Stock → Verifica aggiornamento
```

### Scenario 2: Evadere un Ordine
```
1. Scarico → Inserisci numero ordine
2. Seleziona materiale
3. Inserisci quantità
4. Se serve più materiali → "Distinta Multipla"
5. Clicca "Scarica"
```

### Scenario 3: Controllo Giacenze
```
1. Stock → Visualizza tutto
2. Filtra per stato → "Stock Basso"
3. Identifica cosa riordinare
4. Export CSV per invio a fornitore
```

### Scenario 4: Report Mensile
```
1. Carico → Filtra per data mese scorso
2. Export CSV carichi
3. Scarico → Filtra per data mese scorso
4. Export CSV scarichi
5. Analizza in Excel
```

---

## 🔌 Integrazione API (Per Sviluppatori)

### Test Rapido
1. Vai su **API** (menu in alto)
2. Clicca su uno dei pulsanti "Test"
3. Vedi il risultato JSON in tempo reale

### Endpoint Principali
- `GET /tables/stock` → Leggi giacenze
- `POST /tables/scarichi_magazzino` → Registra scarico
- `GET /tables/materie_prime` → Lista materiali

**Documentazione completa:** Pagina API nel sistema

---

## 💡 Tips & Tricks

### 1. Codici Univoci
- Usa pattern logici: `MP001`, `MP002`, etc.
- Includi categoria: `LAM-001` (laminati), `VIT-001` (viti)

### 2. Foto Materiali
- Usa Google Drive: Carica foto → Condividi → Copia link
- Formato consigliato: JPG/PNG max 1MB
- URL diretti funzionano meglio

### 3. Prezzi
- Inserisci prezzi **senza IVA** per calcoli corretti
- Il sistema calcola automaticamente il prezzo medio ponderato
- IVA è opzionale (default 0%)

### 4. Export Dati
- Export CSV disponibile in **ogni sezione**
- Nome file include data automatica
- Compatibile con Excel/Google Sheets

### 5. Filtri
- Combina filtri per ricerche precise
- Data: usa il calendario per evitare errori
- "Reset" pulisce tutti i filtri

### 6. Stock Basso
- Soglia predefinita: < 10 pezzi
- Controlla Dashboard per alert immediati
- Usa filtri in Stock per analisi dettagliate

---

## ⚠️ Cosa Fare/Non Fare

### ✅ FARE
- Registra TUTTI i movimenti (carichi E scarichi)
- Usa numeri ordine univoci
- Controlla stock prima di scaricare
- Export CSV regolarmente per backup

### ❌ NON FARE
- Eliminare materie prime con stock esistente
- Scaricare senza verificare disponibilità
- Modificare codici dopo aver creato movimenti
- Dimenticare di registrare i carichi

---

## 🆘 Risoluzione Problemi

### "Stock insufficiente"
→ Verifica quantità disponibile in Stock

### "Codice SKU già esistente"
→ Usa un codice diverso o modifica quello esistente

### "Foto non si vede"
→ Verifica che l'URL sia pubblico e diretto

### "Non vedo i dati dopo login"
→ Ricarica la pagina (F5)

### "Export CSV non funziona"
→ Controlla che ci siano dati da esportare

---

## 📱 Compatibilità

✅ Chrome/Edge (consigliato)  
✅ Firefox  
✅ Safari  
✅ Mobile/Tablet (responsive)

---

## 🎓 Video Tutorial (Procedura Completa)

### 1. Aggiungi Materia Prima (1 min)
→ Materie Prime → ➕ Nuova → Compila → Salva

### 2. Carica Materiale (1 min)
→ Carico → Seleziona → Quantità/Prezzo → Carica

### 3. Scarica per Ordine (1 min)
→ Scarico → Ordine → Materiale → Quantità → Scarica

### 4. Controlla Stock (30 sec)
→ Stock → Verifica quantità → Filtra se serve

### 5. Export Dati (30 sec)
→ Qualsiasi pagina → 📥 Esporta CSV → Apri in Excel

---

## 📞 Hai Bisogno di Aiuto?

1. **Documentazione completa:** Leggi `README.md`
2. **API Reference:** Pagina API nel sistema
3. **Esempi codice:** README.md sezione "Integrazione"

---

## 🎉 Pronto!

Il sistema è completamente operativo con dati di esempio.

**Prossimi passi:**
1. Esplora le sezioni
2. Prova carico/scarico
3. Controlla i filtri
4. Export qualche CSV
5. Quando pronto, elimina i dati di esempio e inizia!

**Buon lavoro! 🚀**
