export class ControlView {
    constructor(container) {
        this.container = container;
        this.manualMode = false;
        this.countdown = 600; // 10 mins
        this.timer = null;
    }

    async mount() {
        this.container.innerHTML = `
            <div style="max-width:800px; margin:0 auto;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
                    <h2>Trung tâm Điều khiển</h2>
                    <div style="display:flex; align-items:center; gap:1rem;">
                        <span id="mode-badge" class="badge" style="background:var(--status-ok); font-size:1rem; padding:0.5rem 1rem;">CHẾ ĐỘ TỰ ĐỘNG</span>
                        <label class="switch">
                            <input type="checkbox" id="safety-toggle">
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>

                <div id="controls-panel" class="disabled-overlay">
                    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:1.5rem;">
                        ${this.renderBtn('Bơm nước', 'water_drop')}
                        ${this.renderBtn('Quạt gió', 'air')}
                        ${this.renderBtn('Đèn LED', 'light_mode')}
                    </div>
                    
                    <div id="countdown-area" style="margin-top:2rem; text-align:center; opacity:0; transition:opacity 0.3s;">
                         <p>Điều khiển thủ công sẽ tự tắt sau: <span id="timer" style="font-weight:bold; font-size:1.5rem; font-family:monospace;">10:00</span></p>
                    </div>
                </div>
            </div>

            <style>
                .switch {
                    position: relative; display: inline-block; width: 60px; height: 34px;
                }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider {
                    position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
                    background-color: #ccc; transition: .4s; border-radius: 34px;
                }
                .slider:before {
                    position: absolute; content: ""; height: 26px; width: 26px;
                    left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;
                }
                input:checked + .slider { background-color: var(--status-warning); } /* Orange for manual/danger */
                input:checked + .slider:before { transform: translateX(26px); }
                
                .disabled-overlay {
                    opacity: 0.5; pointer-events: none; transition: opacity 0.3s;
                }
                .disabled-overlay.active {
                    opacity: 1; pointer-events: all;
                }

                .ctrl-btn {
                    background: var(--bg-surface); border: 2px solid var(--border); padding: 2rem;
                    border-radius: var(--radius-md); cursor: pointer; display: flex; flex-direction: column;
                    align-items: center; gap: 1rem; transition: all 0.2s;
                }
                .ctrl-btn:hover { border-color: var(--primary); }
                .ctrl-btn.active {
                    background: var(--primary-light); border-color: var(--primary); color: var(--primary-hover);
                }
                .ctrl-btn span { font-size: 2.5rem; }
            </style>
        `;

        // Bind Events
        const toggle = this.container.querySelector('#safety-toggle');
        const panel = this.container.querySelector('#controls-panel');
        const badge = this.container.querySelector('#mode-badge');
        const timerArea = this.container.querySelector('#countdown-area');

        toggle.addEventListener('change', (e) => {
            this.manualMode = e.target.checked;
            if (this.manualMode) {
                // Confirm Dialog (Simulated)
                const confirm = window.confirm("⚠️ CẢNH BÁO: Chuyển sang chế độ Thủ công sẽ tạm dừng hệ thống tự động trong 10 phút.\n\nBạn có chắc chắn không?");
                if (!confirm) {
                    e.target.checked = false;
                    return;
                }

                panel.classList.add('active');
                badge.textContent = 'CHẾ ĐỘ THỦ CÔNG';
                badge.style.background = 'var(--status-warning)';
                timerArea.style.opacity = '1';
                this.startTimer();
            } else {
                panel.classList.remove('active');
                badge.textContent = 'AUTO MODE';
                badge.style.background = 'var(--status-ok)';
                timerArea.style.opacity = '0';
                this.stopTimer();
            }
        });

        // Button clicks
        this.container.querySelectorAll('.ctrl-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                // Could toast here
            });
        });
    }

    renderBtn(label, icon) {
        return `
            <button class="ctrl-btn">
                <span class="material-icons-round">${icon}</span>
                <strong>${label}</strong>
            </button>
        `;
    }

    startTimer() {
        this.countdown = 600;
        this.updateTimerDisplay();
        this.timer = setInterval(() => {
            this.countdown--;
            this.updateTimerDisplay();
            if (this.countdown <= 0) {
                // Revert
                this.container.querySelector('#safety-toggle').click();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) clearInterval(this.timer);
    }

    updateTimerDisplay() {
        const m = Math.floor(this.countdown / 60);
        const s = this.countdown % 60;
        this.container.querySelector('#timer').textContent = `${m}:${s < 10 ? '0' + s : s}`;
    }

    destroy() {
        this.stopTimer();
    }
}
