import { DEVICES } from '../config.js';

export class ControlView {
    constructor(container) {
        this.container = container;
        this.manualMode = false;
        this.countdown = 600; // 10 mins
        this.timer = null;
        this.deviceStates = {}; // Track device states
    }

    async mount() {
        // Initialize device states
        DEVICES.forEach(dev => {
            this.deviceStates[dev.id] = false;
        });

        // Generate device cards HTML
        const devicesHtml = DEVICES.map(dev => this.renderDeviceCard(dev)).join('');

        this.container.innerHTML = `
            <div class="control-view">
                <!-- Header Section -->
                <div class="control-header">
                    <div class="control-title-section">
                        <h2 class="control-main-title">Trung tâm Điều khiển</h2>
                        <p class="control-subtitle">Quản lý và điều khiển các thiết bị trong hệ thống</p>
                    </div>
                    
                    <div class="mode-toggle-section">
                        <button id="mode-toggle-btn" class="mode-toggle-btn auto">
                            <span class="mode-icon material-icons-round">smart_toy</span>
                            <span class="mode-text">CHẾ ĐỘ TỰ ĐỘNG</span>
                            <span class="mode-indicator"></span>
                        </button>
                    </div>
                </div>

                <!-- Timer Banner (hidden by default) -->
                <div id="manual-timer-banner" class="manual-timer-banner hidden">
                    <div class="timer-content">
                        <span class="material-icons-round warning-icon">warning</span>
                        <span class="timer-text">Điều khiển thủ công sẽ tự tắt sau:</span>
                        <span id="countdown-timer" class="countdown-timer">10:00</span>
                    </div>
                    <button id="cancel-manual-btn" class="cancel-manual-btn">
                        <span class="material-icons-round">close</span>
                        Hủy
                    </button>
                </div>

                <!-- Devices Grid -->
                <div class="devices-grid">
                    ${devicesHtml}
                </div>

                <!-- Status Footer -->
                <div class="control-footer">
                    <div class="status-indicator">
                        <span class="status-dot online"></span>
                        <span>Tất cả thiết bị đang hoạt động bình thường</span>
                    </div>
                </div>
            </div>

            <style>
                .control-view {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 0.5rem;
                }

                /* Header */
                .control-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .control-main-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 0.25rem;
                }

                .control-subtitle {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }

                /* Mode Toggle Button */
                .mode-toggle-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.875rem 1.5rem;
                    border: none;
                    border-radius: 50px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .mode-toggle-btn.auto {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
                }

                .mode-toggle-btn.manual {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
                    animation: pulse-warning 2s infinite;
                }

                .mode-toggle-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
                }

                .mode-toggle-btn.manual:hover {
                    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
                }

                .mode-icon {
                    font-size: 1.5rem;
                }

                .mode-indicator {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: white;
                    animation: blink 1.5s infinite;
                }

                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }

                @keyframes pulse-warning {
                    0%, 100% { box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); }
                    50% { box-shadow: 0 4px 25px rgba(245, 158, 11, 0.6); }
                }

                /* Timer Banner */
                .manual-timer-banner {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border: 1px solid #f59e0b;
                    border-radius: var(--radius-md);
                    padding: 1rem 1.5rem;
                    margin-bottom: 2rem;
                    animation: slideDown 0.3s ease-out;
                }

                .manual-timer-banner.hidden {
                    display: none;
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .timer-content {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: #92400e;
                }

                .warning-icon {
                    color: #f59e0b;
                    font-size: 1.5rem;
                }

                .countdown-timer {
                    font-size: 1.5rem;
                    font-weight: 700;
                    font-family: 'Courier New', monospace;
                    color: #d97706;
                    background: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: var(--radius-sm);
                }

                .cancel-manual-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: #dc2626;
                    color: white;
                    border: none;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .cancel-manual-btn:hover {
                    background: #b91c1c;
                    transform: scale(1.05);
                }

                /* Devices Grid */
                .devices-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                /* Device Card */
                .device-card {
                    background: var(--bg-surface);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    border: 2px solid transparent;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .device-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, var(--device-color, var(--primary)) 0%, transparent 100%);
                    opacity: 0.5;
                    transition: opacity 0.3s;
                }

                .device-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    border-color: var(--primary-light);
                }

                .device-card.active {
                    border-color: var(--device-color, var(--status-ok));
                    box-shadow: 0 0 30px rgba(16, 185, 129, 0.2);
                }

                .device-card.active::before {
                    opacity: 1;
                    background: linear-gradient(90deg, var(--device-color, var(--status-ok)) 0%, var(--device-color, var(--status-ok)) 100%);
                }

                .device-card.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                .device-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.25rem;
                }

                .device-icon-wrapper {
                    width: 60px;
                    height: 60px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--device-color, var(--primary)) 0%, var(--device-color-light, var(--primary-light)) 100%);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s;
                }

                .device-card.active .device-icon-wrapper {
                    transform: scale(1.1);
                    box-shadow: 0 6px 25px rgba(16, 185, 129, 0.3);
                }

                .device-icon {
                    font-size: 2rem;
                    color: white;
                }

                .device-status-badge {
                    padding: 0.35rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .device-status-badge.off {
                    background: var(--bg-muted);
                    color: var(--text-secondary);
                }

                .device-status-badge.on {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    animation: pulse-on 2s infinite;
                }

                @keyframes pulse-on {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
                }

                .device-info {
                    margin-bottom: 1.25rem;
                }

                .device-name {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--text-main);
                    margin-bottom: 0.25rem;
                }

                .device-description {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                /* Toggle Switch */
                .device-toggle {
                    width: 100%;
                    height: 48px;
                    border-radius: 24px;
                    border: none;
                    cursor: pointer;
                    font-size: 0.95rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .device-toggle.off {
                    background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
                    color: #6b7280;
                }

                .device-toggle.on {
                    background: linear-gradient(135deg, var(--device-color, #10b981) 0%, var(--device-color-dark, #059669) 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
                }

                .device-toggle:hover {
                    transform: scale(1.02);
                }

                .device-toggle:active {
                    transform: scale(0.98);
                }

                .device-toggle .toggle-icon {
                    font-size: 1.25rem;
                }

                /* Footer */
                .control-footer {
                    display: flex;
                    justify-content: center;
                    padding-top: 1rem;
                    border-top: 1px solid var(--border-color);
                }

                .status-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }

                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: var(--status-ok);
                    animation: pulse-dot 2s infinite;
                }

                @keyframes pulse-dot {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    50% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .control-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .devices-grid {
                        grid-template-columns: 1fr;
                    }

                    .manual-timer-banner {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                }
            </style>
        `;

        this.bindEvents();
    }

    renderDeviceCard(device) {
        // Define colors for each device type
        const colorMap = {
            'pump': { color: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
            'fan': { color: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed' },
            'led': { color: '#f59e0b', light: '#fbbf24', dark: '#d97706' }
        };

        const colors = colorMap[device.id] || { color: '#10b981', light: '#34d399', dark: '#059669' };

        return `
            <div class="device-card disabled" data-device-id="${device.id}" 
                 style="--device-color: ${colors.color}; --device-color-light: ${colors.light}; --device-color-dark: ${colors.dark};">
                <div class="device-header">
                    <div class="device-icon-wrapper">
                        <span class="device-icon material-icons-round">${device.icon}</span>
                    </div>
                    <span class="device-status-badge off">TẮT</span>
                </div>
                <div class="device-info">
                    <div class="device-name">${device.name}</div>
                    <div class="device-description">${this.getDeviceDescription(device.id)}</div>
                </div>
                <button class="device-toggle off" data-device-id="${device.id}">
                    <span class="toggle-icon material-icons-round">power_settings_new</span>
                    <span class="toggle-text">BẬT THIẾT BỊ</span>
                </button>
            </div>
        `;
    }

    getDeviceDescription(deviceId) {
        const descriptions = {
            'pump': 'Bơm dung dịch dinh dưỡng cho cây trồng',
            'fan': 'Quạt thông gió và làm mát nhà kính',
            'led': 'Đèn LED chiếu sáng bổ sung cho cây'
        };
        return descriptions[deviceId] || 'Thiết bị điều khiển';
    }

    bindEvents() {
        const modeBtn = this.container.querySelector('#mode-toggle-btn');
        const timerBanner = this.container.querySelector('#manual-timer-banner');
        const cancelBtn = this.container.querySelector('#cancel-manual-btn');
        const deviceCards = this.container.querySelectorAll('.device-card');
        const deviceToggles = this.container.querySelectorAll('.device-toggle');

        // Mode toggle button
        modeBtn.addEventListener('click', () => {
            if (!this.manualMode) {
                // Switch to manual mode
                const confirm = window.confirm(
                    "⚠️ CẢNH BÁO: Chuyển sang chế độ Thủ công sẽ tạm dừng hệ thống tự động trong 10 phút.\n\nBạn có chắc chắn không?"
                );
                if (!confirm) return;

                this.manualMode = true;
                modeBtn.classList.remove('auto');
                modeBtn.classList.add('manual');
                modeBtn.querySelector('.mode-icon').textContent = 'front_hand';
                modeBtn.querySelector('.mode-text').textContent = 'CHẾ ĐỘ THỦ CÔNG';

                timerBanner.classList.remove('hidden');
                deviceCards.forEach(card => card.classList.remove('disabled'));

                this.startTimer();
            } else {
                this.switchToAutoMode();
            }
        });

        // Cancel manual mode
        cancelBtn.addEventListener('click', () => {
            this.switchToAutoMode();
        });

        // Device toggle buttons
        deviceToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                if (!this.manualMode) return;

                const deviceId = e.currentTarget.dataset.deviceId;
                const card = this.container.querySelector(`.device-card[data-device-id="${deviceId}"]`);
                const badge = card.querySelector('.device-status-badge');
                const toggleText = toggle.querySelector('.toggle-text');
                const toggleIcon = toggle.querySelector('.toggle-icon');

                this.deviceStates[deviceId] = !this.deviceStates[deviceId];
                const isOn = this.deviceStates[deviceId];

                // Update UI
                card.classList.toggle('active', isOn);
                toggle.classList.toggle('on', isOn);
                toggle.classList.toggle('off', !isOn);
                badge.classList.toggle('on', isOn);
                badge.classList.toggle('off', !isOn);
                badge.textContent = isOn ? 'BẬT' : 'TẮT';
                toggleText.textContent = isOn ? 'TẮT THIẾT BỊ' : 'BẬT THIẾT BỊ';
                toggleIcon.textContent = isOn ? 'power_off' : 'power_settings_new';

                // Log action (would send to backend in real app)
                console.log(`Device ${deviceId} turned ${isOn ? 'ON' : 'OFF'}`);
            });
        });
    }

    switchToAutoMode() {
        const modeBtn = this.container.querySelector('#mode-toggle-btn');
        const timerBanner = this.container.querySelector('#manual-timer-banner');
        const deviceCards = this.container.querySelectorAll('.device-card');

        this.manualMode = false;
        modeBtn.classList.remove('manual');
        modeBtn.classList.add('auto');
        modeBtn.querySelector('.mode-icon').textContent = 'smart_toy';
        modeBtn.querySelector('.mode-text').textContent = 'CHẾ ĐỘ TỰ ĐỘNG';

        timerBanner.classList.add('hidden');
        deviceCards.forEach(card => card.classList.add('disabled'));

        this.stopTimer();

        // Reset all devices
        this.resetDevices();
    }

    resetDevices() {
        Object.keys(this.deviceStates).forEach(deviceId => {
            this.deviceStates[deviceId] = false;
            const card = this.container.querySelector(`.device-card[data-device-id="${deviceId}"]`);
            if (card) {
                const toggle = card.querySelector('.device-toggle');
                const badge = card.querySelector('.device-status-badge');
                const toggleText = toggle.querySelector('.toggle-text');
                const toggleIcon = toggle.querySelector('.toggle-icon');

                card.classList.remove('active');
                toggle.classList.remove('on');
                toggle.classList.add('off');
                badge.classList.remove('on');
                badge.classList.add('off');
                badge.textContent = 'TẮT';
                toggleText.textContent = 'BẬT THIẾT BỊ';
                toggleIcon.textContent = 'power_settings_new';
            }
        });
    }

    startTimer() {
        this.countdown = 600;
        this.updateTimerDisplay();
        this.timer = setInterval(() => {
            this.countdown--;
            this.updateTimerDisplay();
            if (this.countdown <= 0) {
                this.switchToAutoMode();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateTimerDisplay() {
        const timerEl = this.container.querySelector('#countdown-timer');
        if (timerEl) {
            const m = Math.floor(this.countdown / 60);
            const s = this.countdown % 60;
            timerEl.textContent = `${m}:${s < 10 ? '0' + s : s}`;
        }
    }

    destroy() {
        this.stopTimer();
    }
}
