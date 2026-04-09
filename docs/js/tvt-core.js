/**
 * TVT Core — Session & Flow Management
 * Offline-first: localStorage persistence, no server required
 */

const TVTCore = {
  // ─── State ────────────────────────────────────────────────────────────────
  session: null,

  // ─── Session CRUD (localStorage) ─────────────────────────────────────────
  createSession(modelName) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const session = {
      id,
      modelName,
      status: 'active',  // active | analyzing | round2 | generating | done
      phase: 'round1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentQIndex: 0,
      answers: {},
      analysis: null,
      followupAnswers: {},
      researchFindings: '',
      solutions: '',
      skippedResearch: false,
      aiProvider: null,
      chatHistory: []   // [{role:'tvt'|'user', text:'...', ts:'...'}]
    };
    this.session = session;
    this._save();
    return session;
  },

  switchModel(modelName) {
    if (!this.session) return;
    this.session.modelName = modelName;
    // Potentially reset index if the new model is different, 
    // but keep answers for AI context even if IDs don't match.
    this.session.updatedAt = new Date().toISOString();
    this._save();
  },

  loadSession(id) {
    const all = this.listSessions();
    const sess = all.find(s => s.id === id);
    if (sess) { this.session = sess; return sess; }
    return null;
  },

  _save() {
    if (!this.session) return;
    this.session.updatedAt = new Date().toISOString();
    const all = this.listSessions().filter(s => s.id !== this.session.id);
    all.unshift(this.session);
    // Keep max 50 sessions
    localStorage.setItem('tvt_sessions', JSON.stringify(all.slice(0, 50)));
  },

  listSessions() {
    try { return JSON.parse(localStorage.getItem('tvt_sessions') || '[]'); }
    catch(_) { return []; }
  },

  deleteSession(id) {
    const all = this.listSessions().filter(s => s.id !== id);
    localStorage.setItem('tvt_sessions', JSON.stringify(all));
  },

  // ─── Chat history ─────────────────────────────────────────────────────────
  addMessage(role, text) {
    const msg = { role, text, ts: new Date().toISOString() };
    this.session.chatHistory.push(msg);
    this._save();
    return msg;
  },

  // ─── Questions flow ───────────────────────────────────────────────────────
  getModel() {
    return TVT_MODELS[this.session.modelName];
  },

  getCurrentQuestion() {
    const model = this.getModel();
    const idx = this.session.currentQIndex;
    const qs = model.initial_questions;
    return idx < qs.length ? { question: qs[idx], index: idx, total: qs.length } : null;
  },

  submitAnswer(answer) {
    const model = this.getModel();
    const q = model.initial_questions[this.session.currentQIndex];
    if (!q) return { ok: false, error: 'No current question' };

    const words = this.countWords(answer);
    if (words < 1) {
      return { ok: false, error: `Vui lòng nhập nội dung câu trả lời` };
    }

    this.session.answers[q.id] = answer.trim();
    this.session.currentQIndex++;

    const isLast = this.session.currentQIndex >= model.initial_questions.length;
    if (isLast) this.session.phase = 'analyzing';
    this._save();

    return { ok: true, isLast, question: q };
  },

  submitFollowup(index, answer) {
    this.session.followupAnswers[`followup_${index}`] = answer.trim();
    this._save();
  },

  submitResearch(findings, skipped = false) {
    this.session.researchFindings = findings;
    this.session.skippedResearch = skipped;
    this.session.phase = 'generating';
    this._save();
  },

  // ─── Prompt building ──────────────────────────────────────────────────────
  buildAnalysisPrompt() {
    const model = this.getModel();
    let prompt = model.analysis_prompt;
    for (const [k, v] of Object.entries(this.session.answers)) {
      prompt = prompt.replaceAll(`{${k}}`, v);
    }
    // Store for offline analysis context
    window._tvtCurrentAnswers = this.session.answers;
    return prompt;
  },

  buildSolutionPrompt() {
    const model = this.getModel();
    const summary = this.session.analysis?.summary || '';
    const additional = Object.values(this.session.followupAnswers).join(' | ');
    const template = this.session.skippedResearch
      ? model.quick_solution_prompt
      : model.solution_prompt;
    return template
      .replaceAll('{problem_summary}', summary)
      .replaceAll('{research}', this.session.researchFindings || 'Không có')
      .replaceAll('{additional}', additional || 'Không có');
  },

  // ─── Utils ────────────────────────────────────────────────────────────────
  countWords(text) {
    return text.trim().split(/[\s\u00a0]+/).filter(Boolean).length;
  },

  exportJSON() {
    return JSON.stringify(this.session, null, 2);
  },

  exportMarkdown() {
    const s = this.session;
    const model = this.getModel();
    let md = `# TVT Session — ${s.id}\n**Model:** ${model.name}\n**Ngày:** ${s.createdAt.slice(0,10)}\n\n`;
    md += `## Câu trả lời\n`;
    model.initial_questions.forEach(q => {
      if (s.answers[q.id]) md += `\n### ${q.text}\n${s.answers[q.id]}\n`;
    });
    if (s.analysis?.summary) md += `\n## Tóm tắt\n${s.analysis.summary}\n`;
    if (s.solutions) md += `\n## Giải pháp\n${s.solutions}\n`;
    return md;
  }
};
