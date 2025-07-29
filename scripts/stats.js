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
    // Statistiche per combinazione squadra vincente e perdente
    const teamStats = {}; // { "Mario (A) & Luca (D)": { win: n, loss: n } }

    matches.forEach(match => {
        const rossoTeam = `${match.rosso_att} (A) & ${match.rosso_dif} (D)`;
        const bluTeam = `${match.blu_att} (A) & ${match.blu_dif} (D)`;

        // Inizializza squadre se non esistono
        if (!teamStats[rossoTeam]) teamStats[rossoTeam] = { win: 0, loss: 0 };
        if (!teamStats[bluTeam]) teamStats[bluTeam] = { win: 0, loss: 0 };

        // Inizializza giocatori se non esistono
        [match.rosso_att, match.rosso_dif, match.blu_att, match.blu_dif].forEach(player => {
            if (!playerStats[player]) playerStats[player] = { attWin: 0, attLoss: 0, difWin: 0, difLoss: 0 };
        });

        if (match.gol_rosso > match.gol_blu) {
            winsRosso++;
            teamStats[rossoTeam].win++;
            teamStats[bluTeam].loss++;

            playerStats[match.rosso_att].attWin++;
            playerStats[match.rosso_dif].difWin++;
            playerStats[match.blu_att].attLoss++;
            playerStats[match.blu_dif].difLoss++;
        } else if (match.gol_blu > match.gol_rosso) {
            winsBlu++;
            teamStats[bluTeam].win++;
            teamStats[rossoTeam].loss++;

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
        teamStats // <-- usa questo invece di teamWins
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

    // Colori medaglie più scuri
    const medalColors = {
        1: '#D6A800',   // oro scuro
        2: '#8a8a8a',   // argento scuro
        3: '#a97142'    // bronzo scuro
    };

    // Calcola ranking condiviso per giocatori (senza saltare numeri)
    let lastPercPlayer = null;
    let lastRankPlayer = 1;
    playerStatsArray.forEach((p, idx) => {
        if (lastPercPlayer === null || p.winPerc !== lastPercPlayer) {
            lastRankPlayer = idx + 1;
            lastPercPlayer = p.winPerc;
        }
        p.rank = lastRankPlayer;
    });

    const playerStatsTable = `
        <table>
            <thead>
                <tr>
                    <th>Ranking</th>
                    <th>Giocatore</th>
                    <th>Attacco V/S</th>
                    <th>Difesa V/S</th>
                    <th>Partite giocate</th>
                    <th>% Vittorie</th>
                </tr>
            </thead>
            <tbody>
                ${playerStatsArray.map(p => {
                    const color = medalColors[p.rank] ? `style="color:${medalColors[p.rank]};font-weight:bold"` : '';
                    return `<tr>
                        <td ${color}>${p.rank}</td>
                        <td ${color}>${p.player}</td>
                        <td ${color}>${p.attWin} / ${p.attLoss}</td>
                        <td ${color}>${p.difWin} / ${p.difLoss}</td>
                        <td ${color}>${p.tot}</td>
                        <td ${color}>${p.winPerc.toFixed(1)}%</td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    `;

    // Calcola array squadre con % vittorie e ranking condiviso
    const teamsArray = Object.entries(stats.teamStats).map(([team, stats]) => {
        const tot = stats.win + stats.loss;
        const perc = tot > 0 ? (stats.win / tot) * 100 : 0;
        return {
            team,
            win: stats.win,
            loss: stats.loss,
            perc
        };
    });

    // Ordina per % vittorie decrescente
    teamsArray.sort((a, b) => b.perc - a.perc);

    // Calcola ranking condiviso (senza saltare numeri, ranking sempre consecutivo)
    let lastPerc = null;
    let lastRank = 1;
    teamsArray.forEach((t, idx) => {
        if (lastPerc === null || t.perc !== lastPerc) {
            lastRank = idx + 1;
            lastPerc = t.perc;
        }
        t.rank = lastRank;
    });
    // Correggi ranking consecutivo (non saltare numeri dopo ranking condiviso)
    let currentRank = 1;
    for (let i = 0; i < teamsArray.length; i++) {
        if (i > 0 && teamsArray[i].perc !== teamsArray[i - 1].perc) {
            currentRank = i + 1;
        }
        teamsArray[i].rank = currentRank;
    }

    // Colori medaglie più scuri
    const medalColorsTeams = {
        1: '#D6A800',   // oro scuro
        2: '#8a8a8a',   // argento scuro
        3: '#a97142'    // bronzo scuro
    };

    const teamStatsTable = `
        <table>
            <thead>
                <tr>
                    <th>Ranking</th>
                    <th>Squadra (Attaccante & Difensore)</th>
                    <th>Vittorie</th>
                    <th>Sconfitte</th>
                    <th>Partite giocate</th>
                    <th>% Vittorie</th>
                </tr>
            </thead>
            <tbody>
                ${teamsArray.map(t => {
                    const color = medalColorsTeams[t.rank] ? `style="color:${medalColorsTeams[t.rank]};font-weight:bold"` : '';
                    const tot = t.win + t.loss;
                    return `<tr>
                        <td ${color}>${t.rank}</td>
                        <td ${color}>${t.team}</td>
                        <td ${color}>${t.win}</td>
                        <td ${color}>${t.loss}</td>
                        <td ${color}>${tot}</td>
                        <td ${color}>${t.perc.toFixed(1)}%</td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    `;

    // Funzioni di ordinamento
    const playerSorters = {
        vittorie: (a, b) => b.win - a.win,
        percentuale: (a, b) => b.winPerc - a.winPerc,
        punteggio: (a, b) => b.score - a.score
    };
    const teamSorters = {
        vittorie: (a, b) => b.win - a.win,
        percentuale: (a, b) => b.perc - a.perc,
        punteggio: (a, b) => b.score - a.score
    };

    // Calcola punteggio per giocatori e squadre con la nuova formula:
    // Punteggio = (((Vittorie - Sconfitte) / Partite giocate) * Math.log(Partite giocate + 1))*1000
    playerStatsArray.forEach(p => {
        p.score = p.tot > 0
            ? Math.round((((p.win - p.loss) / p.tot) * Math.log(p.tot + 1)) * 1000)
            : 0;
    });
    teamsArray.forEach(t => {
        const tot = t.win + t.loss;
        t.score = tot > 0
            ? Math.round((((t.win - t.loss) / tot) * Math.log(tot + 1)) * 1000)
            : 0;
    });

    // Dropdown per ordinamento
    const playerSortSelect = `
        <label>Ordina giocatori per:
            <select id="player-sort">
                <option value="percentuale">Percentuale vittorie</option>
                <option value="vittorie">Numero vittorie</option>
                <option value="punteggio" selected>Punteggio</option>
            </select>
        </label>
    `;
    const teamSortSelect = `
        <label>Ordina squadre per:
            <select id="team-sort">
                <option value="percentuale">Percentuale vittorie</option>
                <option value="vittorie">Numero vittorie</option>
                <option value="punteggio" selected>Punteggio</option>
            </select>
        </label>
    `;

    // Funzione per generare la tabella giocatori
    function renderPlayerTable(sortKey = "punteggio") { // <-- default punteggio
        playerStatsArray.sort(playerSorters[sortKey]);
        let lastValue = null, lastRank = 1;
        playerStatsArray.forEach((p, idx) => {
            let value = sortKey === "percentuale" ? p.winPerc : sortKey === "vittorie" ? p.win : p.score;
            if (lastValue === null || value !== lastValue) {
                lastRank = idx + 1;
                lastValue = value;
            }
            p.rank = lastRank;
        });
        // Tabella
        return `
            <table>
                <thead>
                    <tr>
                        <th>Ranking</th>
                        <th>Giocatore</th>
                        <th>Attacco V/S</th>
                        <th>Difesa V/S</th>
                        <th>Partite giocate</th>
                        <th>% Vittorie</th>
                        <th>Punteggio</th>
                    </tr>
                </thead>
                <tbody>
                    ${playerStatsArray.map(p => {
                        const color = medalColors[p.rank] ? `style="color:${medalColors[p.rank]};font-weight:bold"` : '';
                        return `<tr>
                            <td ${color}>${p.rank}</td>
                            <td ${color}>${p.player}</td>
                            <td ${color}>${p.attWin} / ${p.attLoss}</td>
                            <td ${color}>${p.difWin} / ${p.difLoss}</td>
                            <td ${color}>${p.tot}</td>
                            <td ${color}>${p.winPerc.toFixed(1)}%</td>
                            <td ${color}>${p.score}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    // Funzione per generare la tabella squadre
    function renderTeamTable(sortKey = "punteggio") { // <-- default punteggio
        teamsArray.sort(teamSorters[sortKey]);
        let lastValue = null, lastRank = 1;
        teamsArray.forEach((t, idx) => {
            let value = sortKey === "percentuale" ? t.perc : sortKey === "vittorie" ? t.win : t.score;
            if (lastValue === null || value !== lastValue) {
                lastRank = idx + 1;
                lastValue = value;
            }
            t.rank = lastRank;
        });
        return `
            <table>
                <thead>
                    <tr>
                        <th>Ranking</th>
                        <th>Squadra (Attaccante & Difensore)</th>
                        <th>Vittorie</th>
                        <th>Sconfitte</th>
                        <th>Partite giocate</th>
                        <th>% Vittorie</th>
                        <th>Punteggio</th>
                    </tr>
                </thead>
                <tbody>
                    ${teamsArray.map(t => {
                        const color = medalColorsTeams[t.rank] ? `style="color:${medalColorsTeams[t.rank]};font-weight:bold"` : '';
                        const tot = t.win + t.loss;
                        return `<tr>
                            <td ${color}>${t.rank}</td>
                            <td ${color}>${t.team}</td>
                            <td ${color}>${t.win}</td>
                            <td ${color}>${t.loss}</td>
                            <td ${color}>${tot}</td>
                            <td ${color}>${t.perc.toFixed(1)}%</td>
                            <td ${color}>${t.score}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    // Inserisci i dropdown e le tabelle nel DOM
    statsContainer.innerHTML = `
        <p><strong>Partite Totali:</strong> ${stats.totalMatches}</p>
        <p><strong class="rosso">Vittorie Rossi - Pro.File:</strong> ${stats.winsRosso}</p>
        <p><strong class="blu">Vittorie Blu - Teamcenter:</strong> ${stats.winsBlu}</p>
        <h3>Vittorie/Sconfitte per Giocatore</h3>
        ${playerSortSelect}
        <div id="player-table-wrap">${renderPlayerTable()}</div>
        <h3>Classifica Squadre (combinazioni vincenti e perdenti)</h3>
        ${teamSortSelect}
        <div id="team-table-wrap">${renderTeamTable()}</div>
    `;

    // Eventi per i dropdown
    document.getElementById('player-sort').addEventListener('change', e => {
        document.getElementById('player-table-wrap').innerHTML = renderPlayerTable(e.target.value);
    });
    document.getElementById('team-sort').addEventListener('change', e => {
        document.getElementById('team-table-wrap').innerHTML = renderTeamTable(e.target.value);
    });
}

// Call displayStatistics when the page loads
window.onload = displayStatistics;
