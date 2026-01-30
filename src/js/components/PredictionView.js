export class PredictionView {
    constructor(container) {
        this.container = container;
    }

    async mount() {
        this.container.innerHTML = `
            <h2>Dự đoán Tăng trưởng (Boosted Tree)</h2>
            
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:2rem; margin-top:2rem;">
                <!-- Result Card -->
                <div style="background:var(--bg-surface); padding:2rem; border-radius:var(--radius-md); box-shadow:var(--shadow-sm);">
                    <h3 style="color:var(--text-secondary); font-size:1rem;">Ngày thu hoạch Dự kiến</h3>
                    <div style="font-size:2.5rem; font-weight:bold; margin-top:0.5rem; color:var(--primary);">15/02/2026</div>
                    <div style="margin-top:0.5rem;">
                        <span class="badge" style="background:var(--status-info)">Còn 16 Ngày</span>
                    </div>
                    
                    <div style="margin-top:2rem;">
                        <h4>Độ tin cậy Mô hình</h4>
                        <div style="background:#e2e8f0; height:8px; border-radius:4px; margin-top:0.5rem; overflow:hidden;">
                            <div style="width:85%; background:var(--primary); height:100%;"></div>
                        </div>
                        <div style="text-align:right; font-size:0.8rem; margin-top:0.25rem;">85% (+/- 2 ngày)</div>
                    </div>
                </div>

                <!-- Input Factors -->
                <div style="background:var(--bg-surface); padding:2rem; border-radius:var(--radius-md); box-shadow:var(--shadow-sm);">
                    <h3>Các yếu tố Tác động Chính</h3>
                    <ul style="margin-top:1rem; list-style:none;">
                        <li style="display:flex; justify-content:space-between; padding:0.75rem 0; border-bottom:1px solid var(--divider);">
                            <span>Nhiệt độ TB</span>
                            <strong>24.5 °C</strong>
                        </li>
                        <li style="display:flex; justify-content:space-between; padding:0.75rem 0; border-bottom:1px solid var(--divider);">
                            <span>Giờ nắng TB</span>
                            <strong>14.2 giờ</strong>
                        </li>
                        <li style="display:flex; justify-content:space-between; padding:0.75rem 0; border-bottom:1px solid var(--divider);">
                            <span>Dinh dưỡng (EC)</span>
                            <strong>1.8 mS/cm</strong>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- What If Analysis -->
            <div style="margin-top:2rem; background:var(--primary-light); padding:1.5rem; border-radius:var(--radius-md);">
                <h3>✨ Phân tích Tình huống (What-If)</h3>
                <p>Mô phỏng thay đổi ngày thu hoạch khi điều chỉnh môi trường.</p>
                <div style="margin-top:1rem; display:flex; gap:1rem; align-items:center;">
                    <span>Tăng Nhiệt độ thêm 2°C?</span>
                    <button style="background:var(--primary); color:white; border:none; padding:0.5rem 1rem; border-radius:4px; cursor:pointer;">Mô phỏng ngay</button>
                    <span style="font-style:italic; color:var(--primary-hover);">Kết quả: Thu hoạch sớm 2 ngày</span>
                </div>
            </div>
        `;
    }

    destroy() { }
}
