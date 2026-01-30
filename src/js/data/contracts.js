/**
 * Hợp đồng Dữ liệu (Định nghĩa Schema)
 * File này đóng vai trò là nguồn sự thật duy nhất cho cấu trúc phản hồi API.
 * Ngay cả khi dùng dữ liệu giả lập (Mock), phải tuân thủ nghiêm ngặt schema này.
 */

// 1. KPI / Cảm biến mới nhất
export const SENSOR_SCHEMA = {
    timestamp: "Chuỗi ISO8601",
    t_air: "số (độ C)",
    rh: "số (%)",
    t_water: "số (độ C)",
    ph: "số (0-14)",
    ec: "số (mS/cm)",
    light: "số (lux)",
    water_level: "số (cm hoặc %)",
    pump_state: "boolean (true=bật)",
    fan_state: "boolean",
    light_state: "boolean"
};

// 2. Cảnh báo
export const ALERT_SCHEMA = {
    id: "chuỗi (uuid)",
    timestamp: "Chuỗi ISO8601",
    severity: "'info' | 'warning' | 'critical' (thông tin/cảnh báo/nghiêm trọng)",
    message: "chuỗi nội dung",
    source: "chuỗi nguồn (vd: pH_Sensor)",
    status: "'open' | 'acked' | 'closed' (mở/đã xem/đóng)",
    acked_by: "chuỗi tên người ack | null"
};

// 3. Digital Twin (Bản sao số)
export const TWIN_SCHEMA = {
    real: { ...SENSOR_SCHEMA },
    expected: { ...SENSOR_SCHEMA }, // Giá trị lý tưởng từ mô hình
    error_score: "số (0-100)",
    anomalies: ["mảng chuỗi (tên trường lỗi)"],
    recommendations: [
        {
            id: "chuỗi",
            message: "chuỗi khuyến nghị",
            action_type: "chuỗi mã hành động", // 'adjust_ph', 'check_pump'
            priority: "'high' | 'medium' | 'low' (ưu tiên)"
        }
    ]
};

// 4. Dự đoán AI (Bệnh)
export const AI_DETECTION_SCHEMA = {
    id: "chuỗi",
    image_url: "chuỗi đường dẫn ảnh",
    timestamp: "ISO8601",
    predictions: [
        { label: "chuỗi tên bệnh", confidence: "số (0-1)" } // vd: "Late_Blight", 0.95
    ],
    verified: "boolean | null" // null = chưa kiểm tra, true = đúng, false = sai (dương tính giả)
};

// 5. Growth Prediction (Boosted Tree)
export const GROWTH_PREDICTION_SCHEMA = {
    current_day: "number", // days since planting
    predicted_harvest_day: "number",
    days_remaining: "number",
    biomass_est: "number (g)",
    confidence_interval: "number (+/- days)"
};
