# Poli Balilla Tracker

## Overview
The Poli Balilla Tracker is a web application designed to track and analyze matches of the Poli Balilla game. It allows users to input match data, which is then stored in Firebase Firestore. The application provides statistical analysis of the match data, enhancing the user experience with a dynamic interface.

## Features
- **Match Data Entry**: Users can enter details of each match, including players and scores.
- **Firebase Integration**: All match data is stored in Firebase Firestore for easy access and management.
- **Statistical Analysis**: The application calculates and displays various statistics, such as win/loss ratios and average goals per match.
- **User Interface Enhancements**: The UI is designed to be user-friendly, with dynamic updates based on user interactions.

## Project Structure
```
poli-balilla-tracker
├── src
│   ├── index.html          # Main HTML document for the application
│   ├── styles
│   │   └── main.css       # CSS styles for the application
│   ├── scripts
│   │   ├── app.js         # Main JavaScript logic for handling form submissions
│   │   ├── stats.js       # JavaScript for statistical analysis of match data
│   │   └── ui.js          # JavaScript for user interface enhancements
│   └── assets
│       └── favicon.ico     # Favicon for the web application
├── package.json            # Configuration file for npm
└── README.md               # Documentation for the project
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd poli-balilla-tracker
   ```
3. Install the necessary dependencies:
   ```
   npm install
   ```

## Usage
1. Open `src/index.html` in a web browser.
2. Fill out the match form with the required details.
3. Click "Salva partita" to save the match data.
4. View statistics and match history as they are dynamically updated.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.
