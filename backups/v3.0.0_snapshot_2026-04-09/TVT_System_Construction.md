Kiến trúc tổng thể TVT (phiên bản MVP)
┌─────────────────────────────────────────────────────────────┐
│                      GIAO DIỆN NGƯỜI DÙNG                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────────┐   │
│  │ CLI      │    │ Web UI   │    │ (TUI - có thể sau)    │   │
│  │ (Typer)  │    │(Streamlit)│    │                      │   │
│  └────┬─────┘    └────┬─────┘    └──────────┬───────────┘   │
└───────┼────────────────┼────────────────────┼───────────────┘
        │                │                    │
        └────────────────┼────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   LỚP ĐIỀU PHỐI (CORE)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Orchestrator (Python)                                │   │
│  │  - Quản lý phiên (session)                            │   │
│  │  - Nạp model YAML                                     │   │
│  │  - Điều khiển vòng hỏi-đáp (tối đa 3 vòng)           │   │
│  │  - Gọi LLM để phân tích & tổng hợp                    │   │
│  │  - Xuất kết quả (JSON, markdown, bảng)                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌─────────────────────────────────┐
│  LỚP MODEL (YAML) │    │  LƯU TRỮ & TIỆN ÍCH              │
│  ┌──────────────┐ │    │  - Lưu phiên làm việc (SQLite)   │
│  │ 5w1h.yaml    │ │    │  - Cache kết quả tìm kiếm (tuỳ)  │
│  │ swot.yaml    │ │    │  - Ghi log tương tác             │
│  │ firstprinc.. │ │    └─────────────────────────────────┘
│  │ scamper.yaml │ │
│  └──────────────┘ │
└──────────────────┘

Ghi chú: MVP sẽ chỉ hỗ trợ CLI + Web UI (Streamlit). Model đầu tiên là 5w1h.yaml (đã thử nghiệm). Các model khác sẽ thêm sau.

📁 Cấu trúc thư mục của repo GitHub: https://github.com/9dpi/tvt 

tvt/
├── README.md                 # Giới thiệu, cài đặt, hướng dẫn nhanh
├── LICENSE                   # MIT hoặc Apache 2.0
├── requirements.txt          # Dependencies (Python)
├── setup.py / pyproject.toml # Đóng gói
├── .env.example              # Mẫu file cấu hình (API keys)
│
├── tvt/
│   ├── __init__.py
│   ├── cli.py                # CLI entry point (Typer)
│   ├── core/
│   │   ├── orchestrator.py   # Lớp điều phối chính
│   │   ├── session.py        # Quản lý phiên làm việc (lưu câu trả lời)
│   │   ├── model_loader.py   # Đọc model YAML
│   │   ├── llm_client.py     # Gọi OpenAI/Gemini/Claude (abstraction)
│   │   └── utils.py          # Hàm phụ trợ
│   ├── models/               # Thư mục chứa các file .yaml
│   │   ├── 5w1h.yaml
│   │   ├── swot.yaml
│   │   └── ...
│   ├── storage/              # Lưu session, cache
│   │   └── sessions.db       # SQLite
│   └── webui/                # Streamlit app
│       └── app.py
│
├── tests/                    # Unit tests
└── docs/                     # Tài liệu chi tiết

Định dạng model YAML (chuẩn cho MVP)
Lấy ví dụ models/5w1h.yaml:
name: "5W1H"
description: "Phân tích vấn đề qua 6 câu hỏi: What, Why, Who, Where, When, How"
version: "1.0"
applicable_for: ["kỹ thuật", "kinh doanh", "xã hội", "cuộc sống"]
max_rounds: 3   # tổng số vòng hỏi-đáp tối đa

# Các bước hỏi trong vòng 1
initial_questions:
  - id: "what"
    text: "What (Vấn đề cụ thể là gì?)"
    min_words: 10
    hint: "Hãy mô tả bằng một câu rõ ràng, không lan man"
  - id: "why"
    text: "Why (Tại sao cần giải quyết? Bối cảnh?)"
    min_words: 15
    hint: "Lợi ích mang lại? Điều gì xảy ra nếu không làm?"
  - id: "who"
    text: "Who (Ai sẽ dùng kết quả? Đối tượng liên quan?)"
    min_words: 10
  - id: "where"
    text: "Where (Môi trường, phạm vi áp dụng?)"
    min_words: 10
  - id: "when"
    text: "When (Thời gian, lịch trình, deadline?)"
    min_words: 10
  - id: "how"
    text: "How (Bạn đã nghĩ đến cách tiếp cận nào chưa?)"
    min_words: 15
    hint: "Kể cả ý tưởng dang dở"

# Phân tích câu trả lời (gửi LLM)
analysis_prompt_template: |
  Bạn là TVT (Tesla Visual Thinking). Dưới đây là câu trả lời của người dùng cho các câu hỏi 5W1H:
  
  What: {what}
  Why: {why}
  Who: {who}
  Where: {where}
  When: {when}
  How: {how}
  
  Hãy:
  1. Tóm tắt vấn đề trong 2-3 câu.
  2. Chỉ ra 2-3 điểm mơ hồ, thiếu cụ thể (nếu có).
  3. Đề xuất 2-3 câu hỏi bổ sung để làm rõ (nếu cần).
  4. Nếu vấn đề đã rõ, hãy đề xuất một nhiệm vụ tự tìm kiếm thực tế cho người dùng (ví dụ: "hãy tìm 5 kênh đối thủ", "hãy thử nghiệm với 3 cách tiếp cận khác nhau", v.v.).
  
  Trả lời bằng JSON có cấu trúc:
  {
    "summary": "...",
    "ambiguities": ["...", "..."],
    "follow_up_questions": ["...", "..."],
    "self_research_task": "..."
  }

# Sau khi user hoàn thành self_research_task (vòng 2), TVT sẽ gọi prompt này để sinh 3 giải pháp
solution_generation_prompt: |
  Dựa trên:
  - Mô tả vấn đề: {problem_summary}
  - Kết quả tự nghiên cứu của user: {user_research_findings}
  - Các câu trả lời bổ sung (nếu có): {additional_answers}
  
  Hãy đưa ra 3 giải pháp khác biệt, mỗi giải pháp gồm:
  - Tên phương pháp
  - Mô tả ngắn (cách làm cụ thể)
  - Điểm mạnh
  - Điểm yếu (bao gồm dự đoán lỗi tiềm ẩn theo kiểu Tesla)
  - (Tuỳ chọn) Thời gian ước lượng đạt mục tiêu
  
  Định dạng đầu ra: markdown (bảng hoặc danh sách).

Giải thích:

initial_questions: vòng 1, hỏi tuần tự.

analysis_prompt_template: gửi đến LLM để phân tích sau vòng 1.

solution_generation_prompt: gửi đến LLM sau vòng 2 (khi user đã hoàn thành tự tìm kiếm). Nếu user chọn phương án B (bỏ qua tự tìm kiếm), TVT sẽ gọi một prompt dự phòng (khác) để sinh giải pháp lý thuyết.

🔄 Luồng xử lý một phiên (session)
User chạy `tvt ask --model 5w1h`
│
├─► Core tạo session mới (lưu vào SQLite)
├─► Load model 5w1h.yaml
│
├─► Vòng 1: Hỏi từng câu hỏi initial_questions
│      (lưu câu trả lời, kiểm tra min_words)
│
├─► Gửi toàn bộ câu trả lời + analysis_prompt_template tới LLM
│      ← LLM trả về JSON (summary, ambiguities, follow_up_questions, self_research_task)
│
├─► Hiển thị cho user:
│      - Tóm tắt vấn đề
│      - Các điểm mơ hồ (nếu có) và yêu cầu trả lời follow_up_questions
│      - Đề xuất self_research_task (yêu cầu user làm offline)
│
├─► Nếu còn follow_up_questions (vòng 1b): hỏi tiếp, tối đa 3 lượt
│
├─► Sau khi user xác nhận đã hoàn thành self_research_task (gõ "done" và nhập findings)
│      → Vòng 2 kết thúc
│
├─► Vòng 3: Gửi solution_generation_prompt + toàn bộ dữ liệu tới LLM
│      ← LLM trả về 3 giải pháp (markdown)
│
├─► Hiển thị kết quả, lưu session
│
└─► Kết thúc. User có thể xuất session ra file JSON.

Trường hợp user chọn "bỏ qua tự tìm kiếm" (như phương án B): TVT sẽ bỏ qua bước self_research_task và gọi một prompt khác (ví dụ quick_solution_prompt) để sinh giải pháp lý thuyết, kèm cảnh báo thiếu dữ liệu thực tế.

🛠 Lựa chọn công nghệ cho MVP
Thành phần	Công nghệ	Lý do
Ngôn ngữ core	Python 3.10+	Dễ phát triển, nhiều thư viện, dễ tích hợp LLM.
CLI	Typer	Xây dựng CLI nhanh, tự động help, hỗ trợ màu sắc.
Web UI	Streamlit	Chỉ vài dòng code có form, text area, hiển thị markdown. Phù hợp MVP.
LLM Client	openai (GPT-3.5/4), google-generativeai (Gemini), anthropic (Claude) – chọn 1 cái trước, dùng config.	Dùng API key từ biến môi trường.
Lưu trữ session	SQLite (qua sqlite3)	Nhẹ, không cần server. Lưu câu trả lời, trạng thái.
Đọc YAML	pyyaml	Chuẩn.
Kiểm tra từng câu hỏi	Regex + len()	Đơn giản, không cần NLP phức tạp.
Hiển thị bảng	rich (cho CLI)	Đẹp, hỗ trợ markdown, bảng.
Giao diện mobile first tone màu sáng, rõ ràng, clean như Yahoo Chat 
