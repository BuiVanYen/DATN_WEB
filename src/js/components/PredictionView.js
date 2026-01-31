export class PredictionView {
    constructor(container) {
        this.container = container;
    }

    async mount() {
        this.container.innerHTML = `
            <div class="prediction-view">
                <h2 class="prediction-title">Dự đoán Tăng trưởng (Boosted Tree)</h2>
                
                <div class="prediction-grid">
                    <!-- Result Card -->
                    <div class="prediction-card">
                        <h3 class="card-label">Ngày thu hoạch Dự kiến</h3>
                        <div class="harvest-date">15/02/2026</div>
                        <div class="days-remaining">
                            <span class="badge info">Còn 16 Ngày</span>
                        </div>
                        
                        <div class="confidence-section">
                            <h4>Độ tin cậy Mô hình</h4>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width:85%;"></div>
                            </div>
                            <div class="progress-label">85% (+/- 2 ngày)</div>
                        </div>
                    </div>

                    <!-- Input Factors -->
                    <div class="prediction-card">
                        <h3>Các yếu tố Tác động Chính</h3>
                        <ul class="factors-list">
                            <li class="factor-item">
                                <span class="factor-name">
                                    <span class="material-icons-round factor-icon">thermostat</span>
                                    Nhiệt độ TB
                                </span>
                                <strong class="factor-value">24.5 °C</strong>
                            </li>
                            <li class="factor-item">
                                <span class="factor-name">
                                    <span class="material-icons-round factor-icon">light_mode</span>
                                    Giờ nắng TB
                                </span>
                                <strong class="factor-value">14.2 giờ</strong>
                            </li>
                            <li class="factor-item">
                                <span class="factor-name">
                                    <span class="material-icons-round factor-icon">science</span>
                                    Dinh dưỡng (EC)
                                </span>
                                <strong class="factor-value">1.8 mS/cm</strong>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- What If Analysis -->
                <div class="whatif-section">
                    <div class="whatif-header">
                        <span class="whatif-icon">✨</span>
                        <h3>Phân tích Tình huống (What-If)</h3>
                    </div>
                    <p class="whatif-description">Mô phỏng thay đổi ngày thu hoạch khi điều chỉnh môi trường.</p>
                    
                    <div class="whatif-controls">
                        <div class="whatif-input-group">
                            <span class="material-icons-round">add_circle</span>
                            <span>Tăng Nhiệt độ thêm 2°C?</span>
                        </div>
                        <button class="simulate-btn">
                            <span class="material-icons-round">play_arrow</span>
                            Mô phỏng ngay
                        </button>
                        <div class="whatif-result">
                            <span class="material-icons-round result-icon">schedule</span>
                            <span>Kết quả: Thu hoạch sớm 2 ngày</span>
                        </div>
                    </div>
                </div>
            </div>

        `;
    }

    destroy() { }
}
