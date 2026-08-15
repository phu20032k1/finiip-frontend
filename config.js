// Backend production dùng chung cho cả Chat AI và Accounting API.
// Không thêm dấu / ở cuối.
window.FINIIP_CONFIG = {
  API_BASE_URL: "https://finiip-backend.fly.dev",
  // Chỉ dùng API key demo/nội bộ. Không nhúng secret thật vào frontend công khai.
  API_KEY: "finiip",
  WORKSPACE_ID: "personal",
  USER_NAME: "Phú",
  FRONTEND_VERSION: "1.14.0",
};

// Accounting Suite: giao diện lõi -> API operations -> feature router V113.
// V114 dùng cùng Fly backend cho cả chat và nghiệp vụ kế toán để tránh lệch dữ liệu.
window.addEventListener("DOMContentLoaded", () => {
  const loadFeatureRouter = () => {
    if (document.querySelector('script[data-finiip-accounting-feature-router]')) return;
    const router = document.createElement("script");
    router.src = "accounting-feature-router-v113.js?v=1.14.0";
    router.dataset.finiipAccountingFeatureRouter = "1.14.0";
    document.body.appendChild(router);
  };

  const loadOperations = () => {
    const existingOperations = document.querySelector('script[data-finiip-accounting-operations]');
    if (existingOperations) {
      loadFeatureRouter();
      return;
    }
    const operations = document.createElement("script");
    operations.src = "accounting-operations-v112.js?v=1.14.0";
    operations.dataset.finiipAccountingOperations = "1.14.0";
    operations.onload = loadFeatureRouter;
    document.body.appendChild(operations);
  };

  const existing = document.querySelector('script[data-finiip-accounting-suite]');
  if (existing) {
    loadOperations();
    return;
  }

  const script = document.createElement("script");
  script.src = "accounting-suite.js?v=1.14.0";
  script.dataset.finiipAccountingSuite = "1.14.0";
  script.onload = loadOperations;
  document.body.appendChild(script);
});
