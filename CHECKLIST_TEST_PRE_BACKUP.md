# ✅ Checklist Test Pre-Backup Git - Gestionale LEGO v4.0

## 🎯 Obiettivo
Verificare che TUTTE le funzionalità del nuovo formato LEGO funzionino correttamente PRIMA di committare su Git.

---

## 📋 Test da Eseguire

### 🔴 Test Critici (OBBLIGATORI)

#### 1️⃣ Test Connessione Database
```bash
URL: test-gestionale-lego.html
Azione: Clicca "🔌 Test Connessione"
Risultato atteso: ✅ "Connessione al database OK"
```
- [ ] Test eseguito
- [ ] Risultato: ✅ PASS / ❌ FAIL

---

#### 2️⃣ Test Schema Database
```bash
Azione: Clicca "📋 Verifica Schema"
Risultato atteso: ✅ "Schema database corretto (7 campi LEGO)"
Campi: color_name, color_ref, color_id, lego_size, size_code, picture_url, unique_id
```
- [ ] Test eseguito
- [ ] Tutti i 7 campi presenti
- [ ] Risultato: ✅ PASS / ❌ FAIL

---

#### 3️⃣ Test Validazione HEX Color
```bash
Azione: Clicca "🎨 Test Validazione HEX"
Test casi:
  ✅ #FF5733 → valido
  ✅ #F6D7B3 → valido
  ✅ #FFF → valido (corto)
  ❌ FF5733 → invalido (manca #)
  ❌ #GGGGGG → invalido (caratteri non validi)
  ❌ rosso → invalido (testo)
```
- [ ] Test eseguito
- [ ] 3 casi validi ✅
- [ ] 3 casi invalidi ❌
- [ ] Risultato: ✅ PASS / ❌ FAIL

---

#### 4️⃣ Test Import CSV Esempio
```bash
File: esempio_import_materie_prime.csv
Contenuto:
  color_name,color_ref,color_id,lego_size,size_code,picture_url,unique_id
  Light Nougat,#F6D7B3,78,Brick 1*1,3005,https://...,300578
  White,#FFFFFF,1,Plate 2*2,3022,https://...,30221
  Black,#1B2A34,26,Tile 1*2,3069,https://...,306926

Azione:
  1. Login admin/admin123
  2. Gestione Materie Prime
  3. Importa CSV/Excel
  4. Carica esempio_import_materie_prime.csv
  5. Verifica preview (3 righe, 7 colonne)
  6. Clicca "Importa"

Risultato atteso:
  ✅ 3 righe importate
  ✅ 0 errori
  ✅ 0 saltati (se DB vuoto)
```
- [ ] Test eseguito
- [ ] Preview corretta (3 righe × 7 colonne)
- [ ] Import riuscito (3/3)
- [ ] Risultato: ✅ PASS / ❌ FAIL

---

#### 5️⃣ Test Controllo Duplicati
```bash
Azione:
  1. Re-importa lo stesso CSV (esempio_import_materie_prime.csv)
  
Risultato atteso:
  ✅ 0 righe importate
  ✅ 3 saltati (duplicati unique_id)
  ⚠️ Messaggio: "3 righe saltate (duplicate)"
```
- [ ] Test eseguito
- [ ] 3 righe saltate
- [ ] Nessun duplicato creato
- [ ] Risultato: ✅ PASS / ❌ FAIL

---

### 🟡 Test Importanti (CONSIGLIATI)

#### 6️⃣ Test Visualizzazione Tabella
```bash
Azione: Vai su Gestione Materie Prime

Risultato atteso:
  ┌────────┬─────────┬───────────────┬──────────────┬─────────┐
  │ Foto   │ Unique  │ Color         │ Size         │ Azioni  │
  ├────────┼─────────┼───────────────┼──────────────┼─────────┤
  │ [IMG]  │ 300578  │ 🟤 L.Nougat   │ Brick 1*1    │ ✏️ 🗑️   │
  │ [IMG]  │ 30221   │ ⬜ White      │ Plate 2*2    │ ✏️ 🗑️   │
  │ [IMG]  │ 306926  │ ⬛ Black      │ Tile 1*2     │ ✏️ 🗑️   │
  └────────┴─────────┴───────────────┴──────────────┴─────────┘

Verifica:
  ✅ Foto visibili (o icona se URL rotto)
  ✅ Unique ID mostrati
  ✅ Quadrato colore HEX presente
  ✅ Nome colore visibile
  ✅ Size + Code visibili
  ✅ Pulsanti Edit/Delete funzionanti
```
- [ ] Test eseguito
- [ ] Foto caricate
- [ ] Quadrati colore HEX corretti
- [ ] Risultato: ✅ PASS / ❌ FAIL

---

#### 7️⃣ Test Ricerca Multi-Campo

**Test 7a: Ricerca per color_name**
```bash
Input: "Light Nougat"
Risultato atteso: 1 risultato (300578)
```
- [ ] Test eseguito
- [ ] Risultato: ✅ PASS / ❌ FAIL

**Test 7b: Ricerca per unique_id**
```bash
Input: "300578"
Risultato atteso: 1 risultato (Light Nougat)
```
- [ ] Test eseguito
- [ ] Risultato: ✅ PASS / ❌ FAIL

**Test 7c: Ricerca per lego_size**
```bash
Input: "Brick"
Risultato atteso: 1 risultato (300578 - Brick 1*1)
```
- [ ] Test eseguito
- [ ] Risultato: ✅ PASS / ❌ FAIL

**Test 7d: Ricerca per size_code**
```bash
Input: "3005"
Risultato atteso: 1 risultato (300578)
```
- [ ] Test eseguito
- [ ] Risultato: ✅ PASS / ❌ FAIL

**Test 7e: Ricerca per color_id**
```bash
Input: "78"
Risultato atteso: 1 risultato (Light Nougat)
```
- [ ] Test eseguito
- [ ] Risultato: ✅ PASS / ❌ FAIL

---

#### 8️⃣ Test CRUD Operations

**Test 8a: Create**
```bash
Azione:
  1. Clicca "➕ Aggiungi Materia Prima"
  2. Compila form:
     - color_name: Test Blue
     - color_ref: #0000FF
     - color_id: 999
     - lego_size: Test Tile 1*1
     - size_code: TEST99
     - picture_url: https://via.placeholder.com/150/0000FF
     - unique_id: TEST99999
  3. Salva

Risultato atteso: ✅ Record creato
```
- [ ] Test eseguito
- [ ] Risultato: ✅ PASS / ❌ FAIL

**Test 8b: Read**
```bash
Azione: Cerca "TEST99999"
Risultato atteso: Trovato record "Test Blue"
```
- [ ] Test eseguito
- [ ] Risultato: ✅ PASS / ❌ FAIL

**Test 8c: Update**
```bash
Azione:
  1. Clicca "✏️" su TEST99999
  2. Modifica color_name → "Test Blue EDITED"
  3. Salva

Risultato atteso: ✅ Record aggiornato
```
- [ ] Test eseguito
- [ ] Risultato: ✅ PASS / ❌ FAIL

**Test 8d: Delete**
```bash
Azione:
  1. Clicca "🗑️" su TEST99999
  2. Conferma eliminazione

Risultato atteso: ✅ Record eliminato
```
- [ ] Test eseguito
- [ ] Risultato: ✅ PASS / ❌ FAIL

---

#### 9️⃣ Test Export CSV
```bash
Azione:
  1. Gestione Materie Prime
  2. Clicca "📥 Esporta CSV"

Risultato atteso:
  ✅ File scaricato: materie_prime_2026-04-12.csv
  ✅ Contenuto: 7 colonne (color_name, color_ref...)
  ✅ 3 righe dati (300578, 30221, 306926)
```
- [ ] Test eseguito
- [ ] File scaricato correttamente
- [ ] Dati corretti nel CSV
- [ ] Risultato: ✅ PASS / ❌ FAIL

---

#### 🔟 Test Console Errors
```bash
Azione:
  1. Apri Developer Tools (F12)
  2. Tab "Console"
  3. Naviga tutte le pagine:
     - Login
     - Dashboard
     - Gestione Materie Prime
     - Carico
     - Scarico
     - Stock

Risultato atteso:
  ✅ 0 errori rossi
  ⚠️ Warning gialli OK (se non critici)
```
- [ ] Test eseguito
- [ ] Console pulita (0 errori)
- [ ] Risultato: ✅ PASS / ❌ FAIL

---

## 📊 Riepilogo Finale

### Statistiche Test
```
Test Critici (5):      [__/__] ✅
Test Importanti (5):   [__/__] ✅
Totale:                [__/10] ✅

Percentuale successo:  ___%
```

### ✅ Condizioni per Procedere con Backup Git

- [ ] **Tutti i 5 test critici** superati (100%)
- [ ] **Almeno 4/5 test importanti** superati (80%)
- [ ] **Console senza errori critici**
- [ ] **README.md aggiornato** con nuova struttura
- [ ] **Documentazione v4.0 completa**

---

## 🚦 Decision Point

### ✅ SE TUTTI I TEST SONO VERDI
```bash
# Procedi con backup Git
git add .
git commit -m "✨ feat: Gestionale LEGO v4.0 - Nuovo formato materie prime

🎨 NEW: 7 campi LEGO (color_name, color_ref, color_id, lego_size, size_code, picture_url, unique_id)
✅ FIX: Validazione HEX color (#RRGGBB)
✅ FIX: Controllo duplicati su unique_id
✅ FIX: Ricerca multi-campo (5 campi)
✅ FIX: Visualizzazione quadrato colore HEX
🧪 TEST: Suite automatica (12 test passati)
📚 DOCS: Documentazione completa v4.0

Breaking Changes:
- Vecchio formato CSV (5 campi) NON più compatibile
- Necessario re-import di tutte le materie prime

Test Status: ✅ 10/10 passati (100%)"

git push origin main
```

### ⚠️ SE CI SONO TEST FALLITI
```bash
# NON fare commit
# Fix dei problemi:

1. Identifica test falliti
2. Controlla errori Console (F12)
3. Verifica file modificati:
   - js/materie-prime-lego.js
   - materie-prime.html
   - esempio_import_materie_prime.csv
4. Ri-esegui test
5. Ripeti fino a 10/10 ✅
```

---

## 📞 Troubleshooting Rapido

### Errore: "Schema incompleto"
```bash
Causa: Database ha vecchia struttura
Fix:
  1. Pulisci Database
  2. Re-importa CSV
  3. Verifica 7 campi presenti
```

### Errore: "HEX invalido"
```bash
Causa: color_ref senza # o formato sbagliato
Fix:
  1. Apri CSV
  2. Verifica colonna color_ref
  3. Aggiungi # se manca
  4. Formato: #FF5733 o #FFF
```

### Errore: "Duplicati creati"
```bash
Causa: Controllo duplicati non funziona
Fix:
  1. Verifica js/materie-prime-lego.js (riga ~450)
  2. Controllo deve usare unique_id
  3. Pulisci DB
  4. Re-importa
```

### Errore: "Foto non si caricano"
```bash
Causa: URL foto non validi o CORS
Fix:
  1. Verifica URL in CSV
  2. Usa HTTPS (non HTTP)
  3. Testa URL in browser
  4. Placeholder: https://via.placeholder.com/150
```

---

## 📝 Note Finali

### Prima del Commit
- [ ] Tutti i file salvati
- [ ] Nessuna modifica in sospeso
- [ ] README.md aggiornato
- [ ] Changelog compilato
- [ ] Test documentati

### Dopo il Commit
- [ ] Verificare push su GitHub
- [ ] Controllare repository online
- [ ] Testare clone fresco
- [ ] Verificare documentazione visibile

---

## ✅ Firma Test

```
Data test: ____/____/______
Eseguito da: _________________
Test superati: ___/10
Status finale: ✅ PRONTO / ❌ DA FIXARE
Note: _______________________________________
```

---

**🎯 Obiettivo: 10/10 test verdi prima del commit! 🚀**
