# 🏭 Gestionale Magazzino

Sistema completo per la gestione di magazzino con funzionalità di carico, scarico, inventario e integrazione API.

## 📋 Funzionalità Implementate

### ✅ Sistema di Autenticazione
- **Login con credenziali statiche**
  - Username: `admin`
  - Password: `admin123`
- Protezione di tutte le pagine (redirect automatico al login)
- Gestione sessione con sessionStorage
- Logout da tutte le pagine

### ✅ Gestione Materie Prime
- **CRUD completo** per materie prime
  - Codice materiale univoco
  - Part Number
  - Codice colore (es. RAL, supporta anche "0")
  - Nome colore
  - Foto (tramite URL)
- **Import CSV/Excel massivo** con anteprima
  - Formato: codice, part_number, codice_colore, colore, foto_url (5 campi obbligatori)
  - Supporto file: CSV (UTF-8), Excel (.xlsx, .xls)
  - Validazione automatica (tutti i campi obbligatori)
  - Gestione duplicati (salta codici esistenti)
  - Supporto codice colore "0" come valore valido
  - File esempio incluso: `esempio_import_materie_prime.csv`
- **Ricerca** per codice e part number
- **Export CSV** di tutte le materie prime
- **Validazione** codici univoci

### ✅ Carico Magazzino
- **Registrazione carichi** con:
  - Selezione materiale dal catalogo
  - Quantità pezzi
  - Prezzo totale (senza IVA)
  - Percentuale IVA (default 0%)
  - **Calcolo automatico** prezzo unitario
  - **Calcolo automatico** totale con IVA
- **Calcolo prezzo medio ponderato** automatico
- **Aggiornamento automatico stock**
- **Storico completo** di tutti i carichi
- **Filtri** per codice materiale e data
- **Export CSV** storico carichi

### ✅ Stock Disponibile
- **Overview completa** con:
  - Foto materiale
  - Codice
  - Colore (nome e codice)
  - Quantità disponibile
  - Prezzo medio
  - Valore totale stock
  - Stato (OK/BASSO/CRITICO/ESAURITO)
- **Statistiche dashboard**:
  - Totale SKU
  - Totale pezzi
  - Valore totale magazzino
  - Conteggio stock bassi
- **Filtri** per codice e stato
- **Export CSV** stock

### ✅ Scarico Magazzino
- **Scarico singolo** con:
  - Numero ordine
  - Selezione materiale
  - Visualizzazione stock disponibile
  - Quantità da scaricare
  - Validazione quantità disponibile
  - Note opzionali
- **Scarico multiplo (distinta parti)**:
  - Un ordine con più materiali
  - Verifica stock per tutti i materiali
  - Scarico atomico di tutta la distinta
- **Aggiornamento automatico stock**
- **Storico completo** scarichi
- **Filtri** per:
  - Numero ordine
  - Codice materiale
  - Data
- **Export CSV** storico scarichi

### ✅ Dashboard
- **Statistiche in tempo reale**:
  - Totale materie prime
  - Totale carichi
  - Totale scarichi
  - Valore totale stock
- **Ultimi 5 carichi**
- **Ultimi 5 scarichi**
- **Alert stock basso** (< 10 pezzi)

### ✅ API RESTful
- **Documentazione completa** delle API disponibili
- **Test API integrati** nella UI
- **Endpoint disponibili**:
  - GET/POST Materie Prime
  - GET/POST Carichi
  - GET/POST Scarichi
  - GET/PUT Stock
- **Esempi di integrazione** JavaScript
- **Ready per integrazione** con sistemi esterni

### ✅ Export Dati
- **Export CSV** da tutte le sezioni:
  - Materie prime
  - Storico carichi
  - Storico scarichi
  - Stock disponibile
- **Formato CSV** con separatori corretti
- **Encoding UTF-8** con BOM
- **Nome file** con data automatica

## 🗂️ Struttura Progetto

```
/
├── index.html              # Pagina login
├── dashboard.html          # Dashboard principale
├── materie-prime.html      # Gestione materie prime
├── carico.html            # Carico magazzino
├── scarico.html           # Scarico magazzino
├── stock.html             # Stock disponibile
├── api.html               # Documentazione API
│
├── css/
│   └── style.css          # Stili globali
│
└── js/
    ├── auth.js            # Sistema autenticazione
    ├── api.js             # Helper API e utilities
    ├── dashboard.js       # Logica dashboard
    ├── materie-prime.js   # Gestione materie prime
    ├── carico.js          # Logica carico
    ├── scarico.js         # Logica scarico
    ├── stock.js           # Visualizzazione stock
    └── api-docs.js        # Test API
```

## 💾 Struttura Database

### Tabella: `materie_prime`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | text | ID univoco (UUID) |
| codice | text | Codice materiale univoco |
| part_number | text | Part number prodotto |
| codice_colore | text | Codice colore (es. RAL9005) |
| colore | text | Nome colore |
| dimensioni | text | Dimensioni (opzionale) |
| foto_url | text | URL foto prodotto |

### Tabella: `carichi_magazzino`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | text | ID univoco (UUID) |
| codice_materiale | text | Codice SKU materiale |
| quantita | number | Numero pezzi caricati |
| prezzo_totale | number | Prezzo totale senza IVA |
| iva_percentuale | number | Percentuale IVA |
| prezzo_unitario | number | Prezzo per pezzo |
| data_carico | datetime | Data e ora carico (timestamp) |

### Tabella: `scarichi_magazzino`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | text | ID univoco (UUID) |
| numero_ordine | text | Numero ordine cliente |
| codice_materiale | text | Codice SKU materiale |
| quantita | number | Numero pezzi scaricati |
| data_scarico | datetime | Data e ora scarico (timestamp) |
| note | text | Note aggiuntive |

### Tabella: `stock`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | text | ID univoco (UUID) |
| codice_materiale | text | Codice SKU materiale |
| quantita_disponibile | number | Quantità disponibile |
| prezzo_medio | number | Prezzo medio ponderato |

## 🔌 API Endpoints

### Base URL
```
/tables/
```

### Stock
- `GET /tables/stock` - Lista stock con paginazione
- `GET /tables/stock?search={codice}` - Cerca stock per codice
- `PUT /tables/stock/{id}` - Aggiorna stock

### Materie Prime
- `GET /tables/materie_prime` - Lista materie prime
- `GET /tables/materie_prime/{id}` - Dettaglio materia prima
- `POST /tables/materie_prime` - Crea materia prima
- `PUT /tables/materie_prime/{id}` - Aggiorna materia prima
- `DELETE /tables/materie_prime/{id}` - Elimina materia prima

### Carichi
- `GET /tables/carichi_magazzino` - Lista carichi
- `POST /tables/carichi_magazzino` - Crea carico

### Scarichi
- `GET /tables/scarichi_magazzino` - Lista scarichi
- `POST /tables/scarichi_magazzino` - Crea scarico

### Parametri Query Comuni
- `page` - Numero pagina (default: 1)
- `limit` - Elementi per pagina (default: 100)
- `search` - Ricerca full-text
- `sort` - Ordinamento (es. `-created_at` per più recenti)

## 📸 Gestione Foto

**Sistema attuale:** URL esterni

Le foto dei materiali vengono gestite tramite URL. L'utente deve:
1. Caricare la foto su un servizio esterno (Google Drive, Dropbox, hosting web, etc.)
2. Ottenere l'URL pubblico della foto
3. Inserire l'URL nel campo "URL Foto"

**Servizi consigliati:**
- Google Drive (con condivisione pubblica)
- Dropbox (link pubblici)
- Imgur
- Hosting web aziendale

## 📥 Import Massivo CSV/Excel

### Formati Supportati
Il sistema supporta l'import da:
- **CSV** (.csv) - Separatore virgola, UTF-8
- **Excel** (.xlsx, .xls) - Legge il primo foglio

### Formato File
Il file deve contenere le seguenti colonne (con intestazione):
```csv
codice,part_number,codice_colore,foto_url
```

### Esempio
Vedi i file inclusi nel progetto:
- **CSV:** `esempio_import_materie_prime.csv`
- **Excel:** Vedi `COME_CREARE_EXCEL.md` per istruzioni

```csv
codice,part_number,codice_colore,foto_url
MAT-004,PN-12348,RAL3020,https://esempio.com/foto1.jpg
MAT-005,PN-12349,RAL1021,https://esempio.com/foto2.jpg
MAT-006,PN-12350,RAL5015,https://esempio.com/foto3.jpg
```

**Per Excel:** Stessa struttura, prima riga = intestazioni, righe successive = dati

### Regole
- **Separatore:** virgola (,)
- **Encoding:** UTF-8
- **Prima riga:** intestazione colonne
- **Tutti i campi sono OBBLIGATORI:**
  - codice → Codice materiale univoco
  - part_number → Part number prodotto
  - codice_colore → Codice identificativo colore (es. RAL9005)
  - foto_url → URL immagine del materiale
- **Colore e dimensioni:** Da inserire **manualmente dopo l'import** (non nel CSV)
- **Duplicati:** Le righe con codice già esistente vengono saltate

### Procedura Import
1. Vai su **Materie Prime**
2. Clicca su "📤 Importa CSV/Excel"
3. Seleziona il file CSV o Excel
4. Clicca su "👁️ Anteprima" per vedere i dati
5. Verifica l'anteprima (prime 5 righe)
6. Clicca su "✅ Importa Tutto"
7. Attendi il completamento (mostra successi/errori)

### Gestione Duplicati
**⚠️ IMPORTANTE:** Il sistema **NON sovrascrive** materiali esistenti!

- ✅ **Codice nuovo** → Materiale viene importato
- ⚠️ **Codice già presente** → Riga viene **saltata** (dati esistenti rimangono invariati)

**Esempio:**
```
Database: MAT-001, MAT-002
Import file: MAT-001, MAT-002, MAT-003, MAT-004

Risultato:
- MAT-001: Saltato (già esiste)
- MAT-002: Saltato (già esiste)  
- MAT-003: Importato ✅
- MAT-004: Importato ✅
```

**Vantaggio:** Puoi reimportare lo stesso file più volte, vengono aggiunti solo i nuovi materiali.

**Per aggiornare materiali esistenti:** Usa la funzione Modifica (✏️) dalla tabella.

### Tips Import
- Prepara il file in Excel/Google Sheets (più comodo della gestione CSV)
- Salva come .xlsx oppure esporta come CSV UTF-8
- Testa con poche righe prima di importare centinaia di materiali
- **Assicurati di avere l'URL per ogni foto** prima di preparare il file
- Carica le foto su Google Drive/Dropbox e ottieni gli URL pubblici
- **Colore e dimensioni** vanno inseriti manualmente dopo l'import (modifica ogni materiale)
- Se Excel: il sistema legge solo il primo foglio

## 🎯 Come Utilizzare il Sistema

### 1. Primo Accesso
1. Accedi con `admin` / `admin123`
2. Vai su **Materie Prime**
3. Opzione A: Aggiungi materie prime una alla volta
4. Opzione B: Usa **Importa CSV** per caricamento massivo
   - Scarica il file `esempio_import_materie_prime.csv` come template
   - Compila con i tuoi dati
   - Importa tutto con un click

### 2. Carico Materiali
1. Vai su **Carico**
2. Seleziona il materiale
3. Inserisci quantità e prezzo
4. Il sistema calcola automaticamente il prezzo medio ponderato
5. Lo stock viene aggiornato automaticamente

### 3. Scarico Materiali
1. Vai su **Scarico**
2. Inserisci numero ordine
3. Seleziona materiale e quantità
4. Il sistema verifica la disponibilità
5. Lo stock viene aggiornato automaticamente

**Scarico Multiplo:**
1. Clicca su "Distinta Multipla"
2. Aggiungi tutti i materiali necessari
3. Il sistema scarica tutto insieme

### 4. Monitoraggio Stock
1. Vai su **Stock**
2. Visualizza quantità disponibili
3. Filtra per stato (OK, BASSO, CRITICO, ESAURITO)
4. Esporta CSV per analisi

### 5. Export Dati
- Ogni sezione ha un pulsante "Esporta CSV"
- I file vengono scaricati con nome formato: `tipo_YYYY-MM-DD.csv`
- Formato compatibile con Excel/LibreOffice

## 🔗 Integrazione con Sistemi Esterni

### Scenario 1: Sistema esterno legge lo stock
```javascript
async function getStockDisponibile(codice) {
    const response = await fetch(`/tables/stock?search=${codice}`);
    const data = await response.json();
    return data.data.find(s => s.codice_materiale === codice);
}
```

### Scenario 2: Sistema esterno scarica materiali
```javascript
async function scaricaMateriale(ordine, codice, quantita) {
    // 1. Verifica stock
    const stock = await getStockDisponibile(codice);
    if (stock.quantita_disponibile < quantita) {
        throw new Error('Stock insufficiente');
    }
    
    // 2. Crea scarico
    await fetch('/tables/scarichi_magazzino', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            numero_ordine: ordine,
            codice_materiale: codice,
            quantita: quantita,
            data_scarico: Date.now()
        })
    });
    
    // 3. Aggiorna stock
    const nuovaQty = stock.quantita_disponibile - quantita;
    await fetch(`/tables/stock/${stock.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            codice_materiale: stock.codice_materiale,
            quantita_disponibile: nuovaQty,
            prezzo_medio: stock.prezzo_medio
        })
    });
}
```

**Consulta la pagina API nel sistema per esempi completi.**

## ⚠️ Limitazioni Attuali

### Non Implementato (Richiede Backend)
1. **Export automatico CSV alle 3AM**: Richiede un server con cron job
2. **Upload foto diretto**: Le foto devono essere caricate su servizi esterni
3. **Autenticazione API esterna**: Le API con autenticazione richiedono backend

### Workaround Disponibili
- **Export CSV**: Manuale con un click, disponibile in ogni sezione
- **Foto**: Tramite URL (Google Drive, Dropbox, etc.)
- **API**: Documentazione completa per integrazione futura

## 🚀 Prossimi Sviluppi Consigliati

### Alta Priorità
1. **Backup automatico dati**: Export programmato giornaliero
2. **Notifiche stock basso**: Alert via email quando stock < soglia
3. **Report mensili**: Statistiche carichi/scarichi per periodo
4. **Gestione fornitori**: Associare materie prime a fornitori

### Media Priorità
5. **Barcode/QR code**: Generazione e scansione codici
6. **Movimenti magazzino**: Log dettagliato di tutte le operazioni
7. **Prezzi multipli**: Gestione listini per cliente/fornitore
8. **Ubicazioni**: Gestione scaffali e posizioni fisiche

### Bassa Priorità
9. **Inventario fisico**: Funzione per conteggio manuale e riconciliazione
10. **Multi-magazzino**: Gestione di più depositi
11. **Gestione utenti**: Ruoli e permessi differenziati

## 🔧 Tecnologie Utilizzate

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Database**: RESTful Table API (JSON-based)
- **Autenticazione**: SessionStorage
- **Styling**: CSS custom (no framework)
- **Export**: JavaScript Blob API
- **Responsive**: Design mobile-friendly

## 📞 Supporto

Per domande o supporto:
1. Consulta la **pagina API** nel sistema
2. Verifica la **Dashboard** per statistiche
3. Controlla i **filtri** in ogni sezione per ricerche avanzate
4. Usa l'**Export CSV** per analisi esterne

## 📄 Licenza

Sistema gestionale magazzino - Tutti i diritti riservati.

---

**Versione:** 1.0.0  
**Data:** 2026-01-14  
**Stato:** Completamente funzionale ✅
