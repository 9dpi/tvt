# 🧬 Project DNA — Tesla Visual Thinking (TVT)

## 🎯 Tầm nhìn
Xây dựng một hệ thống tư duy có cấu trúc, lấy cảm hứng từ nguyên lý cơ bản (First Principles) của Elon Musk, giúp người dùng phân rã các vấn đề phức tạp thành những phần tử hạt nhân. Từ phiên bản 4.0, TVT tiến hóa thành **Cộng đồng Tư Duy Mở (Open Community)** — nơi tri thức và phương pháp giải quyết vấn đề được chia sẻ minh bạch, đa chiều và không phụ thuộc vào AI.

## 🏗️ Kiến Trúc Hệ Thống (Architecture)

### 1. Web Core (v4.1 — Cộng đồng Tư Duy Mở)
- **3-Column Layout**: 
    - **Community (Left)**: Kho tri thức cộng đồng, offline-first.
    - **Chat (Center)**: Không gian tương tác với Nikola AI hoặc tự tư duy.
    - **Task/Settings (Right)**: Quản lý phương pháp và cấu hình.
- **UI/UX**: Thống nhất giao diện **Windows 98 Retro** (Classic Silver, Navy Blue Titlebars, Tahoma 13px).
- **Sound System**: Yahoo Messenger nostalgia (Receieve, Send, BUZZ!).
- **Offline-first & Privacy**: Dữ liệu cộng đồng và cá nhân lưu hoàn toàn tại `localStorage`. Chia sẻ qua Import/Export JSON.

### 2. AI & Logic Engine
- **Decentralized AI**: Tích hợp Ollama (Local), Gemini, Groq (Cloud), và Chrome AI API.
- **Offline Fallback**: Engine phân tích dựa trên cấu trúc câu hỏi logic khi không có kết nối AI.

## 📜 Nguyên Lý "DNA"
1.  **Transparency (Minh bạch)**: Mọi vấn đề đều có thể công khai để nhận góp ý từ cộng đồng.
2.  **Diverse Perspectives (Đa chiều)**: Khuyến khích mỗi người dùng mang đến một mô hình tư duy khác nhau cho cùng một vấn đề.
3.  **No-AI Dependency**: Con người là trung tâm. AI chỉ đóng vai trò trợ lý tổng hợp và gợi ý.
4.  **Zero Server**: Không backend, không database tập trung. Người dùng làm chủ hoàn toàn dữ liệu của mình.

## 🛠️ Stack Công Nghệ
- **Frontend**: Vanilla JS, CSS3, Service Workers (PWA).
- **AI**: Ollama, Google AI SDK, Groq API.
- **Storage**: Browser LocalStorage, JSON Serialization.

---
*Cập nhật lần cuối: 2026-04-09 | Version 4.1.1 (Community Release)*
*Checkpoint chi tiết: [CHECKPOINT_V4.1.md](file:///d:/Automator_Prj/Tesla%20Visual%20Thinking%20-%20TVT/CHECKPOINT_V4.1.md)*
