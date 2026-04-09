# ⚡ TVT — Tesla Visual Thinking

> **Hệ thống tư duy có cấu trúc** · Phong cách Tesla · Offline-first · Hoàn toàn miễn phí

🌐 **Live**: [9dpi.github.io/tvt](https://9dpi.github.io/tvt/)

---

## 🚀 Khởi động nhanh (Local)

Để chạy TVT trên máy tính của bạn với đầy đủ tính năng AI Offline (Ollama):

1. **Tải mã nguồn** về máy.
2. Nhấp đúp vào file **`Start.bat`**.
3. Ứng dụng sẽ tự động kiểm tra môi trường, cài đặt thư viện và mở trình duyệt tại địa chỉ: `http://localhost:8502`

---

## ✨ Tính năng mới (v3.0)

- **🎨 Hệ thống Đa giao diện (Multi-theme)**: Hỗ trợ chuyển đổi giữa giao diện Hiện đại (Glassmorphism) và giao diện Hoài cổ (Windows 98) ngay trong menu.
- **🚀 Siêu tốc độ với Start.bat**: Khởi động Windows chỉ bằng 1 click.
- **🤖 Tối ưu Ollama**: Hỗ trợ timeout lên đến 5 phút cho các dòng máy cấu hình thấp, đảm bảo không bị lỗi "Timed Out" khi sinh giải pháp dài.
- **✨ Dọn dẹp câu trả lời**: Tự động loại bỏ và chuyển đổi các ký tự nhiễu LaTeX ($\rightarrow$, $\Rightarrow$) thành biểu tượng Unicode gọn gàng.

---

## 🤖 Hệ thống AI hỗ trợ

| Độ ưu tiên | Provider | Loại | Trạng thái |
|---|---|---|---|
| 1 | 🖥️ **Ollama** (local) | Hoàn toàn offline | ✅ Hỗ trợ tốt nhất |
| 2 | 🌐 **Chrome AI** (Gemini Nano) | Built-in browser | ✅ Miễn phí |
| 3 | ✨ **Google Gemini** | Cloud (Free key) | ✅ Ổn định |
| 4 | ⚡ **Groq** | Cloud (Free key) | ✅ Siêu nhanh |
| 5 | 📴 **Offline logic** | Bộ quy tắc tĩnh | ✅ Luôn sẵn sàng |

---

## 🖥️ Cài đặt Ollama để dùng AI offline

Nếu bạn muốn tư duy 100% riêng tư không cần Internet:
```bash
# 1. Tải Ollama tại https://ollama.com
# 2. Chạy lệnh để lấy model (khuyên dùng):
ollama pull gemma:2b
# 3. Chạy Start.bat và chọn model trong app.
```

---

## 📁 Cấu trúc thư mục

```
/
├── docs/                   # App chính (Web UI) - Chạy tại cổng 8502
├── tvt/                    # Python Core & CLI tools
├── Start.bat               # File khởi động nhanh (Windows)
├── PROJECT_DNA.md          # Tài liệu kiến trúc & tầm nhìn
└── README.md               # Hướng dẫn sử dụng
```

---

## 📄 License
MIT © 2025 [9dpi](https://github.com/9dpi)
