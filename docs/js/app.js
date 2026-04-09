/**
 * TVT App — Main UI Controller
 * Two-panel layout (Chat + Task Pane)
 */

const App = {
  provider: { provider: 'offline', model: null, free: true, local: true, label: 'Đang tìm AI...' },
  soundEnabled: false,

  // ─── Init ─────────────────────────────────────────────────────────────────
  async init() {
    AI_PROVIDERS.init();
    this.bindEvents();
    
    // Render all side panels
    this.renderModels();
    this.renderHistory();
    this.renderSettings();
    
    // Auto-resume last session if it exists in localStorage
    const lastSessionId = localStorage.getItem('tvt_last_id');
    if (lastSessionId) {
      this.resumeSession(lastSessionId);
    } else if (!TVTCore.session) {
      this.welcomeText();
    }

    await this.detectAI();
  },

  welcomeText() {
    this.clearChat();
    this.tvtSay('Xin chào! Tôi là **NIKOLA**. Tôi sẽ cùng bạn phân tích vấn đề theo phong cách Tư duy của Tesla.\n\n👉 Hãy chọn một **phương pháp tư duy** ở danh sách bên phải để chúng ta bắt đầu nhé!', false);
    this.setInputMode('disabled');
    document.getElementById('msg-input').placeholder = 'Chọn phương pháp bên phải...';
  },

  async detectAI() {
    const statusEl = document.getElementById('ai-status-text');
    const dotEl = document.getElementById('ai-status-dot');
    if (statusEl) statusEl.textContent = 'Đang tìm AI...';

    try {
      this.provider = await AI_PROVIDERS.detectBest();
    } catch(e) {
      this.provider = { provider: 'offline', label: '📴 Offline (Fallback)' };
    }

    if (statusEl) statusEl.textContent = this.provider.label || 'Offline';
    if (dotEl) {
      dotEl.className = 'status-dot ' + (this.provider.provider === 'offline' ? 'offline' : 'online');
    }
    
    // Update all status indicators
    document.querySelectorAll('.provider-label').forEach(el => {
      el.textContent = this.provider.label;
    });
  },

  // ─── Right Panel: Models ──────────────────────────────────────────────────
  renderModels() {
    const modelList = document.getElementById('model-list');
    if (!modelList) return;
    modelList.innerHTML = '';

    Object.entries(TVT_MODELS).forEach(([key, model]) => {
      const active = TVTCore.session && TVTCore.session.modelName === key;
      const btn = document.createElement('button');
      btn.className = `model-btn ${active ? 'active' : ''}`;
      if (active) btn.style.background = '#E5EFFD';
      if (active) btn.style.borderColor = '#0054E3';
      
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

  // ─── Start/Resume Session ─────────────────────────────────────────────────
  startSession(modelName) {
    if (TVTCore.session && TVTCore.session.status === 'active') {
      if (TVTCore.session.modelName === modelName) return;
      
      this.tvtSay(`🔄 _Đã chuyển sang phương pháp: **${TVT_MODELS[modelName].name}**_`, false);
      TVTCore.switchModel(modelName);
      
      // Keep everything, just re-ask the current question of the new model
      this.renderModels();
      this.askNextQuestion();
      return;
    }

    TVTCore.createSession(modelName);
    TVTCore.session.aiProvider = this.provider ? this.provider.provider : 'offline';
    localStorage.setItem('tvt_last_id', TVTCore.session.id);
    this.clearChat();
    this.renderHistory();
    this.renderModels(); // refresh to show active state
    this.startRound1();
  },

  resumeSession(id) {
    const sess = TVTCore.loadSession(id);
    if (!sess) { 
      localStorage.removeItem('tvt_last_id');
      this.welcomeText();
      return; 
    }
    
    localStorage.setItem('tvt_last_id', id);
    this.renderModels(); // highlight active model
    this.clearChat();

    // Replay chat history
    sess.chatHistory.forEach(msg => {
      this.appendMessage(msg.role, msg.text, false);
    });

    // Continue from where we left off
    if (sess.phase === 'round1') {
      const q = TVTCore.getCurrentQuestion();
      if (q) this.askQuestion(q.question, q.index, q.total);
    } else if (sess.phase === 'round1b') {
      this.askFollowup();
    } else if (sess.phase === 'round2') {
      this.startRound2();
    } else if (sess.phase === 'generating' || sess.phase === 'analyzing') {
       this.tvtSay('⚙️ _Đang tiếp tục xử lý..._');
       if (sess.phase === 'analyzing') this.runAnalysis();
       else this.startGenerating();
    } else if (sess.phase === 'done') {
      this.tvtSay('Phiên này đã hoàn thành!');
      this.setInputMode('done');
    }
  },

  highlightActiveModel(modelName) {
    document.querySelectorAll('.model-btn').forEach(btn => {
      if (btn.dataset.model === modelName) {
        btn.classList.add('active-method');
      } else {
        btn.classList.remove('active-method');
      }
    });
  },

  newChat() {
    TVTCore.session = null;
    localStorage.removeItem('tvt_last_id');
    this.renderModels();
    this.welcomeText();
  },

  // ─── Flow Logic ───────────────────────────────────────────────────────────
  startRound1() {
    const model = TVTCore.getModel();
    this.tvtSay(`Chúng ta sẽ dùng phương pháp **${model.name}** để phân tích vấn đề của bạn.\n\n_Hãy trả lời từng câu hỏi để tôi có thể hiểu rõ nhất nhé._ 💡`);
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
    this.setInputMode('answer');
  },

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

  startRound2() {
    const task = TVTCore.session.analysis?.self_research_task;
    if (!task) { this.startGenerating(); return; }

    this.tvtSay(
      `🔍 **Nhiệm vụ tự nghiên cứu:**\n\n${task}\n\n` +
      `_Hãy làm xong rồi quay lại nhập kết quả, hoặc gõ **skip** để nhận giải pháp lý thuyết._`
    );
    this.setInputMode('research');
  },

  async startGenerating() {
    this.tvtSay('⚙️ _TVT đang tổng hợp giải pháp..._');
    this.setInputMode('disabled');
    localStorage.removeItem('tvt_last_id'); // Session complete
    this.updateProgress(10, 'Đang xây dựng prompt giải pháp...');

    try {
      const prompt = TVTCore.buildSolutionPrompt();
      this.updateProgress(30, 'Đang gửi dữ liệu đến AI...');
      
      const solutions = await AI_PROVIDERS.call(prompt, this.provider);
      this.updateProgress(90, 'Đang hoàn tất kết quả...');
      
      TVTCore.session.solutions = solutions;
      TVTCore.session.phase = 'done';
      TVTCore.session.status = 'completed';
      TVTCore._save();
      this.renderHistory();

      this.updateProgress(100, 'Xong!');
      setTimeout(() => this.updateProgress(-1), 1000);

      if (TVTCore.session.skippedResearch) {
        this.tvtSay('⚠️ _Giải pháp dưới đây mang tính lý thuyết do bỏ qua nghiên cứu thực tế._');
      }
      this.tvtSay('🚀 **Giải pháp TVT đề xuất:**\n\n' + solutions);
      this.tvtSay(`✅ **Phiên hoàn thành!**\nDùng nút **💾** ở phía trên cùng bên phải để tải kết quả về máy.`);
      this.setInputMode('done');
    } catch (err) {
      console.error('Generating solution failed:', err);
      this.updateProgress(-1);
      this.tvtSay(`❌ **Lỗi tạo giải pháp:** ${err.message}\n\nCách khắc phục: Hãy kiểm tra Token AI ở bảng bên phải hoặc thử chọn mô hình AI khác.`);
      this.setInputMode('answer');
    }
  },

  async runAnalysis() {
    this.tvtSay('🤖 _TVT đang phân tích..._');
    this.setInputMode('disabled');
    this.updateProgress(10, 'Đang chuẩn bị dữ liệu đầu vào...');

    try {
      const prompt = TVTCore.buildAnalysisPrompt();
      this.updateProgress(40, 'AI đang đọc nội dung...');
      
      const raw = await AI_PROVIDERS.call(prompt, this.provider);
      this.updateProgress(70, 'Đang xử lý kết quả phân tích...');
      
      const analysis = AI_PROVIDERS.parseJSON(raw);
      TVTCore.session.analysis = analysis;
      TVTCore.session.phase = 'round1b';
      TVTCore._save();

      this.updateProgress(100, 'Hoàn thành!');
      setTimeout(() => this.updateProgress(-1), 1000);

      this.tvtSay(`📊 **Tóm tắt vấn đề của bạn:**\n${analysis.summary}`);

      if (analysis.ambiguities?.length > 0) {
        const amb = analysis.ambiguities.map((a, i) => `${i + 1}. ${a}`).join('\n');
        this.tvtSay(`⚠️ **Điểm chưa rõ ràng:**\n${amb}`);
      }

      this.startFollowups(analysis.follow_up_questions || []);
    } catch (err) {
      console.error('Analysis phase failed:', err);
      this.updateProgress(-1);
      
      // Attempt offline fallback automatically
      this.tvtSay(`⚠️ **AI gặp sự cố:** ${err.message}. Đang chuyển sang chế độ phân tích nội bộ...`);
      
      try {
        const offlineRaw = AI_PROVIDERS._offlineAnalysis('');
        const analysis = JSON.parse(offlineRaw);
        TVTCore.session.analysis = analysis;
        TVTCore._save();
        this.tvtSay(`📊 **Tóm tắt (nội bộ):**\n${analysis.summary}`);
        this.startFollowups([]);
      } catch(e) {
        this.tvtSay(`❌ Lỗi hệ thống: Không thể phân tích. Vui lòng thử lại sau hoặc kiểm tra kết nối.`);
        this.setInputMode('answer');
      }
    }
  },

  // ─── Input & Chat Rendering ───────────────────────────────────────────────
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

  // percentage 0-100, -1 to hide
  updateProgress(percent, label = '') {
    const box = document.getElementById('progress-box');
    const bar = document.getElementById('progress-bar');
    const txt = document.getElementById('progress-text');
    if (!box || !bar) return;

    if (percent < 0) {
      box.style.display = 'none';
      return;
    }

    box.style.display = 'flex';
    bar.style.width = percent + '%';
    if (label) txt.textContent = label;
  },

  setInputMode(mode) {
    this._inputMode = mode;
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
        input.placeholder = `Nhập câu trả lời...`;
        if (hint) hint.textContent = ``;
      } else if (mode === 'research') {
        input.placeholder = "Nhập kết quả nghiên cứu (hoặc gõ 'skip')...";
        if (hint) hint.textContent = "⌨ 'skip' để bỏ qua";
      } else if (mode === 'followup') {
        input.placeholder = 'Trả lời câu hỏi bổ sung...';
        if (hint) hint.textContent = '';
      }
      setTimeout(()=>input.focus(), 50);
    }
  },

  handleSend() {
    const input = document.getElementById('msg-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text || input.disabled) return;

    const mode = this._inputMode;
    const wc = TVTCore.countWords(text);

    if (wc < 1) return;

    if (mode === 'answer') {
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

  // ─── Right Panel: History ─────────────────────────────────────────────────
  renderHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;
    const sessions = TVTCore.listSessions();

    if (sessions.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:#888;font-size:11px;padding:10px;">Chưa có phiên nào.</div>';
      return;
    }

    list.innerHTML = '';
    sessions.forEach(s => {
      const model = TVT_MODELS[s.modelName];
      const div = document.createElement('div');
      div.className = `history-item`;
      if(s.status === 'completed') div.style.borderLeft = '3px solid #22aa44';

      div.innerHTML = `
        <div class="history-item-top">
          <strong>${model?.icon || '❓'} ${model?.name || s.modelName}</strong>
          <span class="history-status">${s.status === 'completed' ? '✅' : '🟡'}</span>
        </div>
        <div style="font-size:10px; color:#666; margin-bottom:4px;">Ngày: ${new Date(s.createdAt).toLocaleDateString('vi')}</div>
        <div class="history-actions">
          <button onclick="App.resumeSession('${s.id}')">▶ Mở</button>
          <button onclick="App.downloadJSON('${s.id}')">💾 JSON</button>
          <button onclick="App.downloadMD('${s.id}')">📄 MD</button>
          <button onclick="App.deleteSessionUI('${s.id}')" style="color:#c00000; flex:0.4;">✕</button>
        </div>`;
      list.appendChild(div);
    });
  },

  deleteSessionUI(id) {
    if(!confirm("Xóa phiên này?")) return;
    TVTCore.deleteSession(id);
    this.renderHistory();
    if(TVTCore.session && TVTCore.session.id === id) {
      TVTCore.session = null;
      this.welcomeText();
    }
  },

  downloadJSON(id) {
    const sess = TVTCore.loadSession(id);
    if (!sess) return;
    this._download(`tvt_${id}.json`, JSON.stringify(sess, null, 2), 'application/json');
  },

  downloadMD(id) {
    const sess = TVTCore.loadSession(id);
    if (!sess) return;
    this._download(`tvt_${id}.md`, TVTCore.exportMarkdown(), 'text/markdown');
  },

  _download(filename, content, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = filename;
    a.click();
  },

  // ─── Right Panel: Settings ────────────────────────────────────────────────
  renderSettings() {
    const cfg = AI_PROVIDERS.getConfig();
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('cfg-gemini-key', cfg.geminiKey);
    setVal('cfg-groq-key', cfg.groqKey);
  },

  async saveSettings() {
    const getVal = id => document.getElementById(id)?.value?.trim() || '';
    
    // Quick validation and save
    const btn = document.getElementById('btn-save-settings');
    const oldText = btn.textContent;
    btn.textContent = 'Đang kiểm tra...';
    
    AI_PROVIDERS.saveConfig({
      geminiKey: getVal('cfg-gemini-key'),
      groqKey: getVal('cfg-groq-key')
    });
    
    await this.detectAI();
    this.showToast('✅ Đã cập nhật xong cấu hình AI!');
    btn.textContent = oldText;
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
    // Top right save & new chat buttons
    document.getElementById('btn-new-chat')?.addEventListener('click', () => this.newChat());
    document.getElementById('btn-download-json')?.addEventListener('click', () => {
      if (TVTCore.session) this.downloadJSON(TVTCore.session.id);
    });
    document.getElementById('btn-download-md')?.addEventListener('click', () => {
      if (TVTCore.session) this.downloadMD(TVTCore.session.id);
    });

    // Send Input
    document.getElementById('send-btn')?.addEventListener('click', () => this.handleSend());
    document.getElementById('msg-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    // Sub-settings
    document.getElementById('sound-check')?.addEventListener('change', e => {
      this.soundEnabled = e.target.checked;
    });
    document.getElementById('btn-save-settings')?.addEventListener('click', () => this.saveSettings());
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
