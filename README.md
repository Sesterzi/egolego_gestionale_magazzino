# 🧱 Gestionale Magazzino LEGO

Sistema completo per la gestione di magazzino LEGO con funzionalità di import materie prime, carico, scarico e inventario.

## 🎯 Versione Attuale: v4.0 (LEGO Edition)

### 🆕 Novità Versione 4.0
- **Nuovo formato materie prime LEGO** (7 campi)
- **Validazione colore HEX** (#RRGGBB)
- **Controllo duplicati su unique_id**
- **Ricerca avanzata multi-campo** (5 campi)
- **Visualizzazione colore** con quadrato HEX
- **Suite test automatica** integrata

---

## 📋 Funzionalità Implementate

### ✅ Sistema di Autenticazione
- **Login con credenziali statiche**
  - Username: `admin`
  - Password: `admin123`
- Protezione di tutte le pagine (redirect automatico al login)
- Gestione sessione con sessionStorage
- Logout da tutte le pagine

### ✅ Gestione Materie Prime LEGO (v4.0)

#### 📦 Struttura Dati (7 Campi Obbligatori)
```csv
color_name,color_ref,color_id,lego_size,size_code,picture_url,unique_id
Light Nougat,#F6D7B3,78,Brick 1*1,3005,https://...,300578
```

| Campo | Tipo | Esempio | Descrizione |
|-------|------|---------|-------------|
| **color_name** | Text | Light Nougat | Nome colore LEGO |
| **color_ref** | HEX | #F6D7B3 | Codice HEX colore (con #) |
| **color_id** | Text | 78 | ID colore LEGO |
| **lego_size** | Text | Brick 1*1 | Descrizione pezzo |
| **size_code** | Text | 3005 | Codice pezzo LEGO |
| **picture_url** | URL | https://... | Link immagine |
| **unique_id** | Text | 300578 | ID univoco (size_code + color_id) |

#### ⚡ Funzionalità
- **CRUD completo** per materie prime LEGO
- **Import CSV/Excel massivo** con anteprima
  - Formato: 7 campi obbligatori (vedi sopra)
  - Supporto file: CSV (UTF-8), Excel (.xlsx, .xls)
  - Validazione automatica (tutti i campi + formato HEX)
  - **Protezione duplicati** su `unique_id`
  - File esempio incluso: `esempio_import_materie_prime.csv`
- **Ricerca avanzata multi-campo**
  - color_name (es. "Light Nougat")
  - color_ref (es. "#F6D7B3")
  - color_id (es. "78")
  - lego_size (es. "Brick")
  - size_code (es. "3005")
  - unique_id (es. "300578")
- **Export CSV** di tutte le materie prime
- **Visualizzazione colore** con quadrato HEX colorato
- **Validazione formato HEX** (#RRGGBB o #RGB)

### ✅ Carico Magazzino
- **Registrazione carichi** con:
  - Selezione materiale dal catalogo LEGO
  - Quantità pezzi
  - Prezzo totale (senza IVA)
  - Percentuale IVA (default 0%)
  - **Calcolo automatico** prezzo unitario
  - **Calcolo automatico** totale con IVA
- **Calcolo prezzo medio ponderato** automatico
- **Aggiornamento automatico stock**
- **Storico completo** di tutti i carichi
- **Filtri** per unique_id e data
- **Export CSV** storico carichi

### ✅ Scarico Magazzino
- **Scarico singolo** per produzione
  - Numero ordine
  - Selezione materiale
  - Visualizzazione disponibilità
  - Quantità da scaricare
  - Validazione vs stock disponibile
  - Note opzionali
- **Scarico multiplo** (distinta base)
  - Un ordine con più materiali
  - Verifica disponibilità per tutti i materiali
- **Storico completo** scarichi
- **Filtri** per ordine, unique_id, data
- **Export CSV** storico scarichi

### ✅ Stock Disponibile
- **Overview completa** con:
  - Foto materiale LEGO
  - Unique ID
  - Nome colore e HEX
  - Descrizione size
  - Quantità disponibile
  - Prezzo medio ponderato
  - Valore totale stock
- **Indicatori stato stock**
  - 🟢 **OK** (≥ 10 pezzi)
  - 🟡 **BASSO** (5-9 pezzi)
  - 🔴 **CRITICO** (1-4 pezzi)
  - ⚫ **ESAURITO** (0 pezzi)
- **Statistiche aggregate**
  - Totale SKU
  - Totale pezzi
  - Valore totale inventario
  - Articoli sotto scorta
- **Filtri** per unique_id e stato
- **Export CSV** stock completo

### ✅ Dashboard
- Panoramica generale del magazzino
- Statistiche in tempo reale
- Link rapidi alle funzioni principali

### ✅ API Documentation
- Documentazione completa API REST
- Esempi di richieste/risposte
- Test endpoints interattivi

---

## 🧪 Test e Qualità

### Suite Test Automatica
File: `test-gestionale-lego.html`

**12 Test Implementati:**
1. ✅ Database Connection
2. ✅ Schema Validation (7 campi)
3. ✅ HEX Color Validation
4. ✅ CSV Import
5. ✅ Duplicate Detection (unique_id)
6. ✅ Create Record
7. ✅ Read Record
8. ✅ Update Record
9. ✅ Delete Record
10. ✅ Search color_name
11. ✅ Search unique_id
12. ✅ Search lego_size

**Come eseguire:**
```bash
# Apri nel browser
open test-gestionale-lego.html

# Clicca "🚀 ESEGUI TUTTI I TEST"
# Risultato atteso: 12/12 test passati ✅
```

---

## 🚀 Quick Start

### 1. Login
```
URL: /index.html
Username: admin
Password: admin123
```

### 2. Import Materie Prime LEGO

**Opzione A: File CSV**
```csv
# Crea file: materie_prime_lego.csv
color_name,color_ref,color_id,lego_size,size_code,picture_url,unique_id
Light Nougat,#F6D7B3,78,Brick 1*1,3005,https://...,300578
White,#FFFFFF,1,Plate 2*2,3022,https://...,30221
```

**Opzione B: Excel**
1. Crea foglio con colonne: color_name, color_ref, color_id, lego_size, size_code, picture_url, unique_id
2. Compila i dati
3. Salva come `.xlsx` o CSV UTF-8

**Import:**
```
1. Vai su: Gestione Materie Prime
2. Clicca: "📥 Importa CSV/Excel"
3. Carica file
4. Verifica anteprima (7 colonne)
5. Clicca: "Importa"
```

### 3. Carico Materiale
```
1. Vai su: Carico Magazzino
2. Seleziona materiale (ricerca per unique_id)
3. Inserisci quantità
4. Inserisci prezzo totale (es. 100.00)
5. IVA % (default 0%)
6. Clicca: "Carica in Magazzino"
→ Stock aggiornato automaticamente
```

### 4. Verifica Stock
```
1. Vai su: Stock Disponibile
2. Vedi tutte le giacenze
3. Filtra per unique_id o stato
4. Export CSV per analisi
```

---

## 📂 Struttura Progetto

```
gestionale-magazzino/
├── index.html                          # Login
├── dashboard.html                      # Dashboard principale
├── materie-prime.html                  # Gestione materie prime LEGO
├── carico.html                         # Carico magazzino
├── scarico.html                        # Scarico magazzino
├── stock.html                          # Stock disponibile
├── api.html                            # Documentazione API
├── test-gestionale-lego.html          # Suite test automatica (NEW v4.0)
├── cleanup-materie-prime.html         # Utility pulizia DB
│
├── css/
│   └── style.css                       # Stili globali
│
├── js/
│   ├── auth.js                         # Gestione autenticazione
│   ├── api.js                          # API REST client
│   ├── dashboard.js                    # Dashboard logic
│   ├── materie-prime-lego.js          # Gestione materie prime LEGO (NEW v4.0)
│   ├── carico.js                       # Carico magazzino logic
│   ├── stock.js                        # Stock logic
│   ├── scarico.js                      # Scarico logic
│   └── api-docs.js                     # API docs interattive
│
├── esempio_import_materie_prime.csv    # Template CSV LEGO (NEW v4.0)
│
└── docs/
    ├── README.md                       # Questo file
    ├── GUIDA_RAPIDA.md                # Guida uso rapido
    ├── AGGIORNAMENTO_LEGO_COMPLETO.md # Guida v4.0 (NEW)
    ├── TEST_PRIMA_BACKUP.md           # Checklist test (NEW)
    ├── INTEGRAZIONE_SHOPIFY_GIT.md    # Guida Shopify (NEW)
    └── ... (altre guide)
```

---

## 🔧 Stack Tecnologico

### Frontend
- **HTML5** - Struttura pagine
- **CSS3** - Styling e responsive design
- **JavaScript ES6+** - Logica applicativa
- **Font Awesome 6.4** - Icone

### Backend
- **RESTful Table API** - Gestione dati
  - GET /tables/materie_prime
  - POST /tables/materie_prime
  - PUT /tables/materie_prime/{id}
  - DELETE /tables/materie_prime/{id}
- **SessionStorage** - Autenticazione client-side

### Libraries
- **XLSX.js** (0.18.5) - Import/Export Excel
- Nessuna dipendenza pesante (vanillaJS)

---

## 🎨 Formato Colore HEX

### ✅ Validi
```
#FF5733    (6 caratteri)
#F6D7B3    (6 caratteri)
#FFF       (3 caratteri, abbreviato)
#000       (3 caratteri, abbreviato)
```

### ❌ Invalidi
```
FF5733     (manca #)
#GGGGGG    (caratteri non validi)
#12345     (lunghezza sbagliata)
rosso      (testo)
```

**Regex validazione:**
```javascript
/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
```

---

## 🔒 Sicurezza

### Attuale (Development)
- ✅ Login statico (admin/admin123)
- ✅ SessionStorage per auth
- ✅ Redirect automatico se non autenticato

### Raccomandazioni Produzione
- 🔐 Implementare autenticazione backend
- 🔐 HTTPS obbligatorio
- 🔐 Token JWT invece di sessionStorage
- 🔐 Rate limiting sulle API
- 🔐 Protezione CSRF
- 🔐 Validazione input server-side

---

## 📊 Database Schema

### Tabella: `materie_prime`

| Campo | Tipo | Obbligatorio | Univoco | Esempio |
|-------|------|--------------|---------|---------|
| id | UUID | ✅ | ✅ | auto |
| color_name | text | ✅ | ❌ | Light Nougat |
| color_ref | text | ✅ | ❌ | #F6D7B3 |
| color_id | text | ✅ | ❌ | 78 |
| lego_size | text | ✅ | ❌ | Brick 1*1 |
| size_code | text | ✅ | ❌ | 3005 |
| picture_url | text | ✅ | ❌ | https://... |
| unique_id | text | ✅ | ✅ | 300578 |
| created_at | timestamp | auto | ❌ | auto |
| updated_at | timestamp | auto | ❌ | auto |

### Tabella: `carichi_magazzino`
(Schema invariato)

### Tabella: `stock`
(Schema invariato - usa unique_id come riferimento)

### Tabella: `scarichi_magazzino`
(Schema invariato - usa unique_id come riferimento)

---

## 🔄 Breaking Changes v4.0

### ⚠️ NON RETROCOMPATIBILE

**Vecchio formato CSV (v3.x):**
```csv
codice,part_number,codice_colore,colore,foto_url
MAT-001,PN-12345,RAL9005,Nero,https://...
```

**Nuovo formato CSV (v4.0):**
```csv
color_name,color_ref,color_id,lego_size,size_code,picture_url,unique_id
Light Nougat,#F6D7B3,78,Brick 1*1,3005,https://...,300578
```

### 📋 Migrazione da v3.x a v4.0

1. **Export dati vecchi**
   ```
   Gestione Materie Prime → Esporta CSV
   ```

2. **Converti formato**
   ```
   Vecchio: codice → Nuovo: unique_id
   Vecchio: colore → Nuovo: color_name
   Aggiungi: color_ref (HEX), color_id, lego_size, size_code
   ```

3. **Pulisci database**
   ```
   Gestione Materie Prime → Pulisci Database
   ```

4. **Import nuovo formato**
   ```
   Importa CSV/Excel → nuovo file convertito
   ```

---

## 📦 Deploy e Integrazione

### Opzione 1: Cloudflare Pages (Consigliata)
```bash
# 1. Push su GitHub
git push origin main

# 2. Collega repository su Cloudflare Pages
# 3. Deploy automatico
# 4. Custom domain: gestionale.tuosito.com
```

### Opzione 2: Shopify Integration
Vedi: `INTEGRAZIONE_SHOPIFY_GIT.md`

### Opzione 3: Netlify
```bash
# Deploy manuale
netlify deploy --prod --dir .
```

---

## 🐛 Troubleshooting

### Import CSV non funziona
```
✅ Verifica intestazioni esatte (7 colonne)
✅ Formato UTF-8
✅ Color HEX con # (#FF5733)
✅ Nessuna riga vuota
✅ unique_id univoci (no duplicati)
```

### Colori non si visualizzano
```
✅ Verifica color_ref formato HEX valido
✅ Controlla Console browser (F12)
✅ Ricarica pagina (Ctrl+F5)
```

### Duplicati nel database
```
✅ Usa "Pulisci Database"
✅ Re-import CSV
✅ Verifica unique_id univoci nel CSV
```

### Test falliti
```
1. Apri test-gestionale-lego.html
2. Esegui test singoli
3. Controlla Console (F12)
4. Verifica errori specifici
```

---

## 📚 Documentazione Aggiuntiva

- `GUIDA_RAPIDA.md` - Tutorial passo-passo
- `AGGIORNAMENTO_LEGO_COMPLETO.md` - Dettagli v4.0
- `TEST_PRIMA_BACKUP.md` - Checklist test pre-backup
- `INTEGRAZIONE_SHOPIFY_GIT.md` - Deploy su Shopify
- `FIX_DUPLICATI_IMPORT.md` - Fix bug duplicati
- `RICERCA_MULTI_CAMPO.md` - Uso ricerca avanzata

---

## 🤝 Supporto

### GitHub Repository
```
https://github.com/Sesterzi/egolego_gestionale_magazzino
```

### Issues
Per bug o richieste feature:
```
https://github.com/Sesterzi/egolego_gestionale_magazzino/issues
```

---

## 📝 Changelog

### v4.0.0 (2026-04-12) - LEGO Edition
- 🎨 **NEW**: Formato materie prime LEGO (7 campi)
- ✅ **NEW**: Validazione HEX color
- ✅ **NEW**: Controllo duplicati su unique_id
- ✅ **NEW**: Ricerca multi-campo (5 campi)
- ✅ **NEW**: Visualizzazione quadrato colore HEX
- 🧪 **NEW**: Suite test automatica (12 test)
- 📚 **NEW**: Documentazione completa v4.0
- ⚠️ **BREAKING**: Vecchio formato CSV non compatibile

### v3.1.0 (2026-01-28)
- ✅ Fix import CSV duplicati
- ✅ Ricerca multi-campo (codice, part_number, codice_colore, colore)
- ✅ Utility pulizia database
- 📚 Documentazione deploy Shopify/Cloudflare

### v3.0.0 (2026-01-14)
- ✅ Sistema completo carico/scarico/stock
- ✅ Calcolo prezzo medio ponderato
- ✅ Import CSV/Excel con preview
- ✅ Export CSV tutti i moduli
- ✅ Dashboard con statistiche

---

## 📄 Licenza

Progetto privato - Tutti i diritti riservati

© 2026 Sesterzi/egolego

---

## 🎯 Roadmap Futura

### v4.1 (In pianificazione)
- [ ] Import foto massive da Brickset API
- [ ] Generazione codice a barre per unique_id
- [ ] Report avanzati (grafici stock, trend prezzi)
- [ ] Export PDF documenti carico/scarico

### v5.0 (Long-term)
- [ ] Multi-utente con permessi
- [ ] Notifiche email scorte basse
- [ ] Integrazione fornitori LEGO
- [ ] App mobile (PWA)

---

**🧱 Buon magazzino LEGO! 🚀**
