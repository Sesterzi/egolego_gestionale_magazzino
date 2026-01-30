# File Excel di Esempio

Non posso creare direttamente file .xlsx, ma puoi creare facilmente il file Excel seguendo questi passi:

## Come Creare il File Excel

1. **Apri Excel o Google Sheets**

2. **Crea la tabella con queste intestazioni nella prima riga:**
   ```
   A1: codice
   B1: part_number
   C1: codice_colore
   D1: foto_url
   ```

3. **Aggiungi dati di esempio nelle righe successive:**
   ```
   A2: MAT-004    B2: PN-12348    C2: RAL3020    D2: https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400
   A3: MAT-005    B3: PN-12349    C3: RAL1021    D3: https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400
   A4: MAT-006    B4: PN-12350    C4: RAL5015    D4: https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400
   ```

4. **Salva come:**
   - Excel: File → Salva con nome → Formato: Excel Workbook (.xlsx)
   - Google Sheets: File → Scarica → Microsoft Excel (.xlsx)

## Struttura Esatta

```
| codice  | part_number | codice_colore | foto_url                                                              |
|---------|-------------|---------------|-----------------------------------------------------------------------|
| MAT-004 | PN-12348    | RAL3020       | https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400  |
| MAT-005 | PN-12349    | RAL1021       | https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400  |
| MAT-006 | PN-12350    | RAL5015       | https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400  |
```

## Note Importanti

- ✅ La prima riga DEVE contenere le intestazioni esatte (minuscole)
- ✅ Il sistema legge solo il primo foglio del file Excel
- ✅ Tutti i 4 campi sono obbligatori per ogni riga
- ✅ Funziona con .xlsx e .xls
- ✅ Se hai già un Excel con intestazioni diverse, rinominale come sopra

## Alternativa Rapida

Usa il file CSV già incluso: `esempio_import_materie_prime.csv`

Oppure copia questi dati in Excel e salva come .xlsx
