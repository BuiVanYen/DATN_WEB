import { store } from "../store.js";
import { Card } from "./common/Card.js";

export class DashboardView {
    constructor(container) {
        this.container = container;
        this.cards = [];
        this.unsubscribe = null;
    }

    async mount() {
        this.container.innerHTML = `
            <div class="dashboard-defs">
                <h2 style="margin-bottom:1rem; font-size:1.1rem; color:var(--text-secondary)">Chỉ số hoạt động (KPIs)</h2>
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

        const grid = this.container.querySelector(".dashboard-grid");

        // Define Cards
        const cardDefs = [
            {
                title: "Nhiệt độ không khí",
                valueId: "t_air",
                unit: "°C",
                icon: "thermostat",
                colorVar: "--status-info",
            },
            {
                title: "Độ ẩm",
                valueId: "rh",
                unit: "%",
                icon: "water_drop",
                colorVar: "--status-info",
            },
            {
                title: "Nhiệt độ nước",
                valueId: "t_water",
                unit: "°C",
                icon: "water",
                colorVar: "--primary",
            },
            {
                title: "Độ pH",
                valueId: "ph",
                unit: "",
                icon: "science",
                colorVar: "--status-warning",
            },
            {
                title: "Độ dẫn điện (EC)",
                valueId: "ec",
                unit: "mS/cm",
                icon: "bolt",
                colorVar: "--status-warning",
            },
            {
                title: "Ánh sáng",
                valueId: "light",
                unit: "Lux",
                icon: "light_mode",
                colorVar: "--status-critical",
            },
        ];

        // Create & Append Cards
        this.cards = cardDefs.map((def) => new Card(def));
        this.cards.forEach((c) => grid.appendChild(c.element));

        // Lắng nghe dữ liệu sensor từ store
        this.unsubscribe = store.subscribe("sensors", (data) => {
            if (data) this.cards.forEach((card) => card.update(data));
        });

        // Cập nhật ngay lần đầu
        const currentData = store.getState().sensors;
        if (currentData.timestamp) {
            this.cards.forEach((card) => card.update(currentData));
        }
    }

    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}
