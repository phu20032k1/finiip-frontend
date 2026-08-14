// URL backend đang dùng. Không thêm dấu / ở cuối.
window.FINIIP_CONFIG = {
  API_BASE_URL: "https://finiip-backend.onrender.com",
  // Chỉ dùng API key demo/nội bộ. Không nhúng secret thật vào frontend công khai.
  API_KEY: "finiip",
  WORKSPACE_ID: "personal",
  USER_NAME: "Phú",
  FRONTEND_VERSION: "1.13.0",
};

// Accounting Suite: giao diện lõi -> API operations -> feature router V113.
// V113 giữ AI là chức năng chủ động, không dùng chat làm mặc định cho các nút nghiệp vụ.
window.addEventListener("DOMContentLoaded", () => {
  const loadFeatureRouter = () => {
    if (document.querySelector('script[data-finiip-accounting-feature-router]')) return;
    const router = document.createElement("script");
    router.src = "accounting-feature-router-v113.js?v=1.13.0";
    router.dataset.finiipAccountingFeatureRouter = "1.13.0";
    document.body.appendChild(router);
  };

  const loadOperations = () => {
    const existingOperations = document.querySelector('script[data-finiip-accounting-operations]');
    if (existingOperations) {
      loadFeatureRouter();
      return;
    }
    const operations = document.createElement("script");
    operations.src = "accounting-operations-v112.js?v=1.13.0";
    operations.dataset.finiipAccountingOperations = "1.13.0";
    operations.onload = loadFeatureRouter;
    document.body.appendChild(operations);
  };

  const existing = document.querySelector('script[data-finiip-accounting-suite]');
  if (existing) {
    loadOperations();
    return;
  }

  const script = document.createElement("script");
  script.src = "accounting-suite.js?v=1.13.0";
  script.dataset.finiipAccountingSuite = "1.13.0";
  script.onload = loadOperations;
  document.body.appendChild(script);
});
