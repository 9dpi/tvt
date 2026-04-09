/**
 * TVT App — Main UI Controller
 * Yahoo Messenger / Windows XP IM style
 */

const App = {
  provider: null,
  soundEnabled: false,

  // ─── Init ─────────────────────────────────────────────────────────────────
  async init() {
    AI_PROVIDERS.init();
    this.bindEvents();
    this.showScreen('home');
    await this.detectAI();
  },

  async detectAI() {
    const statusEl = document.getElementById('ai-status-text');
    const dotEl = document.getElementById('ai-status-dot');
    if (statusEl) statusEl.textContent = 'Đang tìm AI...';

    this.provider = await AI_PROVIDERS.detectBest();

    if (statusEl) statusEl.textContent = this.provider.label;
    if (dotEl) {
      dotEl.className = 'status-dot ' + (this.provider.provider === 'offline' ? 'offline' : 'online');
    }

    // Update all status indicators
    document.querySelectorAll('.provider-label').forEach(el => {
      el.textContent = this.provider.label;
    });
  },

  // ─── Screen Management ────────────────────────────────────────────────────
  showScreen(name, data = {}) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(`screen-${name}`);
    if (screen) screen.classList.add('active');

    // Update window title
    const titles = {
      home:     '⚡ TVT — Tesla Visual Thinking',
      chat:     `TVT : ${data.userName || 'Bạn'} — Phiên tư duy`,
      settings: '⚙️ Cài đặt AI',
      history:  '📂 Lịch sử phiên'
    };
    document.getElementById('window-title').textContent = titles[name] || titles.home;

    if (name === 'home') this.renderHome();
    if (name === 'history') this.renderHistory();
    if (name === 'settings') this.renderSettings();
  },

  // ─── Home Screen ─────────────────────────────────────────────────────────
  renderHome() {
    const modelList = document.getElementById('model-list');
    if (!modelList) return;
    modelList.innerHTML = '';

    Object.entries(TVT_MODELS).forEach(([key, model]) => {
      const btn = document.createElement('button');
      btn.className = 'model-btn';
      btn.dataset.model = key;
      btn.innerHTML = `<span class="model-icon">${model.icon}</span>
        <span class="model-info">
          <strong>${model.name}</strong>
          <small>${model.description}</small>
        </span>`;
      btn.onclick = () => this.startSession(key);
      modelList.appendChild(btn);
    });
  },

  // ─── Start Session ────────────────────────────────────────────────────────
  startSession(modelName) {
    TVTCore.createSession(modelName);
    TVTCore.session.aiProvider = this.provider.provider;
    this.showScreen('chat', { userName: 'Bạn' });
    this.clearChat();
    this.startRound1();
  },

  resumeSession(id) {
    const sess = TVTCore.loadSession(id);
    if (!sess) { this.showToast('Không tìm thấy phiên!'); return; }

    this.showScreen('chat', { userName: 'Bạn' });
    this.clearChat();

    // Replay chat history
    sess.chatHistory.forEach(msg => {
      this.appendMessage(msg.role, msg.text, false);
    });

    // Continue from where we left off
    if (sess.phase === 'round1') {
      const q = TVTCore.getCurrentQuestion();
      if (q) this.askQuestion(q.question, q.index, q.total);
    } else if (sess.phase === 'done') {
      this.tvtSay('Phiên này đã hoàn thành! Dùng nút 💾 để tải kết quả.');
    }
  },

  // ─── Round 1: Initial Questions ───────────────────────────────────────────
  startRound1() {
    const model = TVTCore.getModel();
    this.tvtSay(`Xin chào! Tôi là **TVT** — Tesla Visual Thinking.\n\nChúng ta sẽ dùng phương pháp **${model.name}** để phân tích vấn đề của bạn.\n\n_Hãy trả lời từng câu hỏi thật chi tiết. Càng cụ thể, kết quả càng tốt._ 💡`);
    setTimeout(() => this.askNextQuestion(), 800);
  },

  askNextQuestion() {
    const q = TVTCore.getCurrentQuestion();
    if (q) {
      this.askQuestion(q.question, q.index + 1, q.total);
    }
  },

  askQuestion(q, index, total) {
    let text = `**[${index}/${total}] ${q.text}**`;
    if (q.hint) text += `\n\n_💡 ${q.hint}_`;
    this.tvtSay(text);
    this.setInputMode('answer', q.min_words);
  },

  // ─── Round 1b: Follow-ups ─────────────────────────────────────────────────
  startFollowups(questions) {
    if (!questions || questions.length === 0) {
      this.startRound2();
      return;
    }
    this.tvtSay('Có _một vài điểm cần làm rõ_ thêm để TVT phân tích chính xác hơn:');
    this._pendingFollowups = questions;
    this._followupIndex = 0;
    this.askFollowup();
  },

  askFollowup() {
    if (this._followupIndex >= this._pendingFollowups.length) {
      this.startRound2();
      return;
    }
    const q = this._pendingFollowups[this._followupIndex];
    this.tvtSay(`**Câu hỏi bổ sung ${this._followupIndex + 1}:** ${q}`);
    this.setInputMode('followup');
  },

  // ─── Round 2: Self Research ───────────────────────────────────────────────
  startRound2() {
    const task = TVTCore.session.analysis?.self_research_task;
    if (!task) { this.startGenerating(); return; }

    this.tvtSay(
      `🔍 **Nhiệm vụ tự nghiên cứu:**\n\n${task}\n\n` +
      `_Hãy làm xong rồi quay lại nhập kết quả, hoặc gõ **skip** để nhận giải pháp lý thuyết._`
    );
    this.setInputMode('research');
  },

  // ─── Round 3: Generate Solutions ──────────────────────────────────────────
  async startGenerating() {
    this.tvtSay('⚙️ _TVT đang tổng hợp giải pháp..._');
    this.setInputMode('disabled');

    try {
      const prompt = TVTCore.buildSolutionPrompt();
      const solutions = await AI_PROVIDERS.call(prompt, this.provider);
      TVTCore.session.solutions = solutions;
      TVTCore.session.phase = 'done';
      TVTCore.session.status = 'completed';
      TVTCore._save();

      if (TVTCore.session.skippedResearch) {
        this.tvtSay('⚠️ _Giải pháp dưới đây mang tính lý thuyết do bỏ qua nghiên cứu thực tế._');
      }
      this.tvtSay('🚀 **Giải pháp TVT đề xuất:**\n\n' + solutions);
      this.tvtSay(`✅ **Phiên hoàn thành!** ID: \`${TVTCore.session.id}\`\nDùng nút **💾** để tải kết quả về.`);
      this.setInputMode('done');
    } catch (err) {
      this.tvtSay(`❌ Lỗi: ${err.message}\n\nThử lại hoặc kiểm tra cài đặt AI.`);
      this.setInputMode('answer', 0);
    }
  },

  // ─── AI Analysis ──────────────────────────────────────────────────────────
  async runAnalysis() {
    this.tvtSay('🤖 _TVT đang phân tích..._');
    this.setInputMode('disabled');

    try {
      const prompt = TVTCore.buildAnalysisPrompt();
      const raw = await AI_PROVIDERS.call(prompt, this.provider);
      const analysis = AI_PROVIDERS.parseJSON(raw);
      TVTCore.session.analysis = analysis;
      TVTCore.session.phase = 'round1b';
      TVTCore._save();

      // Display analysis
      this.tvtSay(`📊 **Tóm tắt:**\n${analysis.summary}`);

      if (analysis.ambiguities?.length > 0) {
        const amb = analysis.ambiguities.map((a, i) => `${i + 1}. ${a}`).join('\n');
        this.tvtSay(`⚠️ **Điểm cần làm rõ:**\n${amb}`);
      }

      this.startFollowups(analysis.follow_up_questions || []);
    } catch (err) {
      // Parsing failed → try offline fallback
      console.warn('AI parse failed, using offline:', err);
      const offlineRaw = AI_PROVIDERS._offlineAnalysis('');
      const analysis = JSON.parse(offlineRaw);
      TVTCore.session.analysis = analysis;
      TVTCore._save();
      this.tvtSay(`📊 **Tóm tắt (offline):**\n${analysis.summary}`);
      this.startFollowups([]);
    }
  },

  // ─── Message Rendering ────────────────────────────────────────────────────
  tvtSay(text, save = true) {
    if (save) TVTCore.addMessage('tvt', text);
    this.appendMessage('tvt', text);
    this.playSound('receive');
  },

  userSaid(text, save = true) {
    if (save) TVTCore.addMessage('user', text);
    this.appendMessage('user', text);
    this.playSound('send');
  },

  appendMessage(role, text, animate = true) {
    const chat = document.getElementById('chat-messages');
    if (!chat) return;

    const div = document.createElement('div');
    div.className = `msg-line ${animate ? 'msg-animate' : ''}`;

    const name = role === 'tvt' ? 'TVT' : 'Bạn';
    const nameClass = role === 'tvt' ? 'msg-name-tvt' : 'msg-name-user';
    const formatted = this.formatText(text);

    div.innerHTML = `<span class="${nameClass}">${name}:</span> <span class="msg-body">${formatted}</span>`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  },

  formatText(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/^#+\s+(.+)$/gm, '<strong>$1</strong>');
  },

  clearChat() {
    const chat = document.getElementById('chat-messages');
    if (chat) chat.innerHTML = '';
  },

  // ─── Input Modes ──────────────────────────────────────────────────────────
  setInputMode(mode, minWords = 0) {
    this._inputMode = mode;
    this._minWords = minWords;
    const input = document.getElementById('msg-input');
    const sendBtn = document.getElementById('send-btn');
    const hint = document.getElementById('input-hint');

    if (!input) return;

    if (mode === 'disabled') {
      input.disabled = true;
      input.placeholder = 'TVT đang xử lý...';
      if (sendBtn) sendBtn.disabled = true;
    } else if (mode === 'done') {
      input.disabled = true;
      input.placeholder = 'Phiên đã hoàn thành';
      if (sendBtn) sendBtn.disabled = true;
    } else {
      input.disabled = false;
      if (sendBtn) sendBtn.disabled = false;

      if (mode === 'answer') {
        input.placeholder = `Nhập câu trả lời (tối thiểu ${minWords} từ)...`;
        if (hint) hint.textContent = `⌨ Tối thiểu ${minWords} từ`;
      } else if (mode === 'research') {
        input.placeholder = "Nhập kết quả nghiên cứu, hoặc gõ 'skip'...";
        if (hint) hint.textContent = "⌨ Nhập kết quả nghiên cứu hoặc 'skip'";
      } else if (mode === 'followup') {
        input.placeholder = 'Trả lời câu hỏi bổ sung...';
        if (hint) hint.textContent = '';
      }
      input.focus();
    }
  },

  // ─── Send Handler ─────────────────────────────────────────────────────────
  handleSend() {
    const input = document.getElementById('msg-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text || input.disabled) return;

    const mode = this._inputMode;

    if (mode === 'answer') {
      const wc = TVTCore.countWords(text);
      if (wc < this._minWords) {
        this.showToast(`Cần ít nhất ${this._minWords} từ (hiện tại: ${wc})`);
        return;
      }
      this.userSaid(text);
      input.value = '';

      const result = TVTCore.submitAnswer(text);
      if (!result.ok) { this.showToast(result.error); return; }

      if (result.isLast) {
        this.runAnalysis();
      } else {
        setTimeout(() => this.askNextQuestion(), 400);
      }

    } else if (mode === 'followup') {
      this.userSaid(text);
      input.value = '';
      TVTCore.submitFollowup(this._followupIndex + 1, text);
      this._followupIndex++;
      setTimeout(() => this.askFollowup(), 400);

    } else if (mode === 'research') {
      const isSkip = text.toLowerCase() === 'skip' || text === 'bỏ qua';
      this.userSaid(text);
      input.value = '';
      TVTCore.submitResearch(isSkip ? '' : text, isSkip);
      if (isSkip) this.tvtSay('_Đã bỏ qua. TVT sẽ dùng giải pháp lý thuyết._');
      this.startGenerating();
    }
  },

  // ─── History Screen ───────────────────────────────────────────────────────
  renderHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;
    const sessions = TVTCore.listSessions();

    if (sessions.length === 0) {
      list.innerHTML = '<div class="history-empty">Chưa có phiên nào được lưu.</div>';
      return;
    }

    list.innerHTML = '';
    sessions.forEach(s => {
      const model = TVT_MODELS[s.modelName];
      const div = document.createElement('div');
      div.className = `history-item ${s.status === 'completed' ? 'done' : ''}`;
      div.innerHTML = `
        <div class="history-item-main">
          <span class="history-icon">${model?.icon || '❓'}</span>
          <span class="history-info">
            <strong>${model?.name || s.modelName}</strong>
            <small>${s.id} · ${s.updatedAt.slice(0,10)}</small>
          </span>
          <span class="history-status">${s.status === 'completed' ? '✅' : '🟡'}</span>
        </div>
        <div class="history-actions">
          <button onclick="App.resumeSession('${s.id}')">▶ Tiếp tục</button>
          <button onclick="App.downloadJSON('${s.id}')">💾 JSON</button>
          <button onclick="App.downloadMD('${s.id}')" class="secondary">📄 MD</button>
          <button onclick="App.deleteSessionUI('${s.id}')" class="danger">🗑</button>
        </div>`;
      list.appendChild(div);
    });
  },

  deleteSessionUI(id) {
    TVTCore.deleteSession(id);
    this.renderHistory();
  },

  downloadJSON(id) {
    const sess = TVTCore.loadSession(id);
    if (!sess) return;
    const data = JSON.stringify(sess, null, 2);
    this._download(`tvt_${id}.json`, data, 'application/json');
  },

  downloadMD(id) {
    const sess = TVTCore.loadSession(id);
    if (!sess) return;
    const md = TVTCore.exportMarkdown();
    this._download(`tvt_${id}.md`, md, 'text/markdown');
  },

  _download(filename, content, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = filename;
    a.click();
  },

  // ─── Settings Screen ──────────────────────────────────────────────────────
  renderSettings() {
    const cfg = AI_PROVIDERS.getConfig();
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('cfg-gemini-key', cfg.geminiKey);
    setVal('cfg-gemini-model', cfg.geminiModel || 'gemini-2.0-flash');
    setVal('cfg-groq-key', cfg.groqKey);
    setVal('cfg-openrouter-key', cfg.openrouterKey);
  },

  async saveSettings() {
    const getVal = id => document.getElementById(id)?.value?.trim() || '';
    AI_PROVIDERS.saveConfig({
      geminiKey: getVal('cfg-gemini-key'),
      geminiModel: getVal('cfg-gemini-model') || 'gemini-2.0-flash',
      groqKey: getVal('cfg-groq-key'),
      openrouterKey: getVal('cfg-openrouter-key')
    });
    await this.detectAI();
    this.showToast('✅ Đã lưu! AI: ' + this.provider.label);
    setTimeout(() => this.showScreen('home'), 1200);
  },

  // ─── Utils ────────────────────────────────────────────────────────────────
  showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  },

  playSound(type) {
    if (!this.soundEnabled) return;
    // Simple beep using Web Audio API
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = type === 'receive' ? 880 : 660;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } catch(_) {}
  },

  // ─── Event Binding ────────────────────────────────────────────────────────
  bindEvents() {
    // Send button
    document.getElementById('send-btn')?.addEventListener('click', () => this.handleSend());

    // Enter key in textarea
    document.getElementById('msg-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    // Sound checkbox
    document.getElementById('sound-check')?.addEventListener('change', e => {
      this.soundEnabled = e.target.checked;
    });

    // Nav buttons
    document.getElementById('nav-home')?.addEventListener('click', () => this.showScreen('home'));
    document.getElementById('nav-history')?.addEventListener('click', () => this.showScreen('history'));
    document.getElementById('nav-settings')?.addEventListener('click', () => this.showScreen('settings'));
    document.getElementById('btn-close')?.addEventListener('click', () => {
      if (confirm('Quay về màn hình chính?')) this.showScreen('home');
    });

    // Settings save
    document.getElementById('btn-save-settings')?.addEventListener('click', () => this.saveSettings());
    document.getElementById('btn-test-ai')?.addEventListener('click', async () => {
      this.renderSettings(); // ensure latest values saved first
      document.getElementById('btn-test-ai').textContent = 'Đang kiểm tra...';
      await this.saveSettings();
      document.getElementById('btn-test-ai').textContent = '🔍 Kiểm tra AI';
    });

    // Download current session
    document.getElementById('btn-download-json')?.addEventListener('click', () => {
      if (!TVTCore.session) return;
      this._download(`tvt_${TVTCore.session.id}.json`, TVTCore.exportJSON(), 'application/json');
    });
    document.getElementById('btn-download-md')?.addEventListener('click', () => {
      if (!TVTCore.session) return;
      this._download(`tvt_${TVTCore.session.id}.md`, TVTCore.exportMarkdown(), 'text/markdown');
    });
  }
};

// Boot
window.addEventListener('DOMContentLoaded', () => App.init());
