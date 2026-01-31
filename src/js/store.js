/**
 * Quản lý Trạng thái Đơn giản (Mô hình Pub/Sub)
 */

/*
Luồng hoạt động :
A. Khi web bắt đầu chạy
Bước 1: store.js được import vào main.js
Bước 2: File store.js chạy từ trên xuống dưới
    1. Import config
    2. Định nghĩa class store
    3. Tạo 1 store duy nhất
        export const store = new Store();
        → Ngay lúc này constructor() chạy, tạo:
        store.state (chứa theme, sensors, alerts…)
        store.listeners (rỗng)
    4. Thiết lập theme ngay lập tức (dựa trên store.state.theme)
B. Khi app chạy (runtime)
Bước 1: Các “View” hoặc “main.js” đăng ký nghe-listen vào store qua store.subscribe('key', callback)
Bước 2: DataService (hoặc backend) cập nhật dữ liệu
        store.setState('sensors', newData)
        Trong setState() nó làm 3 việc:
        1.Nếu không đổi thì bỏ qua:if (this.state[key] === value) return;
        2.Cập nhật trạng thái mới:this.state[key] = value;
        3.Báo cho tất cả người đang nghe key đó:this.listeners[key].forEach(cb => cb(value));
        -> call back chạy, ui cập nhật
Bước 3: Trường hợp đặc biệt theme
Khi gọi :store.setState("theme", "dark");
Nó sẽ lưu theme vào localStorage và cập nhật thuộc tính data-theme của thẻ <html>
*/
//Lấy biến CONFIG trong config.js để dùng ở đây.
//Ví dụ CONFIG.DEMO_MODE quyết định app chạy demo hay live.
import { CONFIG } from "./config.js";

class Store {
  //constructor-chay khi tạo đối tượng từ lớp Store
  constructor() {
    this.state = {
      //appStatus: 'initializing'Trạng thái app đang khởi động.Sau này có thể đổi sang 'ready', 'error', 'offline'.
      appStatus: "initializing", // initializing, ready, error, offline
      connectionMode: CONFIG.DEMO_MODE ? "demo" : "live",
      sensors: {}, // Lưu dữ liệu SENSOR_SCHEMA mới nhất
      alerts: [],
      user: { name: "QTV", role: "quan_tri_vien" },
      //lấy theme đã lưu trong trình duyệt (localStorage) nếu có. Mặc định là 'light'
      //localStorage là “bộ nhớ nhỏ” của trình duyệt, lưu được sau khi bạn đóng/mở web lại.
      theme: localStorage.getItem("theme") || "light",
    };
    this.listeners = {}; // là mảng lưu trữ các hàm callback để gọi khi trạng thái thay đổi.
  }

  /**
   * Đăng ký lắng nghe thay đổi trạng thái
   * @param {string} key - Tên khóa trạng thái cần nghe (vd: 'sensors', 'appStatus')
   * @param {function} callback// hàm callback được gọi khi trạng thái thay đổi
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
    // Kiểm tra thay đổi đơn giản (tránh gọi không cần thiết)
    if (this.state[key] === value) return;

    this.state[key] = value;

    if (this.listeners[key]) {
      this.listeners[key].forEach((cb) => cb(value));
    }

    // Lưu trữ các key đặc biệt
    if (key === "theme") {
      localStorage.setItem("theme", value);
      document.documentElement.setAttribute("data-theme", value);
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
document.documentElement.setAttribute("data-theme", store.state.theme);
