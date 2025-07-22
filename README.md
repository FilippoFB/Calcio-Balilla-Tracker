# Tracker Calcio Balilla

## Descrizione

Il Tracker Calcio Balilla è una web app per registrare, gestire e analizzare le partite di calcio balilla. I dati vengono salvati su Firebase Firestore e l’interfaccia offre statistiche avanzate, grafici, gestione giocatori e funzioni di estrazione casuale delle squadre.

## Funzionalità principali

- **Inserimento Partite**: Form intuitivo per inserire i dati delle partite (giocatori, ruoli, gol), con selezione rapida dei nomi da lista aggiornata automaticamente.
- **Gestione Giocatori**: Lista dei giocatori sempre aggiornata, possibilità di aggiungere nuovi partecipanti e selezionare chi è presente per la giornata.
- **Estrazione Squadre**: Estrazione casuale delle squadre e dei ruoli tra i presenti, con gestione automatica delle riserve (anche "volante" se dispari).
- **Swap Rapido**: Pulsanti per scambiare ruoli tra attaccante/difensore e per invertire i colori delle squadre nel form di inserimento.
- **Storico Partite con Paginazione**: Visualizzazione delle partite salvate in tabelle paginabili, ogni pagina mostra le partite degli ultimi 5 giorni.
- **Statistiche Avanzate**:
  - Classifica giocatori con ranking, vittorie/sconfitte in attacco/difesa, percentuali e partite giocate.
  - Classifica squadre (coppie di giocatori e ruoli) per numero di vittorie.
  - Grafici dinamici (torta, barre) sulle statistiche principali.
- **Tema Responsive e Automatico**: Interfaccia adattiva per PC e smartphone, con supporto automatico a tema chiaro/scuro in base alle impostazioni del dispositivo.

## Struttura del progetto

```
calcio-balilla-tracker
├── assets
│       └── favicon.ico   # Icona dell'app
├── scripts
│   ├── app.js            # Logica per inserimento e salvataggio partite
│   ├── stats.js          # Analisi statistiche e grafici
│   ├── ui.js             # Gestione interfaccia e paginazione storico
│   └── teams.js          # Gestione giocatori e estrazione squadre
├── styles
│   └── main.css          # Stili CSS
├── index.html            # Pagina principale dell'applicazione
└── README.md             # Documentazione
```

## Installazione e utilizzo (opzionale)

1. **Clona il repository:**

   ```sh

   git clone <repository-url>
   ```

2. **Vai nella cartella del progetto:**

   ```sh
   cd calcio-balilla-tracker
   ```

3. **(Opzionale) Installa le dipendenze:**

   ```sh
   npm install
   ```

4. **Avvio locale:**
   - Apri `src/index.html` con un browser **tramite un server locale** (es. Live Server di VS Code o `python -m http.server`).
   - Inserisci le partite, gestisci i giocatori, visualizza statistiche e storico.

## Note tecniche

- **Firebase**: Configura le tue chiavi Firebase in `app.js` per abilitare il salvataggio dati.
- **Grafici**: I grafici sono realizzati con [Chart.js](https://www.chartjs.org/).
- **Mobile friendly**: L’interfaccia si adatta automaticamente a smartphone e tablet.
- **Dati persistenti**: I giocatori aggiunti vengono salvati in locale e sincronizzati con i form.

## Contribuire

Contributi, suggerimenti e segnalazioni sono benvenuti! Apri una issue o una pull request.

## Licenza

Questo progetto è distribuito con licenza MIT. Vedi il file LICENSE per dettagli.
