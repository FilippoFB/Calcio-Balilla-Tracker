// This file contains the main JavaScript logic for handling form submissions and interacting with Firebase Firestore to save match data. 
// It initializes Firebase and sets up event listeners for user interactions.

const firebaseConfig = {
  apiKey: "AIzaSyBw5H71bU8srFZDn1JqXn3ZatKkNvOGb9k",
  authDomain: "poli-balilla.firebaseapp.com",
  projectId: "poli-balilla",
  storageBucket: "poli-balilla.appspot.com",
  messagingSenderId: "817113722105",
  appId: "1:817113722105:web:049160437912c90f15c628",
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