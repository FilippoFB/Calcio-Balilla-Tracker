// This file handles user interface enhancements for the Poli Balilla Tracker application.

let matchesPages = [];
let currentPage = 0;

function groupMatchesBy5Days(matches) {
  if (!matches.length) return [];
  // Ordina per data decrescente
  matches.sort((a, b) => new Date(b.data_partita) - new Date(a.data_partita));
  const pages = [];
  let page = [];
  let pageStartDate = new Date(matches[0].data_partita);
  pageStartDate.setHours(0,0,0,0);

  for (const match of matches) {
    const matchDate = new Date(match.data_partita);
    matchDate.setHours(0,0,0,0);
    // Se la partita è oltre 5 giorni dalla data di inizio pagina, crea nuova pagina
    if (page.length && (pageStartDate - matchDate) > 4 * 24 * 60 * 60 * 1000) {
      pages.push(page);
      page = [];
      pageStartDate = matchDate;
    }
    page.push(match);
  }
  if (page.length) pages.push(page);
  return pages;
}

async function displayMatches(pageIdx = 0) {
  const matchesList = document.getElementById('matches-list');
  const matches = await fetchMatches();
  matchesPages = groupMatchesBy5Days(matches);
  currentPage = Math.max(0, Math.min(pageIdx, matchesPages.length - 1));

  // Se non ci sono partite
  if (!matchesPages.length) {
    if (matchesList) matchesList.innerHTML = "<p>Nessuna partita salvata.</p>";
    // aggiorna paginazione (mostra 0/0)
    const indicatorEmpty = document.getElementById('matches-page-indicator');
    if (indicatorEmpty) indicatorEmpty.textContent = `0 / 0`;
    const prevEmpty = document.getElementById('matches-prev');
    const nextEmpty = document.getElementById('matches-next');
    if (prevEmpty) prevEmpty.disabled = true;
    if (nextEmpty) nextEmpty.disabled = true;
    return;
  }

  // Crea la tabella per la pagina corrente
  const pageMatches = matchesPages[currentPage];
  const tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th class="rosso">Attaccante Rosso</th>
          <th class="rosso">Difensore Rosso</th>
          <th class="blu">Attaccante Blu</th>
          <th class="blu">Difensore Blu</th>
          <th>Gol <span class="rosso">R</span>-<span class="blu">B</span></th>
        </tr>
      </thead>
      <tbody>
        ${pageMatches.map(match => `
          <tr>
            <td>${new Date(match.data_partita).toLocaleDateString()}</td>
            <td>${match.rosso_att}</td>
            <td>${match.rosso_dif}</td>
            <td>${match.blu_att}</td>
            <td>${match.blu_dif}</td>
            <td>
              <span class="gol-risultato">
                <span class="rosso">${match.gol_rosso}</span>
                <span class="trattino">-</span>
                <span class="blu">${match.gol_blu}</span>
              </span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // Inserisci la tabella dentro #matches-list (senza ricreare controlli)
  if (matchesList) matchesList.innerHTML = tableHTML;

  // Usa i bottoni già presenti (matches-prev / matches-next) e l'indicatore (matches-page-indicator)
  const prevBtn = document.getElementById('matches-prev');
  const nextBtn = document.getElementById('matches-next');
  const indicator = document.getElementById('matches-page-indicator');

  if (indicator) indicator.textContent = `${currentPage + 1} / ${matchesPages.length}`;

  if (prevBtn) {
    prevBtn.textContent = 'Pagina precedente';
    prevBtn.disabled = currentPage === 0;
    prevBtn.onclick = () => displayMatches(currentPage - 1);
  }
  if (nextBtn) {
    nextBtn.textContent = 'Pagina successiva';
    nextBtn.disabled = currentPage === matchesPages.length - 1;
    nextBtn.onclick = () => displayMatches(currentPage + 1);
  }
}

/* ---------- Modale: modifica / elimina partite ---------- */
async function openEditMatchesModal() {
  // rimuovi eventuale modale precedente
  const prev = document.getElementById('edit-matches-modal');
  if (prev) prev.remove();

  // fetch current matches (uso funzione esistente)
  const matches = await fetchMatches(); // ritorna array con {id,...}
  // costruisco modale
  const modal = document.createElement('div');
  modal.id = 'edit-matches-modal';
  Object.assign(modal.style, { position:'fixed', inset:'0', background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:'11000', overflow:'auto', padding:'2rem' });

  const box = document.createElement('div');
  Object.assign(box.style, { background:'#fff', borderRadius:'10px', padding:'1rem', width:'min(1200px,100%)', boxSizing:'border-box' });

  box.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem;">
      <h3 style="margin:0">Modifica / Elimina partite</h3>
      <div>
        <button id="close-edit-matches" class="btn-primary" style="background:#888">Chiudi</button>
      </div>
    </div>
    <div style="max-height:60vh;overflow:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f5f5f5">
            <th>Data</th>
            <th>Rosso Att</th>
            <th>Rosso Dif</th>
            <th>Blu Att</th>
            <th>Blu Dif</th>
            <th>Gol R</th>
            <th>Gol B</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody id="edit-matches-tbody">
          ${matches.map(m => {
            const dateVal = (m.data_partita || '').split('T')[0] || '';
            return `<tr data-id="${m.id}">
              <td><input type="date" class="edit-date" value="${dateVal}" /></td>
              <td><input type="text" class="edit-rosso-att" value="${escapeHtml(m.rosso_att || '')}" /></td>
              <td><input type="text" class="edit-rosso-dif" value="${escapeHtml(m.rosso_dif || '')}" /></td>
              <td><input type="text" class="edit-blu-att" value="${escapeHtml(m.blu_att || '')}" /></td>
              <td><input type="text" class="edit-blu-dif" value="${escapeHtml(m.blu_dif || '')}" /></td>
              <td><input type="number" min="0" class="edit-gol-rosso" value="${m.gol_rosso != null ? m.gol_rosso : 0}" style="width:5ch" /></td>
              <td><input type="number" min="0" class="edit-gol-blu" value="${m.gol_blu != null ? m.gol_blu : 0}" style="width:5ch" /></td>
              <td style="white-space:nowrap">
                <button class="save-match-btn btn-primary" style="margin-right:0.4em">Salva</button>
                <button class="delete-match-btn" style="background:#d32f2f;color:#fff;border:none;padding:0.4em 0.6em;border-radius:6px">Elimina</button>
              </td>
            </tr>`; }).join('')}

        </tbody>
      </table>
    </div>
  `;

  modal.appendChild(box);
  document.body.appendChild(modal);

  // bind chiudi
  document.getElementById('close-edit-matches').addEventListener('click', () => modal.remove());

  // bind salva e elimina per ogni riga (event delegation)
  const tbody = document.getElementById('edit-matches-tbody');
  tbody.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const tr = btn.closest('tr');
    const id = tr && tr.getAttribute('data-id');
    if (!id) return;

    if (btn.classList.contains('save-match-btn')) {
      // legge valori dalla riga
      const dateVal = tr.querySelector('.edit-date').value;
      const rossoAtt = tr.querySelector('.edit-rosso-att').value.trim();
      const rossoDif = tr.querySelector('.edit-rosso-dif').value.trim();
      const bluAtt = tr.querySelector('.edit-blu-att').value.trim();
      const bluDif = tr.querySelector('.edit-blu-dif').value.trim();
      const golRosso = parseInt(tr.querySelector('.edit-gol-rosso').value || '0', 10);
      const golBlu = parseInt(tr.querySelector('.edit-gol-blu').value || '0', 10);

      // validazioni minime
      if (!rossoAtt || !rossoDif || !bluAtt || !bluDif) { alert('Compila tutti i giocatori.'); return; }
      if (!dateVal) { alert('Seleziona la data.'); return; }

      try {
        // aggiorna Firestore: data_partita come ISO
        await db.collection('matches').doc(id).update({
          rosso_att: rossoAtt,
          rosso_dif: rossoDif,
          blu_att: bluAtt,
          blu_dif: bluDif,
          gol_rosso: golRosso,
          gol_blu: golBlu,
          data_partita: new Date(dateVal).toISOString()
        });
        // conferma e aggiorna vista
        btn.textContent = 'OK';
        setTimeout(() => btn.textContent = 'Salva', 700);
        if (typeof displayMatches === 'function') displayMatches(currentPage);
        if (typeof updateStatistics === 'function') updateStatistics();
      } catch (err) {
        console.error(err);
        alert('Errore salvataggio: ' + (err && err.message ? err.message : err));
      }
    } else if (btn.classList.contains('delete-match-btn')) {
      if (!confirm('Eliminare definitivamente questa partita?')) return;
      try {
        await db.collection('matches').doc(id).delete();
        // rimuovi riga dalla tabella
        tr.remove();
        if (typeof displayMatches === 'function') displayMatches(currentPage);
        if (typeof updateStatistics === 'function') updateStatistics();
      } catch (err) {
        console.error(err);
        alert('Errore eliminazione: ' + (err && err.message ? err.message : err));
      }
    }
  });
}

// bind pulsante Modifica partite
document.addEventListener('DOMContentLoaded', () => {
  const editMatchesBtn = document.getElementById('edit-matches-btn');
  if (editMatchesBtn) editMatchesBtn.addEventListener('click', openEditMatchesModal);
});

// Function to fetch matches from Firestore
const fetchMatches = async () => {
    const snapshot = await db.collection('matches').orderBy('data_partita', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// popola le select del form con la lista giocatori e si aggiorna quando cambia
function updatePlayerSelects() {
  const players = (window.getPlayers ? window.getPlayers() : (JSON.parse(localStorage.getItem('players')||'[]'))).slice().sort();
  const ids = ['rosso_att','rosso_dif','blu_att','blu_dif'];
  ids.forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="">Seleziona...</option>' +
      players.map(n => `<option value="${n}" ${current===n ? 'selected' : ''}>${n}</option>`).join('');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updatePlayerSelects();
  // called whenever teams.js updates the players list
  window.onPlayersUpdated = () => updatePlayerSelects();
});

// Call displayMatches to show matches on page load
document.addEventListener('DOMContentLoaded', () => {
  displayMatches();
});
