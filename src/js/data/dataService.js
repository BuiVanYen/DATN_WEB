/**
 * =============================================
 * DATASERVICE.JS - DỊCH VỤ LẤY DỮ LIỆU CẢM BIẾN
 * =============================================
 * 
 * Chức năng: Lấy dữ liệu từ cảm biến và cập nhật vào Store
 * 
 * Có 2 chế độ hoạt động:
 * 
 * 1. DEMO MODE (Chế độ Demo):
 *    - Không cần phần cứng thật
 *    - Tự tạo dữ liệu giả (mock data) mỗi 3 giây
 *    - Dùng để test giao diện, trình diễn đồ án
 * 
 * 2. LIVE MODE (Chế độ Thật):
 *    - Kết nối WebSocket đến backend
 *    - Nhận dữ liệu thời gian thực từ cảm biến
 *    - Dùng khi có phần cứng Raspberry Pi + cảm biến
 * 
 * LUỒNG HOẠT ĐỘNG:
 * ┌─────────────┐
 * │   App khởi  │
 * │   chạy      │
 * └──────┬──────┘
 *        ▼
 * ┌─────────────┐     Có       ┌─────────────┐
 * │ DEMO_MODE?  │─────────────▶│ Demo Mode   │──┐
 * └──────┬──────┘              │ (data giả)  │  │
 *        │ Không               └─────────────┘  │
 *        ▼                                      │
 * ┌─────────────┐     Thành    ┌─────────────┐  │
 * │ Kết nối WS  │─────công────▶│ Live Mode   │  │
 * └──────┬──────┘              │ (data thật) │  │
 *        │ Thất bại                             │
 *        ▼                                      │
 * ┌─────────────┐                               │
 * │ Chuyển sang │───────────────────────────────┘
 * │ Demo Mode   │
 * └─────────────┘
 */

// === IMPORT CÁC MODULE CẦN THIẾT ===

// store: Kho lưu trữ dữ liệu toàn cục của ứng dụng
// Dùng để: store.setState('sensors', data) - cập nhật dữ liệu cảm biến
import { store } from "../store.js";

// CONFIG: Cấu hình ứng dụng (DEMO_MODE, REFRESH_RATE_MS, WS_URL...)
import { CONFIG } from "../config.js";

// generateSensorData: Hàm tạo dữ liệu cảm biến giả
// Trả về object: { ph: 6.2, ec: 1.5, t_water: 22, t_air: 25, rh: 65 }
import { generateSensorData } from "./mockData.js";


/**
 * CLASS DataService - Quản lý việc lấy dữ liệu cảm biến
 * 
 * Cách sử dụng:
 *   const dataService = new DataService();  // Tạo instance
 *   dataService.start();                     // Bắt đầu lấy dữ liệu
 *   dataService.switchMode('live');          // Chuyển sang chế độ khác
 */
export class DataService {

  /**
   * Hàm khởi tạo - chạy khi tạo new DataService()
   */
  constructor() {
    // intervalId: Lưu ID của setInterval()
    // Dùng để dừng interval bằng clearInterval(this.intervalId)
    this.intervalId = null;

    // socket: Lưu kết nối WebSocket (chỉ dùng trong Live mode)
    // WebSocket cho phép server gửi dữ liệu xuống client liên tục
    this.socket = null;

    // mode: Chế độ hiện tại ('demo' hoặc 'live')
    // Lấy từ CONFIG.DEMO_MODE: true -> 'demo', false -> 'live'
    this.mode = CONFIG.DEMO_MODE ? "demo" : "live";
  }

  /**
   * Bắt đầu dịch vụ lấy dữ liệu
   * Được gọi 1 lần khi app khởi động
   */
  start() {
    // In ra console để debug
    // toUpperCase() chuyển 'demo' thành 'DEMO'
    console.log(
      `Đang chạy DataService ở chế độ: ${this.mode.toUpperCase()}...`,
    );

    // Tùy theo mode mà gọi hàm tương ứng
    if (this.mode === "demo") {
      this.startDemoMode();    // Dùng dữ liệu giả
    } else {
      this.connectWebSocket(); // Kết nối WebSocket đến backend
    }
  }

  // =========================================
  // CHẾ ĐỘ DEMO - Dữ liệu giả lập
  // =========================================

  /**
   * Khởi động chế độ Demo
   * - Tạo dữ liệu giả ngay lập tức
   * - Sau đó tạo mới mỗi 3 giây (CONFIG.REFRESH_RATE_MS)
   */
  startDemoMode() {
    // Bước 1: Lấy dữ liệu lần đầu tiên (để UI có gì hiển thị ngay)
    // generateSensorData() trả về: { ph: 6.2, ec: 1.5, ... }
    this.updateStore(generateSensorData());

    // Bước 2: Thiết lập interval - chạy lặp lại mỗi X giây
    // setInterval(hàm, thời_gian) - chạy hàm mỗi thời_gian (ms)
    // Trả về ID để có thể dừng sau này
    this.intervalId = setInterval(() => {
      // Tạo dữ liệu mới
      const data = generateSensorData();
      // Cập nhật vào Store
      this.updateStore(data);
    }, CONFIG.REFRESH_RATE_MS); // 3000ms = 3 giây

    // Bước 3: Cập nhật trạng thái ứng dụng
    store.setState("connectionMode", "demo"); // Sidebar hiện "Chế độ Demo"
    store.setState("appStatus", "ready");     // App đã sẵn sàng
  }

  // =========================================
  // CHẾ ĐỘ LIVE - Dữ liệu thật từ WebSocket
  // =========================================

  /**
   * Kết nối đến WebSocket server
   * WebSocket là giao thức cho phép:
   * - Kết nối 2 chiều (server có thể gửi dữ liệu xuống client)
   * - Thời gian thực (nhận ngay khi có dữ liệu mới)
   */
  connectWebSocket() {
    try {
      // Bước 1: Tạo kết nối WebSocket
      // CONFIG.WS_URL = "ws://localhost:5000/ws"
      this.socket = new WebSocket(CONFIG.WS_URL);

      // Bước 2: Xử lý sự kiện KẾT NỐI THÀNH CÔNG
      // onopen được gọi khi WebSocket kết nối xong
      this.socket.onopen = () => {
        console.log("WS Đã kết nối");
        store.setState("appStatus", "ready");     // App sẵn sàng
        store.setState("connectionMode", "live"); // Sidebar hiện "Live System"
      };

      // Bước 3: Xử lý sự kiện NHẬN DỮ LIỆU
      // onmessage được gọi mỗi khi server gửi dữ liệu xuống
      this.socket.onmessage = (event) => {
        try {
          // event.data là chuỗi JSON, ví dụ: '{"ph":6.2,"ec":1.5,...}'
          // JSON.parse() chuyển chuỗi thành Object JavaScript
          const data = JSON.parse(event.data);

          // Cập nhật dữ liệu vào Store
          this.updateStore(data);
        } catch (e) {
          // Nếu dữ liệu không phải JSON hợp lệ -> ghi log lỗi
          console.error("Lỗi parse dữ liệu WS", e);
        }
      };

      // Bước 4: Xử lý sự kiện LỖI KẾT NỐI
      // onerror được gọi khi có lỗi (sai URL, server từ chối, v.v.)
      this.socket.onerror = (e) => {
        console.error("Lỗi WS", e);
        this.handleConnectionFail(); // Chuyển sang Demo mode
      };

      // Bước 5: Xử lý sự kiện MẤT KẾT NỐI
      // onclose được gọi khi WebSocket bị đóng (server tắt, mất mạng)
      this.socket.onclose = () => {
        console.warn("WS Đã đóng");
        this.handleConnectionFail(); // Chuyển sang Demo mode
      };

    } catch (e) {
      // Nếu không thể tạo WebSocket (lỗi nghiêm trọng)
      this.handleConnectionFail();
    }
  }

  /**
   * Xử lý khi kết nối thất bại
   * Tự động chuyển về Demo mode để app không "chết"
   */
  handleConnectionFail() {
    // Đánh dấu trạng thái offline
    store.setState("appStatus", "offline");

    console.log("Đang chuyển sang chế độ Demo dự phòng...");

    // Đóng socket cũ nếu có
    if (this.socket) this.socket.close();

    // Chuyển sang Demo mode
    this.mode = "demo";
    this.startDemoMode();
  }

  /**
   * Cập nhật dữ liệu vào Store
   * @param {Object} data - Dữ liệu cảm biến { ph, ec, t_water, t_air, rh }
   */
  updateStore(data) {
    // setState('sensors', data) sẽ:
    // 1. Lưu data vào store.state.sensors
    // 2. Thông báo cho tất cả listener (UI components) để cập nhật
    store.setState("sensors", data);

    // Có thể thêm logic kiểm tra ngưỡng cảnh báo ở đây
    // this.checkThresholds(data);
  }

  /**
   * Chuyển đổi giữa các chế độ (demo <-> live)
   * @param {string} newMode - Chế độ mới ('demo' hoặc 'live')
   */
  switchMode(newMode) {
    // Nếu đã ở chế độ đó rồi thì không làm gì
    if (this.mode === newMode) return;

    // Dọn dẹp (cleanup) chế độ cũ
    // Dừng interval nếu đang chạy
    if (this.intervalId) clearInterval(this.intervalId);
    // Đóng WebSocket nếu đang mở
    if (this.socket) this.socket.close();

    // Chuyển sang chế độ mới
    this.mode = newMode;
    this.start(); // Gọi lại start() với mode mới
  }
}

/*
 * TÓM TẮT LUỒNG HOẠT ĐỘNG:
 * 
 * 1. App khởi chạy
 *    └─> new DataService()
 *    └─> dataService.start()
 * 
 * 2. Nếu DEMO_MODE = true:
 *    └─> startDemoMode()
 *    └─> generateSensorData() tạo data giả mỗi 3 giây
 *    └─> store.setState('sensors', data)
 *    └─> UI tự động cập nhật (vì đã subscribe vào store)
 * 
 * 3. Nếu DEMO_MODE = false:
 *    └─> connectWebSocket()
 *    └─> Kết nối đến ws://localhost:5000/ws
 *    └─> Nhận data từ backend qua WebSocket
 *    └─> JSON.parse() chuyển thành object
 *    └─> store.setState('sensors', data)
 *    └─> UI tự động cập nhật
 * 
 * 4. Nếu WebSocket bị lỗi/mất kết nối:
 *    └─> handleConnectionFail()
 *    └─> Đánh dấu appStatus = 'offline'
 *    └─> Tự động chuyển sang Demo mode
 *    └─> App vẫn hoạt động (hiển thị data giả)
 */
