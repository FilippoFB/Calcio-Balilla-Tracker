// This file is responsible for statistical analysis of the match data.
// It includes functions to calculate and display statistics such as win/loss ratios, average goals per match, and other relevant metrics.

// Function to calculate win/loss ratios and advanced statistics
async function calculateStatistics() {
    const matchesSnapshot = await db.collection('matches').get();
    const matches = matchesSnapshot.docs.map(doc => doc.data());

    let totalMatches = matches.length;
    let winsRosso = 0;
    let winsBlu = 0;

    // Statistiche per persona (vittorie e sconfitte)
    const playerStats = {}; // { nome: { attWin: n, attLoss: n, difWin: n, difLoss: n } }
    // Statistiche per combinazione squadra vincente
    const teamWins = {}; // { "Mario (A) & Luca (D)": n }

    matches.forEach(match => {
        const rossoTeam = `${match.rosso_att} (A) & ${match.rosso_dif} (D)`;
        const bluTeam = `${match.blu_att} (A) & ${match.blu_dif} (D)`;

        // Inizializza giocatori se non esistono
        [match.rosso_att, match.rosso_dif, match.blu_att, match.blu_dif].forEach(player => {
            if (!playerStats[player]) playerStats[player] = { attWin: 0, attLoss: 0, difWin: 0, difLoss: 0 };
        });

        if (match.gol_rosso > match.gol_blu) {
            winsRosso++;
            // Incrementa solo la squadra vincente
            teamWins[rossoTeam] = (teamWins[rossoTeam] || 0) + 1;

            playerStats[match.rosso_att].attWin++;
            playerStats[match.rosso_dif].difWin++;
            playerStats[match.blu_att].attLoss++;
            playerStats[match.blu_dif].difLoss++;
        } else if (match.gol_blu > match.gol_rosso) {
            winsBlu++;
            // Incrementa solo la squadra vincente
            teamWins[bluTeam] = (teamWins[bluTeam] || 0) + 1;

            playerStats[match.blu_att].attWin++;
            playerStats[match.blu_dif].difWin++;
            playerStats[match.rosso_att].attLoss++;
            playerStats[match.rosso_dif].difLoss++;
        }
    });

    return {
        totalMatches,
        winsRosso,
        winsBlu,
        playerStats,
        teamWins
    };
}

// Function to display statistics on the UI
async function displayStatistics() {
    const stats = await calculateStatistics();
    const statsContainer = document.getElementById('stats-display');
    if (!statsContainer) return;

    // Calcola ranking e percentuali
    const playerStatsArray = Object.entries(stats.playerStats).map(([player, roles]) => {
        const tot = roles.attWin + roles.attLoss + roles.difWin + roles.difLoss;
        const win = roles.attWin + roles.difWin;
        const loss = roles.attLoss + roles.difLoss;
        const winPerc = tot > 0 ? (win / tot) * 100 : 0;
        const lossPerc = tot > 0 ? (loss / tot) * 100 : 0;
        return {
            player,
            attWin: roles.attWin,
            attLoss: roles.attLoss,
            difWin: roles.difWin,
            difLoss: roles.difLoss,
            tot,
            win,
            loss,
            winPerc,
            lossPerc
        };
    });

    // Ordina per % vittorie decrescente
    playerStatsArray.sort((a, b) => b.winPerc - a.winPerc);

    // Tabella ranking
    const playerStatsTable = `
        <table>
            <thead>
                <tr>
                    <th>Ranking</th>
                    <th>Giocatore</th>
                    <th>Attacco<br><span class="rosso">V</span>/<span class="blu">S</span></th>
                    <th>Difesa<br><span class="rosso">V</span>/<span class="blu">S</span></th>
                    <th>Partite giocate</th>
                    <th>% Vittorie</th>
                    <th>% Sconfitte</th>
                </tr>
            </thead>
            <tbody>
                ${playerStatsArray.map((p, idx) =>
                    `<tr>
                        <td>${idx + 1}</td>
                        <td>${p.player}</td>
                        <td><span class="rosso">${p.attWin}</span> / <span class="blu">${p.attLoss}</span></td>
                        <td><span class="rosso">${p.difWin}</span> / <span class="blu">${p.difLoss}</span></td>
                        <td>${p.tot}</td>
                        <td>${p.winPerc.toFixed(1)}%</td>
                        <td>${p.lossPerc.toFixed(1)}%</td>
                    </tr>`
                ).join('')}
            </tbody>
        </table>
    `;

    // Tabella squadre
    const sortedTeams = Object.entries(stats.teamWins)
        .sort((a, b) => b[1] - a[1]);

    const teamStatsTable = `
        <table>
            <thead>
                <tr>
                    <th>Ranking</th>
                    <th>Squadra (Attaccante & Difensore)</th>
                    <th>Vittorie</th>
                </tr>
            </thead>
            <tbody>
                ${sortedTeams.map(([team, wins], idx) =>
                    `<tr>
                        <td>${idx + 1}</td>
                        <td>${team}</td>
                        <td><span>${wins}</span></td>
                    </tr>`
                ).join('')}
            </tbody>
        </table>
    `;

    statsContainer.innerHTML = `
        <p><strong>Partite Totali:</strong> ${stats.totalMatches}</p>
        <p><strong class="rosso">Vittorie Rossi - Pro.File:</strong> ${stats.winsRosso}</p>
        <p><strong class="blu">Vittorie Blu - Teamcenter:</strong> ${stats.winsBlu}</p>
        <h3>Vittorie/Sconfitte per Giocatore</h3>
        ${playerStatsTable}
        <h3>Classifica Squadre (combinazioni vincenti)</h3>
        ${teamStatsTable}
    `;
}

// Call displayStatistics when the page loads
window.onload = displayStatistics;
