/**
 * Dịch vụ Dữ liệu
 * Xử lý việc lấy dữ liệu (WebSocket vs Mock) và cập nhật Store toàn cục.
 */
import { store } from '../store.js';
import { CONFIG } from '../config.js';
import { generateSensorData } from './mockData.js';

export class DataService {
    constructor() {
        this.intervalId = null;
        this.socket = null;
        this.mode = CONFIG.DEMO_MODE ? 'demo' : 'live';
    }

    start() {
        console.log(`Đang chạy DataService ở chế độ: ${this.mode.toUpperCase()}...`);
        if (this.mode === 'demo') {
            this.startDemoMode();
        } else {
            this.connectWebSocket();
        }
    }

    /**
     * Chế độ Demo: Sinh dữ liệu giả lập theo chu kỳ
     */
    startDemoMode() {
        // Lấy lần đầu
        this.updateStore(generateSensorData());

        // Cập nhật định kỳ
        this.intervalId = setInterval(() => {
            const data = generateSensorData();
            this.updateStore(data);
        }, CONFIG.REFRESH_RATE_MS);

        store.setState('connectionMode', 'demo');
        store.setState('appStatus', 'ready');
    }

    /**
     * Chế độ Live: Kết nối tới WebSocket
     */
    connectWebSocket() {
        try {
            this.socket = new WebSocket(CONFIG.WS_URL);

            this.socket.onopen = () => {
                console.log('WS Đã kết nối');
                store.setState('appStatus', 'ready');
                store.setState('connectionMode', 'live');
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // Validate/Biến đổi dữ liệu nếu cần khớp SENSOR_SCHEMA
                    this.updateStore(data);
                } catch (e) {
                    console.error('Lỗi parse dữ liệu WS', e);
                }
            };

            this.socket.onerror = (e) => {
                console.error('Lỗi WS', e);
                this.handleConnectionFail();
            };

            this.socket.onclose = () => {
                console.warn('WS Đã đóng');
                this.handleConnectionFail();
            };

        } catch (e) {
            this.handleConnectionFail();
        }
    }

    handleConnectionFail() {
        store.setState('appStatus', 'offline');

        // Tự động chuyển về Demo nếu cấu hình
        console.log('Đang chuyển sang chế độ Demo dự phòng...');
        if (this.socket) this.socket.close();

        // Thông báo cho user (Toast) và chuyển đổi
        this.mode = 'demo';
        this.startDemoMode();
    }

    updateStore(data) {
        // Cập nhật trạng thái cảm biến
        store.setState('sensors', data);

        // Có thể phát hiện cảnh báo tại đây nếu backend không gửi
        // this.checkThresholds(data);
    }

    switchMode(newMode) {
        if (this.mode === newMode) return;

        // Cleanup
        if (this.intervalId) clearInterval(this.intervalId);
        if (this.socket) this.socket.close();

        this.mode = newMode;
        this.start();
    }
}
