# Integrazione Gestionale Magazzino LEGO con Shopify tramite Git

## 🎯 Obiettivo
Mantenere il codice sorgente del gestionale su GitHub e integrarlo in Shopify, usando Git come backup e source of truth.

## 🏗️ Architettura

```
┌─────────────────────────────────────────────────────────┐
│ GitHub Repository                                        │
│ https://github.com/Sesterzi/egolego_gestionale_magazzino│
│ ┌──────────────┐  ┌────────────┐  ┌──────────────┐    │
│ │ HTML Files   │  │ CSS Files  │  │ JS Files     │    │
│ │ (8 pages)    │  │ (1 file)   │  │ (8 files)    │    │
│ └──────────────┘  └────────────┘  └──────────────┘    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │ Opzione A: GitHub Actions         │
        │ (Deploy automatico su Shopify)    │
        └───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ Shopify Assets                                          │
│ ┌──────────────────────────────────────────────────┐  │
│ │ assets/gestionale-style.css                      │  │
│ │ assets/gestionale-main.js                        │  │
│ │ assets/gestionale-api.js                         │  │
│ │ ... (tutti i JS necessari)                       │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
│ ┌──────────────────────────────────────────────────┐  │
│ │ templates/page.gestionale.liquid                 │  │
│ └──────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │ Pagina Shopify                    │
        │ https://laterego.com/pages/       │
        │ gestionale-magazzino              │
        └───────────────────────────────────┘
```

---

## 🚀 Opzione 1: Deploy Manuale (Più Semplice)

### Vantaggi
✅ Nessun codice aggiuntivo  
✅ Controllo totale  
✅ Zero configurazione automatica  
✅ Ideale per aggiornamenti occasionali  

### Procedura

#### Step 1: Preparazione Repository GitHub
```bash
# 1. Clona il repository
git clone https://github.com/Sesterzi/egolego_gestionale_magazzino.git
cd egolego_gestionale_magazzino

# 2. Aggiungi tutti i file del gestionale
# (scaricali da Genspark e copiali nella cartella)

# 3. Commit e push
git add .
git commit -m "✨ Initial commit - Gestionale LEGO Materie Prime v4.0"
git push origin main
```

#### Step 2: Crea File Bundle per Shopify

Crea un file che unisce tutti i JS necessari:

```bash
# Crea cartella per bundle
mkdir -p shopify-bundle

# Concatena tutti i JS in un unico file
cat js/auth.js \
    js/api.js \
    js/materie-prime-lego.js \
    > shopify-bundle/gestionale-all.js

# Copia il CSS
cp css/style.css shopify-bundle/gestionale-style.css
```

#### Step 3: Upload su Shopify Assets

1. **Accedi a Shopify Admin**  
   `Admin → Negozio online → Temi`

2. **Modifica Codice**  
   `Azioni → Modifica codice`

3. **Upload Assets**
   - Cartella **Assets** → `Aggiungi una nuova risorsa`
   - Upload `gestionale-style.css`
   - Upload `gestionale-all.js`

4. **Crea Template Liquid**
   - Cartella **Templates** → `Aggiungi un nuovo template`
   - Tipo: `page`
   - Nome: `gestionale`
   - Contenuto (vedi sotto)

#### Step 4: Template Liquid (`templates/page.gestionale.liquid`)

```liquid
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestionale Magazzino LEGO | {{ shop.name }}</title>
    
    <!-- CSS del gestionale -->
    {{ 'gestionale-style.css' | asset_url | stylesheet_tag }}
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div id="app">
        <!-- Navbar -->
        <nav class="navbar">
            <div class="nav-container">
                <div class="nav-brand">
                    <i class="fas fa-warehouse"></i>
                    Gestionale Magazzino LEGO
                </div>
                <ul class="nav-menu" id="navMenu">
                    <li><a href="#dashboard">📊 Dashboard</a></li>
                    <li><a href="#materie-prime" class="active">📦 Materie Prime</a></li>
                    <li><a href="#carico">📥 Carico</a></li>
                    <li><a href="#scarico">📤 Scarico</a></li>
                    <li><a href="#stock">📊 Stock</a></li>
                </ul>
                <button class="logout-btn" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Esci
                </button>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="main-content" id="mainContent">
            <!-- Il contenuto verrà caricato dinamicamente dal JS -->
        </main>
    </div>

    <!-- JavaScript del gestionale -->
    {{ 'gestionale-all.js' | asset_url | script_tag }}
    
    <script>
        // Inizializzazione
        document.addEventListener('DOMContentLoaded', function() {
            // Verifica autenticazione
            if (!Auth.isAuthenticated()) {
                window.location.href = '/pages/gestionale-login';
                return;
            }
            
            // Carica la pagina materie prime di default
            loadMateriePrimePage();
        });
    </script>
</body>
</html>
```

#### Step 5: Crea Pagina Shopify

1. **Crea nuova pagina**  
   `Admin → Pagine → Aggiungi pagina`

2. **Configura**
   - Titolo: `Gestionale Magazzino`
   - URL: `/gestionale-magazzino`
   - Template: `page.gestionale`
   - Visibilità: **Solo per staff** (importante!)

3. **Salva**

#### Step 6: Proteggi la Pagina

**Opzione A: Password Shopify** (più semplice)
1. `Negozio online → Preferenze`
2. Abilita "Password"
3. Imposta password personalizzata

**Opzione B: App Shopify** (più flessibile)
- **Locksmith** (€9/mese) - permette protezione selettiva
- **PA+ Plus** (€14/mese) - protezione avanzata

---

## 🤖 Opzione 2: Deploy Automatico con GitHub Actions

### Vantaggi
✅ Deploy automatico ad ogni push  
✅ Gestione versioni  
✅ Rollback facile  
✅ Workflow professionale  

### Prerequisiti
- Shopify Store con API access
- GitHub repository con Actions abilitate
- Token API Shopify

### Setup

#### Step 1: Crea API Token Shopify

1. `Admin → Impostazioni → App e canali di vendita`
2. `Sviluppa app → Crea un'app`
3. Nome: `GitHub Deploy Bot`
4. `Configura API Admin`
5. Abilita permessi:
   - `read_themes`
   - `write_themes`
6. `Installa app`
7. **Copia l'API Token** (lo userai una volta sola!)

#### Step 2: Aggiungi Secrets su GitHub

1. Vai su `https://github.com/Sesterzi/egolego_gestionale_magazzino/settings/secrets/actions`
2. `New repository secret`
3. Aggiungi:
   - **Nome**: `SHOPIFY_API_TOKEN`
   - **Valore**: il token copiato prima
4. Aggiungi anche:
   - **Nome**: `SHOPIFY_SHOP_URL`
   - **Valore**: `laterego.myshopify.com`

#### Step 3: Crea Workflow GitHub Actions

Crea file `.github/workflows/deploy-shopify.yml`:

```yaml
name: Deploy to Shopify

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Shopify CLI
        run: npm install -g @shopify/cli @shopify/theme
      
      - name: Bundle JavaScript
        run: |
          mkdir -p dist
          cat js/auth.js js/api.js js/materie-prime-lego.js > dist/gestionale-all.js
          cp css/style.css dist/gestionale-style.css
      
      - name: Deploy to Shopify
        env:
          SHOPIFY_CLI_THEME_TOKEN: ${{ secrets.SHOPIFY_API_TOKEN }}
          SHOPIFY_SHOP: ${{ secrets.SHOPIFY_SHOP_URL }}
        run: |
          shopify theme push \
            --path dist \
            --theme YOUR_THEME_ID \
            --only "assets/gestionale-*"
```

#### Step 4: Push e Verifica

```bash
git add .github/workflows/deploy-shopify.yml
git commit -m "🚀 Add automatic Shopify deploy workflow"
git push origin main

# Verifica deploy su:
# https://github.com/Sesterzi/egolego_gestionale_magazzino/actions
```

---

## 📝 Workflow di Sviluppo

### Sviluppo Locale
```bash
# 1. Modifica i file in locale
code js/materie-prime-lego.js

# 2. Test in locale (apri index.html nel browser)
open index.html

# 3. Commit e push
git add .
git commit -m "✨ feat: Aggiungi validazione HEX color"
git push origin main

# 4. Deploy automatico (se hai GitHub Actions)
# oppure upload manuale su Shopify Assets
```

### Gestione Versioni
```bash
# Crea tag per release stabili
git tag -a v4.0.0 -m "Release: Gestionale LEGO v4.0"
git push origin v4.0.0

# Rollback se necessario
git revert HEAD
git push origin main
```

---

## 🔒 Sicurezza

### Checklist
- [ ] Pagina protetta da password o app
- [ ] API Token Shopify salvato solo nei GitHub Secrets
- [ ] File sensibili in `.gitignore`
- [ ] HTTPS abilitato (automatico su Shopify)
- [ ] Accesso limitato agli admin dello store

### `.gitignore` consigliato
```gitignore
# Secrets
.env
secrets.json
config/production.json

# Build
dist/
node_modules/

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
```

---

## 🎨 Personalizzazione Shopify

### Integra con il Tema Shopify

Modifica `page.gestionale.liquid` per includere header/footer del tema:

```liquid
{% layout 'theme' %}

<div class="gestionale-wrapper">
    <!-- Navbar gestionale -->
    <nav class="gestionale-navbar">
        <!-- ... -->
    </nav>
    
    <!-- Content -->
    <main>
        <!-- ... -->
    </main>
</div>

{{ 'gestionale-all.js' | asset_url | script_tag }}
```

### Stile Coerente

Importa variabili CSS del tema:

```css
/* gestionale-style.css */
@import '{{ 'theme.css' | asset_url }}';

:root {
    --primary-color: {{ settings.colors_accent_1 }};
    --text-color: {{ settings.colors_text }};
    /* ... */
}
```

---

## 📊 Confronto Opzioni

| Criterio | Deploy Manuale | GitHub Actions |
|----------|---------------|----------------|
| **Setup iniziale** | ⭐⭐⭐⭐⭐ Facile | ⭐⭐ Richiede config |
| **Aggiornamenti** | ⭐⭐ Manuale | ⭐⭐⭐⭐⭐ Automatico |
| **Backup** | ⭐⭐⭐⭐⭐ Git | ⭐⭐⭐⭐⭐ Git + History |
| **Rollback** | ⭐⭐ Manuale | ⭐⭐⭐⭐ Automatico |
| **Costo** | 💰 Gratis | 💰 Gratis |
| **Manutenzione** | ⭐⭐ Media | ⭐⭐⭐⭐ Bassa |

---

## 🆘 Troubleshooting

### Problema: CSS non si carica
**Soluzione**: Verifica che il file sia in `assets/` e che il nome corrisponda nel template

### Problema: JavaScript errors
**Soluzione**: Controlla la console browser (F12) e verifica che tutti i JS siano caricati

### Problema: API Token invalido
**Soluzione**: Rigenera il token in Shopify Admin → App → GitHub Deploy Bot

### Problema: Deploy Actions fallisce
**Soluzione**: Verifica i secrets su GitHub e i permessi dell'app Shopify

---

## 🎯 Raccomandazione Finale

**Per il tuo caso d'uso (Backup + Integrazione Shopify):**

👉 **OPZIONE 1: Deploy Manuale**

**Perché?**
- ✅ Setup rapido (30 minuti)
- ✅ Zero configurazione automatica
- ✅ Controllo totale
- ✅ GitHub come backup affidabile
- ✅ Aggiornamenti non frequenti (≈1/mese)
- ✅ Perfetto per team piccoli

**Workflow consigliato:**
1. Sviluppa e testa in locale
2. Commit su GitHub (backup)
3. Ogni tanto (es. ogni 2 settimane) fai upload manuale su Shopify Assets
4. Rollback facile: prendi versione precedente da Git e ri-upload

---

## 📚 Prossimi Passi

1. [ ] Scegli l'opzione (Manuale o GitHub Actions)
2. [ ] Prepara repository GitHub
3. [ ] Crea bundle JS/CSS
4. [ ] Upload su Shopify Assets
5. [ ] Crea template Liquid
6. [ ] Crea pagina Shopify
7. [ ] Proteggi con password
8. [ ] Test completo
9. [ ] Deploy in produzione

---

## 🤝 Hai bisogno di aiuto?

Posso guidarti passo-passo per:
- ✅ Creare il bundle JS/CSS ottimizzato
- ✅ Scrivere il template Liquid personalizzato
- ✅ Configurare GitHub Actions (se scegli opzione 2)
- ✅ Risolvere problemi di integrazione

**Dimmi quale opzione preferisci e procediamo! 🚀**
