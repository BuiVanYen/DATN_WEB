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
