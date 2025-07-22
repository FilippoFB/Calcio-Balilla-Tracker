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
    matchesList.outerHTML = "<p>Nessuna partita salvata.</p>";
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
    <div class="pagination-controls">
      <button id="prev-page" ${currentPage === 0 ? 'disabled' : ''}>Pagina precedente</button>
      <span>Pagina ${currentPage + 1} di ${matchesPages.length}</span>
      <button id="next-page" ${currentPage === matchesPages.length - 1 ? 'disabled' : ''}>Pagina successiva</button>
    </div>
  `;

  matchesList.outerHTML = `<div id="matches-list">${tableHTML}</div>`;

  // Eventi per i pulsanti di paginazione
  setTimeout(() => {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    if (prevBtn) prevBtn.onclick = () => displayMatches(currentPage - 1);
    if (nextBtn) nextBtn.onclick = () => displayMatches(currentPage + 1);
  }, 0);
}

// Function to fetch matches from Firestore
const fetchMatches = async () => {
    const snapshot = await db.collection('matches').orderBy('data_partita', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Call displayMatches to show matches on page load
document.addEventListener('DOMContentLoaded', () => {
  displayMatches();
});
