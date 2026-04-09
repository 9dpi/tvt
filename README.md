# ⚡ TVT — Tesla Visual Thinking

> **Hệ thống tư duy có cấu trúc** · Phong cách Tesla · Offline-first · Hoàn toàn miễn phí

🌐 **Live**: [9dpi.github.io/tvt](https://9dpi.github.io/tvt/)

---

## ✨ Tính năng chính

- **🎨 Giao diện Yahoo Messenger / Windows XP** — Nostalgic, clean, dễ dùng
- **📴 Offline-first** — Hoạt động ngay cả không có internet
- **🤖 Tự động tìm AI miễn phí** theo thứ tự ưu tiên:

  | Độ ưu tiên | Provider | Loại |
  |---|---|---|
  | 1 | 🖥️ **Ollama** (local) | Hoàn toàn offline, cục bộ |
  | 2 | 🌐 **Chrome AI** (Gemini Nano) | Built-in browser |
  | 3 | ✨ **Google Gemini** (free tier) | Cloud, miễn phí |
  | 4 | ⚡ **Groq** (free tier) | Cloud, siêu nhanh |
  | 5 | 🔀 **OpenRouter** (free models) | Cloud, đa model |
  | 6 | 📴 **Offline rule-based** | Luôn hoạt động |

- **💾 Lưu session vào localStorage** — Không cần server, không cần tài khoản
- **📥 Xuất JSON/Markdown** — Giữ lại kết quả phân tích
- **📱 PWA** — Cài được lên điện thoại / desktop

---

## 🧠 Các model tư duy

| Model | Mô tả |
|---|---|
| **5W1H** | What · Why · Who · Where · When · How |
| **SWOT** | Strengths · Weaknesses · Opportunities · Threats |
| **First Principles** | Tư duy từ nguyên lý cơ bản — phong cách Elon Musk |

---

## 🚀 Dùng ngay (không cần cài gì)

Truy cập: **[9dpi.github.io/tvt](https://9dpi.github.io/tvt/)**

Hoạt động 100% offline bằng rule-based analysis nếu không có AI.

---

## 🖥️ Cài Ollama để dùng AI offline hoàn toàn

```bash
# 1. Tải Ollama tại https://ollama.com

# 2. Pull một model (chọn theo RAM)
ollama pull gemma3          # 4GB RAM — khuyến nghị
ollama pull llama3.2:3b     # 2GB RAM — nhẹ hơn
ollama pull phi3:mini       # 2GB RAM — nhanh

# 3. Mở TVT → tự động detect Ollama!
```

---

## 🔑 Cài đặt API Key (tùy chọn)

Nếu muốn dùng AI cloud miễn phí:

**Gemini (Google)**: Lấy key tại [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

**Groq**: Lấy key tại [console.groq.com](https://console.groq.com)

Sau đó vào **⚙️ Cài đặt AI** trong app và nhập key.

---

## 📁 Cấu trúc repo (GitHub Pages)

```
/
├── docs/                   # GitHub Pages root
│   ├── index.html          # App chính (XP/Yahoo UI)
│   ├── css/tvt.css         # Styles
│   ├── js/
│   │   ├── models.js       # Định nghĩa model (5W1H, SWOT, ...)
│   │   ├── ai-providers.js # Auto-detect free AI
│   │   ├── tvt-core.js     # Session + flow logic
│   │   └── app.js          # UI controller
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service Worker (offline cache)
├── tvt/                    # Legacy Python CLI (tùy chọn)
└── .github/workflows/      # Auto-deploy to GitHub Pages
```

---

## 🔄 Deploy lên GitHub Pages của bạn

```bash
# Fork repo → Settings → Pages → Source: Deploy from branch
# Chọn branch: main, folder: /docs
# Tự động deploy qua GitHub Actions
```

---

## 📄 License

MIT © 2025 [9dpi](https://github.com/9dpi)
