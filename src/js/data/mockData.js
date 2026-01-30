/**
 * Bộ sinh dữ liệu Giả lập (Mock Data)
 * Tạo dữ liệu ngẫu nhiên hợp lý cho "Chế độ Demo"
 */
import { SENSOR_SCHEMA } from './contracts.js';

// Random float trong khoảng
const random = (min, max) => Math.random() * (max - min) + min;

// Tạo một bản ghi cảm biến thực tế
export const generateSensorData = () => {
    return {
        timestamp: new Date().toISOString(),
        t_air: parseFloat(random(22, 32).toFixed(1)),
        rh: parseFloat(random(55, 80).toFixed(1)),
        t_water: parseFloat(random(20, 25).toFixed(1)),
        ph: parseFloat(random(5.8, 6.8).toFixed(2)),
        ec: parseFloat(random(1.2, 2.2).toFixed(2)),
        light: Math.floor(random(5000, 15000)),
        water_level: Math.floor(random(60, 95)),
        pump_state: Math.random() > 0.5,
        fan_state: Math.random() > 0.5,
        light_state: true
    };
};

export const generateMockHistory = (points = 20) => {
    const history = [];
    const now = new Date();
    for (let i = points; i > 0; i--) {
        const t = new Date(now.getTime() - i * 60000); // trừ i phút
        const d = generateSensorData();
        d.timestamp = t.toISOString();
        history.push(d);
    }
    return history;
};

export const MOCK_ALERTS = [
    { id: '1', timestamp: new Date().toISOString(), severity: 'warning', message: 'Độ pH hơi cao (6.8)', source: 'Hệ thống pH', status: 'open' },
    { id: '2', timestamp: new Date(Date.now() - 3600000).toISOString(), severity: 'critical', message: 'Mực nước thấp (<40%)', source: 'Bồn chứa', status: 'acked', acked_by: 'QTV' }
];
