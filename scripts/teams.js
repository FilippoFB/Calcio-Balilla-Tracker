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

  const cardStyle = `
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

  const titleStyle = `margin:0 0 0.4em 0;font-size:1.05em;`;
  const roleStyle = `margin:0;font-size:0.95em;`;

  const printTeam = (title, att, dif, colore) => {
    const colorStyle = colore
      ? (colore.toLowerCase().includes('rosso') ? '#d32f2f' : (colore.toLowerCase().includes('blu') ? '#1976d2' : '#666'))
      : '#000';
    return `
      <div class="team-card" style="${cardStyle}">
        <h4 style="${titleStyle}color:${colorStyle};">${escapeHtml(title)}</h4>
        <div style="${roleStyle}">Attaccante: <strong>${escapeHtml(att)}</strong></div>
        <div style="${roleStyle}">Difensore: <strong>${escapeHtml(dif)}</strong></div>
      </div>
    `;
  };

  const numTeams = Math.floor(n / 2);

  for (let i = 0; i < numTeams; i++) {
    const att = shuffled[i * 2];
    const dif = shuffled[i * 2 + 1];
    let title, colore;
    if (i === 0) { title = 'Squadra Rossa'; colore = 'Rosso'; }
    else if (i === 1) { title = 'Squadra Blu'; colore = 'Blu'; }
    else { title = 'Squadra Riserva'; colore = null; }
    html += printTeam(title, att, dif, colore);
  }

  if (n % 2 === 1) {
    const last = shuffled[n - 1];
    html += `
      <div class="team-card" style="${cardStyle}">
        <h4 style="${titleStyle}color:#666;">Giocatore di Riserva</h4>
        <div style="${roleStyle}">${escapeHtml(last)}</div>
      </div>
    `;
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

/* Collegamenti DOM: solo rendering e bind per estrazione */
document.addEventListener('DOMContentLoaded', () => {
  renderPlayersList();

  const drawBtn = document.getElementById('draw-teams-btn');
  if (drawBtn) drawBtn.addEventListener('click', drawTeams);

  // collega il pulsante di sincronizzazione (se presente nel DOM)
  const syncBtn = document.getElementById('sync-players-btn');
  if (syncBtn) syncBtn.addEventListener('click', () => syncPlayersFromDefaults(true));
});
