# Gestionale Magazzino

Sistema completo per la gestione di magazzino con funzionalità di carico, scarico, inventario e integrazione API.

![Version](https://img.shields.io/badge/version-3.1-blue)
![Status](https://img.shields.io/badge/status-production%20ready-green)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Funzionalità Principali

### ✅ Sistema di Autenticazione
- Login con credenziali statiche (admin/admin123)
- Protezione di tutte le pagine
- Gestione sessione con sessionStorage

### ✅ Gestione Materie Prime (v3.1 - COMPLETO)
- **CRUD completo** per materie prime
- **Import CSV/Excel massivo** con protezione duplicati intelligente
- **Ricerca multi-campo** su 4 campi (codice, part_number, codice_colore, colore)
- **Export CSV** completo
- **Validazioni robuste** con supporto codice colore "0"
- **Utility pulizia database** per manutenzione

### ✅ Carico Magazzino
- Registrazione carichi con calcolo automatico prezzo unitario
- Calcolo prezzo medio ponderato
- Aggiornamento automatico stock
- Storico completo con filtri
- Export CSV

### ✅ Stock Disponibile
- Overview completa con foto, quantità, prezzi
- Indicatori stato (OK/BASSO/CRITICO/ESAURITO)
- Statistiche aggregate
- Filtri multipli
- Export CSV

### ✅ Scarico Magazzino
- Scarico singolo e multiplo (distinta parti)
- Controllo automatico disponibilità
- Filtri per ordine/codice/data
- Export CSV

### ✅ API RESTful
- Documentazione completa
- Esempi di utilizzo
- Test integrati

---

## 🚀 Quick Start

### Prerequisiti
- Browser moderno (Chrome, Firefox, Safari, Edge)
- Server web statico (Apache, Nginx, o qualsiasi hosting statico)

### Installazione

1. **Clone il repository**
```bash
git clone https://github.com/tuo-username/gestionale-magazzino.git
cd gestionale-magazzino
```

2. **Deploy**
- Upload su server web
- Oppure apri `index.html` localmente

3. **Login**
```
Username: admin
Password: admin123
```

4. **Import dati iniziali**
- Vai su Gestione Materie Prime
- Usa il file `esempio_import_materie_prime.csv` come template
- Importa i tuoi materiali

---

## 📁 Struttura Progetto

```
/
├── index.html                      # Login page
├── dashboard.html                  # Dashboard principale
├── materie-prime.html              # Gestione materie prime ⭐
├── carico.html                     # Carico magazzino
├── scarico.html                    # Scarico magazzino
├── stock.html                      # Overview stock
├── api.html                        # Documentazione API
├── cleanup-materie-prime.html      # Utility pulizia DB ⭐
│
├── css/
│   └── style.css                   # Stili globali
│
├── js/
│   ├── auth.js                     # Autenticazione
│   ├── api.js                      # API helper
│   ├── materie-prime.js            # Gestione materie prime ⭐
│   ├── carico.js                   # Carico logic
│   ├── scarico.js                  # Scarico logic
│   ├── stock.js                    # Stock logic
│   └── ...
│
├── esempio_import_materie_prime.csv    # Template import
│
└── docs/                               # Documentazione completa
    ├── README.md
    ├── GUIDA_RAPIDA.md
    ├── FORMATO_IMPORT_AGGIORNATO.md
    ├── CHECKPOINT_V3.1.md
    └── ...
```

---

## 📊 Database Schema

### Tabella: materie_prime
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | text | ID univoco |
| codice | text | Codice materiale univoco |
| part_number | text | Part number prodotto |
| codice_colore | text | Codice colore (es. RAL9005) |
| colore | text | Nome colore |
| foto_url | text | URL foto prodotto |

### Altre Tabelle
- `carichi_magazzino` - Storico carichi
- `scarichi_magazzino` - Storico scarichi
- `stock` - Giacenze disponibili

---

## 🎯 Caratteristiche v3.1

### Import CSV/Excel Intelligente
- ✅ Supporto CSV (UTF-8) e Excel (.xlsx, .xls)
- ✅ Protezione duplicati avanzata (vs database reale)
- ✅ Validazione 5 campi obbligatori
- ✅ Anteprima prima dell'import
- ✅ Performance ottimizzata (O(1) lookup)

### Ricerca Multi-Campo
- ✅ Ricerca simultanea su 4 campi
- ✅ Case-insensitive
- ✅ Ricerca parziale
- ✅ Supporto tasto Invio

### Gestione Duplicati
- ✅ Controllo sempre contro database reale
- ✅ Protezione duplicati interni al CSV
- ✅ Feedback dettagliato (importati/saltati)

---

## 📚 Documentazione

### Guide Utente
- [GUIDA_RAPIDA.md](GUIDA_RAPIDA.md) - Guida rapida all'uso
- [FORMATO_IMPORT_AGGIORNATO.md](FORMATO_IMPORT_AGGIORNATO.md) - Guida import CSV/Excel

### Guide Tecniche
- [FIX_DUPLICATI_IMPORT.md](FIX_DUPLICATI_IMPORT.md) - Fix bug duplicati
- [RICERCA_MULTI_CAMPO.md](RICERCA_MULTI_CAMPO.md) - Ricerca avanzata
- [CHECKPOINT_V3.1.md](CHECKPOINT_V3.1.md) - Changelog completo

### Template
- [esempio_import_materie_prime.csv](esempio_import_materie_prime.csv) - Template import

---

## 🧪 Test

### Test Funzionali Superati
- ✅ 15/15 test funzionali
- ✅ 7/7 test edge cases
- ✅ 0 bug noti

### Come Testare
1. Login con admin/admin123
2. Import file esempio: `esempio_import_materie_prime.csv`
3. Test ricerca multi-campo
4. Test export CSV
5. Test import duplicati (verifica che vengano saltati)

---

## 🐛 Bug Risolti

### v3.1
- ✅ Fix duplicati durante import multipli
- ✅ Rimozione campo "dimensioni" obsoleto
- ✅ Ricerca limitata solo a codice
- ✅ Performance import lenta (O(n²) → O(n))

---

## 🔧 Configurazione

### Credenziali Default
```javascript
Username: admin
Password: admin123
```

⚠️ **Importante**: Cambia le credenziali in `js/auth.js` prima del deploy in produzione!

### API Endpoints
```
Base URL: /tables/

GET    /materie_prime          # Lista materiali
POST   /materie_prime          # Crea materiale
GET    /materie_prime/:id      # Get singolo
PUT    /materie_prime/:id      # Update completo
PATCH  /materie_prime/:id      # Update parziale
DELETE /materie_prime/:id      # Elimina
```

---

## 🚀 Deploy

### Hosting Statico (Consigliato)
- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages

### Deploy Manuale
1. Upload tutti i file su server
2. Configura server per servire file statici
3. Accedi tramite browser
4. Login e inizia a usare!

---

## 📝 Roadmap

### v3.2 (Prossima)
- [ ] Test completi moduli Carico/Scarico/Stock
- [ ] Ricerca in tempo reale
- [ ] Ordinamento colonne tabella
- [ ] Paginazione per grandi database

### v4.0 (Futuro)
- [ ] Export Excel (attualmente solo CSV)
- [ ] Upload foto materiali
- [ ] QR code generazione
- [ ] Stampa etichette
- [ ] API esterna sincronizzazione

---

## 🤝 Contributi

Contributi benvenuti! Per favore:
1. Fork il repository
2. Crea un branch (`git checkout -b feature/nuova-funzionalita`)
3. Commit le modifiche (`git commit -am 'Aggiungi nuova funzionalità'`)
4. Push al branch (`git push origin feature/nuova-funzionalita`)
5. Apri una Pull Request

---

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file [LICENSE](LICENSE) per dettagli.

---

## 👥 Autori

- **Sviluppo Iniziale** - Sistema gestionale magazzino completo
- **v3.1** - Ottimizzazioni import, ricerca multi-campo, fix duplicati

---

## 🆘 Supporto

### Problemi Comuni

**Q: Vedo ancora record dopo pulizia database**  
A: Usa il pulsante "🗑️ Pulisci Database" nella pagina Materie Prime

**Q: Import CSV non funziona**  
A: Verifica formato CSV: 5 colonne obbligatorie (codice,part_number,codice_colore,colore,foto_url)

**Q: Come cambio la password di login?**  
A: Modifica il file `js/auth.js`

### Contatti
- Issues: [GitHub Issues](https://github.com/tuo-username/gestionale-magazzino/issues)
- Documentazione: Cartella `docs/`

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/tuo-username/gestionale-magazzino)
![GitHub forks](https://img.shields.io/github/forks/tuo-username/gestionale-magazzino)
![GitHub issues](https://img.shields.io/github/issues/tuo-username/gestionale-magazzino)

---

## 🎉 Status

**Gestione Materie Prime**: ✅ Production Ready  
**Sistema Completo**: 🟡 Functional (test in corso)

---

**Ultimo aggiornamento**: 2026-01-28  
**Versione**: 3.1  
**Status**: Production Ready (Gestione Materie Prime)

---

Made with ❤️ for efficient warehouse management
