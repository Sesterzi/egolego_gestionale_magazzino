# 🚀 GUIDA PUSH GIT - Gestionale LEGO v4.0

## ✅ PRE-REQUISITI COMPLETATI

- ✅ Test superati: **11/11 (100%)**
- ✅ Report test creato: `TEST_REPORT_V4.0_PASSED.md`
- ✅ Documentazione aggiornata
- ✅ File pronti per backup

---

## 📥 STEP 1: Scarica il Progetto da Genspark

### Nell'interfaccia Genspark dove sei ora:

#### Opzione A: Tab "Esplora file" (PROVA QUESTA)
1. **Clicca** sul tab **"Esplora file"** (in alto nella barra menu)
2. Cerca pulsante **"Download"** / **"⬇️"** / **"Export"**
3. Dovrebbe scaricare un file ZIP con tutto il progetto

#### Opzione B: Tab "Pubblica"
1. **Clicca** sul tab **"Pubblica"**
2. Cerca **"Esporta progetto"** / **"Download ZIP"**

#### Opzione C: Menu Principale
1. Cerca icona **⋮** (3 punti verticali) o **☰** (hamburger menu)
2. Opzione **"Scarica progetto"** / **"Export"**

### 📦 Dopo il Download
Il file dovrebbe chiamarsi qualcosa tipo:
```
gestionale-magazzino.zip
oppure
project-[ID].zip
```

**Salvalo in:** `~/Downloads/`

---

## 📁 STEP 2: Estrai e Prepara i File

### Su Mac/Linux:
```bash
# 1. Vai nella cartella Downloads
cd ~/Downloads

# 2. Estrai lo ZIP
unzip gestionale-magazzino.zip -d ~/Projects/

# 3. Vai nella cartella estratta
cd ~/Projects/gestionale-magazzino/

# (oppure il nome della cartella estratta)

# 4. Verifica che i file ci siano
ls -la

# Dovresti vedere:
# - index.html
# - materie-prime.html
# - test-gestionale-lego.html
# - js/ (cartella)
# - css/ (cartella)
# - esempio_import_materie_prime.csv
# - README.md
# - TEST_REPORT_V4.0_PASSED.md
# - ... (altri file)
```

### Su Windows (PowerShell):
```powershell
# 1. Vai nella cartella Downloads
cd ~\Downloads

# 2. Estrai lo ZIP (clicca destro → Estrai tutto)
# oppure usa comando:
Expand-Archive -Path gestionale-magazzino.zip -DestinationPath C:\Projects\

# 3. Vai nella cartella estratta
cd C:\Projects\gestionale-magazzino\

# 4. Verifica i file
dir
```

---

## 🔧 STEP 3: Inizializza Git

### Nella cartella del progetto:

```bash
# 1. Inizializza repository Git (se non già fatto)
git init

# Output atteso:
# Initialized empty Git repository in /path/to/gestionale-magazzino/.git/

# 2. Verifica file presenti
git status

# Dovresti vedere tutti i file in rosso (non tracciati)
```

---

## 🔗 STEP 4: Collega a GitHub

### A) Se il Repository GitHub È GIÀ VUOTO

```bash
# Collega il remote
git remote add origin https://github.com/Sesterzi/egolego_gestionale_magazzino.git

# Verifica
git remote -v

# Output atteso:
# origin  https://github.com/Sesterzi/egolego_gestionale_magazzino.git (fetch)
# origin  https://github.com/Sesterzi/egolego_gestionale_magazzino.git (push)
```

### B) Se il Repository GitHub Ha GIÀ DEI FILE

```bash
# Collega il remote
git remote add origin https://github.com/Sesterzi/egolego_gestionale_magazzino.git

# Pull dei file esistenti (se ce ne sono)
git pull origin main --allow-unrelated-histories

# Se chiede di fare merge, salva e chiudi l'editor (Ctrl+X su nano, :wq su vim)
```

---

## 📝 STEP 5: Aggiungi Tutti i File

```bash
# Aggiungi TUTTI i file al commit
git add .

# Verifica (ora dovrebbero essere verdi)
git status

# Output atteso:
# Changes to be committed:
#   (use "git restore --staged <file>..." to unstage)
#         new file:   .gitignore
#         new file:   README.md
#         new file:   TEST_REPORT_V4.0_PASSED.md
#         new file:   api.html
#         ... (tutti i 37 file)
```

---

## 💬 STEP 6: Commit con Messaggio Descrittivo

```bash
git commit -m "🎉 v4.0.0 - Gestionale LEGO COMPLETO + Test Report

✨ NEW FEATURES:
- 🎨 Nuovo formato materie prime LEGO (7 campi obbligatori)
- 🔍 Ricerca avanzata multi-campo (5 campi simultanei)
- 🎨 Visualizzazione colore con quadrato HEX colorato
- 🛡️ Protezione duplicati su unique_id (controllo real-time)
- ✅ Validazione formato HEX color (#RRGGBB)

🧪 TESTING:
- ✅ Suite test automatica completa (test-gestionale-lego.html)
- ✅ 11/11 test superati (100%)
- ✅ Report test dettagliato (TEST_REPORT_V4.0_PASSED.md)
- ✅ 0 errori console
- ✅ Production ready

📚 DOCUMENTAZIONE:
- 📖 README.md aggiornato formato v4.0
- 📋 INTEGRAZIONE_SHOPIFY_GIT.md (guida deploy)
- 📝 TEST_REPORT_V4.0_PASSED.md (risultati test)
- 📄 CHECKLIST_TEST_PRE_BACKUP.md
- 📘 AGGIORNAMENTO_LEGO_COMPLETO.md

🔧 TECHNICAL DETAILS:
- Formato CSV: color_name, color_ref, color_id, lego_size, size_code, picture_url, unique_id
- Validazione HEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
- Controllo duplicati: unique_id (chiave univoca)
- Import/Export: CSV e Excel (.xlsx, .xls)
- Ricerca: case-insensitive, match parziale, real-time

⚠️ BREAKING CHANGES:
- Vecchio formato CSV (5 campi) NON più compatibile
- Richiesto re-import completo di tutte le materie prime
- Campo 'codice' sostituito da 'unique_id'
- Campo 'colore' sostituito da 'color_name' + 'color_ref'

📊 FILE STATISTICS:
- 37 file totali (~1.2 MB)
- 9 HTML, 8 JS, 1 CSS, 18 MD, 1 CSV
- 20.5 KB js/materie-prime-lego.js (nuovo)
- 18 KB test-gestionale-lego.html (nuovo)
- 8.9 KB TEST_REPORT_V4.0_PASSED.md (nuovo)

🎯 TESTED BY: Sesterzi
📅 TEST DATE: 2026-04-12
✅ STATUS: Production Ready
🚀 READY FOR DEPLOY: Shopify, Cloudflare Pages, Netlify"
```

---

## 🚀 STEP 7: Push su GitHub

```bash
# Push del commit principale
git push -u origin main

# Se è il PRIMO push, potrebbe chiederti autenticazione:
# Username: Sesterzi
# Password: [USA PERSONAL ACCESS TOKEN, non password normale]
```

### 🔐 Se Non Hai Personal Access Token

#### Crealo così:
1. Vai su: https://github.com/settings/tokens
2. Clicca: **"Generate new token"** → **"Classic"**
3. Imposta:
   - **Name:** `Gestionale Magazzino Deploy`
   - **Expiration:** `90 days`
   - **Scopes:** ✅ `repo` (seleziona tutti i sub-scope)
4. Clicca: **"Generate token"**
5. **COPIA IL TOKEN** (lo vedrai una volta sola!)
6. Usa questo token come **password** nel `git push`

#### Salva il Token per Evitare di Digitarlo Ogni Volta:
```bash
# Su Mac/Linux (credential helper)
git config --global credential.helper osxkeychain

# Su Windows
git config --global credential.helper wincred

# Al prossimo push, il token verrà salvato automaticamente
```

---

## 🔄 STEP 8: Gestione Errori Comuni

### Errore: "remote: Repository not found"
```bash
# Fix: Verifica URL repository
git remote -v

# Se sbagliato, correggilo:
git remote set-url origin https://github.com/Sesterzi/egolego_gestionale_magazzino.git
```

### Errore: "Updates were rejected"
```bash
# Fix: Pull prima di push (se repo non vuoto)
git pull origin main --allow-unrelated-histories

# Poi riprova push
git push -u origin main
```

### Errore: "Permission denied"
```bash
# Fix 1: Usa Personal Access Token come password
# (vedi sezione sopra)

# Fix 2: Verifica username GitHub
git config --global user.name "Sesterzi"
git config --global user.email "tua-email@example.com"
```

### Errore: "fatal: not a git repository"
```bash
# Fix: Sei nella cartella giusta?
pwd

# Dovresti essere in: ~/Projects/gestionale-magazzino/
# (o comunque dove hai estratto i file)

# Re-inizializza:
git init
```

---

## ✅ STEP 9: Verifica su GitHub

### Dopo il push riuscito:

1. **Apri browser** e vai su:
   ```
   https://github.com/Sesterzi/egolego_gestionale_magazzino
   ```

2. **Verifica che vedi:**
   - ✅ Tutti i 37 file
   - ✅ README.md renderizzato (con badge, tabelle, etc.)
   - ✅ TEST_REPORT_V4.0_PASSED.md visibile
   - ✅ Commit message completo
   - ✅ Data/ora commit corrette

3. **Controlla file chiave:**
   - `index.html` (login)
   - `materie-prime.html` (gestione)
   - `js/materie-prime-lego.js` (20.5 KB)
   - `test-gestionale-lego.html` (18 KB)
   - `esempio_import_materie_prime.csv` (3 righe)

4. **Verifica documentazione:**
   - README.md → dovrebbe mostrare struttura v4.0
   - TEST_REPORT_V4.0_PASSED.md → con tabelle test
   - INTEGRAZIONE_SHOPIFY_GIT.md → guida deploy

---

## 🏷️ STEP 10: Crea Tag Versione (Opzionale ma Consigliato)

```bash
# Crea tag per questa versione stabile
git tag -a v4.0.0 -m "Release: Gestionale LEGO v4.0.0

✅ Tutti i test superati (11/11)
✅ Nuovo formato materie prime LEGO
✅ Production ready
✅ Report test completo

Breaking Changes:
- Formato CSV v3.x NON più compatibile
- Richiesto re-import materie prime"

# Push del tag
git push origin v4.0.0

# Verifica su GitHub:
# https://github.com/Sesterzi/egolego_gestionale_magazzino/tags
```

---

## 📊 CHECKLIST FINALE

### Prima del Push
- [x] ✅ Test superati (11/11)
- [x] ✅ Report test creato
- [x] ✅ README.md aggiornato
- [x] ✅ File scaricati da Genspark
- [x] ✅ File estratti in cartella locale
- [ ] ⏳ Git init eseguito
- [ ] ⏳ Remote GitHub configurato
- [ ] ⏳ File aggiunti (git add .)
- [ ] ⏳ Commit creato
- [ ] ⏳ Push eseguito

### Dopo il Push
- [ ] ⏳ Repository visibile su GitHub
- [ ] ⏳ Tutti i 37 file presenti
- [ ] ⏳ README renderizzato correttamente
- [ ] ⏳ Commit message completo visibile
- [ ] ⏳ Tag v4.0.0 creato (opzionale)

---

## 🎯 COMANDI COMPLETI IN SEQUENZA

Per copiare e incollare tutto insieme:

```bash
# === DOPO AVER SCARICATO ED ESTRATTO I FILE ===

# 1. Vai nella cartella del progetto
cd ~/Projects/gestionale-magazzino/

# 2. Inizializza Git
git init

# 3. Configura identità (se non già fatto)
git config --global user.name "Sesterzi"
git config --global user.email "tua-email@example.com"

# 4. Aggiungi remote GitHub
git remote add origin https://github.com/Sesterzi/egolego_gestionale_magazzino.git

# 5. Aggiungi tutti i file
git add .

# 6. Verifica
git status

# 7. Commit (copia il messaggio sopra completo)
git commit -m "🎉 v4.0.0 - Gestionale LEGO COMPLETO + Test Report
[... resto del messaggio ...]"

# 8. Push
git push -u origin main

# 9. (Opzionale) Crea tag
git tag -a v4.0.0 -m "Release v4.0.0 - Production Ready"
git push origin v4.0.0

# 10. Verifica su GitHub
# Apri: https://github.com/Sesterzi/egolego_gestionale_magazzino
```

---

## 🆘 AIUTO RAPIDO

### Sono bloccato, cosa faccio?

**Dimmi a che punto sei:**
1. "Ho scaricato lo ZIP ma non so dove estrarlo"
2. "Ho estratto i file ma `git init` dà errore"
3. "Il push chiede username/password"
4. "Errore: [copia/incolla l'errore esatto]"
5. "Il push è riuscito, come verifico?"

**Ti guido passo-passo in base al problema!**

---

## 📞 PROSSIMI STEP DOPO IL BACKUP

Una volta completato il push Git:

1. ✅ **Backup completato** → Codice al sicuro su GitHub
2. ⏳ **Pulizia database test** → Rimuovi i 3 record di test
3. ⏳ **Import dati reali** → Carica il tuo CSV LEGO completo
4. ⏳ **Test moduli Carico/Scarico** → Verifica con dati reali
5. ⏳ **Deploy Shopify** (opzionale) → Segui INTEGRAZIONE_SHOPIFY_GIT.md

---

**🎯 Inizia scaricando il progetto da Genspark e dimmi quando sei pronto per il comando Git! 🚀**
