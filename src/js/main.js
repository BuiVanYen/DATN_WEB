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

// mỗi file view  là 1 class, module render dữ liệu lên content-area
import { DashboardView } from "./components/DashboardView.js";
import { RealtimeView } from "./components/RealtimeView.js";
import { TrendsView } from "./components/TrendsView.js";
import { DigitalTwinView } from "./components/DigitalTwinView.js";
import { ControlView } from "./components/ControlView.js";
import { AIView } from "./components/AIView.js";
import { PredictionView } from "./components/PredictionView.js";


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
