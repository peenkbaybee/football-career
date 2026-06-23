# ⚽ Percorso Calcistico — Beta Open Source

> Crea il tuo calciatore da zero e scalalo dalle serie minori ai grandi campionati europei.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Version](https://img.shields.io/badge/version-0.1.0--beta-blue)]()

---

## 🎮 Cos'è questo gioco?

**Percorso Calcistico** è un gioco gestionale calcistico open source costruito con React.  
Parti da zero in un club di terza categoria, sviluppa il tuo personaggio tramite un sistema di XP e livelli, e scala le categorie attraverso 5 nazioni e 15 campionati diversi.

### Caratteristiche principali

- 🧑 **Creazione personaggio** — aspetto personalizzabile (pelle, capelli, genere), ruolo, piede
- ⚽ **5 nazioni** — Italia, Spagna, Francia, Germania, Portogallo
- 🏆 **3 categorie per nazione** — 15 campionati totali con difficoltà progressiva
- 📈 **Sistema XP / Livelli** — guadagna esperienza partita per partita, spendi punti abilità dove vuoi
- 🔄 **Mercato realistico** — offerte di riparazione (metà stagione), fine stagione, promozioni e trasferimenti all'estero
- 💾 **Salvataggio automatico** — la carriera viene salvata nel browser tramite `localStorage`

---

## 🚀 Come avviare il progetto in locale

### Requisiti
- [Node.js](https://nodejs.org/) v18 o superiore
- npm (incluso con Node.js)

### Installazione

```bash
# 1. Clona il repository
git clone https://github.com/TUO_USERNAME/percorso-calcistico.git
cd percorso-calcistico

# 2. Installa le dipendenze
npm install

# 3. Avvia il server di sviluppo
npm run dev
```

Il gioco sarà disponibile su `http://localhost:5173`.

### Build per la produzione

```bash
npm run build
# i file pronti saranno nella cartella /dist
```

---

## 🌐 Deploy su GitHub Pages

```bash
# Installa il pacchetto gh-pages
npm install --save-dev gh-pages

# Aggiungi in package.json sotto "scripts":
# "deploy": "gh-pages -d dist"

npm run build
npm run deploy
```

---

## 🤝 Come contribuire

Leggi [CONTRIBUTING.md](CONTRIBUTING.md) per tutte le istruzioni dettagliate.

In breve:
1. Fai il **Fork** di questo repo
2. Crea un branch (`git checkout -b feature/nome-feature`)
3. Fai le tue modifiche e committale (`git commit -m "feat: descrizione"`)
4. Pusha il branch (`git push origin feature/nome-feature`)
5. Apri una **Pull Request** — verrà revisionata dal maintainer

### Idee di contributo

| Area | Idee |
|------|------|
| 🎮 Gameplay | Sistema di allenamento settimanale, infortuni, capitaneria |
| 🌍 Contenuti | Nuove nazioni (Inghilterra, Olanda…), più squadre per categoria |
| 📊 Statistiche | Grafici di forma, confronto stagioni, record personali |
| 🎨 UI/UX | Animazioni, schermata di caricamento, temi colore |
| 🐛 Bug fix | Vedi la sezione [Issues](../../issues) |

---

## 🗂️ Struttura del progetto

```
percorso-calcistico/
├── index.html             # Entry point HTML
├── vite.config.js         # Configurazione Vite
├── package.json
├── src/
│   ├── main.jsx           # Bootstrap React
│   └── App.jsx            # Tutto il gioco (componenti + logica)
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

> **Nota per i contributori:** `App.jsx` contiene sia la logica di gioco che i componenti UI.
> Se vuoi rifattorizzare in file separati (es. `gameEngine.js`, `components/`), è una PR benvenuta!

---

## 📜 Licenza

Distribuito sotto licenza **MIT**. Vedi [LICENSE](LICENSE) per i dettagli.  
In breve: puoi usare, modificare e distribuire liberamente, anche in progetti commerciali, purché citi l'autore originale.

---

## ✨ Crediti

Creato con ❤️ da [@TUO_USERNAME](https://github.com/TUO_USERNAME).  
Contribuzioni di tutta la community open source.
