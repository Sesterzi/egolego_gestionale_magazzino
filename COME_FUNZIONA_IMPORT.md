# 📋 Gestione Import - Come Funziona

## 🎯 Comportamento Attuale

### Quando Importi un File CSV/Excel

Il sistema segue questa logica:

```
Per ogni riga del file:
  1. Controlla se il CODICE esiste già nel database
  2. Se NON esiste → ✅ IMPORTA (crea nuovo)
  3. Se esiste → ⚠️ SALTA (non modifica)
```

## 📊 Esempi Pratici

### Scenario 1: Primo Import (Database Vuoto)

**File da importare:**
```csv
codice,part_number,codice_colore,foto_url
MAT-001,PN-001,RAL9005,https://foto1.jpg
MAT-002,PN-002,RAL9016,https://foto2.jpg
MAT-003,PN-003,RAL3020,https://foto3.jpg
```

**Risultato:**
```
✅ Importati: 3
⚠️ Saltati: 0
```

Tutti e 3 i materiali vengono aggiunti al database.

---

### Scenario 2: Import Incrementale (Database con Dati)

**Database esistente:**
- MAT-001 (già presente)
- MAT-002 (già presente)

**File da importare:**
```csv
codice,part_number,codice_colore,foto_url
MAT-001,PN-001-NEW,RAL9005,https://foto1-new.jpg  ← Esiste già!
MAT-002,PN-002-NEW,RAL9016,https://foto2-new.jpg  ← Esiste già!
MAT-003,PN-003,RAL3020,https://foto3.jpg          ← Nuovo!
MAT-004,PN-004,RAL5015,https://foto4.jpg          ← Nuovo!
```

**Risultato:**
```
✅ Importati: 2 (MAT-003, MAT-004)
⚠️ Saltati: 2 (MAT-001, MAT-002 - già esistenti)
```

**Cosa succede:**
- MAT-001: **SALTATO** - dati vecchi rimangono invariati
- MAT-002: **SALTATO** - dati vecchi rimangono invariati
- MAT-003: **IMPORTATO** - nuovo materiale aggiunto
- MAT-004: **IMPORTATO** - nuovo materiale aggiunto

**⚠️ IMPORTANTE:** I dati di MAT-001 e MAT-002 **NON vengono aggiornati**!

---

### Scenario 3: Stesso File Importato Due Volte

**Primo import:**
```
✅ Importati: 100
⚠️ Saltati: 0
```

**Secondo import (stesso file):**
```
✅ Importati: 0
⚠️ Saltati: 100 (tutti già esistenti)
```

**Risultato:** Database rimane identico dopo il secondo import.

---

## 🔍 Come Identificare i Duplicati

### Il sistema controlla SOLO il campo "codice"

Due materiali sono considerati **DUPLICATI** se hanno lo stesso **codice**, anche se:
- Part number è diverso ✗
- Codice colore è diverso ✗
- Foto URL è diversa ✗
- Altri campi sono diversi ✗

**Esempio:**

**Database:** MAT-001, PN-001, RAL9005, foto1.jpg
**Import:** MAT-001, PN-999, RAL8888, foto999.jpg

**Risultato:** ⚠️ SALTATO (stesso codice "MAT-001")

---

## 💡 Strategie di Utilizzo

### Strategia 1: Import Solo Nuovi (Attuale)

**Quando usarla:**
- Vuoi aggiungere nuovi materiali
- NON vuoi modificare materiali esistenti
- Vuoi proteggere i dati già inseriti

**Come fare:**
1. Prepara file con nuovi codici
2. Importa
3. Ignora gli avvisi sui duplicati
4. ✅ Solo i nuovi vengono aggiunti

**Vantaggio:** Sicuro, non rischi di sovrascrivere dati

---

### Strategia 2: Aggiornare Materiali Esistenti

**Problema:** L'import attuale NON aggiorna i duplicati.

**Soluzione Manuale:**
1. Esporta CSV attuale (pulsante "📥 Esporta CSV")
2. Cerca il materiale da aggiornare nel CSV
3. Vai su Materie Prime → Clicca "✏️" modifica
4. Aggiorna manualmente i dati
5. Salva

**Soluzione per Aggiornamenti Massivi:**
Se devi aggiornare molti materiali:
1. Elimina i materiali vecchi dalla UI
2. Re-importa con dati aggiornati

⚠️ **Attenzione:** Verifica prima che non ci siano carichi/scarichi associati!

---

### Strategia 3: Import Combinato

**Scenario:** Hai un file con 100 materiali, di cui:
- 80 già esistenti (da mantenere)
- 20 nuovi (da importare)

**Come fare:**
1. Importa il file completo
2. Sistema salta 80 duplicati
3. Sistema importa 20 nuovi
4. ✅ Database aggiornato con solo i nuovi

**Vantaggio:** Puoi riusare lo stesso file master senza modifiche

---

## 📈 Report Import

### Dopo ogni import vedi:

```
✅ Importazione completata!

Importati: 25
Saltati (duplicati): 15

Errori/Avvisi:
MAT-001: già esistente (saltato)
MAT-002: già esistente (saltato)
...
```

**Cosa significano i numeri:**
- **Importati:** Nuovi materiali aggiunti al database
- **Saltati:** Materiali con codice già esistente (non modificati)
- **Errori:** Problemi durante l'import (validazione fallita, ecc.)

---

## ❓ FAQ

### Q: Come aggiorno un materiale esistente?

**A:** L'import NON aggiorna materiali esistenti. Opzioni:
1. **Manualmente:** Materie Prime → Modifica (✏️) → Salva
2. **Elimina e re-importa:** (solo se non ci sono carichi/scarichi)

### Q: Posso importare lo stesso file più volte?

**A:** Sì, ma il secondo import salterà tutti i duplicati (nessun effetto).

### Q: Cosa succede se cambio il part_number ma non il codice?

**A:** Il sistema vede solo il codice. Se il codice esiste, la riga viene saltata.

### Q: Come faccio import incrementali?

**A:** Aggiungi solo le nuove righe al file. Il sistema importa solo quelle con codice non presente.

### Q: E se sbaglio un import?

**A:** Nessun problema! I materiali importati possono essere:
- Modificati uno per uno (✏️)
- Eliminati uno per uno (🗑️)
- Esportati in CSV per backup

---

## 🎯 Best Practices

### ✅ DO (Consigliato)

1. **Mantieni un file master**
   - Un unico file Excel/CSV con TUTTI i materiali
   - Aggiungi nuove righe in fondo
   - Importa tutto ogni volta (salta automaticamente i duplicati)

2. **Backup prima di import massivi**
   - Export CSV attuale
   - Salva il file
   - Poi importa i nuovi

3. **Controlla il report**
   - Leggi quanti importati/saltati
   - Verifica se ci sono errori
   - Controlla la lista duplicati

4. **Usa codici univoci**
   - MAT-001, MAT-002, MAT-003...
   - Non riusare codici eliminati
   - Mantieni sequenza progressiva

### ❌ DON'T (Evita)

1. **Non importare per aggiornare**
   - Import non sovrascrive
   - Usa modifica manuale

2. **Non eliminare e re-importare con carichi/scarichi**
   - Verifica prima dipendenze
   - Rischi inconsistenze database

3. **Non cambiare codici esistenti**
   - Mantieni stabili i codici
   - Evita confusione negli storici

---

## 🔧 Modalità Future (Possibili)

### Opzione 1: Import con Aggiornamento
```
☐ Aggiorna materiali esistenti
```
Se selezionato, sovrascrive i dati dei duplicati.

### Opzione 2: Scelta Interattiva
```
Trovato duplicato MAT-001:
[ ] Mantieni esistente
[ ] Sovrascrivi con nuovo
[ ] Salta questo
```

### Opzione 3: Import con Merge
```
Duplicato MAT-001:
- Mantieni: colore, dimensioni
- Aggiorna: part_number, foto_url
```

**Nota:** Queste funzionalità non sono implementate attualmente.

---

## ✅ Riepilogo

### Comportamento Attuale

| Situazione | Azione Sistema | Risultato |
|------------|----------------|-----------|
| Codice NUOVO | ✅ Importa | Materiale aggiunto |
| Codice ESISTENTE | ⚠️ Salta | Materiale NON modificato |
| Errore validazione | ❌ Segnala | Riga non importata |

### In Sintesi

- ✅ **Aggiunge** solo materiali con codice nuovo
- ⚠️ **Salta** materiali con codice già esistente
- ❌ **NON sovrascrive** mai materiali esistenti
- 📊 **Mostra report** dettagliato con conteggi

**Questo comportamento è SICURO:** non rischi mai di perdere dati esistenti!

---

**Documento aggiornato:** 2026-01-28
