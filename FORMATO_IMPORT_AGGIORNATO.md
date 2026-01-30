# 📦 Gestionale Magazzino - Formato Import CSV/Excel

## ✅ NUOVA STRUTTURA (5 Campi Obbligatori)

Dalla versione aggiornata, il CSV/Excel deve contenere **5 colonne obbligatorie**:

```
codice,part_number,codice_colore,colore,foto_url
```

### 📋 Descrizione Campi

| Campo | Tipo | Obbligatorio | Descrizione | Esempio |
|-------|------|--------------|-------------|---------|
| `codice` | Testo | ✅ SÌ | Codice materiale univoco | `MAT-001` |
| `part_number` | Testo | ✅ SÌ | Part number prodotto | `PN-12345` |
| `codice_colore` | Testo | ✅ SÌ | Codice identificativo colore | `RAL9005` o `0` |
| `colore` | Testo | ✅ SÌ | Nome descrittivo del colore | `Nero`, `Bianco` |
| `foto_url` | URL | ✅ SÌ | URL immagine del materiale | `https://...` |

### 📝 Esempio File CSV

```csv
codice,part_number,codice_colore,colore,foto_url
MAT-001,PN-12345,RAL9005,Nero,https://esempio.com/foto1.jpg
MAT-002,PN-12346,RAL9016,Bianco,https://esempio.com/foto2.jpg
MAT-003,PN-12347,RAL3020,Rosso,https://esempio.com/foto3.jpg
MAT-004,PN-12348,0,Trasparente,https://esempio.com/foto4.jpg
```

### 📊 Esempio File Excel

Crea un file Excel con questa struttura:

| codice | part_number | codice_colore | colore | foto_url |
|--------|-------------|---------------|--------|----------|
| MAT-001 | PN-12345 | RAL9005 | Nero | https://esempio.com/foto1.jpg |
| MAT-002 | PN-12346 | RAL9016 | Bianco | https://esempio.com/foto2.jpg |

Poi salva come `.xlsx` o `.csv`

---

## ⚠️ Note Importanti

### 1️⃣ Codice Colore "0" è Valido
Il sistema accetta **"0"** come codice colore valido (ad esempio per colori trasparenti o neutri).

**Esempi validi:**
- `0` → Trasparente
- `00` → Neutro
- `000` → Base
- `RAL0` → Codice RAL con zero

### 2️⃣ Tutti i Campi Sono Obbligatori
Ogni riga deve avere **tutti e 5 i campi compilati**. Righe incomplete verranno saltate con messaggio di errore.

### 3️⃣ Gestione Duplicati
- Se un `codice` esiste già nel database, la riga viene **saltata**
- Non c'è sovrascrittura automatica
- Per aggiornare un materiale esistente, modificalo manualmente o eliminalo prima

### 4️⃣ URL Foto
- Deve essere un URL pubblico accessibile
- Formati supportati: JPG, PNG, GIF, WebP
- Esempio: `https://images.unsplash.com/photo-xxx.jpg?w=400`

---

## 🚀 Come Importare

### Passo 1: Prepara il File
1. Crea file CSV/Excel con la struttura corretta
2. Verifica che tutti i campi siano compilati
3. Salva come `.csv` (UTF-8) o `.xlsx`

### Passo 2: Carica nel Sistema
1. Vai su **Gestione Materie Prime**
2. Clicca **📤 Importa CSV/Excel**
3. Seleziona il file
4. Verifica l'**Anteprima** (prime 5 righe)
5. Clicca **Importa Tutto**

### Passo 3: Verifica Risultato
Il sistema mostrerà:
- ✅ **Importati**: Nuovi materiali aggiunti
- ⚠️ **Saltati**: Codici già esistenti
- ❌ **Errori**: Righe con campi mancanti

---

## 🎯 Casi d'Uso

### Scenario 1: Primo Import
```csv
codice,part_number,codice_colore,colore,foto_url
MAT-001,PN-001,RAL9005,Nero,https://foto1.jpg
MAT-002,PN-002,RAL9016,Bianco,https://foto2.jpg
```
**Risultato**: 2 materiali importati ✅

### Scenario 2: Import Incrementale
Database contiene: `MAT-001`, `MAT-002`

File import:
```csv
codice,part_number,codice_colore,colore,foto_url
MAT-001,PN-001,RAL9005,Nero,https://foto1.jpg
MAT-003,PN-003,RAL3020,Rosso,https://foto3.jpg
```
**Risultato**: 
- 1 importato (MAT-003) ✅
- 1 saltato (MAT-001) ⚠️

### Scenario 3: Codice Colore "0"
```csv
codice,part_number,codice_colore,colore,foto_url
MAT-010,PN-010,0,Trasparente,https://foto.jpg
```
**Risultato**: Importato correttamente ✅

---

## ❌ Errori Comuni

### Errore 1: Colonna Mancante
```
❌ Il file deve contenere tutte le colonne: codice, part_number, codice_colore, colore, foto_url
```
**Soluzione**: Verifica che l'intestazione sia esattamente `codice,part_number,codice_colore,colore,foto_url`

### Errore 2: Campo Vuoto
```
❌ Riga 3: colore mancante
```
**Soluzione**: Compila tutti i campi per ogni riga

### Errore 3: Formato File
```
❌ Seleziona un file CSV o Excel
```
**Soluzione**: Usa file con estensione `.csv`, `.xlsx` o `.xls`

---

## 🔧 Risoluzione Problemi

| Problema | Causa | Soluzione |
|----------|-------|-----------|
| "Codice già esistente" | Codice duplicato nel DB | Modifica il codice o elimina il vecchio materiale |
| "Colore mancante" | Campo colore vuoto | Compila il campo colore per ogni riga |
| "URL foto non valido" | Foto non accessibile | Verifica che l'URL sia pubblico e funzionante |
| "0 non accettato" | (Non dovrebbe più accadere) | Il sistema ora accetta "0" come valore valido |

---

## 📚 Risorse

- [README.md](README.md) - Documentazione completa
- [GUIDA_RAPIDA.md](GUIDA_RAPIDA.md) - Guida rapida all'uso
- [esempio_import_materie_prime.csv](esempio_import_materie_prime.csv) - File di esempio

---

**Data Aggiornamento**: 2026-01-28  
**Versione**: 2.0 (Campo colore obbligatorio)
