# 🏁 Checkpoint v2.1.0 — Tesla Visual Thinking

## 📅 Thời gian: 2026-04-09 12:45 (Local Time)

## 🎯 Trạng thái hoàn thành
Hệ thống đã được nâng cấp toàn diện để hỗ trợ AI Offline (Ollama) tốt hơn, cải thiện trải nghiệm người dùng trên Windows và làm sạch dữ liệu đầu ra.

## ✅ Danh sách thay đổi (Changelog)

### 1. 🤖 Tối ưu hóa LLM (Ollama Focus)
- **Tăng Timeout**: Nâng từ 30 giây lên **5 phút (300 giây)** cho các cuộc gọi API (Ollama, Gemini, Groq). Khắc phục triệt để lỗi `signal timed out` trên các máy cấu hình thấp.
- **Python Integration**: Đồng bộ hóa `llm_client.py` để hỗ trợ Ollama và các thiết lập timeout tương ứng.

### 2. ✨ Dọn dẹp dữ liệu (Output Cleaning)
- **LaTeX Stripping**: Tự động chuyển đổi/loại bỏ các ký tự `$\rightarrow$`, `$\Rightarrow$`, `\rightarrow` thành biểu tượng Unicode sạch sẽ.
- **Global 적용**: Áp dụng cả trên giao diện Web (qua `formatText` trong `app.js`) và core Python (qua `_clean_text` trong `llm_client.py`).

### 3. 🚀 Trải nghiệm người dùng (UX)
- **Start.bat**: Tạo file khởi chạy tự động cho Windows. Kiểm tra Python, cài đặt thư viện, kiểm tra Ollama và khởi động server chỉ với 1-click.
- **WebServer Fix**: Cấu hình `http.server` chạy trực tiếp từ thư mục `docs` để đảm bảo load đúng CSS và JS, tránh vỡ layout.

### 4. 📂 Tài liệu dự án (Documentation)
- **README.md**: Viết lại theo hướng hiện đại, tập trung vào tính năng mới và hướng dẫn khởi động nhanh.
- **PROJECT_DNA.md**: Thiết lập tài liệu kiến trúc hạt nhân cho dự án.

## 📌 Lưu ý cho phiên tiếp theo
- Nếu mô hình AI vẫn phản hồi chậm, có thể cân nhắc thêm cơ chế **Stream response** (hiện tại đang dùng `stream: false`).
- Cần kiểm tra khả năng tương thích của Chrome AI trên các phiên bản trình duyệt khác nhau.

---
*Checkpoint created by Antigravity*
