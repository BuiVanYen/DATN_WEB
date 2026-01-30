import { store } from '../store.js';

export class TrendsView {
    constructor(container) {
        this.container = container;
        this.chart = null;
        this.unsubscribe = null;
        this.history = []; // Local buffer
    }

    async mount() {
        this.container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2>Biểu đồ Xu hướng</h2>
                <select id="metric-select" style="padding:0.5rem; border-radius:var(--radius-sm); border:1px solid var(--border);">
                    <option value="t_air">Nhiệt độ không khí</option>
                    <option value="rh">Độ ẩm</option>
                    <option value="ph">Độ pH</option>
                    <option value="ec">Độ dẫn điện (EC)</option>
                    <option value="t_water">Nhiệt độ nước</option>
                </select>
            </div>
            <div style="margin-top:1.5rem; background:var(--bg-surface); padding:1rem; border-radius:var(--radius-md); box-shadow:var(--shadow-sm); height:400px;">
                <canvas id="trendChart"></canvas>
            </div>
        `;

        const ctx = this.container.querySelector('#trendChart').getContext('2d');
        const select = this.container.querySelector('#metric-select');

        // Initialize Chart
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Air Temp',
                    data: [],
                    borderColor: '#10b981', // Emerald 500
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { display: true },
                    y: { beginAtZero: false }
                },
                animation: false // Disable animation for perforamnce on realtime
            }
        });

        // Handle Metric Change
        select.addEventListener('change', (e) => {
            this.updateChartMetric(e.target.value);
        });

        // Subscribe
        this.unsubscribe = store.subscribe('sensors', (data) => this.addDataPoint(data));
    }

    updateChartMetric(metric) {
        this.chart.data.datasets[0].label = metric.toUpperCase();

        // Clear current data visual only, keep buffer logic if we were tracking all
        // For simple demo, we just clear and wait for new data or need a history buffer in Store
        this.chart.data.labels = [];
        this.chart.data.datasets[0].data = [];
        this.chart.update();
    }

    addDataPoint(data) {
        if (!this.chart) return;

        const select = this.container.querySelector('#metric-select');
        const metric = select ? select.value : 't_air';
        const val = data[metric];
        const time = new Date(data.timestamp).toLocaleTimeString();

        // Add Data
        this.chart.data.labels.push(time);
        this.chart.data.datasets[0].data.push(val);

        // Rolling Window (Keep 20 points)
        if (this.chart.data.labels.length > 20) {
            this.chart.data.labels.shift();
            this.chart.data.datasets[0].data.shift();
        }

        this.chart.update();
    }

    destroy() {
        if (this.chart) this.chart.destroy();
    }
}
