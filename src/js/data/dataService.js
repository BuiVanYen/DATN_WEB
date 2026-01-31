/**
 * Dịch vụ Dữ liệu
 * Xử lý việc lấy dữ liệu (WebSocket vs Mock) và cập nhật Store toàn cục.
 */
import { store } from "../store.js"; //Import store: để gọi store.setState(...)
import { CONFIG } from "../config.js"; //Import CONFIG: để biết demo mode, refresh rate, WS URL..
import { generateSensorData } from "./mockData.js"; //Import generateSensorData: hàm tạo dữ liệu giả.

export class DataService {
  constructor() {
    this.intervalId = null; //Nơi lưu “ID của setInterval” để sau này dừng nó (clearInterval)
    this.socket = null; //Nơi lưu kết nối WebSocket (nếu chạy live).
    this.mode = CONFIG.DEMO_MODE ? "demo" : "live";
  }
  //bắt đầu dịch vụ dữ liệu
  /*In ra console mode hiện tại.
  Nếu mode demo → chạy startDemoMode()
  Nếu mode live → chạy connectWebSocket() */
  start() {
    console.log(
      `Đang chạy DataService ở chế độ: ${this.mode.toUpperCase()}...`,
    );
    if (this.mode === "demo") {
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

    store.setState("connectionMode", "demo");
    store.setState("appStatus", "ready");
  }

  /**
   * Chế độ Live: Kết nối tới WebSocket- chế độ live, lấy dữ liệu back end qua WebSocket
   */
  connectWebSocket() {
    try {
      this.socket = new WebSocket(CONFIG.WS_URL); //tạo kết nối WebSocket tới ws://localhost:5000/ws, nếu có lỗi chuyển sang catch

      this.socket.onopen = () => {
        //onopen là “sự kiện”: kết nối WS đã mở
        console.log("WS Đã kết nối");
        store.setState("appStatus", "ready");
        store.setState("connectionMode", "live");
        ////Sidebar sẽ hiện “Live System” + chấm xanh.
      };
      //Khi server gửi dữ liệu xuống
      /*Khi có message:
      event.data là chuỗi JSON (text)
      JSON.parse() đổi chuỗi thành object JS
      rồi update store */
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Validate/Biến đổi dữ liệu nếu cần khớp SENSOR_SCHEMA
          this.updateStore(data);
        } catch (e) {
          console.error("Lỗi parse dữ liệu WS", e);
        }
      };
      // khi có lỗi kết nối WS-Nếu lỗi WS → gọi handleConnectionFail() (chuyển sang demo dự phòng)
      this.socket.onerror = (e) => {
        console.error("Lỗi WS", e);
        this.handleConnectionFail();
      };
      // khi kết nối WS đóng-Server tắt / mất mạng → WS đóng → chuyển sang demo.
      this.socket.onclose = () => {
        console.warn("WS Đã đóng");
        this.handleConnectionFail();
      };
    } catch (e) {
      this.handleConnectionFail();
    }
  }

  handleConnectionFail() {
    store.setState("appStatus", "offline");

    // Tự động chuyển về Demo nếu cấu hình
    console.log("Đang chuyển sang chế độ Demo dự phòng...");
    if (this.socket) this.socket.close();

    // Thông báo cho user (Toast) và chuyển đổi
    this.mode = "demo";
    this.startDemoMode();
  }

  updateStore(data) {
    // Cập nhật trạng thái cảm biến
    store.setState("sensors", data);

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
/*Khi app khởi chạy:
1.new DataService() tạo dịch vụ
2.dataService.start()
Nếu DEMO:
1.startDemoMode()
2.tạo data giả mỗi 3 giây
3.gọi store.setState('sensors', data)
4.UI tự update
Nếu LIVE:
1.connectWebSocket()
2.WS nhận data
3.parse JSON
4.gọi store.setState('sensors', data)
5.UI tự update
Nếu LIVE bị lỗi:
1.handleConnectionFail()
2.set offline
3.chuyển qua demo để app không “chết” */
