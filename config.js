// URL backend Render đang dùng. Không thêm dấu / ở cuối.
window.FINIIP_CONFIG = {
  API_BASE_URL: "https://finiip-backend.onrender.com",
  // Chỉ dùng API key demo/nội bộ. Không nhúng secret thật vào frontend công khai.
  API_KEY: "finiip",
  WORKSPACE_ID: "personal",
  USER_NAME: "Phú",
  FRONTEND_VERSION: "1.12.0",
};

// V112 Accounting Suite được tách riêng để không làm rối app.js V111.
// Nạp sau khi app chính đã khởi tạo để tái sử dụng API, chat, báo cáo và RAG hiện có.
window.addEventListener("DOMContentLoaded", () => {
  const loadOperations = () => {
    if (document.querySelector('script[data-finiip-accounting-operations]')) return;
    const operations = document.createElement("script");
    operations.src = "accounting-operations-v112.js?v=1.12.0";
    operations.dataset.finiipAccountingOperations = "1.12.0";
    document.body.appendChild(operations);
  };

  const existing = document.querySelector('script[data-finiip-accounting-suite]');
  if (existing) {
    loadOperations();
    return;
  }

  const script = document.createElement("script");
  script.src = "accounting-suite.js?v=1.12.0";
  script.dataset.finiipAccountingSuite = "1.12.0";
  script.onload = loadOperations;
  document.body.appendChild(script);
});
