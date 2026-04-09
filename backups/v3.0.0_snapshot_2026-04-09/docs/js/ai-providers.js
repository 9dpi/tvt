/**
 * TVT AI Providers — Auto-detect free/local AI services
 * Priority: Ollama (local) → LM Studio → LocalAI → Chrome AI → Gemini Free → Groq Free → Offline
 */

const AI_PROVIDERS = {
  // Current active provider info
  _current: null,
  _status: 'checking', // checking | ollama | chrome | gemini | groq | offline

  // User-configured API keys (stored in localStorage)
  _config: {},

  init() {
    const saved = localStorage.getItem('tvt_ai_config');
    if (saved) this._config = JSON.parse(saved);
  },

  saveConfig(config) {
    this._config = { ...this._config, ...config };
    localStorage.setItem('tvt_ai_config', JSON.stringify(this._config));
  },

  getConfig() { return this._config; },

  /**
   * Auto-detect best available AI provider
   * Returns provider info object
   */
  async detectBest() {
    return Promise.race([
      this._detectBestLogic(),
      new Promise(resolve => setTimeout(() => {
        resolve({ provider: 'offline', model: null, free: true, local: true, label: '📴 Offline (Timeout)' });
      }, 3000))
    ]);
  },

  async _detectBestLogic() {
    // 1. Try Ollama (local, default port 11434)
    try {
      const res = await fetch('http://localhost:11434/api/tags', {
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const data = await res.json();
        const models = data.models || [];
        const preferred = ['gemma', 'llama', 'mistral', 'phi', 'qwen'];
        let chosenModel = null;
        for (const pref of preferred) {
          const found = models.find(m => m.name.toLowerCase().includes(pref));
          if (found) { chosenModel = found.name; break; }
        }
        if (!chosenModel && models.length > 0) chosenModel = models[0].name;
        if (chosenModel) {
          this._status = 'ollama';
          return { provider: 'ollama', model: chosenModel, free: true, local: true, label: `🖥️ Ollama (${chosenModel})` };
        }
      }
    } catch (_) {}

    // 1.1 Try LM Studio (Local, OpenAI-style on port 1234)
    try {
      const res = await fetch('http://localhost:1234/v1/models', {
        signal: AbortSignal.timeout(1000)
      });
      if (res.ok) {
        const data = await res.json();
        const model = data.data?.[0]?.id;
        if (model) {
          this._status = 'lm-studio';
          return { provider: 'groq', model, free: true, local: true, label: `🖥️ LM Studio (${model})`, baseUrl: 'http://localhost:1234/v1' };
        }
      }
    } catch (_) {}

    // 1.2 Try LocalAI (port 8080)
    try {
      const res = await fetch('http://localhost:8080/v1/models', {
        signal: AbortSignal.timeout(1000)
      });
      if (res.ok) {
        const data = await res.json();
        const model = data.data?.[0]?.id;
        if (model) {
          this._status = 'local-ai';
          return { provider: 'groq', model, free: true, local: true, label: `🖥️ LocalAI (${model})`, baseUrl: 'http://localhost:8080/v1' };
        }
      }
    } catch (_) {}

    // 2. Try Chrome Built-in AI (Gemini Nano)
    if (typeof window !== 'undefined' && window.ai?.languageModel) {
      try {
        const capabilities = await window.ai.languageModel.capabilities();
        if (capabilities.available !== 'no') {
          this._status = 'chrome';
          return { provider: 'chrome', model: 'gemini-nano', free: true, local: true, label: '🌐 Chrome AI (Gemini Nano)' };
        }
      } catch (_) {}
    }

    // 3. Try configured Gemini key
    if (this._config.geminiKey) {
      this._status = 'gemini';
      return { provider: 'gemini', model: this._config.geminiModel || 'gemini-2.0-flash', free: true, local: false, label: '✨ Gemini' };
    }

    // 4. Try configured Groq key
    if (this._config.groqKey) {
      this._status = 'groq';
      return { provider: 'groq', model: this._config.groqModel || 'llama-3.3-70b-versatile', free: true, local: false, label: '⚡ Groq' };
    }

    // 5. Try OpenRouter free models
    if (this._config.openrouterKey) {
      this._status = 'openrouter';
      return { provider: 'openrouter', model: 'meta-llama/llama-3.2-3b-instruct:free', free: true, local: false, label: '🔀 OpenRouter' };
    }

    // 6. Offline fallback
    this._status = 'offline';
    return { provider: 'offline', model: null, free: true, local: true, label: '📴 Offline (Quy tắc mẫu)' };
  },

  /**
   * Call the AI with a prompt
   */
  async call(prompt, providerInfo) {
    switch (providerInfo.provider) {
      case 'ollama':    return await this._callOllama(prompt, providerInfo.model);
      case 'chrome':    return await this._callChromeAI(prompt);
      case 'gemini':    return await this._callGemini(prompt);
      case 'groq':      return await this._callGroq(prompt, providerInfo);
      case 'openrouter':return await this._callOpenRouter(prompt);
      case 'offline':   
        if (prompt.includes('JSON')) return this._offlineAnalysis(prompt);
        return this._offlineSolution(prompt);
      default: throw new Error('Unknown provider: ' + providerInfo.provider);
    }
  },

  async _callOllama(prompt, model) {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
      signal: AbortSignal.timeout(300000)
    });
    if (!res.ok) throw new Error('Ollama error: ' + res.status);
    const data = await res.json();
    return data.response;
  },

  async _callChromeAI(prompt) {
    const session = await window.ai.languageModel.create({
      systemPrompt: 'You are TVT, a structured thinking assistant. Always respond in Vietnamese. Return valid JSON when asked.'
    });
    const result = await session.prompt(prompt);
    session.destroy();
    return result;
  },

  async _callGemini(prompt) {
    const key = this._config.geminiKey;
    const model = this._config.geminiModel || 'gemini-2.0-flash';
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: AbortSignal.timeout(300000)
      }
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error('Gemini: ' + (err.error?.message || res.status));
    }
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  },

  async _callGroq(prompt, providerInfo) {
    const baseUrl = providerInfo.baseUrl || 'https://api.groq.com/openai/v1';
    const key = this._config.groqKey || 'none'; 
    const model = this._config.groqModel || providerInfo.model || 'llama-3.3-70b-versatile';
    
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      }),
      signal: AbortSignal.timeout(300000)
    });
    if (!res.ok) throw new Error('AI Server error: ' + res.status);
    const data = await res.json();
    return data.choices[0].message.content;
  },

  async _callOpenRouter(prompt) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this._config.openrouterKey}`,
        'HTTP-Referer': 'https://9dpi.github.io/tvt/',
        'X-Title': 'TVT Tesla Visual Thinking'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!res.ok) throw new Error('OpenRouter error: ' + res.status);
    const data = await res.json();
    return data.choices[0].message.content;
  },

  /**
   * Offline rule-based analysis — no AI needed, deterministic
   */
  _offlineAnalysis(prompt) {
    const ctx = window._tvtCurrentAnswers || {};
    const allText = Object.values(ctx).join(' ').toLowerCase();
    const topic = Object.values(ctx)[0] || "vấn đề";
    const shortTopic = topic.substring(0, 50) + (topic.length > 50 ? '...' : '');

    // 1. Phân loại Domain
    let domain = 'tổng quát';
    if (allText.match(/app|web|phần mềm|code|it|hệ thống|máy tính/)) domain = 'kỹ thuật (Tech)';
    else if (allText.match(/bán|mua|khách|tiền|lợi nhuận|marketing|thị trường/)) domain = 'kinh doanh (Business)';
    else if (allText.match(/học|tập|thi|vở|sách|điểm/)) domain = 'học tập';

    // 2. Chấm điểm chi tiết
    const wordCount = allText.split(/\s+/).filter(Boolean).length;
    let scoreText = 'Cơ bản';
    if (wordCount > 100) scoreText = 'Rất chi tiết';
    else if (wordCount > 50) scoreText = 'Đủ dùng';

    // 3. Phân tích điểm mù
    const blindSpots = [];
    if (!allText.includes('rủi ro') && !allText.includes('lỗi')) blindSpots.push("Chưa tính đến các kịch bản thất bại (Pre-mortem).");
    if (!allText.match(/\d/)) blindSpots.push("Thiếu các dữ liệu cứng (con số, ngân sách).");
    if (!allText.includes('giờ') && !allText.includes('ngày')) blindSpots.push("Tiến độ công việc còn mơ hồ.");

    return JSON.stringify({
      summary: `[NIKOLA Logic Engine] Đã nhận diện vấn đề thuộc lĩnh vực ${domain}. Độ chi tiết: ${scoreText} (${wordCount} từ). Hệ thống nhận dạng đây là bài toán cần tối ưu hóa cấu trúc dựa trên nguyên lý Tesla.`,
      ambiguities: blindSpots.length ? blindSpots : ["Không phát hiện điểm mù lớn, nhưng cần kiểm chứng thực tế."],
      follow_up_questions: [
        `Yếu tố nào trong "${shortTopic}" có thể khiến bạn mất ngủ nếu nó không thành công?`,
        "Nếu ngân sách bị cắt giảm 50%, bạn sẽ giữ lại phần nào để duy trì cốt lõi?"
      ],
      self_research_task: `Tìm kiếm 3 giải pháp tương tự đã thành công trong lĩnh vực ${domain} để so sánh.`
    });
  },

  _offlineSolution(prompt) {
    const ctx = window._tvtCurrentAnswers || {};
    const allText = Object.values(ctx).join(' ').toLowerCase();
    const topic = Object.values(ctx)[0] || "vấn đề của bạn";

    let strategy = {
      title: "Chiến lược Tối ưu hóa Tổng quát",
      step1: "Xác định phần tử cốt lõi không thể thay đổi.",
      step2: "Loại bỏ 80% các yếu tố phụ trợ gây nhiễu.",
      step3: "Tập trung 100% nguồn lực vào 20% công việc quan trọng nhất."
    };

    if (allText.match(/app|web|phần mềm|code|it/)) {
      strategy = {
        title: "Chiến lược Tối ưu hóa Kỹ thuật (MVP First)",
        step1: "Xây dựng tính năng hạt nhân (Core function) trong 48h.",
        step2: "Giảm thiểu nợ kỹ thuật (Technical Debt) bằng cách code sạch từ đầu.",
        step3: "Triển khai bản Beta lấy phản hồi ngay lập tức."
      };
    } else if (allText.match(/bán|mua|khách|kinh doanh/)) {
      strategy = {
        title: "Chiến lược Kinh doanh Tinh gọn (Lean Startup)",
        step1: "Xác định nỗi đau khách hàng (Customer Painpoints).",
        step2: "Tạo ra một ưu đãi không thể từ chối (Irresistible Offer).",
        step3: "Tối ưu hóa phễu chuyển đổi thay vì tìm kiếm khách hàng mới."
      };
    }

    return `### ⚡ GIẢI PHÁP ĐỀ XUẤT (Logic Engine - Offline)
  
  NIKOLA đã tổng hợp dữ liệu và đề xuất: **${strategy.title}**
  
  **1. Bước Phân rã (Deconstruction)**
  - ${strategy.step1}
  
  **2. Bước Sàng lọc (Selection)**
  - ${strategy.step2}
  
  **3. Bước Thực thi (Execution)**
  - ${strategy.step3}
  
  ---
  ⚠️ *Phân tích này được chạy bằng thuật toán logic tĩnh của TVT. Để có giải pháp sáng tạo và linh hoạt từ Cloud AI (Gemini/Groq), vui lòng cài đặt **API Key** ở bảng bên phải.*`;
  },

  /**
   * Parse JSON from LLM response (handles markdown code blocks)
   */
  parseJSON(text) {
    text = text.trim();
    text = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '');
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    if (start !== -1 && end > start) text = text.slice(start, end);
    return JSON.parse(text);
  }
};
