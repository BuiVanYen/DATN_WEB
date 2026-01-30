# Smart Agriculture Web App

## How to Run
This project uses ES Modules, so it requires a local web server to run (it will not work if you just double-click index.html).

### Option 1: Python (Recommended)
If you have Python installed:
1. Open this folder in a terminal.
2. Run:
   ```bash
   python -m http.server
   ```
3. Open your browser to: `http://localhost:8000`

### Option 2: Node.js
If you have Node.js installed:
1. Run:
   ```bash
   npx http-server .
   ```
2. Open the URL shown in the terminal.

### Option 3: VS Code Live Server
1. Install the "Live Server" extension.
2. Right-click `index.html` -> "Open with Live Server".

## Features Implemented
- **Dashboard**: Real-time KPI cards.
- **Realtime**: Live data table.
- **Trends**: Historical charts (Chart.js).
- **AI Disease**: Mock gallery with Detail Modal.
- **Prediction**: Growth prediction and What-If analysis.
- **Digital Twin**: Real vs Expected comparison.
- **Control Center**: Safety toggle and manual control simulation.
- **Demo Mode**: Automatically generates data.
