// This file handles user interface enhancements for the Poli Balilla Tracker application.

document.addEventListener('DOMContentLoaded', () => {
    const matchesSection = document.getElementById('matches-section');
    const matchesList = document.getElementById('matches-list');

    // Function to display saved matches in a table
    const displayMatches = async () => {
        const matches = await fetchMatches();

        // Crea la tabella
        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th class="rosso">Attaccante Rosso</th>
                        <th class="rosso">Difensore Rosso</th>
                        <th class="blu">Attaccante Blu</th>
                        <th class="blu">Difensore Blu</th>
                        <th>Gol: <span class="rosso">R</span> - <span class="blu">B</span></th>
                    </tr>
                </thead>
                <tbody>
                    ${matches.map(match => `
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

        // Sostituisci la lista con la tabella
        matchesList.outerHTML = tableHTML;
    };

    // Function to fetch matches from Firestore
    const fetchMatches = async () => {
        const snapshot = await db.collection('matches').orderBy('data_partita', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    // Call displayMatches to show matches on page load
    displayMatches();
});
