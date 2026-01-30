import { store } from '../store.js';

export class RealtimeView {
    constructor(container) {
        this.container = container;
        this.unsubscribe = null;
    }

    async mount() {
        this.container.innerHTML = `
            <h2>Dữ liệu Cảm biến Thời gian thực</h2>
            <div class="table-container" style="margin-top:1rem; background:var(--bg-surface); border-radius:var(--radius-md); box-shadow:var(--shadow-sm); overflow:hidden;">
                <table style="width:100%; border-collapse:collapse;">
                    <thead style="background:var(--primary-light); color:var(--primary-hover);">
                        <tr>
                            <th style="padding:1rem; text-align:left;">Thông số</th>
                            <th style="padding:1rem; text-align:left;">Giá trị</th>
                            <th style="padding:1rem; text-align:left;">Đơn vị</th>
                            <th style="padding:1rem; text-align:left;">Trạng thái</th>
                            <th style="padding:1rem; text-align:left;">Cập nhật lần cuối</th>
                        </tr>
                    </thead>
                    <tbody id="realtime-tbody">
                        <!-- Rows injected here -->
                    </tbody>
                </table>
            </div>
        `;

        this.tbody = this.container.querySelector('#realtime-tbody');

        // Define rows to track
        this.metrics = [
            { id: 't_air', label: 'Nhiệt độ không khí', unit: '°C' },
            { id: 'rh', label: 'Độ ẩm không khí', unit: '%' },
            { id: 't_water', label: 'Nhiệt độ dung dịch', unit: '°C' },
            { id: 'ph', label: 'Độ pH', unit: '' },
            { id: 'ec', label: 'Độ dẫn điện (EC)', unit: 'mS/cm' },
            { id: 'light', label: 'Cường độ sáng', unit: 'Lux' },
            { id: 'water_level', label: 'Mực nước bồn', unit: '%' }
        ];

        // Render initial rows
        this.metrics.forEach(m => {
            const row = document.createElement('tr');
            row.id = `row-${m.id}`;
            row.style.borderBottom = '1px solid var(--divider)';
            row.innerHTML = `
                <td style="padding:1rem; font-weight:500;">${m.label}</td>
                <td style="padding:1rem; font-weight:bold; font-size:1.1rem;" id="val-${m.id}">--</td>
                <td style="padding:1rem; color:var(--text-secondary);">${m.unit}</td>
                <td style="padding:1rem;"><span class="badge" style="background:var(--status-info)" id="status-${m.id}">Ổn định</span></td>
                <td style="padding:1rem; color:var(--text-secondary); font-size:0.9rem;" id="time-${m.id}">--</td>
            `;
            this.tbody.appendChild(row);
        });

        this.unsubscribe = store.subscribe('sensors', (data) => this.update(data));

        // Initial Update
        const current = store.getState().sensors;
        if (current.timestamp) this.update(current);
    }

    update(data) {
        const timeStr = new Date(data.timestamp).toLocaleTimeString();

        this.metrics.forEach(m => {
            const val = data[m.id];
            if (val !== undefined) {
                const valEl = this.tbody.querySelector(`#val-${m.id}`);
                const timeEl = this.tbody.querySelector(`#time-${m.id}`);

                valEl.textContent = val;
                timeEl.textContent = timeStr;

                // Simple status logic (can be upgraded with CONFIG thresholds later)
                // For now, nice visual update
                valEl.style.color = 'var(--text-main)';
            }
        });
    }

    destroy() {
        // Remove listener logic if available
    }
}
