/**
 * ===================================
 * CONFIG.JS - FILE CẤU HÌNH ỨNG DỤNG
 * ===================================
 * 
 * File này chứa tất cả các cài đặt quan trọng của hệ thống.
 * Khi cần thay đổi địa chỉ server, ngưỡng cảnh báo, v.v.
 * chỉ cần sửa ở file này.
 * 
 * CÁCH SỬ DỤNG:
 * - store.js dùng: CONFIG.DEMO_MODE để biết chạy demo hay thật
 * - dataService.js dùng: API_BASE_URL, WS_URL, REFRESH_RATE_MS
 * - Các View dùng: THRESHOLDS và getStatus() để tô màu cảnh báo
 */

// =========================================
// 1. CÀI ĐẶT CHUNG
// =========================================

/*
 * export const = Xuất biến hằng ra để file khác import được
 * const = hằng số (không thể thay đổi sau khi khai báo)
 */
export const CONFIG = {

  // URL của Backend API (nơi gửi/nhận dữ liệu)
  // - localhost = chạy trên máy tính cá nhân
  // - Nếu dùng Raspberry Pi, đổi thành: http://raspberrypi.local/api
  API_BASE_URL: "http://localhost:5000/api",

  // URL WebSocket (kết nối thời gian thực để nhận dữ liệu liên tục)
  WS_URL: "ws://localhost:5000/ws",

  // CHẾ ĐỘ DEMO
  // - true = Dùng dữ liệu giả (mock data), không cần backend
  // - false = Gọi API thật từ backend
  DEMO_MODE: true,

  // Chu kỳ cập nhật dữ liệu (đơn vị: mili giây)
  // 3000ms = 3 giây = mỗi 3 giây lấy dữ liệu mới 1 lần
  REFRESH_RATE_MS: 3000,

  // Số điểm dữ liệu giữ lại để vẽ biểu đồ lịch sử
  // Giữ 50 điểm gần nhất, cũ hơn sẽ bị xóa
  CHART_HISTORY_POINTS: 50,

  // Thời gian chờ giữa 2 lần cảnh báo (tránh spam thông báo)
  // 300000ms = 5 phút
  ALERT_COOLDOWN_MS: 300000,
};


// =========================================
// 2. NGƯỠNG CẢNH BÁO THEO GIAI ĐOẠN CÂY
// =========================================

/*
 * THRESHOLDS dùng để xác định khi nào chỉ số tốt/xấu
 * 
 * Ý nghĩa các ngưỡng:
 * - min / max: Ngưỡng AN TOÀN (màu xanh)
 * - critical_low / critical_high: Ngưỡng NGUY HIỂM (màu đỏ)
 * - Nằm ngoài min/max nhưng chưa đến critical: CẢNH BÁO (màu vàng)
 * 
 * Ví dụ cho pH giai đoạn vegetative:
 *   |  ĐỎ  |  VÀNG  | XANH | VÀNG |  ĐỎ  |
 *   0    5.0     5.5    6.5    7.0    14
 *         ^       ^      ^      ^
 *    critical_low min   max  critical_high
 */
export const THRESHOLDS = {

  // Giai đoạn VEGETATIVE (phát triển thân lá)
  // Đây là giai đoạn cây còn non, cần pH thấp hơn và EC vừa phải
  vegetative: {
    // pH: Độ axit/kiềm của dung dịch (thang 0-14)
    // Cây rau thủy canh thích pH 5.5-6.5
    ph: {
      min: 5.5,          // Ngưỡng dưới an toàn
      max: 6.5,          // Ngưỡng trên an toàn
      critical_low: 5.0, // Dưới mức này = nguy hiểm
      critical_high: 7.0 // Trên mức này = nguy hiểm
    },

    // EC: Độ dẫn điện (đo nồng độ dinh dưỡng)
    // Đơn vị: mS/cm (mili Siemens trên centimet)
    ec: {
      min: 1.2,
      max: 2.0,
      critical_low: 0.8,
      critical_high: 2.5
    },

    // t_water: Nhiệt độ nước (°C)
    // Nước quá lạnh hoặc quá nóng sẽ làm rễ bị sốc
    t_water: {
      min: 18,
      max: 26,
      critical_low: 15,
      critical_high: 30
    },

    // t_air: Nhiệt độ không khí (°C)
    t_air: {
      min: 18,
      max: 28,
      critical_low: 10,
      critical_high: 35
    },

    // rh: Độ ẩm không khí (% - Relative Humidity)
    rh: {
      min: 50,
      max: 70,
      critical_low: 40,
      critical_high: 85
    },
  },

  // Giai đoạn FLOWERING (ra hoa/đậu quả)
  // Cây cần pH cao hơn và EC cao hơn để tạo hoa/quả
  flowering: {
    ph: { min: 6.0, max: 6.8 },
    ec: { min: 2.0, max: 3.0 },
    // Các thông số khác giữ nguyên như vegetative
    // (có thể thêm nếu cần)
  },
};


// =========================================
// 3. DANH SÁCH THIẾT BỊ ĐIỀU KHIỂN
// =========================================

/*
 * DEVICES = Mảng chứa thông tin các thiết bị có thể điều khiển
 * 
 * Mỗi thiết bị gồm:
 * - id: Mã định danh duy nhất (dùng trong code)
 * - name: Tên hiển thị cho người dùng (tiếng Việt)
 * - icon: Tên icon Material Icons (Google cung cấp)
 * 
 * Xem thêm icon tại: https://fonts.google.com/icons
 */
export const DEVICES = [
  {
    id: 'pump',           // Mã thiết bị
    name: 'Bơm nước',     // Tên hiển thị
    icon: 'water_drop'    // Icon giọt nước
  },
  {
    id: 'fan',
    name: 'Quạt gió',
    icon: 'air'           // Icon gió (không khí)
  },
  {
    id: 'led',
    name: 'Đèn LED',
    icon: 'light_mode'    // Icon ánh sáng
  }
];


// =========================================
// 4. HÀM XÁC ĐỊNH TRẠNG THÁI (OK/CẢNH BÁO/NGUY HIỂM)
// =========================================

/**
 * Hàm getStatus - Kiểm tra giá trị đo được và trả về trạng thái màu
 * 
 * @param {string} metric - Tên chỉ số, ví dụ: 'ph', 'ec', 't_air'
 * @param {number} value - Giá trị đo được, ví dụ: 6.2
 * @param {string} stage - Giai đoạn cây, mặc định 'vegetative'
 * 
 * @returns {string} - Một trong 3 giá trị:
 *   - 'ok' = Tốt (màu xanh)
 *   - 'warning' = Cảnh báo (màu vàng)  
 *   - 'critical' = Nguy hiểm (màu đỏ)
 * 
 * VÍ DỤ SỬ DỤNG:
 *   getStatus('ph', 6.2)           // Trả về 'ok'
 *   getStatus('ph', 5.3)           // Trả về 'warning'
 *   getStatus('ph', 4.5)           // Trả về 'critical'
 *   getStatus('ph', 6.5, 'flowering') // Kiểm tra theo giai đoạn ra hoa
 */
export const getStatus = (metric, value, stage = "vegetative") => {
  // Bước 1: Lấy quy tắc ngưỡng cho chỉ số này
  // ?. là optional chaining - tránh lỗi nếu không tìm thấy
  const rules = THRESHOLDS[stage]?.[metric];

  // Bước 2: Nếu không có quy tắc, mặc định là OK
  if (!rules) return "ok";

  // Bước 3: Kiểm tra có nằm trong vùng NGUY HIỂM không
  // (thấp hơn critical_low HOẶC cao hơn critical_high)
  if (value < rules.critical_low || value > rules.critical_high) {
    return "critical";
  }

  // Bước 4: Kiểm tra có nằm trong vùng CẢNH BÁO không
  // (ngoài min/max nhưng chưa đến critical)
  if (value < rules.min || value > rules.max) {
    return "warning";
  }

  // Bước 5: Nằm trong vùng AN TOÀN
  return "ok";
};
