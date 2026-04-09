/**
 * TVT AI Providers — Auto-detect free/local AI services
 * Priority: Ollama (local) → Chrome AI → Gemini Free → Groq Free → Offline
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
    // 1. Try Ollama (local, completely free)
    try {
      const res = await fetch('http://localhost:11434/api/tags', {
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        const models = data.models || [];
        const preferred = ['gemma3', 'gemma2', 'llama3', 'llama3.2', 'mistral', 'phi3', 'qwen'];
        let chosenModel = null;
        for (const pref of preferred) {
          const found = models.find(m => m.name.toLowerCase().startsWith(pref));
          if (found) { chosenModel = found.name; break; }
        }
        if (!chosenModel && models.length > 0) chosenModel = models[0].name;
        if (chosenModel) {
          this._status = 'ollama';
          return { provider: 'ollama', model: chosenModel, free: true, local: true, label: `🖥️ Ollama (${chosenModel})` };
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

    // 3. Try configured Gemini key (free tier)
    if (this._config.geminiKey) {
      this._status = 'gemini';
      return { provider: 'gemini', model: this._config.geminiModel || 'gemini-2.0-flash', free: true, local: false, label: '✨ Gemini' };
    }

    // 4. Try configured Groq key (free tier)
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
      case 'groq':      return await this._callGroq(prompt);
      case 'openrouter':return await this._callOpenRouter(prompt);
      case 'offline':   return this._offlineAnalysis(prompt);
      default: throw new Error('Unknown provider: ' + providerInfo.provider);
    }
  },

  async _callOllama(prompt, model) {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
      signal: AbortSignal.timeout(30000)
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
        signal: AbortSignal.timeout(30000)
      }
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error('Gemini: ' + (err.error?.message || res.status));
    }
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  },

  async _callGroq(prompt) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this._config.groqKey}`
      },
      body: JSON.stringify({
        model: this._config.groqModel || 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      }),
      signal: AbortSignal.timeout(30000)
    });
    if (!res.ok) throw new Error('Groq error: ' + res.status);
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
    // Extract answers from the prompt context (passed via window)
    const ctx = window._tvtCurrentAnswers || {};
    const allText = Object.values(ctx).join(' ').toLowerCase();
    const wordCount = allText.split(/\s+/).filter(Boolean).length;

    // Detect potential ambiguities by keyword analysis
    const ambiguities = [];
    const vague = ['nhiều', 'một số', 'có thể', 'khoảng', 'tương đối', 'chắc là', 'dự kiến'];
    vague.forEach(v => { if (allText.includes(v)) ambiguities.push(`Cụm "${v}" cần định lượng cụ thể hơn`); });
    if (ambiguities.length === 0) ambiguities.push('Bổ sung dữ liệu định lượng (số liệu, tỷ lệ, mốc thời gian cụ thể)');

    const topicWords = Object.values(ctx)[0]?.split(' ').slice(0, 5).join(' ') || 'vấn đề này';
    
    return JSON.stringify({
      summary: `[Phân tích offline] Bạn đang xử lý vấn đề: "${topicWords}..." với ${wordCount} từ mô tả. TVT ghi nhận đầy đủ 6 chiều phân tích. Độ chi tiết: ${wordCount > 80 ? 'tốt' : 'cần bổ sung thêm'}.`,
      ambiguities: ambiguities.slice(0, 3),
      follow_up_questions: [
        `Bạn có thể đo lường thành công của "${topicWords}" bằng con số cụ thể nào?`,
        'Có yếu tố rủi ro nào bạn chưa đề cập đến trong mô tả?'
      ],
      self_research_task: `Tìm 3-5 ví dụ thực tế (case study) về "${topicWords}" và ghi lại điểm mạnh/yếu của mỗi ví dụ.`
    });
  },

  /**
   * Parse JSON from LLM response (handles markdown code blocks)
   */
  parseJSON(text) {
    text = text.trim();
    // Remove markdown fences
    text = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '');
    // Find JSON object
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    if (start !== -1 && end > start) text = text.slice(start, end);
    return JSON.parse(text);
  }
};
