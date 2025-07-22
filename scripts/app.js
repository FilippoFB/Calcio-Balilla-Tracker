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
    form.reset();
    updateStatistics();
  } catch (error) {
    alert('Errore: ' + error.message);
    console.error(error);
  }
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
