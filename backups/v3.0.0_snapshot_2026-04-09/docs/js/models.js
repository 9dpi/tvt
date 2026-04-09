// TVT Model Definitions — embedded for offline/GitHub Pages
const TVT_MODELS = {
  "5w1h": {
    name: "5W1H",
    description: "Phân tích vấn đề qua 6 câu hỏi: What, Why, Who, Where, When, How",
    icon: "❓",
    applicable_for: ["kỹ thuật", "kinh doanh", "xã hội", "cuộc sống"],
    max_rounds: 3,
    initial_questions: [
      { id: "what",  text: "What — Vấn đề cụ thể là gì?",                         min_words: 10, hint: "Mô tả bằng một câu rõ ràng, không lan man" },
      { id: "why",   text: "Why — Tại sao cần giải quyết? Bối cảnh?",              min_words: 15, hint: "Lợi ích mang lại? Điều gì xảy ra nếu không làm?" },
      { id: "who",   text: "Who — Ai sẽ dùng kết quả? Đối tượng liên quan?",      min_words: 10, hint: "Người dùng cuối, bên liên quan, đối tượng tác động" },
      { id: "where", text: "Where — Môi trường, phạm vi áp dụng?",                min_words: 10, hint: "Địa điểm, nền tảng, bối cảnh cụ thể" },
      { id: "when",  text: "When — Thời gian, lịch trình, deadline?",             min_words: 10, hint: "Mốc thời gian, ưu tiên, hạn chót" },
      { id: "how",   text: "How — Bạn đã nghĩ đến cách tiếp cận nào chưa?",      min_words: 15, hint: "Kể cả ý tưởng dang dở, sơ bộ đều được" }
    ],
    analysis_prompt: `Bạn là TVT (Tesla Visual Thinking) — trợ lý tư duy cấu trúc, phong cách Tesla: chính xác, thực tế, không lãng mạn hóa.

Câu trả lời 5W1H của người dùng:
What: {what}
Why: {why}
Who: {who}
Where: {where}
When: {when}
How: {how}

Trường hợp thông tin người dùng cung cấp quá ít hoặc không rõ ràng, bạn TUYỆT ĐỐI không được để trống. Hãy dùng "summary" để gợi ý cách mô tả tốt hơn và dùng "follow_up_questions" để hỏi ngược lại người dùng.

Trả lời CHÍNH XÁC bằng JSON hợp lệ (không thêm text bên ngoài):
{
  "summary": "Tóm tắt hoặc Gợi ý nếu thông tin chưa đủ",
  "ambiguities": ["điểm mơ hồ hoặc giả định"],
  "follow_up_questions": ["câu hỏi bổ sung hoặc câu hỏi ngược lại để làm rõ"],
  "self_research_task": "Nhiệm vụ thực tế cụ thể"
}`,
    solution_prompt: `Bạn là TVT (Tesla Visual Thinking). Phong cách: thực tiễn, dự đoán lỗi, tư duy first principles.

Vấn đề: {problem_summary}
Nghiên cứu thực tế: {research}
Bổ sung: {additional}

Đưa ra 3 giải pháp khác biệt (định dạng markdown):
Mỗi giải pháp: **Tên** · Mô tả cụ thể · Điểm mạnh · Điểm yếu/rủi ro (theo tư duy Tesla) · Thời gian ước lượng`,
    quick_solution_prompt: `Bạn là TVT (Tesla Visual Thinking).
⚠️ Giải pháp lý thuyết (thiếu dữ liệu thực tế).

Vấn đề: {problem_summary}

Đưa ra 3 giải pháp khả thi (markdown). Nhắc nhở kiểm chứng thực tế trước khi triển khai.`
  },

  "swot": {
    name: "SWOT",
    description: "Strengths · Weaknesses · Opportunities · Threats",
    icon: "🎯",
    applicable_for: ["kinh doanh", "chiến lược", "dự án", "cá nhân"],
    max_rounds: 3,
    initial_questions: [
      { id: "context",       text: "Bạn đang phân tích điều gì?",                     min_words: 10, hint: "Tên, lĩnh vực, giai đoạn phát triển của sản phẩm/dự án" },
      { id: "strengths",     text: "Strengths — Điểm mạnh nội tại?",                  min_words: 15, hint: "Nguồn lực, kỹ năng, lợi thế cạnh tranh bạn đang có" },
      { id: "weaknesses",    text: "Weaknesses — Điểm yếu nội tại?",                  min_words: 15, hint: "Hạn chế, thiếu sót, điều cần cải thiện" },
      { id: "opportunities", text: "Opportunities — Cơ hội bên ngoài đang mở ra?",   min_words: 15, hint: "Xu hướng thị trường, nhu cầu chưa được đáp ứng" },
      { id: "threats",       text: "Threats — Mối đe dọa bên ngoài?",                min_words: 15, hint: "Đối thủ, rủi ro, thay đổi môi trường bất lợi" }
    ],
    analysis_prompt: `Bạn là TVT (Tesla Visual Thinking) — tư duy chiến lược, thực tế.

SWOT cho: {context}
Strengths: {strengths}
Weaknesses: {weaknesses}
Opportunities: {opportunities}
Threats: {threats}

Luôn phải có phản hồi. Nếu thông tin thiếu, hãy nêu giả định trong "summary" và hỏi thêm trong "follow_up_questions". TUYỆT ĐỐI không trả lời trống.

JSON hợp lệ:
{
  "summary": "Phân tích tổng thể hoặc gợi ý bổ sung",
  "ambiguities": ["điểm cần làm rõ"],
  "follow_up_questions": ["câu hỏi đào sâu/ngược lại"],
  "self_research_task": "Nhiệm vụ thực tế"
}`,
    solution_prompt: `TVT SWOT Analysis. {problem_summary}. Nghiên cứu: {research}.

3 chiến lược markdown:
1. SO Strategy (Strengths × Opportunities)
2. WO Strategy (Weaknesses → Opportunities)  
3. Defensive Strategy (chống Threats)`,
    quick_solution_prompt: `TVT SWOT lý thuyết cho: {problem_summary}. 3 chiến lược markdown. ⚠️ Cần kiểm chứng thực tế.`
  },

  "firstprinc": {
    name: "First Principles",
    description: "Tư duy từ nguyên lý cơ bản — phong cách Elon Musk / Tesla",
    icon: "⚛️",
    applicable_for: ["đổi mới", "startup", "kỹ thuật", "chiến lược"],
    max_rounds: 3,
    initial_questions: [
      { id: "assumption",  text: "Giả định nào bạn đang tin là đúng về vấn đề này?",       min_words: 15, hint: "Liệt kê tất cả điều bạn 'mặc định' chấp nhận là sự thật" },
      { id: "breakdown",   text: "Chia nhỏ nhất có thể: vấn đề gồm những phần nào?",      min_words: 15, hint: "Như tháo rời một chiếc xe — từng bộ phận riêng biệt" },
      { id: "physics",     text: "Giới hạn vật lý / thực tế cứng nhắc nhất là gì?",      min_words: 10, hint: "Điều gì là KHÔNG THỂ thay đổi dù có bao nhiêu tiền/nguồn lực?" },
      { id: "rebuild",     text: "Nếu không có giới hạn xã hội, bạn sẽ xây lại thế nào?", min_words: 15, hint: "Bỏ qua 'cách thường làm', tưởng tượng từ con số 0" }
    ],
    analysis_prompt: `TVT — First Principles Thinking.

Giả định: {assumption}
Phân rã: {breakdown}
Giới hạn: {physics}
Xây lại: {rebuild}

Nếu thông tin chưa đủ để phân rã, hãy dùng "summary" để hướng dẫn người dùng cách tư duy First Principles và đặt câu hỏi ngược lại.

JSON:
{
  "summary": "Vấn đề cốt lõi hoặc Hướng dẫn tư duy lại",
  "ambiguities": ["giả định cần thách thức"],
  "follow_up_questions": ["câu hỏi đào sâu/ngược lại"],
  "self_research_task": "Kiểm chứng thực tế"
}`,
    solution_prompt: `TVT First Principles. Cốt lõi: {problem_summary}. Nghiên cứu: {research}.

3 giải pháp từ nguyên lý cơ bản (markdown). Mỗi cái: bắt đầu từ zero, không copy giải pháp hiện tại.`,
    quick_solution_prompt: `TVT First Principles lý thuyết: {problem_summary}. 3 hướng tiếp cận zero-based. Markdown.`
  }
};
