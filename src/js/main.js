/**
 * Main Entry Point - Final Assembly
 */
import { store } from './store.js';
import { Router } from './router.js';
import { DataService } from './data/dataService.js';
import { Card } from './components/common/Card.js';

// Views
import { RealtimeView } from './components/RealtimeView.js';
import { TrendsView } from './components/TrendsView.js';
import { DigitalTwinView } from './components/DigitalTwinView.js';
import { ControlView } from './components/ControlView.js';
import { AIView } from './components/AIView.js';
import { PredictionView } from './components/PredictionView.js';

// Dashboard View (Inline for simplicity)
class DashboardView {
    constructor(container) {
        this.container = container;
        this.cards = [];
        this.unsubscribe = null;
    }

    async mount() {
        this.container.innerHTML = `
            <div class="dashboard-defs">
                <h2 style="margin-bottom:1rem; font-size:1.1rem; color:var(--text-secondary)">Chỉ số Hoạt động Chính (KPIs)</h2>
                <div class="dashboard-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
                </div>
            </div>
            
            <div style="margin-top: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:1.5rem;">
               <div style="background:var(--bg-surface); padding:1.5rem; border-radius:var(--radius-md); box-shadow:var(--shadow-sm)">
                    <h3>Trạng thái Hệ thống</h3>
                    <div style="display:flex; align-items:center; gap:0.5rem; margin-top:1rem;">
                        <span class="material-icons-round" style="color:var(--status-ok); font-size:3rem;">check_circle</span>
                        <div>
                            <div style="font-weight:bold; font-size:1.2rem;">Hệ thống Ổn định</div>
                            <div style="color:var(--text-secondary)">Tất cả cảm biến hoạt động trong ngưỡng cho phép</div>
                        </div>
                    </div>
               </div>
               
               <div style="background:var(--bg-surface); padding:1.5rem; border-radius:var(--radius-md); box-shadow:var(--shadow-sm)">
                    <h3>Kết quả AI (Mới nhất)</h3>
                    <div style="margin-top:1rem; display:flex; gap:1rem; align-items:center;">
                         <div style="width:60px; height:60px; background:#e2e8f0; border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; color:var(--text-secondary)">
                            <span class="material-icons-round">image</span>
                         </div>
                         <div>
                            <div>Không phát hiện bệnh</div>
                            <small class="badge" style="background:var(--status-ok)">Độ tin cậy: 98%</small>
                         </div>
                    </div>
               </div>
            </div>
        `;
        const grid = this.container.querySelector('.dashboard-grid');

        // Define Cards
        const cardDefs = [
            { title: 'Nhiệt độ KK', valueId: 't_air', unit: '°C', icon: 'thermostat', colorVar: '--status-info' },
            { title: 'Độ ẩm', valueId: 'rh', unit: '%', icon: 'water_drop', colorVar: '--status-info' },
            { title: 'Nhiệt độ nước', valueId: 't_water', unit: '°C', icon: 'water', colorVar: '--primary' },
            { title: 'Độ pH', valueId: 'ph', unit: '', icon: 'science', colorVar: '--status-warning' },
            { title: 'Độ dẫn điện (EC)', valueId: 'ec', unit: 'mS/cm', icon: 'bolt', colorVar: '--status-warning' },
            { title: 'Ánh sáng', valueId: 'light', unit: 'Lux', icon: 'light_mode', colorVar: '--status-critical' }
        ];

        // Create & Append Cards
        this.cards = cardDefs.map(def => new Card(def));
        this.cards.forEach(c => grid.appendChild(c.element));

        // Subscribe to Store
        this.unsubscribe = store.subscribe('sensors', (data) => {
            if (data) this.cards.forEach(card => card.update(data));
        });

        // Trigger initial update
        const currentData = store.getState().sensors;
        if (currentData.timestamp) {
            this.cards.forEach(card => card.update(currentData));
        }
    }

    destroy() {
        // Cleanup would go here
    }
}

class PlaceholderView {
    constructor(container) { this.container = container; }
    async mount() { this.container.innerHTML = `<h2>Coming Soon</h2>`; }
}

// Initialize System
async function initApp() {
    console.log('Initializing Smart Agriculture App...');

    // 1. Setup Data Service (Demo Mode Default)
    const dataService = new DataService();
    dataService.start();

    // 2. Setup Router
    // Mapped to specific Classes
    const routes = {
        '/dashboard': DashboardView,
        '/realtime': RealtimeView,
        '/trends': TrendsView,
        '/ai': AIView,
        '/prediction': PredictionView,
        '/twin': DigitalTwinView,
        '/control': ControlView,
        '/alerts': PlaceholderView, // Left as placeholder for now or straightforward list
        '/settings': PlaceholderView
    };

    window.router = new Router(routes);

    // 3. UI Bindings
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = store.state.theme;
            const next = current === 'dark' ? 'light' : 'dark';
            store.setState('theme', next);
        });
    }

    // Clock
    setInterval(() => {
        const now = new Date();
        const el = document.getElementById('current-time');
        if (el) el.textContent = now.toLocaleTimeString();
    }, 1000);

    // Connection Status
    store.subscribe('connectionMode', (mode) => {
        const el = document.getElementById('connection-text');
        const dot = document.querySelector('.status-dot');
        if (el && dot) {
            if (mode === 'demo') {
                el.textContent = 'Demo Mode';
                dot.style.color = 'var(--status-warning)';
            } else {
                el.textContent = 'Live System';
                dot.style.color = 'var(--status-ok)';
            }
        }
    });

    console.log('App Initialized.');
}

document.addEventListener('DOMContentLoaded', initApp);
