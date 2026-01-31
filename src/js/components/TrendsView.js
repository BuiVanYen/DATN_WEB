import { store } from "../store.js";

export class TrendsView {
  constructor(container) {
    this.container = container;
    this.chart = null;
    this.unsubscribe = null;
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

    const ctx = this.container.querySelector("#trendChart").getContext("2d");
    const select = this.container.querySelector("#metric-select");

    // Initial Data Load from Store
    const history = store.getState().history || [];
    const initialMetric = "t_air";

    const labels = history.map((d) =>
      new Date(d.timestamp).toLocaleTimeString(),
    );
    const dataPoints = history.map((d) => d[initialMetric]);

    // Initialize Chart
    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: this.getLabel(initialMetric),
            data: dataPoints,
            borderColor: "#10b981", // Emerald 500
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { display: true },
          y: { beginAtZero: false },
        },
        animation: false,
      },
    });

    // Handle Metric Change
    select.addEventListener("change", (e) => {
      this.updateChartMetric(e.target.value);
    });

    // Subscribe - Now we just need to append new points
    // History in store is automatically updated by store logic we just added
    this.unsubscribe = store.subscribe("sensors", (data) =>
      this.addDataPoint(data),
    );
  }

  getLabel(metric) {
    const map = {
      t_air: "Nhiệt độ không khí",
      rh: "Độ ẩm",
      ph: "Độ pH",
      ec: "Độ dẫn điện (EC)",
      t_water: "Nhiệt độ nước",
    };
    return map[metric] || metric.toUpperCase();
  }

  updateChartMetric(metric) {
    this.chart.data.datasets[0].label = this.getLabel(metric);

    // Reload data from global history
    const history = store.getState().history || [];
    this.chart.data.labels = history.map((d) =>
      new Date(d.timestamp).toLocaleTimeString(),
    );
    this.chart.data.datasets[0].data = history.map((d) => d[metric]);

    this.chart.update();
  }

  addDataPoint(data) {
    if (!this.chart) return;

    const select = this.container.querySelector("#metric-select");
    const metric = select ? select.value : "t_air";
    const val = data[metric];
    const time = new Date(data.timestamp).toLocaleTimeString();

    // Add Data to Visual Chart
    this.chart.data.labels.push(time);
    this.chart.data.datasets[0].data.push(val);

    // Visual rolling window (keep it consistent with store history size or slightly less/more as needed)
    // Store config defines history size.
    // Let's just limit visual items to avoid memory leak in long running tab,
    // though store history limit is 50.
    if (this.chart.data.labels.length > 50) {
      this.chart.data.labels.shift();
      this.chart.data.datasets[0].data.shift();
    }

    this.chart.update();
  }

  destroy() {
    if (this.chart) this.chart.destroy();
    if (this.unsubscribe) this.unsubscribe();
  }
}
