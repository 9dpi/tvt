# 🧬 Project DNA — Tesla Visual Thinking (TVT)

## 🎯 Tầm nhìn
Xây dựng một hệ thống tư duy có cấu trúc, lấy cảm hứng từ nguyên lý cơ bản (First Principles) của Elon Musk, giúp người dùng phân rã các vấn đề phức tạp thành những phần tử hạt nhân để giải quyết triệt để.

## 🏗️ Kiến Trúc Hệ Thống (Architecture)

### 1. Web Core (v3.0 - Hiện tại)
- **Frontend native**: HTML5, Vanilla JavaScript, CSS3.
- **UI/UX**: Hỗ trợ đa giao diện (Multi-theme). Bao gồm:
    - **Hiện đại**: Clean, Mobile-first, Glassmorphism.
    - **Windows 98**: Retro nostalgic, pixel perfect bevels.
- **Offline-first**: Sử dụng Service Worker để cache toàn bộ ứng dụng, hoạt động không cần Internet.
- **AI Orhcestration**: Logic điều phối AI nằm hoàn toàn ở client-side (`docs/js/ai-providers.js`).

### 2. Python Bridge (Legacy/CLI)
- **CLI**: Công cụ dòng lệnh mạnh mẽ (`tvt/cli.py`).
- **WebUI (Streamlit)**: Dashboard phân tích sâu (`tvt/webui/app.py`).
- **Core Logic**: Bộ engine xử lý YAML models và LLM client đồng bộ (`tvt/core/`).

## 🤖 Chiến Lược AI (AI Strategy)
Hệ thống ưu tiên quyền riêng tư và chi phí thấp thông qua mô hình phân tầng:
1.  **Local LLM (Ollama)**: Ưu tiên số 1, bảo mật tuyệt đối, hoàn toàn miễn phí.
2.  **Browser AI (Chrome API)**: Tận dụng sức mạnh xử lý ngay trên trình duyệt.
3.  **Cloud AI (Gemini/Groq)**: Chỉ sử dụng khi cần hiệu suất cao, hỗ trợ Free Tier.
4.  **Logic Engine (Offline)**: Bộ quy tắc tĩnh để phân tích cơ bản khi không có AI.

## 🛠️ Stack Công Nghệ
- **Web**: Vanilla JS, CSS Glassmorphism, Service Workers, PWA.
- **Python**: Typer (CLI), Rich (Terminal UI), Streamlit (WebUI), PyYAML (Data).
- **AI Tools**: Ollama, Google Generative AI SDK, Groq Cloud API.

## 📜 Nguyên Lý Phát Triển
1.  **Simple First**: Ưu tiên JavaScript thuần để tối ưu tốc độ và khả năng triển khai dễ dàng.
2.  **Privacy First**: Không lưu trữ dữ liệu trên server, toàn bộ nằm ở local storage.
3.  **Visual Thinking**: Biến các câu trả lời văn bản khô khan thành sơ đồ tư duy trực quan.

---
*Cập nhật lần cuối: 2026-04-09 | Version 3.0.0 (Stable)*
*Lộ trình tiếp theo: [CHECKPOINT_V4.0_PLANNING.md](file:///d:/Automator_Prj/Tesla%20Visual%20Thinking%20-%20TVT/CHECKPOINT_V4.0_PLANNING.md)*
