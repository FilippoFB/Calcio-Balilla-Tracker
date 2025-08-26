// This file contains the main JavaScript logic for handling form submissions and interacting with Firebase Firestore to save match data. 
// It initializes Firebase and sets up event listeners for user interactions.

const firebaseConfig = {
  apiKey: "AIzaSyC9hhquSxCtabMK9KGtdoO10wSe3HrWtUk",
  authDomain: "calcio-balilla-tracker.firebaseapp.com",
  projectId: "calcio-balilla-tracker",
  storageBucket: "calcio-balilla-tracker.firebasestorage.app",
  messagingSenderId: "504162914362",
  appId: "1:504162914362:web:223c4389fab6b120c16503",
  measurementId: "G-J6PML7W1EK"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore(); // Rende db globale

let campionati = [];
let partite = [];

// Handle form submission
const form = document.getElementById('match-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    rosso_att: form.rosso_att.value,
    rosso_dif: form.rosso_dif.value,
    blu_att: form.blu_att.value,
    blu_dif: form.blu_dif.value,
    gol_rosso: parseInt(form.gol_rosso.value),
    gol_blu: parseInt(form.gol_blu.value),
    data_partita: new Date().toISOString()
  };

  try {
    await db.collection('matches').add(data);
    alert('Partita salvata!');
    form.gol_rosso.value = 0;
    form.gol_blu.value = 0;
    updateStatistics();
  } catch (error) {
    alert('Errore: ' + error.message);
    console.error(error);
  }
});

async function caricaCampionati() {
  const snapshot = await db.collection('championship').orderBy('dataInizio', 'desc').get();
  campionati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  aggiornaTendinaCampionati();
}

async function caricaPartite() {
  const snapshot = await db.collection('matches').get();
  partite = snapshot.docs.map(doc => doc.data());
}

function aggiornaTendinaCampionati() {
  const select = document.getElementById('campionato-select');
  select.innerHTML = `<option value="global">Campionato globale</option>` +
    campionati.map(c =>
      `<option value="${c.id}">${c.nome} (${c.dataInizio} - ${c.dataFine || 'in corso'})</option>`
    ).join('');
}

function filtraPartiteCampionato(campionatoId) {
  if (campionatoId === "global") return partite;
  const campionato = campionati.find(c => c.id === campionatoId);
  if (!campionato) return partite;
  return partite.filter(p => {
    const data = p.data_partita ? p.data_partita.split('T')[0] : p.date.split('T')[0];
    if (!campionato.dataFine || campionato.attivo) {
      return data >= campionato.dataInizio;
    } else {
      return data >= campionato.dataInizio && data <= campionato.dataFine;
    }
  });
}

// Adatta la funzione di visualizzazione statistiche per accettare le partite filtrate
async function displayStatisticsFiltered(matches) {
  if (window.displayStatistics) {
    await window.displayStatistics(matches); // stats.js deve accettare matches come parametro
  }
}

// Quando cambia la selezione della tendina, aggiorna le statistiche
document.getElementById('campionato-select').addEventListener('change', async (e) => {
  const campionatoId = e.target.value;
  const matches = filtraPartiteCampionato(campionatoId);
  await displayStatisticsFiltered(matches);
});

// Function to update statistics
async function updateStatistics() {
  const matchesSnapshot = await db.collection('matches').get();
  const matches = matchesSnapshot.docs.map(doc => doc.data());

  const totalMatches = matches.length;
  const totalGoals = matches.reduce((sum, match) => sum + match.gol_rosso + match.gol_blu, 0);
  const averageGoals = totalMatches ? (totalGoals / totalMatches).toFixed(2) : 0;

  displayStatistics(totalMatches, averageGoals);
}

// Function to display statistics
function displayStatistics(totalMatches, averageGoals) {
  const statsContainer = document.getElementById('stats-container');
  statsContainer.innerHTML = `
    <h2>Statistiche</h2>
    <p>Partite totali: ${totalMatches}</p>
    <p>Media gol per partita: ${averageGoals}</p>
  `;
}

document.addEventListener('DOMContentLoaded', async () => {
  await caricaCampionati();
  await caricaPartite();
  await displayStatisticsFiltered(partite);

  // Scambia colori squadre
  document.getElementById('swap-colors-btn').onclick = () => {
    // Salva valori attuali
    const rossoAtt = document.getElementById('rosso_att').value;
    const rossoDif = document.getElementById('rosso_dif').value;
    const bluAtt = document.getElementById('blu_att').value;
    const bluDif = document.getElementById('blu_dif').value;
    // Scambia
    document.getElementById('rosso_att').value = bluAtt;
    document.getElementById('rosso_dif').value = bluDif;
    document.getElementById('blu_att').value = rossoAtt;
    document.getElementById('blu_dif').value = rossoDif;
  };

  // Scambia ruoli Rosso
  document.getElementById('swap-rosso-btn').onclick = () => {
    const att = document.getElementById('rosso_att').value;
    const dif = document.getElementById('rosso_dif').value;
    document.getElementById('rosso_att').value = dif;
    document.getElementById('rosso_dif').value = att;
  };

  // Scambia ruoli Blu
  document.getElementById('swap-blu-btn').onclick = () => {
    const att = document.getElementById('blu_att').value;
    const dif = document.getElementById('blu_dif').value;
    document.getElementById('blu_att').value = dif;
    document.getElementById('blu_dif').value = att;
  };

  document.getElementById('gestisci-campionati-btn').addEventListener('click', mostraModaleCampionati);

  function mostraModaleCampionati() {
    // Rimuovi eventuale modale precedente
    let oldModal = document.getElementById('modale-campionati');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'modale-campionati';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.3)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';

    // Sezione aggiunta nuovo campionato
    const oggi = new Date().toISOString().split('T')[0];
    modal.innerHTML = `
      <div style="
        background:#fff;
        padding:2em 2.5em;
        border-radius:16px;
        min-width:370px;
        max-width:95vw;
        box-shadow:0 4px 32px #0002;
        font-size:1.08em;
      ">
        <h2 style="margin-top:0;text-align:center;">Gestione Campionati Stagionali</h2>
        <div style="margin-bottom:2em;border-bottom:1px solid #eee;padding-bottom:1.2em;">
          <h3 style="margin-bottom:0.7em;">Aggiungi nuovo campionato</h3>
          <div style="display:flex;flex-wrap:wrap;gap:1em;align-items:center;">
            <label style="flex:1 1 120px;">Nome:<br>
              <input type="text" id="camp-nome" style="width:100%;padding:0.5em;">
            </label>
            <label style="flex:1 1 120px;">Data inizio:<br>
              <input type="date" id="camp-inizio" value="${oggi}" style="width:100%;padding:0.5em;">
            </label>
            <label style="flex:1 1 120px;">Data fine:<br>
              <input type="date" id="camp-fine" style="width:100%;padding:0.5em;">
            </label>
            <label style="flex:0 1 80px;margin-top:1.2em;">
              <input type="checkbox" id="camp-attivo" checked> Attivo
            </label>
            <button id="camp-crea-btn" style="
              background:#1976d2;
              color:#fff;
              border:none;
              border-radius:6px;
              padding:0.7em 1.5em;
              font-size:1em;
              font-weight:bold;
              margin-top:1.2em;
              cursor:pointer;
              transition:background 0.2s;
            ">Aggiungi</button>
          </div>
        </div>
        <h3 style="margin-bottom:0.7em;">Lista campionati</h3>
        <div id="campionati-list"></div>
        <button id="camp-close-btn" style="
          margin-top:2em;
          background:#888;
          color:#fff;
          border:none;
          border-radius:6px;
          padding:0.7em 1.5em;
          font-size:1em;
          font-weight:bold;
          cursor:pointer;
          transition:background 0.2s;
          display:block;
          margin-left:auto;
          margin-right:auto;
        ">Chiudi</button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('camp-close-btn').onclick = () => modal.remove();

    document.getElementById('camp-crea-btn').onclick = async () => {
      const nome = document.getElementById('camp-nome').value.trim();
      const dataInizio = document.getElementById('camp-inizio').value;
      const dataFine = document.getElementById('camp-fine').value;
      const attivo = document.getElementById('camp-attivo').checked;
      if (!nome || !dataInizio) {
        alert('Nome e data inizio sono obbligatori!');
        return;
      }
      await db.collection('championship').add({
        nome,
        dataInizio,
        dataFine: dataFine || '',
        attivo
      });
      await caricaCampionati();
      renderCampionatiList();
      document.getElementById('camp-nome').value = '';
      document.getElementById('camp-inizio').value = oggi;
      document.getElementById('camp-fine').value = '';
      document.getElementById('camp-attivo').checked = true;
    };

    function renderCampionatiList() {
      const container = document.getElementById('campionati-list');
      container.innerHTML = `
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:0.6em;">Nome</th>
              <th style="padding:0.6em;">Data inizio</th>
              <th style="padding:0.6em;">Data fine</th>
              <th style="padding:0.6em;">Attivo</th>
              <th style="padding:0.6em;">Elimina</th>
            </tr>
          </thead>
          <tbody>
            ${campionati.map(c => `
              <tr>
                <td>
                  <input type="text" value="${c.nome}" class="campionato-input" onchange="window.aggiornaCampoCampionato('${c.id}','nome',this.value)">
                </td>
                <td>
                  <input type="date" value="${c.dataInizio}" class="campionato-input" onchange="window.aggiornaCampoCampionato('${c.id}','dataInizio',this.value)">
                </td>
                <td>
                  <input type="date" value="${c.dataFine || ''}" class="campionato-input" onchange="window.aggiornaCampoCampionato('${c.id}','dataFine',this.value)">
                </td>
                <td style="text-align:center;">
                  <input type="checkbox" class="campionato-checkbox" ${c.attivo ? 'checked' : ''} onchange="window.aggiornaCampoCampionato('${c.id}','attivo',this.checked)">
                </td>
                <td style="text-align:center;">
                  <button class="campionato-delete-btn" onclick="window.eliminaCampionato('${c.id}', '${c.nome}')">&#128465;</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    // Espone le funzioni per gli input dinamici
    window.aggiornaCampoCampionato = async (id, campo, valore) => {
      let update = {};
      if (campo === 'attivo') update[campo] = valore;
      else update[campo] = valore;
      await db.collection('championship').doc(id).update(update);
      await caricaCampionati();
      renderCampionatiList();
    };

    window.eliminaCampionato = async (id, nome) => {
      if (confirm(`Vuoi davvero eliminare il campionato "${nome}"?`)) {
        await db.collection('championship').doc(id).delete();
        await caricaCampionati();
        renderCampionatiList();
      }
    };

    renderCampionatiList();
  }
});
