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

## ✨ Tính năng mới (v4.1) — Cộng đồng & Hoài niệm

- **🌐 Community Panel**: Cột trái hiển thị vấn đề cộng đồng đang thảo luận — công khai, minh bạch.
- **✏️ Đặt câu hỏi**: Chia sẻ vấn đề kèm phương pháp tư duy và tags phân loại.
- **💬 Yahoo Messenger Sounds**: Âm thanh nhận tin, gửi tin và **BUZZ!** kinh điển của Yahoo.
- **🔔 BUZZ! Feature**: Nudge (rung màn hình) để thu hút sự chú ý, mang lại cảm giác hoài cổ.
- **🎨 Windows 98 Theme**: Giao diện thống nhất màu Silver và Navy Blue, font Tahoma 13px cực kỳ dễ đọc.
- **🗳️ Voting & Giải quyết**: Ủng hộ bài viết hay, đánh dấu vấn đề đã có hướng đi.
- **📦 Chia sẻ qua JSON**: Xuất/nhập toàn bộ dữ liệu cộng đồng để chia sẻ với nhóm khác.

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
