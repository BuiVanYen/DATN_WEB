/**
 * ControlView.js - Trang Điều khiển Thiết bị
 * 
 * Chức năng: Hiển thị và điều khiển các thiết bị (Bơm, Quạt, Đèn LED)
 * Có 2 chế độ:
 *   - Tự động: Hệ thống tự điều khiển, người dùng không can thiệp được
 *   - Thủ công: Người dùng có thể bật/tắt thiết bị trong 10 phút
 */

// Import danh sách thiết bị từ file cấu hình
// DEVICES chứa thông tin: id, tên, icon của từng thiết bị
import { DEVICES } from '../config.js';

// Khai báo class ControlView - đây là "bản thiết kế" cho trang điều khiển
export class ControlView {

    /**
     * Hàm khởi tạo - chạy khi trang được tạo
     * @param {HTMLElement} container - Vùng HTML sẽ chứa nội dung trang
     */
    constructor(container) {
        // Lưu lại vùng chứa để dùng sau
        this.container = container;

        // manualMode = false nghĩa là đang ở chế độ Tự động
        // true = đang ở chế độ Thủ công
        this.manualMode = false;

        // Thời gian đếm ngược (600 giây = 10 phút)
        // Khi hết 10 phút sẽ tự động quay về chế độ Tự động
        this.countdown = 600;

        // Biến lưu bộ đếm thời gian
        this.timer = null;

        // Object lưu trạng thái BẬT/TẮT của từng thiết bị
        // Ví dụ: { pump: true, fan: false, led: true }
        this.deviceStates = {};
    }

    /**
     * Hàm mount() - Được gọi khi trang cần hiển thị
     * Tạo giao diện HTML và gắn các sự kiện click
     */
    async mount() {
        // Bước 1: Khởi tạo trạng thái tất cả thiết bị = TẮT (false)
        DEVICES.forEach(dev => {
            this.deviceStates[dev.id] = false;
        });

        // Bước 2: Tạo HTML cho từng card thiết bị
        // .map() duyệt qua từng thiết bị và gọi hàm renderDeviceCard()
        // .join('') nối tất cả lại thành 1 chuỗi HTML
        const devicesHtml = DEVICES.map(dev => this.renderDeviceCard(dev)).join('');

        // Bước 3: Đổ HTML vào vùng chứa (container)
        // Template literal (``) cho phép viết HTML nhiều dòng và chèn biến ${...}
        this.container.innerHTML = `
            <!-- Khung bao toàn bộ trang điều khiển -->
            <div class="control-view">
                
                <!-- ===== PHẦN HEADER - Tiêu đề và nút chế độ ===== -->
                <div class="control-header">
                    <!-- Bên trái: Tiêu đề chính và phụ đề -->
                    <div class="control-title-section">
                        <h2 class="control-main-title">Trung tâm Điều khiển</h2>
                        <p class="control-subtitle">Quản lý và điều khiển các thiết bị trong hệ thống</p>
                    </div>
                    
                    <!-- Bên phải: Nút chuyển chế độ Tự động / Thủ công -->
                    <div class="mode-toggle-section">
                        <!-- id="mode-toggle-btn" để JavaScript tìm và gắn sự kiện click -->
                        <!-- class="auto" là trạng thái ban đầu (chế độ Tự động) -->
                        <button id="mode-toggle-btn" class="mode-toggle-btn auto">
                            <!-- Icon robot = chế độ tự động -->
                            <span class="mode-icon material-icons-round">smart_toy</span>
                            <!-- Chữ hiển thị trên nút -->
                            <span class="mode-text">CHẾ ĐỘ TỰ ĐỘNG</span>
                            <!-- Chấm tròn nhấp nháy -->
                            <span class="mode-indicator"></span>
                        </button>
                    </div>
                </div>

                <!-- ===== THANH ĐẾM NGƯỢC - Ẩn mặc định, hiện khi ở chế độ Thủ công ===== -->
                <!-- class="hidden" làm thanh này ẩn đi ban đầu -->
                <div id="manual-timer-banner" class="manual-timer-banner hidden">
                    <div class="timer-content">
                        <!-- Icon cảnh báo màu vàng -->
                        <span class="material-icons-round warning-icon">warning</span>
                        <span class="timer-text">Điều khiển thủ công sẽ tự tắt sau:</span>
                        <!-- Đồng hồ đếm ngược, JavaScript sẽ cập nhật số này -->
                        <span id="countdown-timer" class="countdown-timer">10:00</span>
                    </div>
                    <!-- Nút Hủy để quay về chế độ Tự động ngay -->
                    <button id="cancel-manual-btn" class="cancel-manual-btn">
                        <span class="material-icons-round">close</span>
                        Hủy
                    </button>
                </div>

                <!-- ===== LƯỚI THIẾT BỊ - Chứa các card Bơm, Quạt, LED ===== -->
                <!-- devicesHtml chứa HTML của tất cả card thiết bị -->
                <div class="devices-grid">
                    ${devicesHtml}
                </div>

                <!-- ===== FOOTER - Trạng thái hệ thống ===== -->
                <div class="control-footer">
                    <div class="status-indicator">
                        <!-- Chấm xanh = hệ thống hoạt động bình thường -->
                        <span class="status-dot online"></span>
                        <span>Tất cả thiết bị đang hoạt động bình thường</span>
                    </div>
                </div>
            </div>

        `;

        // Bước 4: Gắn các sự kiện click cho các nút
        this.bindEvents();
    }

    /**
     * Tạo HTML cho 1 card thiết bị
     * @param {Object} device - Thông tin thiết bị { id, name, icon }
     * @returns {string} - Chuỗi HTML của card
     */
    renderDeviceCard(device) {
        // Bảng màu cho từng loại thiết bị
        // pump = Bơm (xanh dương), fan = Quạt (tím), led = Đèn (cam)
        const colorMap = {
            'pump': { color: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
            'fan': { color: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed' },
            'led': { color: '#f59e0b', light: '#fbbf24', dark: '#d97706' }
        };

        // Lấy màu cho thiết bị này, nếu không có thì dùng màu xanh lá mặc định
        const colors = colorMap[device.id] || { color: '#10b981', light: '#34d399', dark: '#059669' };

        // Trả về HTML của 1 card thiết bị
        return `
            <!-- Card thiết bị, class="disabled" ban đầu để vô hiệu hóa -->
            <!-- data-device-id lưu ID thiết bị để JavaScript biết đang click vào cái nào -->
            <!-- style="--device-color:..." đặt biến CSS để đổi màu theo thiết bị -->
            <div class="device-card disabled" data-device-id="${device.id}" 
                 style="--device-color: ${colors.color}; --device-color-light: ${colors.light}; --device-color-dark: ${colors.dark};">
                
                <!-- Phần đầu card: Icon và badge trạng thái -->
                <div class="device-header">
                    <!-- Khung tròn chứa icon -->
                    <div class="device-icon-wrapper">
                        <!-- Icon thiết bị (water_drop, air, light_mode) -->
                        <span class="device-icon material-icons-round">${device.icon}</span>
                    </div>
                    <!-- Badge hiển thị BẬT/TẮT -->
                    <span class="device-status-badge off">TẮT</span>
                </div>
                
                <!-- Phần giữa: Tên và mô tả thiết bị -->
                <div class="device-info">
                    <div class="device-name">${device.name}</div>
                    <div class="device-description">${this.getDeviceDescription(device.id)}</div>
                </div>
                
                <!-- Phần cuối: Nút bật/tắt thiết bị -->
                <!-- data-device-id để biết đang bấm nút của thiết bị nào -->
                <button class="device-toggle off" data-device-id="${device.id}">
                    <!-- Icon nguồn điện -->
                    <span class="toggle-icon material-icons-round">power_settings_new</span>
                    <span class="toggle-text">BẬT THIẾT BỊ</span>
                </button>
            </div>
        `;
    }

    /**
     * Lấy mô tả chi tiết cho từng thiết bị dựa vào ID
     * @param {string} deviceId - ID của thiết bị (pump, fan, led)
     * @returns {string} - Mô tả thiết bị
     */
    getDeviceDescription(deviceId) {
        // Object chứa mô tả cho từng thiết bị
        const descriptions = {
            'pump': 'Bơm dung dịch dinh dưỡng cho cây trồng',
            'fan': 'Quạt thông gió và làm mát nhà kính',
            'led': 'Đèn LED chiếu sáng bổ sung cho cây'
        };
        // Trả về mô tả, nếu không tìm thấy thì trả về text mặc định
        return descriptions[deviceId] || 'Thiết bị điều khiển';
    }

    /**
     * Gắn sự kiện click cho các nút
     * Được gọi 1 lần sau khi HTML đã được tạo
     */
    bindEvents() {
        // === Tìm các phần tử HTML cần gắn sự kiện ===

        // Nút chuyển chế độ (Tự động / Thủ công)
        const modeBtn = this.container.querySelector('#mode-toggle-btn');

        // Thanh đếm ngược
        const timerBanner = this.container.querySelector('#manual-timer-banner');

        // Nút Hủy trên thanh đếm ngược
        const cancelBtn = this.container.querySelector('#cancel-manual-btn');

        // Tất cả các card thiết bị
        const deviceCards = this.container.querySelectorAll('.device-card');

        // Tất cả các nút BẬT/TẮT thiết bị
        const deviceToggles = this.container.querySelectorAll('.device-toggle');

        // === SỰ KIỆN 1: Click nút chuyển chế độ ===
        modeBtn.addEventListener('click', () => {
            // Nếu đang ở chế độ Tự động -> chuyển sang Thủ công
            if (!this.manualMode) {
                // Hiện hộp thoại xác nhận
                const confirm = window.confirm(
                    "⚠️ CẢNH BÁO: Chuyển sang chế độ Thủ công sẽ tạm dừng hệ thống tự động trong 10 phút.\n\nBạn có chắc chắn không?"
                );
                // Nếu người dùng bấm Cancel thì không làm gì
                if (!confirm) return;

                // Đánh dấu đang ở chế độ Thủ công
                this.manualMode = true;

                // Đổi giao diện nút: xóa class 'auto', thêm class 'manual'
                modeBtn.classList.remove('auto');
                modeBtn.classList.add('manual');

                // Đổi icon thành biểu tượng bàn tay
                modeBtn.querySelector('.mode-icon').textContent = 'front_hand';

                // Đổi chữ trên nút
                modeBtn.querySelector('.mode-text').textContent = 'CHẾ ĐỘ THỦ CÔNG';

                // Hiện thanh đếm ngược (xóa class 'hidden')
                timerBanner.classList.remove('hidden');

                // Bỏ disabled cho tất cả card thiết bị (cho phép click)
                deviceCards.forEach(card => card.classList.remove('disabled'));

                // Bắt đầu đếm ngược 10 phút
                this.startTimer();
            } else {
                // Nếu đang ở chế độ Thủ công -> quay về Tự động
                this.switchToAutoMode();
            }
        });

        // === SỰ KIỆN 2: Click nút Hủy trên thanh đếm ngược ===
        cancelBtn.addEventListener('click', () => {
            // Quay về chế độ Tự động ngay lập tức
            this.switchToAutoMode();
        });

        // === SỰ KIỆN 3: Click nút BẬT/TẮT thiết bị ===
        deviceToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                // Nếu không phải chế độ Thủ công thì không cho click
                if (!this.manualMode) return;

                // Lấy ID thiết bị từ thuộc tính data-device-id
                const deviceId = e.currentTarget.dataset.deviceId;

                // Tìm card chứa thiết bị này
                const card = this.container.querySelector(`.device-card[data-device-id="${deviceId}"]`);

                // Tìm badge trạng thái và các phần tử cần cập nhật
                const badge = card.querySelector('.device-status-badge');
                const toggleText = toggle.querySelector('.toggle-text');
                const toggleIcon = toggle.querySelector('.toggle-icon');

                // Đảo trạng thái: đang TẮT -> BẬT, đang BẬT -> TẮT
                this.deviceStates[deviceId] = !this.deviceStates[deviceId];
                const isOn = this.deviceStates[deviceId];

                // === Cập nhật giao diện theo trạng thái mới ===

                // Card: thêm/xóa class 'active'
                card.classList.toggle('active', isOn);

                // Nút: thêm/xóa class 'on' và 'off'
                toggle.classList.toggle('on', isOn);
                toggle.classList.toggle('off', !isOn);

                // Badge: thêm/xóa class và đổi chữ
                badge.classList.toggle('on', isOn);
                badge.classList.toggle('off', !isOn);
                badge.textContent = isOn ? 'BẬT' : 'TẮT';

                // Nút: đổi chữ và icon
                toggleText.textContent = isOn ? 'TẮT THIẾT BỊ' : 'BẬT THIẾT BỊ';
                toggleIcon.textContent = isOn ? 'power_off' : 'power_settings_new';

                // Ghi log ra console (trong thực tế sẽ gửi lệnh đến backend)
                console.log(`Device ${deviceId} turned ${isOn ? 'ON' : 'OFF'}`);
            });
        });
    }

    /**
     * Chuyển về chế độ Tự động
     * Reset lại tất cả thiết bị và giao diện
     */
    switchToAutoMode() {
        // Tìm các phần tử cần cập nhật
        const modeBtn = this.container.querySelector('#mode-toggle-btn');
        const timerBanner = this.container.querySelector('#manual-timer-banner');
        const deviceCards = this.container.querySelectorAll('.device-card');

        // Đánh dấu đang ở chế độ Tự động
        this.manualMode = false;

        // Đổi giao diện nút về trạng thái Tự động
        modeBtn.classList.remove('manual');
        modeBtn.classList.add('auto');
        modeBtn.querySelector('.mode-icon').textContent = 'smart_toy';
        modeBtn.querySelector('.mode-text').textContent = 'CHẾ ĐỘ TỰ ĐỘNG';

        // Ẩn thanh đếm ngược
        timerBanner.classList.add('hidden');

        // Vô hiệu hóa tất cả card thiết bị (không cho click)
        deviceCards.forEach(card => card.classList.add('disabled'));

        // Dừng bộ đếm thời gian
        this.stopTimer();

        // Reset tất cả thiết bị về trạng thái TẮT
        this.resetDevices();
    }

    /**
     * Reset tất cả thiết bị về trạng thái TẮT
     */
    resetDevices() {
        // Duyệt qua tất cả ID thiết bị
        Object.keys(this.deviceStates).forEach(deviceId => {
            // Đặt trạng thái = TẮT
            this.deviceStates[deviceId] = false;

            // Tìm card thiết bị
            const card = this.container.querySelector(`.device-card[data-device-id="${deviceId}"]`);

            if (card) {
                // Tìm các phần tử con
                const toggle = card.querySelector('.device-toggle');
                const badge = card.querySelector('.device-status-badge');
                const toggleText = toggle.querySelector('.toggle-text');
                const toggleIcon = toggle.querySelector('.toggle-icon');

                // Reset giao diện về trạng thái TẮT
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

    /**
     * Bắt đầu đếm ngược 10 phút
     */
    startTimer() {
        // Đặt lại 600 giây (10 phút)
        this.countdown = 600;

        // Cập nhật hiển thị lần đầu
        this.updateTimerDisplay();

        // setInterval chạy hàm mỗi 1000ms (1 giây)
        this.timer = setInterval(() => {
            // Giảm 1 giây
            this.countdown--;

            // Cập nhật hiển thị
            this.updateTimerDisplay();

            // Nếu hết giờ (0 giây) thì quay về Tự động
            if (this.countdown <= 0) {
                this.switchToAutoMode();
            }
        }, 1000);
    }

    /**
     * Dừng bộ đếm thời gian
     */
    stopTimer() {
        // Nếu timer đang chạy thì dừng lại
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * Cập nhật hiển thị thời gian đếm ngược
     * Chuyển từ giây (VD: 605) thành phút:giây (VD: 10:05)
     */
    updateTimerDisplay() {
        // Tìm phần tử hiển thị thời gian
        const timerEl = this.container.querySelector('#countdown-timer');

        if (timerEl) {
            // Tính số phút (chia lấy phần nguyên)
            const m = Math.floor(this.countdown / 60);

            // Tính số giây (chia lấy phần dư)
            const s = this.countdown % 60;

            // Hiển thị theo format "M:SS" (thêm số 0 nếu giây < 10)
            timerEl.textContent = `${m}:${s < 10 ? '0' + s : s}`;
        }
    }

    /**
     * Hàm destroy() - Được gọi khi rời khỏi trang
     * Dọn dẹp tài nguyên để tránh rò rỉ bộ nhớ
     */
    destroy() {
        // Dừng bộ đếm nếu đang chạy
        this.stopTimer();
    }
}
