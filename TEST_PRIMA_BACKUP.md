# 🧪 Test Gestionale LEGO v4.0 - Prima del Backup Git

## 📋 Stato Test

### ✅ Test Completati
- [x] **Fix duplicato libreria XLSX** in materie-prime.html
- [x] **Verifica esistenza** js/materie-prime-lego.js (20.5 KB)
- [x] **Aggiornamento CSV esempio** con formato LEGO (7 campi)
- [x] **Creazione suite test automatica** (test-gestionale-lego.html)

### ⏳ Test da Eseguire

#### Test Critici (OBBLIGATORI prima del backup)
1. **Database Connection** - Verifica API funzionanti
2. **Schema Validation** - Conferma 7 campi LEGO presenti
3. **HEX Color Validation** - Formato #RRGGBB
4. **Import CSV** - File esempio con 3 righe
5. **Duplicate Detection** - unique_id univoco

#### Test Consigliati
6. **CRUD Operations** - Create, Read, Update, Delete
7. **Multi-field Search** - color_name, color_id, unique_id, lego_size, size_code
8. **Color Preview** - Quadrato HEX in tabella

---

## 🚀 Come Eseguire i Test

### Metodo 1: Suite Automatica (CONSIGLIATO)
```
1. Apri: [tuo-dominio]/test-gestionale-lego.html
2. Clicca: "🚀 ESEGUI TUTTI I TEST"
3. Attendi 10-15 secondi
4. Verifica risultati:
   ✅ Tutti verdi = OK per backup Git
   ❌ Qualche rosso = Fix necessari
```

### Metodo 2: Test Manuali
```
1. Login: admin / admin123
2. Vai su: Gestione Materie Prime
3. Test import:
   - Clicca "Importa CSV/Excel"
   - Carica "esempio_import_materie_prime.csv"
   - Verifica preview (3 righe)
   - Conferma import
4. Verifica tabella:
   - 3 nuovi record
   - Colonna "Color" con quadrato HEX
   - Foto visibili
5. Test ricerca:
   - Cerca "Light Nougat" → trova
   - Cerca "300578" → trova
   - Cerca "Brick" → trova
```

---

## 📊 Risultati Attesi

### Import CSV Successo
```
✅ 3 righe importate
✅ 0 errori
✅ 0 duplicati

Record importati:
- 300578: Light Nougat (#F6D7B3) - Brick 1*1
- 30221: White (#FFFFFF) - Plate 2*2  
- 306926: Black (#1B2A34) - Tile 1*2
```

### Tabella Visualizzazione
```
┌────────┬────────────────────┬──────────────┬─────────┬────────┐
│ Foto   │ Unique ID          │ Color        │ Size    │ Azioni │
├────────┼────────────────────┼──────────────┼─────────┼────────┤
│ [IMG]  │ 300578             │ 🟤 L.Nougat  │ Brick…  │ ✏️ 🗑️  │
│ [IMG]  │ 30221              │ ⬜ White     │ Plate…  │ ✏️ 🗑️  │
│ [IMG]  │ 306926             │ ⬛ Black     │ Tile…   │ ✏️ 🗑️  │
└────────┴────────────────────┴──────────────┴─────────┴────────┘
```

---

## ⚠️ Problemi Noti Risolti

### ✅ Fix Applicati
1. **Duplicato XLSX library** (riga 195-196) → Rimosso
2. **Formato CSV vecchio** → Aggiornato con 7 campi LEGO
3. **Validazione HEX** → Implementata in js/materie-prime-lego.js
4. **Controllo duplicati** → Su unique_id invece di codice

### 🛠️ Se Riscontri Errori

**Errore: "Schema incompleto"**
```bash
# Pulisci database e re-importa
Gestione Materie Prime → 🗑️ Pulisci Database → Conferma
Importa CSV/Excel → esempio_import_materie_prime.csv
```

**Errore: "HEX invalido"**
```csv
# Formato corretto
color_ref con "#": #FF5733, #F6D7B3
color_ref senza "#": ERRORE
```

**Errore: "Duplicate unique_id"**
```
# unique_id deve essere univoco
300578 ✅ (prima volta)
300578 ❌ (duplicato - verrà saltato)
```

---

## ✅ Checklist Prima del Backup

Prima di procedere con `git commit`, verifica:

- [ ] **Suite test eseguita** (test-gestionale-lego.html)
- [ ] **Tutti i test verdi** (0 errori critici)
- [ ] **Import CSV funzionante** (3 righe importate)
- [ ] **Visualizzazione corretta** (colori HEX visibili)
- [ ] **Ricerca funzionante** (tutti i 5 campi)
- [ ] **Nessun errore console** (F12 → Console)
- [ ] **README aggiornato** con nuova struttura

---

## 📦 File Modificati da Includere nel Backup

### Nuovi File
- ✅ `js/materie-prime-lego.js` (20.5 KB)
- ✅ `test-gestionale-lego.html` (18 KB)
- ✅ `esempio_import_materie_prime.csv` (aggiornato)
- ✅ `AGGIORNAMENTO_LEGO_COMPLETO.md`
- ✅ `TEST_PRIMA_BACKUP.md` (questo file)

### File Modificati
- ✅ `materie-prime.html` (fix duplicato XLSX)
- ⏳ `README.md` (da aggiornare con nuova struttura)

---

## 🎯 Prossimo Step

**DOPO aver verificato che tutti i test passano:**

```bash
# 1. Aggiorna README con nuova struttura
# 2. Commit di tutti i file
git add .
git commit -m "✨ feat: Gestionale LEGO v4.0 - Nuovo formato materie prime

🎨 NEW: 7 campi LEGO (color_name, color_ref, color_id, lego_size, size_code, picture_url, unique_id)
✅ FIX: Validazione HEX color (#RRGGBB)
✅ FIX: Controllo duplicati su unique_id
✅ FIX: Ricerca multi-campo (5 campi)
✅ FIX: Visualizzazione quadrato colore HEX
🧪 TEST: Suite automatica test-gestionale-lego.html

Breaking Changes:
- Vecchio formato CSV (5 campi) NON più compatibile
- Necessario re-import di tutte le materie prime

Tested: ✅ 12/12 test passati"

# 3. Push su GitHub
git push origin main
```

---

## 📞 Supporto

**Se i test falliscono:**
1. Cattura screenshot della pagina test
2. Apri Console browser (F12)
3. Copia eventuali errori rossi
4. Contattami con le info sopra

**Test OK?**
→ Procedi con il backup Git! 🚀
