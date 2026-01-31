/*Tóm tắt luồng chạy 

Trang load xong → DOMContentLoaded

chạy initApp()

DataService start → liên tục cập nhật store

Router render view theo URL (#/dashboard…)

DashboardView subscribe sensors → cập nhật card

nút theme đổi store.theme

đồng hồ chạy 1 giây/lần

connectionMode đổi → đổi chữ & màu dot */

/**
 * Main Entry Point - Final Assembly
 */
import { store } from "./store.js"; //nơi giữ dữ liệu chung, trạng thái ứng dụng(sensors, theme, connectionMode)
import { Router } from "./router.js"; // đổi màn hình theo dashboard
import { DataService } from "./data/dataService.js"; // nơi bơm dữ liệu vào store(demo or api thật)
import { Card } from "./components/common/Card.js"; // component api card(hiển thị chỉ số cảm biến)

// mỗi file view  là 1 class, module render dữ liệu lên content-area
import { RealtimeView } from "./components/RealtimeView.js";
import { TrendsView } from "./components/TrendsView.js";
import { DigitalTwinView } from "./components/DigitalTwinView.js";
import { ControlView } from "./components/ControlView.js";
import { AIView } from "./components/AIView.js";
import { PredictionView } from "./components/PredictionView.js";

// Dashboard View (Inline for simplicity)
/*constructor: Hàm khởi tạo. Khi "xây" phòng Dashboard, nó cần biết nó sẽ nằm ở đâu (container - chính là cái thẻ <div id="content-area"> trong HTML).*/
class DashboardView {
  constructor(container) {
    this.container = container; // luu trữ thẻ div chứa nội dung của dashboard
    this.cards = []; // tạo mang rỗng để lưu trữ các thẻ card
    this.unsubscribe = null; //để sau này lưu “hàm hủy đăng ký” (unsubscribe) khi không cần lắng nghe store nữa.
  }
  //mount()-Hàm này nghĩa là "Lắp đặt". Khi người dùng bấm vào menu "Tổng quan", hàm này chạy- là hàm hiển thị giao diện.
  async mount() {
    //innerHTML-đặt nội dung HTML bên trong thẻ container
    //trong đoạn html này có  1 tiêu đề, 1 div dashboard-grid để chứa các thẻ card, và 1 số thông tin trạng thái hệ thống khác.
    this.container.innerHTML = `
            <div class="dashboard-defs">
                <h2 style="margin-bottom:1rem; font-size:1.1rem; color:var(--text-secondary)">Chỉ số hoạt động (KPIs)</h2>
                <div class="dashboard-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
                </div>
            </div>
            
            <div style="margin-top: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:1.5rem;">
               <div style="background:var(--bg-surface); padding:1.5rem; border-radius:var(--radius-md); box-shadow:var(--shadow-sm)">
                    <h3>Trạng thái Hệ thống</h3>
                    <div style="display:flex; align-items:center; gap:0.5rem; margin-top:1rem;">
                        <span class="material-icons-round" style="color:var(--status-ok); font-size:3rem;">check_circle</span>
                        <div>
                            <div style="font-weight:bold; font-size:1.2rem;">Hệ thống Ổn định</div>
                            <div style="color:var(--text-secondary)">Tất cả cảm biến hoạt động trong ngưỡng cho phép</div>
                        </div>
                    </div>
               </div>
               
               <div style="background:var(--bg-surface); padding:1.5rem; border-radius:var(--radius-md); box-shadow:var(--shadow-sm)">
                    <h3>Kết quả AI (Mới nhất)</h3>
                    <div style="margin-top:1rem; display:flex; gap:1rem; align-items:center;">
                         <div style="width:60px; height:60px; background:#e2e8f0; border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; color:var(--text-secondary)">
                            <span class="material-icons-round">image</span>
                         </div>
                         <div>
                            <div>Không phát hiện bệnh</div>
                            <small class="badge" style="background:var(--status-ok)">Độ tin cậy: 98%</small>
                         </div>
                    </div>
               </div>
            </div>
        `;
    //querySelector('.dashboard-grid') = tìm trong container thẻ có class dashboard-grid
    //grid là chỗ bạn sẽ appendChild các card vào.
    const grid = this.container.querySelector(".dashboard-grid");

    // Define Cards-ĐInh nghĩa các thẻ card sẽ hiển thị trên dashboard
    const cardDefs = [
      {
        title: "Nhiệt độ không khí",
        valueId: "t_air",
        unit: "°C",
        icon: "thermostat",
        colorVar: "--status-info",
      },
      {
        title: "Độ ẩm",
        valueId: "rh",
        unit: "%",
        icon: "water_drop",
        colorVar: "--status-info",
      },
      {
        title: "Nhiệt độ nước",
        valueId: "t_water",
        unit: "°C",
        icon: "water",
        colorVar: "--primary",
      },
      {
        title: "Độ pH",
        valueId: "ph",
        unit: "",
        icon: "science",
        colorVar: "--status-warning",
      },
      {
        title: "Độ dẫn điện (EC)",
        valueId: "ec",
        unit: "mS/cm",
        icon: "bolt",
        colorVar: "--status-warning",
      },
      {
        title: "Ánh sáng",
        valueId: "light",
        unit: "Lux",
        icon: "light_mode",
        colorVar: "--status-critical",
      },
    ];

    // Create & Append Cards
    //lấy từng định nghĩa thẻ card trong mảng cardDefs và tạo một thể hiện (instance) của lớp Card dựa trên định nghĩa đó.
    //this.cards là mảng lưu trữ tất cả các thẻ card đã tạo.
    this.cards = cardDefs.map((def) => new Card(def));
    //forEach = lặp từng phần tử trong mảng để làm gì đó, KHÔNG tạo mảng mới.
    // gắn html của từng thẻ card vào trong thẻ dashboard-grid
    this.cards.forEach((c) => grid.appendChild(c.element));

    // Lắng nghe dữ liệu sensor từ store
    //store.subscribe('sensors', callback)-nghĩa là: “Hễ dữ liệu sensors trong store thay đổi thì gọi callback”
    //callback nhận tham số data-là dữ liệu sensors mới từ store
    this.unsubscribe = store.subscribe("sensors", (data) => {
      // nếu có data-> cập nhật tất cả card với data mới
      if (data) this.cards.forEach((card) => card.update(data));
    });

    // Cập nhật ngay lần đầu
    const currentData = store.getState().sensors;
    //NẾU CÓ timestamp(trạng thái dữ liệu cảm biến) thì cập nhật tất cả thẻ card với dữ liệu hiện tại
    if (currentData.timestamp) {
      this.cards.forEach((card) => card.update(currentData));
    }
  }
  //Hàm dọn dẹp khi rời view
  destroy() {
    // Cleanup would go here
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
// màn hình tạm-Dùng cho /alerts và /settings chưa làm.
class PlaceholderView {
  constructor(container) {
    this.container = container;
  }
  async mount() {
    this.container.innerHTML = `<h2>Coming Soon</h2>`;
  }
}

// Initialize System
async function initApp() {
  console.log("Initializing Smart Agriculture App...");

  // 1. Setup Data Service (Demo Mode Default)
  const dataService = new DataService(); //tạo đối tượng lấy dữ liệu.
  dataService.start(); //start()-bắt đầu quá trình lấy dữ liệu - có thể là dữ liệu demo hoặc dữ liệu thật từ API tùy cấu hình trong store rồi đẩy vào store.setState('sensors', ...)

  // 2. Setup Router
  // Mapped to specific Classes
  const routes = {
    "/dashboard": DashboardView,
    "/realtime": RealtimeView,
    "/trends": TrendsView,
    "/ai": AIView,
    "/prediction": PredictionView,
    "/twin": DigitalTwinView,
    "/control": ControlView,
    "/alerts": PlaceholderView, // Left as placeholder for now or straightforward list
    "/settings": PlaceholderView,
  };
  /*Tạo router, đưa routes vào.
Gán router vào window.router để: cóthể debug ngoài console (gõ router) */
  window.router = new Router(routes);

  // 3. UI Bindings
  //gắn hành vi cho nút đổi thêm
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const current = store.state.theme;
      const next = current === "dark" ? "light" : "dark";
      store.setState("theme", next);
    });
  }

  // Clock
  setInterval(() => {
    const now = new Date();
    const el = document.getElementById("current-time");
    if (el) el.textContent = now.toLocaleTimeString();
  }, 1000);

  // Connection Status
  store.subscribe("connectionMode", (mode) => {
    const el = document.getElementById("connection-text");
    const dot = document.querySelector(".status-dot");
    if (el && dot) {
      if (mode === "demo") {
        el.textContent = "Demo Mode";
        dot.style.color = "var(--status-warning)";
      } else {
        el.textContent = "Live System";
        dot.style.color = "var(--status-ok)";
      }
    }
  });
  //Kết thúc initApp
  console.log("App Initialized.");
}
/*Đảm bảo toàn bộ HTML (button, div…) đã tồn tại rồi mới chạy initApp.
Nếu chạy sớm quá thì getElementById sẽ ra null. */
document.addEventListener("DOMContentLoaded", initApp);
