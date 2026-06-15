from __future__ import annotations

import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REQUIRED = [
    "index.html", "app.js", "styles.css", "config.js",
    "config.example.js", "vercel.json", "README.md",
]

errors: list[str] = []
for name in REQUIRED:
    if not (ROOT / name).exists():
        errors.append(f"Thiếu file: {name}")

html = (ROOT / "index.html").read_text(encoding="utf-8")
js = (ROOT / "app.js").read_text(encoding="utf-8")
css = (ROOT / "styles.css").read_text(encoding="utf-8")

ids = re.findall(r'id="([^"]+)"', html)
duplicates = sorted({item for item in ids if ids.count(item) > 1})
if duplicates:
    errors.append("ID HTML bị trùng: " + ", ".join(duplicates))

selectors = set(re.findall(r"\$\('#([^']+)'\)", js))
missing = sorted(selectors - set(ids))
if missing:
    errors.append("Selector JavaScript không có trong HTML: " + ", ".join(missing))

if css.count("{") != css.count("}"):
    errors.append("Số ngoặc { } trong CSS không cân bằng")

required_endpoints = [
    "/api/v1/chat/status",
    "/api/v1/chat/capabilities",
    "/api/v1/chat/conversations",
    "/api/v1/chat/attachments",
    "/ai/v69/file-report/jobs",
    "/ai/v70/file-report/history",
    "/ai/v84/rag/documents",
]
for endpoint in required_endpoints:
    if endpoint not in js:
        errors.append(f"Chưa nối endpoint: {endpoint}")

node = shutil.which("node")
if node:
    result = subprocess.run([node, "--check", str(ROOT / "app.js")], capture_output=True, text=True)
    if result.returncode:
        errors.append("JavaScript sai cú pháp:\n" + result.stderr)

if errors:
    print("FRONTEND VALIDATION: FAILED")
    for error in errors:
        print("-", error)
    raise SystemExit(1)

print("FRONTEND VALIDATION: PASSED")
print(f"- {len(ids)} HTML IDs, không trùng")
print(f"- {len(selectors)} JavaScript ID selectors, không thiếu")
print("- CSS braces balanced")
print("- Backend V110 endpoint mappings present")
print("- JavaScript syntax checked" if node else "- Node.js không có; bỏ qua node --check")
