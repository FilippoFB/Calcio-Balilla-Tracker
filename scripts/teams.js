// Gestione giocatori, rendering checkbox e estrazione squadre (robusta)

/* default interno solo se window.DEFAULT_PLAYERS non definito */
const FALLBACK_DEFAULT_PLAYERS = [
  "Bonaccorso Hadrien",
  "Ceresoli Luca",
  "D'Angelo Angelo",
  "Di Donato Marco",
  "Fusar Bassini Filippo",
  "Rossi Andrea",
  "Zagheni Marco"
];

function getPlayers() {
  try {
    const stored = JSON.parse(localStorage.getItem('players') || 'null');
    if (Array.isArray(stored)) return stored.slice();
    const defaults = Array.isArray(window.DEFAULT_PLAYERS) ? [...window.DEFAULT_PLAYERS] : [...FALLBACK_DEFAULT_PLAYERS];
    localStorage.setItem('players', JSON.stringify(defaults));
    return defaults;
  } catch (e) {
    console.error('getPlayers error', e);
    return Array.isArray(window.DEFAULT_PLAYERS) ? [...window.DEFAULT_PLAYERS] : [...FALLBACK_DEFAULT_PLAYERS];
  }
}

function setPlayers(list) {
  if (!Array.isArray(list)) return;
  localStorage.setItem('players', JSON.stringify(list));
  if (typeof window.onPlayersUpdated === 'function') {
    try { window.onPlayersUpdated(list); } catch (e) { console.error(e); }
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function renderPlayersList() {
  const container = document.getElementById('players-list');
  if (!container) return;
  const players = getPlayers();
  container.innerHTML = players.map(name => `
    <label class="player-item">
      <div class="player-left">
        <input type="checkbox" class="player-checkbox" value="${escapeHtml(name)}" checked />
        <span class="player-name">${escapeHtml(name)}</span>
      </div>
    </label>
  `).join('');
}

// --- shared card style + helper per rendering (usato da drawTeams e drawTeamsInfame) ---
const CARD_STYLE_SHARED = `
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:flex-start;
  gap:0.35rem;
  box-sizing:border-box;
  padding:0.8rem;
  border-radius:8px;
  background:#fff;
  border:1px solid #eee;
  flex: 0 1 calc(50% - 0.8rem);
  max-width: calc(50% - 0.8rem);
  min-width: 220px;
  height:100px;
  margin-top:1rem;
`;

const TITLE_STYLE_SHARED = `margin:0 0 0.4em 0;font-size:1.05em;`;
const ROLE_STYLE_SHARED = `margin:0;font-size:0.95em;`;

function printTeam(title, att, dif, colore) {
  const colorStyle = colore
    ? (colore.toLowerCase().includes('rosso') ? '#d32f2f' : (colore.toLowerCase().includes('blu') ? '#1976d2' : '#666'))
    : '#000';
  return `
    <div class="team-card" style="${CARD_STYLE_SHARED}">
      <h4 style="${TITLE_STYLE_SHARED}color:${colorStyle};">${escapeHtml(title)}</h4>
      <div style="${ROLE_STYLE_SHARED}">Attaccante: <strong>${escapeHtml(att || '')}</strong></div>
      <div style="${ROLE_STYLE_SHARED}">Difensore: <strong>${escapeHtml(dif || '')}</strong></div>
    </div>
  `;
}

function printReserve(name) {
  return `
    <div class="team-card" style="${CARD_STYLE_SHARED}">
      <h4 style="${TITLE_STYLE_SHARED}color:#666;">Giocatore di Riserva</h4>
      <div style="${ROLE_STYLE_SHARED}">${escapeHtml(name)}</div>
    </div>
  `;
}
// --- fine shared helpers ---

function drawTeams() {
  const checked = Array.from(document.querySelectorAll('.player-checkbox:checked')).map(cb => cb.value);
  const resultDiv = document.getElementById('teams-result') || document.createElement('div');
  const n = checked.length;
  if (n < 4) {
    resultDiv.innerHTML = "<p>Servono almeno 4 giocatori!</p>";
    if (!document.getElementById('teams-result')) document.body.appendChild(resultDiv);
    return;
  }

  const shuffled = checked.slice().sort(() => Math.random() - 0.5);
  let html = "";

  const numTeams = Math.floor(n / 2);

  for (let i = 0; i < numTeams; i++) {
    const att = shuffled[i * 2];
    const dif = shuffled[i * 2 + 1];
    let title, colore;
    if (i === 0) { title = 'Squadra Rossa'; colore = 'Rosso'; }
    else if (i === 1) { title = 'Squadra Blu'; colore = 'Blu'; }
    else { title = `Squadra ${i+1}`; colore = null; }
    html += printTeam(title, att, dif, colore);
  }

  if (n % 2 === 1) {
    const last = shuffled[n - 1];
    html += printReserve(last);
  }

  resultDiv.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:0.8rem;align-items:flex-start;justify-content:center;margin-top:1rem;">${html}</div>`;
  if (!document.getElementById('teams-result')) document.body.appendChild(resultDiv);
}

// funzione per sincronizzare localStorage con players.js (defaults)
function syncPlayersFromDefaults(overwrite = true) {
  const defaults = Array.isArray(window.DEFAULT_PLAYERS) ? [...window.DEFAULT_PLAYERS] : [...FALLBACK_DEFAULT_PLAYERS];
  if (!defaults.length) {
    alert('Nessun DEFAULT_PLAYERS disponibile.');
    return;
  }
  if (overwrite) {
    if (!confirm('Sovrascrivere la lista giocatori salvata con quella presente in players.js?')) return;
    setPlayers(defaults);
  } else {
    // merge: aggiunge solo i mancanti mantenendo l'ordine salvato
    const current = getPlayers();
    defaults.forEach(n => { if (!current.includes(n)) current.push(n); });
    setPlayers(current);
  }
  renderPlayersList();
  if (typeof window.updatePlayerSelects === 'function') window.updatePlayerSelects();
  alert('Lista giocatori sincronizzata.');
}

// rendi disponibile globalmente se necessario
window.syncPlayersFromDefaults = syncPlayersFromDefaults;

/* Esponi funzioni necessarie */
window.getPlayers = getPlayers;
window.setPlayers = setPlayers;
window.renderPlayersList = renderPlayersList;
window.drawTeams = drawTeams;
window.syncPlayersFromDefaults = syncPlayersFromDefaults;

// Nuova: computePlayerRoleStats ora accetta optional playersList per limitare il calcolo
async function computePlayerRoleStats(campId = null, playersList = null) {
  // ritorna oggetto { playerName: { attWin, attLoss, difWin, difLoss, score } }
  const stats = {};
  const players = Array.isArray(playersList) ? playersList.slice() : getPlayers();
  players.forEach(p => stats[p] = { attWin:0, attLoss:0, difWin:0, difLoss:0, score:0 });

  // se non c'è db, ritorna stats vuoti (ma con chiavi per i giocatori richiesti)
  if (typeof window.db === 'undefined') {
    return stats;
  }

  const col = (typeof window.matchesCollection === 'function')
    ? window.matchesCollection(campId)
    : (window.db ? window.db.collection('matches') : null);
  if (!col) return stats;

  const snapshot = await col.get();
  const matches = snapshot.docs.map(d => d.data());

  matches.forEach(m => {
    const ra = m.rosso_att, rd = m.rosso_dif, ba = m.blu_att, bd = m.blu_dif;
    if (m.gol_rosso > m.gol_blu) {
      if (stats[ra]) stats[ra].attWin++;
      if (stats[rd]) stats[rd].difWin++;
      if (stats[ba]) stats[ba].attLoss++;
      if (stats[bd]) stats[bd].difLoss++;
    } else if (m.gol_blu > m.gol_rosso) {
      if (stats[ba]) stats[ba].attWin++;
      if (stats[bd]) stats[bd].difWin++;
      if (stats[ra]) stats[ra].attLoss++;
      if (stats[rd]) stats[rd].difLoss++;
    }
  });

  // calcola score semplice (win - loss)
  Object.keys(stats).forEach(p => {
    const s = stats[p];
    const win = (s.attWin || 0) + (s.difWin || 0);
    const loss = (s.attLoss || 0) + (s.difLoss || 0);
    s.score = win - loss;
  });

  return stats;
}

async function drawTeamsInfame() {
  // usa solo i giocatori selezionati nella lista (come drawTeams)
  const checked = Array.from(document.querySelectorAll('.player-checkbox:checked')).map(cb => cb.value);
  const players = checked.slice();
  if (!players || players.length < 4) {
    alert('Servono almeno 4 giocatori per eseguire l\'estrazione "infame".');
    return;
  }

  const campId = document.getElementById('campionato-select')?.value || null;
  const roleStats = await computePlayerRoleStats(campId, players);

  // ordina per forza: score desc
  players.sort((a,b) => (roleStats[b]?.score || 0) - (roleStats[a]?.score || 0));

  // coppia strongest <-> weakest
  const n = players.length;
  const pairs = [];
  for (let i = 0; i < Math.floor(n/2); i++) {
    const strong = players[i];
    const weak = players[n - 1 - i];
    pairs.push([strong, weak]);
  }

  // crea HTML per le squadre usando gli stessi helpers estetici
  const teamCards = [];
  pairs.forEach((pair, idx) => {
    const [p1, p2] = pair;
    const s1 = roleStats[p1] || { attWin:0,difWin:0,attLoss:0,difLoss:0 };
    const s2 = roleStats[p2] || { attWin:0,difWin:0,attLoss:0,difLoss:0 };

    const weakRole = (st) => {
      const att = st.attWin || 0;
      const dif = st.difWin || 0;
      if (att === dif) return 'ATT';
      return att < dif ? 'ATT' : 'DIF';
    };

    let role1 = weakRole(s1);
    let role2 = weakRole(s2);

    let forced2 = false;
    if (role1 === role2) {
      role2 = (role1 === 'ATT') ? 'DIF' : 'ATT';
      forced2 = true;
    }

    const attPlayer = role1 === 'ATT' ? p1 : (role2 === 'ATT' ? p2 : '');
    const difPlayer = role1 === 'DIF' ? p1 : (role2 === 'DIF' ? p2 : '');
    const attForcedNote = (attPlayer === p2 && forced2) ? ' (forzato)' : '';
    const difForcedNote = (difPlayer === p2 && forced2) ? ' (forzato)' : '';

    let title, colore;
    if (idx === 0) { title = 'Squadra Rossa'; colore = 'Rosso'; }
    else if (idx === 1) { title = 'Squadra Blu'; colore = 'Blu'; }
    else { title = `Squadra ${idx + 1}`; colore = null; }

    teamCards.push(printTeam(title, `${attPlayer}${attForcedNote}`, `${difPlayer}${difForcedNote}`, colore));
  });

  // se dispari, la persona rimanente è riserva
  let reserveHtml = '';
  if (players.length % 2 === 1) {
    const last = players[Math.floor(n/2)];
    reserveHtml = printReserve(last);
  }

  const resultDiv = document.getElementById('teams-result') || document.createElement('div');
  resultDiv.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:0.8rem;align-items:flex-start;justify-content:center;margin-top:1rem;">${teamCards.join('')}${reserveHtml}</div>`;
  if (!document.getElementById('teams-result')) document.body.appendChild(resultDiv);
}

// bind del nuovo pulsante (DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
  const infameBtn = document.getElementById('draw-teams-infame-btn');
  if (infameBtn) infameBtn.addEventListener('click', () => {
    // mostra conferma per chiarezza
    if (confirm('Eseguire estrazione "infame"? Verranno abbinati i più forti con i più deboli.')) {
      drawTeamsInfame();
    }
  });
});

// Esponi globalmente se necessario
window.drawTeamsInfame = drawTeamsInfame;

/* Collegamenti DOM: solo rendering e bind per estrazione */
document.addEventListener('DOMContentLoaded', () => {
  renderPlayersList();

  const drawBtn = document.getElementById('draw-teams-btn');
  if (drawBtn) drawBtn.addEventListener('click', drawTeams);

  // collega il pulsante di sincronizzazione (se presente nel DOM)
  const syncBtn = document.getElementById('sync-players-btn');
  if (syncBtn) syncBtn.addEventListener('click', () => syncPlayersFromDefaults(true));
});
