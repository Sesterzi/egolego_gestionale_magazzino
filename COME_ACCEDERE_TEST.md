# 🧪 ISTRUZIONI ACCESSO TEST - Genspark

## 📱 Nella Interfaccia Genspark

### Opzione A: Pannello File/Preview
1. **Cerca** nel pannello laterale sinistro/destro un'area chiamata:
   - "Files" / "File Explorer" / "Project Files"
   - "Preview" / "Anteprima"
   - Lista di file HTML

2. **Trova** nella lista:
   ```
   test-gestionale-lego.html  (18 KB)
   ```

3. **Clicca** sul file per:
   - Aprirlo in anteprima/preview
   - Oppure clicca icona "▶️ Run" / "👁️ Preview" / "🔗 Open"

### Opzione B: Menu Deploy/Publish
1. Cerca menu/tab chiamato:
   - "Deploy" / "Publish" / "Preview"
   - Potrebbe avere icona: 🚀 📤 👁️

2. Dovrebbe mostrare lista pagine disponibili

3. Cerca `test-gestionale-lego.html`

### Opzione C: URL Preview Genspark
Se Genspark genera URL preview tipo:
```
https://preview.genspark.ai/[ID-PROGETTO]/index.html
```

Modifica in:
```
https://preview.genspark.ai/[ID-PROGETTO]/test-gestionale-lego.html
```

---

## 🔍 NON TROVI IL FILE?

**Dimmi cosa vedi:**
1. Screenshot del pannello Genspark
2. Quali tab/menu sono disponibili?
3. C'è un pulsante "Preview" o "Deploy"?

**Ti guido in base alla tua interfaccia!**

---

## ⚡ ALTERNATIVA: Test Manuali

Se non riesci ad accedere a test-gestionale-lego.html, possiamo fare i test manuali:

### Test Rapido (3 minuti)

1️⃣ **Accedi al gestionale normale**
```
[tuo-url]/index.html
Username: admin
Password: admin123
```

2️⃣ **Vai su Gestione Materie Prime**

3️⃣ **Importa CSV**
```
Clicca: "📥 Importa CSV/Excel"
Carica: esempio_import_materie_prime.csv
```

4️⃣ **Verifica Preview**
```
✅ Vedi 3 righe?
✅ Vedi 7 colonne?
   - color_name
   - color_ref
   - color_id
   - lego_size
   - size_code
   - picture_url
   - unique_id
```

5️⃣ **Importa**
```
Clicca: "Importa"
Messaggio atteso: "✅ 3 righe importate"
```

6️⃣ **Verifica Tabella**
```
✅ 3 nuovi record visibili?
✅ Colonna "Color" con quadrato colorato? 🟤 🟢 🔵
✅ Foto caricate?
```

7️⃣ **Test Ricerca**
```
Campo ricerca: "Light Nougat"
✅ Trova 1 risultato?

Campo ricerca: "300578"
✅ Trova 1 risultato?

Campo ricerca: "Brick"
✅ Trova 1 risultato?
```

8️⃣ **Console Browser**
```
Premi F12 (o Cmd+Option+I su Mac)
Tab "Console"
✅ 0 errori rossi?
```

---

## 📸 Scatta Screenshot

Se fai i test manuali, fai screenshot di:
1. ✅ Preview import (3 righe × 7 colonne)
2. ✅ Messaggio successo import
3. ✅ Tabella con 3 record e colori HEX
4. ✅ Console browser (F12)

E dimmi: **"Test manuali OK, tutti verdi!"** oppure **"Errore in [step X]"**

---

**Dimmi cosa vedi nell'interfaccia Genspark e ti guido!** 🚀
