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
  const n = checked.length;
  if (n < 4) {
    resultDiv.innerHTML = "<p>Servono almeno 4 giocatori!</p>";
    return;
  }
  // Mischia i giocatori
  const shuffled = checked.sort(() => Math.random() - 0.5);

  let html = "";
  let idx = 0;

  // Funzione per stampare una squadra
  function printSquadra(nome, att, dif, colore) {
    return `
      <h4>Squadra${colore ? ` <span class="${colore.toLowerCase()}">${colore.toUpperCase()}</span>` : " NEUTRA"}</h4>
      <ul>
        <li>Attaccante: <strong>${att}</strong></li>
        <li>Difensore: <strong>${dif}</strong></li>
      </ul>
    `;
  }

  // 4 giocatori: 2 squadre
  if (n === 4) {
    html += printSquadra("Rosso", shuffled[0], shuffled[1], "Rosso");
    html += printSquadra("Blu", shuffled[2], shuffled[3], "Blu");
  }
  // 5 giocatori: 2 squadre + riserva volante
  else if (n === 5) {
    html += printSquadra("Rosso", shuffled[0], shuffled[1], "Rosso");
    html += printSquadra("Blu", shuffled[2], shuffled[3], "Blu");
    html += `<h4>Riserva: <strong>${shuffled[4]}</strong> (volante)</h4>`;
  }
  // 6 giocatori: 2 squadre + squadra neutra
  else if (n === 6) {
    html += printSquadra("Rosso", shuffled[0], shuffled[1], "Rosso");
    html += printSquadra("Blu", shuffled[2], shuffled[3], "Blu");
    html += printSquadra("Neutra", shuffled[4], shuffled[5], null);
    html += `<div class="info-cambio">La squadra neutra darà il cambio a quella perdente.</div>`;
  }
  // 7 giocatori: 2 squadre + squadra neutra + riserva volante
  else if (n === 7) {
    html += printSquadra("Rosso", shuffled[0], shuffled[1], "Rosso");
    html += printSquadra("Blu", shuffled[2], shuffled[3], "Blu");
    html += printSquadra("Neutra", shuffled[4], shuffled[5], null);
    html += `<div class="info-cambio">La squadra neutra darà il cambio a quella perdente.</div>`;
    html += `<h4>Riserva: <strong>${shuffled[6]}</strong> (volante)</h4>`;
  }
  // 8 o più giocatori: 4 squadre (2 rosse, 2 blu), eventuali riserve e squadre neutre
  else {
    // Quante squadre complete da 2 giocatori?
    const numSquadre = Math.floor(n / 2);
    // Le prime 4 squadre sono "rosse" e "blu" alternate
    let colori = ["Rosso", "Rosso", "Blu", "Blu"];
    let squadre = [];
    for (let i = 0; i < Math.min(numSquadre, 4); i++) {
      squadre.push(printSquadra(colori[i], shuffled[i * 2], shuffled[i * 2 + 1], colori[i]));
    }
    html += squadre.join("");
    // Se ci sono altre squadre (oltre le prime 4), sono "neutre"
    for (let i = 4; i < numSquadre; i++) {
      html += printSquadra("Neutra", shuffled[i * 2], shuffled[i * 2 + 1], null);
    }
    // Info cambio
    if (numSquadre > 2) {
      html += `<div class="info-cambio">Le squadre si daranno il cambio a rotazione.`;
      if (numSquadre > 4) html += ` Le squadre neutre danno il cambio a rotazione casuale.`;
      html += `</div>`;
    }
    // Se dispari, ultima riserva volante
    if (n % 2 === 1) {
      html += `<h4>Riserva: <strong>${shuffled[n - 1]}</strong> (volante)</h4>`;
    }
  }

  resultDiv.innerHTML = html;
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
