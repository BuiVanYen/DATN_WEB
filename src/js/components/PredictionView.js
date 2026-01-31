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

            <style>
                .prediction-view {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .prediction-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 2rem;
                    color: var(--text-main);
                }

                .prediction-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                }

                .prediction-card {
                    background: var(--bg-surface);
                    padding: 2rem;
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--border-color);
                    transition: all 0.3s ease;
                }

                .prediction-card:hover {
                    box-shadow: var(--shadow-hover);
                    transform: translateY(-2px);
                }

                .card-label {
                    color: var(--text-secondary);
                    font-size: 1rem;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                }

                .harvest-date {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--primary);
                }

                .days-remaining {
                    margin-top: 0.75rem;
                }

                .badge.info {
                    background: var(--status-info);
                    color: white;
                    padding: 0.35rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .confidence-section {
                    margin-top: 2rem;
                }

                .confidence-section h4 {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    margin-bottom: 0.5rem;
                }

                .progress-bar {
                    background: var(--bg-muted);
                    height: 10px;
                    border-radius: 5px;
                    overflow: hidden;
                }

                .progress-fill {
                    background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%);
                    height: 100%;
                    border-radius: 5px;
                    transition: width 0.5s ease;
                }

                .progress-label {
                    text-align: right;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-top: 0.35rem;
                }

                .factors-list {
                    list-style: none;
                    margin-top: 1.25rem;
                    padding: 0;
                }

                .factor-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 0;
                    border-bottom: 1px solid var(--border-color);
                }

                .factor-item:last-child {
                    border-bottom: none;
                }

                .factor-name {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-secondary);
                }

                .factor-icon {
                    font-size: 1.25rem;
                    color: var(--primary);
                }

                .factor-value {
                    color: var(--text-main);
                    font-size: 1.1rem;
                }

                /* What-If Section - Dark Mode Compatible */
                .whatif-section {
                    margin-top: 2rem;
                    background: var(--bg-surface);
                    border: 1px solid var(--primary);
                    border-radius: var(--radius-md);
                    padding: 1.5rem;
                    position: relative;
                    overflow: hidden;
                }

                .whatif-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 50%, var(--primary) 100%);
                }

                .whatif-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                }

                .whatif-icon {
                    font-size: 1.5rem;
                }

                .whatif-header h3 {
                    color: var(--text-main);
                    font-size: 1.1rem;
                    margin: 0;
                }

                .whatif-description {
                    color: var(--text-secondary);
                    margin-bottom: 1.25rem;
                }

                .whatif-controls {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    align-items: center;
                }

                .whatif-input-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-main);
                    background: var(--bg-muted);
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-sm);
                }

                .whatif-input-group .material-icons-round {
                    color: var(--primary);
                    font-size: 1.25rem;
                }

                .simulate-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
                    color: white;
                    border: none;
                    padding: 0.65rem 1.25rem;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 10px rgba(46, 125, 50, 0.3);
                }

                .simulate-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(46, 125, 50, 0.4);
                }

                .simulate-btn .material-icons-round {
                    font-size: 1.25rem;
                }

                .whatif-result {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--status-ok);
                    font-weight: 500;
                    background: rgba(16, 185, 129, 0.1);
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-sm);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                }

                .result-icon {
                    font-size: 1.25rem;
                }

                @media (max-width: 768px) {
                    .whatif-controls {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .whatif-input-group,
                    .simulate-btn,
                    .whatif-result {
                        width: 100%;
                        justify-content: center;
                    }
                }
            </style>
        `;
    }

    destroy() { }
}
