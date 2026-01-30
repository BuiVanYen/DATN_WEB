import { store } from '../store.js';

export class DigitalTwinView {
    constructor(container) {
        this.container = container;
        this.unsubscribe = null;
    }

    async mount() {
        this.container.innerHTML = `
           <div style="display:grid; grid-template-columns: 2fr 1fr; gap:2rem;">
                <!-- Left: Twin vs Real Comparison -->
                <div>
                   <h2>Phân tích Bản sao Số (Digital Twin)</h2>
                   <div style="margin-top:1rem; display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                        <!-- Real Block -->
                        <div class="twin-card real">
                            <h3>Thực tế (Real-time)</h3>
                            <div class="twin-row">
                                <span>pH</span>
                                <span class="val" id="real-ph">--</span>
                            </div>
                            <div class="twin-row">
                                <span>EC</span>
                                <span class="val" id="real-ec">--</span>
                            </div>
                            <div class="twin-row">
                                <span>T_Nước</span>
                                <span class="val" id="real-tw">--</span>
                            </div>
                        </div>

                        <!-- Expected Block -->
                        <div class="twin-card expected">
                            <h3>Mô hình Chuẩn (Expected)</h3>
                             <div class="twin-row">
                                <span>pH</span>
                                <span class="val">6.0 - 6.5</span>
                            </div>
                            <div class="twin-row">
                                <span>EC</span>
                                <span class="val">1.8 - 2.2</span>
                            </div>
                             <div class="twin-row">
                                <span>T_Nước</span>
                                <span class="val">22.0 - 24.0</span>
                            </div>
                        </div>
                   </div>
                   
                   <div style="margin-top:2rem;">
                        <h3>Biểu đồ Sai lệch (Error Deviation)</h3>
                        <div style="background:var(--bg-surface); height:200px; display:flex; align-items:center; justify-content:center; border-radius:var(--radius-md); box-shadow:var(--shadow-sm);">
                            <span style="color:var(--text-secondary)">Biểu đồ sai lệch (Đang cần API Twin)</span>
                        </div>
                   </div>
                </div>

                <!-- Right: Rules & Recommendations -->
                <div style="background:var(--bg-surface); padding:1.5rem; border-radius:var(--radius-md); box-shadow:var(--shadow-sm); height:fit-content;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h3>Điểm Hệ thống</h3>
                        <span class="badge" style="font-size:1.2rem; background:var(--status-ok);">92/100</span>
                    </div>
                    <hr style="margin:1rem 0; border:0; border-top:1px solid var(--border);">
                    
                    <h4>Khuyến nghị Hành động</h4>
                    <ul style="margin-top:1rem; list-style:none; padding:0; display:flex; flex-direction:column; gap:0.75rem;">
                         <li class="rec-item">
                            <span class="material-icons-round" style="color:var(--status-info)">info</span>
                            <span>EC hơi thấp. Đề xuất tăng DD A thêm 5ml.</span>
                         </li>
                         <li class="rec-item">
                            <span class="material-icons-round" style="color:var(--status-ok)">check</span>
                            <span>Độ pH ổn định. Không cần thao tác.</span>
                         </li>
                    </ul>
                </div>
           </div>
           
           <style>
            .twin-card {
                background: var(--bg-surface);
                padding: 1.5rem;
                border-radius: var(--radius-md);
                box-shadow: var(--shadow-sm);
                border-top: 4px solid var(--primary);
            }
            .twin-card.real { border-color: var(--status-info); }
            .twin-card.expected { border-color: var(--status-ok); } /* Mock model color */
            
            .twin-row {
                display:flex; justify-content:space-between; margin-top:0.75rem; font-size:1.1rem;
            }
            .twin-row .val { font-weight:bold; }
            
            .rec-item {
                display:flex; gap:0.5rem; align-items:start; font-size:0.9rem; color:var(--text-secondary);
                background: var(--bg-body); padding:0.5rem; border-radius:var(--radius-sm);
            }
           </style>
        `;

        this.unsubscribe = store.subscribe('sensors', (data) => this.update(data));
    }

    update(data) {
        const setBg = (id, val) => {
            const el = this.container.querySelector(id);
            if (el) el.textContent = val;
        };

        if (data.ph) setBg('#real-ph', data.ph);
        if (data.ec) setBg('#real-ec', data.ec);
        if (data.t_water) setBg('#real-tw', data.t_water);
    }

    destroy() { }
}
