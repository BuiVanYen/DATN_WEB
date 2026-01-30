/**
 * Cấu hình Chung & Các Ngưỡng
 */

export const CONFIG = {
    API_BASE_URL: 'http://localhost:5000/api', // Hoặc http://raspberrypi.local/api
    WS_URL: 'ws://localhost:5000/ws',
    DEMO_MODE: true, // Mặc định là true (chế độ demo)
    REFRESH_RATE_MS: 3000, // 3 giây
    CHART_HISTORY_POINTS: 50, // Giữ lại 50 điểm lịch sử biểu đồ
    ALERT_COOLDOWN_MS: 300000 // 5 phút (thời gian chờ cảnh báo lại)
};

// Ngưỡng cho các chỉ báo trực quan (Xanh/Vàng/Đỏ)
// Theo Giai đoạn sinh trưởng (Mặc định: 'vegetative' - phát triển thân lá)
export const THRESHOLDS = {
    vegetative: {
        ph: { min: 5.5, max: 6.5, critical_low: 5.0, critical_high: 7.0 },
        ec: { min: 1.2, max: 2.0, critical_low: 0.8, critical_high: 2.5 },
        t_water: { min: 18, max: 26, critical_low: 15, critical_high: 30 },
        t_air: { min: 18, max: 28, critical_low: 10, critical_high: 35 },
        rh: { min: 50, max: 70, critical_low: 40, critical_high: 85 }
    },
    flowering: {
        ph: { min: 6.0, max: 6.8 },
        ec: { min: 2.0, max: 3.0 }
        // ... ghi đè các tham số khác nếu cần
    }
};

/**
 * Hàm hỗ trợ xác định màu trạng thái dựa trên giá trị
 * @param {string} metric - vd: 'ph'
 * @param {number} value 
 * @param {string} stage - mặc định 'vegetative'
 * @returns {'ok' | 'warning' | 'critical'}
 */
export const getStatus = (metric, value, stage = 'vegetative') => {
    const rules = THRESHOLDS[stage]?.[metric];
    if (!rules) return 'ok'; // No rule defined

    if (value < rules.critical_low || value > rules.critical_high) return 'critical';
    if (value < rules.min || value > rules.max) return 'warning';
    return 'ok';
};
