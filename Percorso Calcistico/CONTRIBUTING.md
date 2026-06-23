# 🤝 Come contribuire a Percorso Calcistico

Grazie per voler contribuire! Qualsiasi contributo è benvenuto — dal semplice bug fix alle nuove feature. Segui questa guida per far sì che le tue modifiche vengano integrate nel modo corretto.

---

## 📋 Prima di iniziare

1. **Controlla le Issues aperte** per vedere se qualcuno sta già lavorando su ciò che vuoi fare.
2. Se la tua idea non è ancora nelle Issues, **aprila prima** e discutiamone — evita di sprecare tempo su cose che potrebbero non venire accettate.
3. Sii rispettoso e costruttivo. Questo è un progetto amichevole e aperto a tutti i livelli di esperienza.

---

## 🔧 Setup locale

```bash
# Fork del repo su GitHub, poi:
git clone https://github.com/TUO_USERNAME/percorso-calcistico.git
cd percorso-calcistico
npm install
npm run dev
```

---

## 🌿 Flusso di lavoro Git

### 1. Crea un branch dedicato

```bash
# Aggiorna il tuo main prima
git checkout main
git pull upstream main

# Crea il tuo branch con un nome descrittivo
git checkout -b feature/sistema-infortuni
# oppure
git checkout -b fix/bug-classifica
# oppure
git checkout -b content/campionato-inghilterra
```

### 2. Fai le tue modifiche

Testa sempre in locale con `npm run dev` prima di committare.

### 3. Committa con messaggi chiari

Usiamo il formato **Conventional Commits**:

```
feat: aggiunto sistema infortuni con probabilità per ruolo
fix: corretta classifica con goal difference uguale
content: aggiunte 10 squadre per il campionato inglese
refactor: separata logica simulazione partite in gameEngine.js
docs: aggiornato README con nuove istruzioni deploy
style: migliorata UI card giocatore su mobile
```

### 4. Pusha e apri la Pull Request

```bash
git push origin feature/sistema-infortuni
```

Vai su GitHub e apri una **Pull Request** verso `main`.

**Nella descrizione della PR indica:**
- Cosa hai aggiunto/cambiato e perché
- Screenshot (se cambi la UI)
- Se ci sono Breaking Changes
- Issue collegata (es. `Closes #12`)

---

## ✅ Checklist prima di aprire la PR

- [ ] Il gioco funziona correttamente in locale (`npm run dev`)
- [ ] Non ho introdotto errori nella console del browser
- [ ] Il codice è leggibile e commentato dove non è ovvio
- [ ] Ho testato su mobile (o almeno ridimensionato la finestra)
- [ ] Ho aggiornato il README se ho aggiunto feature visibili

---

## 🎯 Aree prioritarie

### 🐛 Bug fix (sempre benvenuti, nessuna discussione necessaria)
- Problemi di rendering mobile
- Edge case nella simulazione partite
- Errori nel calcolo classifica

### 🎮 Nuove feature (apri Issue prima)
- **Sistema allenamento** — guadagna XP anche fuori dalle partite
- **Infortuni** — possibilità di infortunarsi con tempi di recupero
- **Capitaneria e leadership** — bonus morale squadra
- **Obiettivi stagionali** — missioni con ricompense XP extra
- **Coppa nazionale** — torneo parallelo al campionato

### 🌍 Nuovi contenuti (PR dirette ok)
- Nuove nazioni (Inghilterra Premier/Championship/League One, Olanda, ecc.)
- Più squadre per categoria
- Nomi allenatori e compagni di squadra

### 📊 Miglioramenti statistiche
- Grafici forma/rendimento
- Storico head-to-head con le squadre
- Record personali (gol stagione, presenze consecutive)

### 🎨 UI/UX
- Dark/Light theme toggle
- Animazioni transizioni schermata
- Effetti goal e level-up

---

## 🏗️ Struttura del codice

Il progetto è volutamente tenuto in un singolo file `src/App.jsx` per facilitare il vibe coding e le modifiche rapide. Se vuoi rifattorizzarlo in moduli separati, è una PR molto benvenuta. Struttura consigliata:

```
src/
├── main.jsx
├── App.jsx              # Entry point componenti
├── gameEngine/
│   ├── simulation.js    # Logica simulazione partite
│   ├── xp.js            # Sistema XP e livelli
│   ├── market.js        # Logica mercato e trasferimenti
│   └── clubs.js         # Database squadre e campionati
├── components/
│   ├── Avatar.jsx
│   ├── HomeScreen.jsx
│   ├── MatchesScreen.jsx
│   ├── StatsScreen.jsx
│   ├── modals/
│   │   ├── MatchResultModal.jsx
│   │   └── TransferModal.jsx
│   └── ui/
│       ├── StatBar.jsx
│       ├── OverallBadge.jsx
│       └── Pill.jsx
└── constants/
    ├── nations.js       # Nazioni e campionati
    ├── appearance.js    # Skin tones, hair ecc.
    └── design.js        # Token di design (colori, font)
```

---

## ❓ Domande?

Apri una [Discussion](../../discussions) su GitHub o commenta direttamente nella Issue pertinente. Siamo qui per aiutarti!
