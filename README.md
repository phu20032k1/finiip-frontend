# Finiip Frontend V111 — tương thích Backend V110

Frontend HTML/CSS/JavaScript thuần, không cần build. Có thể deploy lên Vercel, Netlify hoặc bất kỳ static hosting nào.

## Những chức năng đã nối với Backend V110

### Trò chuyện AI

- Tạo, mở, đổi tên, lưu trữ và xóa cuộc trò chuyện.
- Giữ `conversation_id`, `user_id` và `workspace_id` để backend nhớ đúng ngữ cảnh.
- Câu hỏi tối đa 100.000 ký tự, có bộ đếm ký tự.
- Chế độ phân tích sâu.
- Backend tự phân tích câu hỏi nhiều đầu việc; frontend hiển thị trạng thái xử lý.
- Hiển thị câu trả lời dài, bảng Markdown, danh sách, code block và trích dẫn.
- Hiển thị độ tin cậy, số đầu việc, cảnh báo chất lượng và câu hỏi gợi ý tiếp theo.

### Nguồn tham chiếu đẹp

Frontend ưu tiên trường `source_cards` của Backend V110 và hiển thị nguồn ở khối thu gọn riêng bên dưới câu trả lời.

- Không nối đường dẫn nội bộ vào bong bóng trả lời.
- Tự làm sạch tên như `knowledge_base/accounting_accounts.md`.
- Có badge, tên tài liệu, vị trí và đoạn trích.
- Vẫn hỗ trợ `citations` cũ khi mở lịch sử trò chuyện.

### Đính kèm và đọc file

- Chọn nhiều file hoặc kéo thả trực tiếp vào ô chat.
- Tối đa theo giá trị backend trả về, mặc định 12 file/tin nhắn.
- Hỗ trợ PDF, DOCX, XLSX/XLSM, CSV, JSON, TXT, Markdown, HTML/XML và ảnh OCR.
- Hiển thị dung lượng và số ký tự backend đã đọc.
- Có thể bỏ từng file trước khi gửi.

### Tải file do chatbot tạo

Khi backend trả:

```json
{
  "generated_file": {
    "status": "done",
    "filename": "bao-cao.docx",
    "download_url": "/api/v1/chat/generated-files/fr_..."
  }
}
```

frontend hiển thị thẻ **Tải file** riêng. File được tải bằng `fetch` kèm `X-User-ID`, `X-Workspace-ID` và `X-API-Key`, nên hoạt động đúng với endpoint có kiểm tra quyền.

### Tài liệu & báo cáo

Màn hình **Tài liệu & báo cáo** đã nối:

- `GET /ai/v68/file-report/capabilities`
- `POST /ai/v69/file-report/jobs`
- `GET /ai/v69/file-report/jobs/{job_id}`
- `GET /ai/v69/file-report/jobs/{job_id}/download`
- `GET /ai/v70/file-report/history`
- `DELETE /ai/v70/file-report/history/{job_id}`

Chức năng:

- Chọn nhiều file.
- Chọn loại báo cáo, kiểu trình bày và định dạng đầu ra.
- Tạo job bất đồng bộ và tự poll trạng thái.
- Xem lịch sử, tải hoặc xóa báo cáo.
- Hỗ trợ DOCX, XLSX, PDF, CSV, JSON, TXT và Markdown.

### Kho kiến thức RAG

Màn hình **Kho kiến thức** đã nối API V84:

- Dashboard số tài liệu/chunks.
- Tìm kiếm tài liệu.
- Upload tài liệu vào RAG theo workspace.
- Xem metadata và chunks.
- Kích hoạt/lưu trữ.
- Lập chỉ mục lại.
- Xóa tài liệu.

Các endpoint dùng:

```text
GET    /ai/v84/rag/dashboard/status
POST   /ai/v84/rag/documents/upload
GET    /ai/v84/rag/documents
GET    /ai/v84/rag/documents/{document_id}
POST   /ai/v84/rag/documents/{document_id}/status
POST   /ai/v84/rag/documents/{document_id}/reindex
DELETE /ai/v84/rag/documents/{document_id}
```

Đây là chức năng quản trị. Khi deploy thật, backend nên đặt `FINIIP_API_KEY` và frontend quản trị không nên công khai API key bí mật trong mã nguồn.

## Cấu hình backend

Mở `config.js`:

```js
window.FINIIP_CONFIG = {
  API_BASE_URL: "https://TEN-BACKEND.onrender.com",
  API_KEY: "",
  WORKSPACE_ID: "personal",
  USER_NAME: "Phú",
  FRONTEND_VERSION: "1.11.0",
};
```

Không thêm dấu `/` ở cuối URL.

Bạn cũng có thể bấm nút trạng thái API trên giao diện để thay URL, API key, workspace và tên hiển thị. API key nhập trong giao diện chỉ được lưu trong `sessionStorage`.

Hoặc chạy:

```bash
python set_api_url.py https://TEN-BACKEND.onrender.com
```

## Chạy local

Không mở bằng `file://`. Trong thư mục frontend chạy:

```bash
python -m http.server 5500
```

Mở:

```text
http://localhost:5500
```

## Deploy Vercel

1. Đưa toàn bộ thư mục frontend lên một Git repository.
2. Import repository vào Vercel.
3. Framework Preset: **Other**.
4. Không cần Build Command.
5. Output Directory để trống hoặc `.`.

## CORS trên Render

Backend phải cho phép domain frontend. Ví dụ:

```env
CORS_ORIGINS=https://ten-frontend.vercel.app,http://localhost:5500
```

Sau khi thay biến môi trường, deploy lại backend.

## Các file đã nâng

```text
index.html
app.js
styles.css
config.js
config.example.js
set_api_url.py
vercel.json
README.md
MANIFEST_FRONTEND_V111.txt
validate_frontend.py
```

## Kiểm tra nhanh

```bash
python validate_frontend.py
```

Script kiểm tra file bắt buộc, ID HTML, selector JavaScript, dấu ngoặc CSS và cú pháp JavaScript nếu máy có Node.js.
