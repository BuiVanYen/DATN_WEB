/**
 * Quản lý Trạng thái Đơn giản (Mô hình Pub/Sub)
 */
import { CONFIG } from './config.js';

class Store {
    constructor() {
        this.state = {
            appStatus: 'initializing', // initializing, ready, error, offline
            connectionMode: CONFIG.DEMO_MODE ? 'demo' : 'live',
            sensors: {}, // Lưu dữ liệu SENSOR_SCHEMA mới nhất
            alerts: [],
            user: { name: 'QTV', role: 'quan_tri_vien' },
            theme: localStorage.getItem('theme') || 'light'
        };
        this.listeners = {};
    }

    /**
     * Đăng ký lắng nghe thay đổi trạng thái
     * @param {string} key - Tên khóa trạng thái cần nghe (vd: 'sensors', 'appStatus')
     * @param {function} callback 
     */
    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
        // Có thể thêm cơ chế ID hủy đăng ký sau này
    }

    /**
     * Cập nhật trạng thái và thông báo cho listeners
     * @param {string} key 
     * @param {any} value 
     */
    setState(key, value) {
        // Kiểm tra thay đổi đơn giản (shallow check)
        if (this.state[key] === value) return;

        this.state[key] = value;

        if (this.listeners[key]) {
            this.listeners[key].forEach(cb => cb(value));
        }

        // Lưu trữ các key đặc biệt
        if (key === 'theme') {
            localStorage.setItem('theme', value);
            document.documentElement.setAttribute('data-theme', value);
        }
    }

    /**
     * Lấy bản chụp trạng thái hiện tại
     */
    getState() {
        return { ...this.state };
    }
}

export const store = new Store();

// Initialize theme immediately
document.documentElement.setAttribute('data-theme', store.state.theme);
