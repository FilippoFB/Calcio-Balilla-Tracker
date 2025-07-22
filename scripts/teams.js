const DEFAULT_PLAYERS = [
  "Bonaccorso Hadrien",
  "Ceresoli Luca",
  "D'Angelo Angelo",
  "Di Donato Marco",
  "Fusar Bassini Filippo",
  "Zagheni Marco"
];

function getPlayers() {
  return JSON.parse(localStorage.getItem('players') || '[]');
}

function setPlayers(players) {
  localStorage.setItem('players', JSON.stringify(players));
}

function renderPlayersList() {
  const players = getPlayers().length ? getPlayers() : DEFAULT_PLAYERS;
  const listDiv = document.getElementById('players-list');
  listDiv.innerHTML = players
    .sort()
    .map(name => `
      <label>
        <input type="checkbox" class="player-checkbox" value="${name}" checked>
        ${name}
      </label>
    `).join('<br>');
  updatePlayerSelects(); // <--- AGGIUNGI QUESTA RIGA
}

function addPlayer(name) {
  let players = getPlayers();
  if (!players.includes(name)) {
    players.push(name);
    setPlayers(players);
    renderPlayersList();
  }
}

function drawTeams() {
  const checked = Array.from(document.querySelectorAll('.player-checkbox:checked')).map(cb => cb.value);
  const resultDiv = document.getElementById('teams-result');
  if (checked.length < 4) {
    resultDiv.innerHTML = "<p>Servono almeno 4 giocatori!</p>";
    return;
  }
  // Mischia i giocatori
  const shuffled = checked.sort(() => Math.random() - 0.5);
  // Squadre titolari
  const rosso = { att: shuffled[0], dif: shuffled[1] };
  const blu = { att: shuffled[2], dif: shuffled[3] };
  // Riserve
  const reserves = shuffled.slice(4);
  let reservesHtml = "";
  if (reserves.length > 0) {
    reservesHtml = "<h4>Riserve:</h4><ul>";
    reserves.forEach((name, idx) => {
      if (reserves.length % 2 === 1 && idx === reserves.length - 1) {
        reservesHtml += `<li><strong>${name}</strong> (volante)</li>`;
      } else {
        const team = idx % 2 === 0 ? "Rosso" : "Blu";
        reservesHtml += `<li><strong>${name}</strong> (${team})</li>`;
      }
    });
    reservesHtml += "</ul>";
  }
  resultDiv.innerHTML = `
    <h4>Squadra <span class="rosso">ROSSO</span></h4>
    <ul>
      <li>Attaccante: <strong>${rosso.att}</strong></li>
      <li>Difensore: <strong>${rosso.dif}</strong></li>
    </ul>
    <h4>Squadra <span class="blu">BLU</span></h4>
    <ul>
      <li>Attaccante: <strong>${blu.att}</strong></li>
      <li>Difensore: <strong>${blu.dif}</strong></li>
    </ul>
    ${reservesHtml}
  `;
}

function updatePlayerSelects() {
  const players = getPlayers().sort();
  const selects = [
    document.getElementById('rosso_att'),
    document.getElementById('rosso_dif'),
    document.getElementById('blu_att'),
    document.getElementById('blu_dif')
  ];
  selects.forEach(select => {
    if (!select) return;
    // Salva il valore selezionato (se c'è)
    const selected = select.value;
    // Ricostruisci le opzioni
    select.innerHTML = '<option value="">Seleziona...</option>' +
      players.map(name => `<option${selected === name ? ' selected' : ''}>${name}</option>`).join('');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Inizializza lista giocatori
  if (!getPlayers().length) setPlayers(DEFAULT_PLAYERS);
  renderPlayersList();

  document.getElementById('add-player-btn').onclick = () => {
    const name = document.getElementById('new-player-name').value.trim();
    if (name) {
      addPlayer(name);
      document.getElementById('new-player-name').value = "";
    }
  };

  document.getElementById('draw-teams-btn').onclick = drawTeams;
});
