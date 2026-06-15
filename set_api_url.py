from pathlib import Path
import json
import sys

if len(sys.argv) != 2:
    raise SystemExit("Cách dùng: python set_api_url.py https://ten-backend.onrender.com")

url = sys.argv[1].strip().rstrip("/")
if not url.startswith(("http://", "https://")):
    raise SystemExit("URL phải bắt đầu bằng http:// hoặc https://")

path = Path(__file__).with_name("config.js")
path.write_text(
    "// Tạo tự động bởi set_api_url.py\n"
    "window.FINIIP_CONFIG = {\n"
    f"  API_BASE_URL: {json.dumps(url)},\n"
    "  API_KEY: \"\",\n"
    "  WORKSPACE_ID: \"personal\",\n"
    "  USER_NAME: \"Phú\",\n"
    "  FRONTEND_VERSION: \"1.11.0\",\n"
    "};\n",
    encoding="utf-8",
)
print(f"Đã gắn backend: {url}")
