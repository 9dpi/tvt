"""
TVT - Tesla Visual Thinking
Web UI (Streamlit) — Mobile-first, light theme, clean như Yahoo Chat
"""
import streamlit as st
import json
from dotenv import load_dotenv
import os
import sys
from pathlib import Path

# Ensure tvt package is importable
sys.path.insert(0, str(Path(__file__).parent.parent.parent))
load_dotenv()

from tvt.core.model_loader import load_model, list_models
from tvt.core.session import create_session, load_session, save_session, list_sessions, export_session_json
from tvt.core.llm_client import call_llm, parse_json_response

# ─── Page config ────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="TVT — Tesla Visual Thinking",
    page_icon="⚡",
    layout="centered",
    initial_sidebar_state="expanded",
)

# ─── CSS: Mobile-first, light, clean, Yahoo Chat vibe ───────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    /* ── Reset & base ── */
    html, body, [class*="css"] {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    }

    /* ── Background ── */
    .stApp {
        background: linear-gradient(135deg, #f0f4ff 0%, #fafbff 50%, #f5f0ff 100%);
        min-height: 100vh;
    }

    /* ── Hide Streamlit branding ── */
    #MainMenu, footer, header { visibility: hidden; }

    /* ── Main container ── */
    .main .block-container {
        max-width: 740px;
        padding: 1.5rem 1rem 4rem;
        margin: 0 auto;
    }

    /* ── Header card ── */
    .tvt-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        padding: 2rem 2.5rem;
        margin-bottom: 1.5rem;
        text-align: center;
        box-shadow: 0 8px 32px rgba(102,126,234,0.25);
    }
    .tvt-header h1 {
        color: white;
        font-size: 2rem;
        font-weight: 700;
        margin: 0 0 0.25rem;
        letter-spacing: -0.5px;
    }
    .tvt-header p {
        color: rgba(255,255,255,0.85);
        font-size: 0.9rem;
        margin: 0;
        font-weight: 300;
    }

    /* ── Chat bubble style ── */
    .chat-bubble {
        background: white;
        border-radius: 18px 18px 18px 4px;
        padding: 1rem 1.25rem;
        margin-bottom: 0.75rem;
        box-shadow: 0 2px 12px rgba(0,0,0,0.07);
        border-left: 4px solid #667eea;
        animation: slideIn 0.3s ease;
    }
    .chat-bubble.user {
        background: linear-gradient(135deg, #667eea10, #764ba215);
        border-left-color: #764ba2;
        border-radius: 18px 18px 4px 18px;
    }
    @keyframes slideIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* ── Step badge ── */
    .step-badge {
        display: inline-block;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 0.2rem 0.6rem;
        border-radius: 20px;
        margin-bottom: 0.4rem;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }

    /* ── Card ── */
    .tvt-card {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 2px 16px rgba(0,0,0,0.06);
    }

    /* ── Analysis card ── */
    .analysis-card {
        background: linear-gradient(135deg, #e8f4fd, #f0e8fd);
        border-radius: 16px;
        padding: 1.25rem 1.5rem;
        margin-bottom: 0.75rem;
        border: 1px solid rgba(102,126,234,0.15);
    }

    /* ── Research task card ── */
    .research-card {
        background: linear-gradient(135deg, #fff3e0, #fce4ec);
        border-radius: 16px;
        padding: 1.25rem 1.5rem;
        border: 1px solid rgba(255,152,0,0.2);
        margin-bottom: 1rem;
    }

    /* ── Input ── */
    .stTextArea textarea {
        border-radius: 12px !important;
        border: 2px solid #e8ecf4 !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 0.95rem !important;
        transition: border-color 0.2s;
    }
    .stTextArea textarea:focus {
        border-color: #667eea !important;
        box-shadow: 0 0 0 3px rgba(102,126,234,0.1) !important;
    }

    /* ── Buttons ── */
    .stButton > button {
        border-radius: 12px !important;
        font-weight: 600 !important;
        font-family: 'Inter', sans-serif !important;
        transition: all 0.2s !important;
        border: none !important;
    }
    .stButton > button[kind="primary"] {
        background: linear-gradient(135deg, #667eea, #764ba2) !important;
        color: white !important;
    }
    .stButton > button:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 20px rgba(102,126,234,0.3) !important;
    }

    /* ── Progress ── */
    .stProgress > div > div {
        background: linear-gradient(90deg, #667eea, #764ba2) !important;
        border-radius: 10px !important;
    }

    /* ── Sidebar ── */
    [data-testid="stSidebar"] {
        background: white !important;
        border-right: 1px solid #f0f0f0 !important;
    }

    /* ── Selectbox ── */
    .stSelectbox select, [data-testid="stSelectbox"] {
        border-radius: 10px !important;
    }

    /* ── Warning/info boxes ── */
    .stWarning {
        border-radius: 12px !important;
    }
    .stSuccess {
        border-radius: 12px !important;
    }

    /* ── Mobile tweaks ── */
    @media (max-width: 600px) {
        .main .block-container { padding: 1rem 0.5rem 5rem; }
        .tvt-header { padding: 1.5rem 1.25rem; }
        .tvt-header h1 { font-size: 1.5rem; }
    }

    /* ── Hint text ── */
    .hint-text {
        color: #888;
        font-size: 0.82rem;
        margin-top: 0.25rem;
        font-style: italic;
    }

    /* ── Word count ── */
    .word-count {
        font-size: 0.78rem;
        color: #aaa;
        text-align: right;
        margin-top: -0.5rem;
        margin-bottom: 0.5rem;
    }

    /* ── Solution output ── */
    .solution-box {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        margin-top: 1rem;
    }
</style>
""", unsafe_allow_html=True)


# ─── State init ──────────────────────────────────────────────────────────────
def init_state():
    defaults = {
        "phase": "setup",          # setup | round1 | analyzing | round1b | round2 | generating | done
        "session_id": None,
        "model_name": "5w1h",
        "model": None,
        "current_q_index": 0,
        "answers": {},
        "analysis": {},
        "followup_answers": {},
        "research_findings": "",
        "solutions": "",
        "skipped_research": False,
        "error": None,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v

init_state()


# ─── Header ──────────────────────────────────────────────────────────────────
st.markdown("""
<div class="tvt-header">
    <h1>⚡ Tesla Visual Thinking</h1>
    <p>Hệ thống tư duy có cấu trúc · Phong cách Tesla — Đặt câu hỏi trước khi hành động</p>
</div>
""", unsafe_allow_html=True)


# ─── Sidebar ─────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("### ⚡ TVT")
    st.markdown("---")

    # Model selection
    available_models = list_models()
    selected_model = st.selectbox(
        "📋 Chọn model tư duy",
        options=available_models,
        index=available_models.index("5w1h") if "5w1h" in available_models else 0,
        format_func=lambda x: x.upper(),
        disabled=(st.session_state.phase != "setup")
    )

    if st.session_state.phase == "setup":
        st.session_state.model_name = selected_model

    # Provider info
    st.markdown("---")
    provider = os.getenv("TVT_PROVIDER", "gemini")
    st.markdown(f"**🤖 LLM Provider:** `{provider.upper()}`")

    has_key = bool(
        os.getenv("GEMINI_API_KEY") or
        os.getenv("OPENAI_API_KEY") or
        os.getenv("ANTHROPIC_API_KEY")
    )
    if has_key:
        st.success("✅ API Key đã cấu hình")
    else:
        st.warning("⚠️ Chưa có API Key — kiểm tra file .env")

    # Session history
    st.markdown("---")
    st.markdown("**📂 Phiên gần đây**")
    recent = list_sessions(5)
    if recent:
        for s in recent:
            icon = "✅" if s["status"] == "completed" else "🟡"
            st.markdown(
                f"{icon} `{s['id']}` · {s['model_name']} "
                f"<span style='color:#aaa;font-size:0.75rem'>({s['updated_at'][:10]})</span>",
                unsafe_allow_html=True
            )
    else:
        st.markdown("<span style='color:#aaa'>Chưa có phiên nào</span>", unsafe_allow_html=True)

    # New session button
    if st.session_state.phase != "setup":
        st.markdown("---")
        if st.button("🔄 Phiên mới", use_container_width=True):
            for k in list(st.session_state.keys()):
                del st.session_state[k]
            st.rerun()


# ─── Error display ────────────────────────────────────────────────────────────
if st.session_state.get("error"):
    st.error(f"❌ {st.session_state.error}")
    if st.button("Thử lại"):
        st.session_state.error = None
        st.rerun()
    st.stop()


# ─── Helper: word count ───────────────────────────────────────────────────────
def count_words(text: str) -> int:
    import re
    return len([w for w in re.split(r"[\s\u00a0]+", text.strip()) if w])


# ─── PHASE: SETUP ────────────────────────────────────────────────────────────
if st.session_state.phase == "setup":
    model_data = load_model(st.session_state.model_name)

    st.markdown(f"""
    <div class="tvt-card">
        <div class="step-badge">Model đã chọn</div>
        <h3 style="margin:0.3rem 0 0.2rem;color:#334;">📐 {model_data['name']}</h3>
        <p style="color:#666;margin:0;font-size:0.9rem">{model_data['description']}</p>
        <div style="margin-top:0.75rem;font-size:0.82rem;color:#888">
            Áp dụng cho: {' · '.join(model_data.get('applicable_for', []))}
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="chat-bubble">
        <strong>Chào bạn! 👋</strong><br>
        TVT sẽ dẫn dắt bạn qua một quy trình tư duy có cấu trúc.<br>
        Bạn sẽ trả lời một số câu hỏi, sau đó TVT phân tích và đưa ra giải pháp cụ thể.
    </div>
    """, unsafe_allow_html=True)

    if not has_key:
        st.warning(
            "⚠️ Chưa tìm thấy API Key. Tạo file `.env` với nội dung:\n"
            "```\nTVT_PROVIDER=gemini\nGEMINI_API_KEY=your_key_here\n```"
        )

    col1, col2 = st.columns(2)
    with col1:
        if st.button("🚀 Bắt đầu phiên mới", type="primary", use_container_width=True, disabled=not has_key):
            st.session_state.model = model_data
            st.session_state.session_id = create_session(st.session_state.model_name)
            st.session_state.phase = "round1"
            st.session_state.current_q_index = 0
            st.rerun()

    with col2:
        resume_id = st.text_input("Tiếp tục session ID", placeholder="abc12345", label_visibility="collapsed")
        if st.button("▶️ Tiếp tục", use_container_width=True) and resume_id:
            sess = load_session(resume_id.strip())
            if sess:
                st.session_state.session_id = resume_id.strip()
                st.session_state.model_name = sess["model_name"]
                st.session_state.model = load_model(sess["model_name"])
                st.session_state.answers = sess["data"].get("answers", {})
                st.session_state.analysis = sess["data"].get("analysis", {})
                st.session_state.followup_answers = sess["data"].get("followup_answers", {})
                st.session_state.research_findings = sess["data"].get("research_findings", "")
                st.session_state.solutions = sess["data"].get("solutions", "")
                st.session_state.skipped_research = sess["data"].get("skipped_research", False)
                st.session_state.phase = sess["status"] if sess["status"] != "active" else "round1"
                if sess["status"] == "completed":
                    st.session_state.phase = "done"
                st.rerun()
            else:
                st.error(f"Không tìm thấy session '{resume_id}'")


# ─── PHASE: ROUND 1 — Initial Questions ──────────────────────────────────────
elif st.session_state.phase == "round1":
    model = st.session_state.model
    questions = model["initial_questions"]
    total = len(questions)
    idx = st.session_state.current_q_index

    # Progress
    st.progress(idx / total)
    st.markdown(
        f"<div style='text-align:right;color:#888;font-size:0.82rem;margin-top:-0.5rem'>"
        f"Câu {idx + 1} / {total}</div>",
        unsafe_allow_html=True
    )

    # Show previous answers
    for i, q in enumerate(questions[:idx]):
        with st.expander(f"✅ {q['text']}", expanded=False):
            st.markdown(f"> {st.session_state.answers.get(q['id'], '')}")

    if idx < total:
        q = questions[idx]
        hint = q.get("hint", "")
        min_words = q.get("min_words", 5)

        st.markdown(f"""
        <div class="chat-bubble">
            <div class="step-badge">Câu hỏi {idx + 1}/{total}</div>
            <strong>{q['text']}</strong>
            {f'<p class="hint-text">💡 {hint}</p>' if hint else ''}
        </div>
        """, unsafe_allow_html=True)

        answer = st.text_area(
            "Câu trả lời của bạn",
            key=f"answer_{idx}",
            height=120,
            placeholder="Nhập câu trả lời...",
            label_visibility="collapsed"
        )

        if answer:
            wc = count_words(answer)
            color = "#4CAF50" if wc >= min_words else "#FF9800"
            st.markdown(
                f"<div class='word-count' style='color:{color}'>{wc} từ / tối thiểu {min_words}</div>",
                unsafe_allow_html=True
            )

        if st.button("Tiếp theo →", type="primary", use_container_width=True):
            if not answer or not answer.strip():
                st.warning("Vui lòng nhập câu trả lời.")
            elif count_words(answer) < min_words:
                st.warning(f"Câu trả lời cần ít nhất **{min_words} từ** (hiện tại: {count_words(answer)} từ)")
            else:
                st.session_state.answers[q["id"]] = answer.strip()
                st.session_state.current_q_index = idx + 1

                # Save to DB
                save_session(st.session_state.session_id, {
                    "answers": st.session_state.answers,
                    "analysis": st.session_state.analysis,
                    "followup_answers": st.session_state.followup_answers,
                    "research_findings": st.session_state.research_findings,
                    "solutions": st.session_state.solutions,
                    "skipped_research": st.session_state.skipped_research,
                })
                st.rerun()
    else:
        # All questions answered → move to analysis
        st.success("✅ Đã trả lời tất cả câu hỏi! Đang phân tích...")
        st.session_state.phase = "analyzing"
        st.rerun()


# ─── PHASE: ANALYZING ────────────────────────────────────────────────────────
elif st.session_state.phase == "analyzing":
    with st.spinner("🤖 TVT đang phân tích câu trả lời của bạn..."):
        try:
            template = st.session_state.model["analysis_prompt_template"]
            prompt = template.format(**st.session_state.answers)
            raw = call_llm(prompt)
            analysis = parse_json_response(raw)
            st.session_state.analysis = analysis

            save_session(st.session_state.session_id, {
                "answers": st.session_state.answers,
                "analysis": analysis,
                "followup_answers": st.session_state.followup_answers,
                "research_findings": st.session_state.research_findings,
                "solutions": st.session_state.solutions,
                "skipped_research": st.session_state.skipped_research,
            })

            follow_ups = analysis.get("follow_up_questions", [])
            st.session_state.phase = "round1b" if follow_ups else "round2"
            st.rerun()
        except Exception as e:
            st.session_state.error = str(e)
            st.session_state.phase = "round1b"  # fallback
            st.rerun()


# ─── PHASE: ROUND 1b — Follow-up questions ───────────────────────────────────
elif st.session_state.phase == "round1b":
    analysis = st.session_state.analysis
    follow_ups = analysis.get("follow_up_questions", [])

    # Show analysis summary
    st.markdown(f"""
    <div class="analysis-card">
        <div class="step-badge">📊 Phân tích TVT</div>
        <p style="margin:0.5rem 0 0;color:#334;line-height:1.6">{analysis.get('summary', '')}</p>
    </div>
    """, unsafe_allow_html=True)

    ambiguities = analysis.get("ambiguities", [])
    if ambiguities:
        with st.expander("⚠️ Điểm cần làm rõ"):
            for a in ambiguities:
                st.markdown(f"- {a}")

    if follow_ups:
        st.markdown("### ❓ Câu hỏi bổ sung")
        all_answered = True
        for i, q_text in enumerate(follow_ups):
            key = f"followup_{i+1}"
            existing = st.session_state.followup_answers.get(key, "")

            st.markdown(f"""
            <div class="chat-bubble" style="margin-bottom:0.5rem">
                <strong>Câu hỏi bổ sung {i+1}:</strong> {q_text}
            </div>
            """, unsafe_allow_html=True)

            ans = st.text_area(
                f"Câu trả lời {i+1}",
                value=existing,
                key=f"fup_ans_{i}",
                height=90,
                label_visibility="collapsed",
                placeholder="Câu trả lời của bạn..."
            )
            if ans:
                st.session_state.followup_answers[key] = ans.strip()
            else:
                all_answered = False

        if st.button("✅ Xác nhận và tiếp tục", type="primary", use_container_width=True):
            save_session(st.session_state.session_id, {
                "answers": st.session_state.answers,
                "analysis": analysis,
                "followup_answers": st.session_state.followup_answers,
                "research_findings": st.session_state.research_findings,
                "solutions": st.session_state.solutions,
                "skipped_research": st.session_state.skipped_research,
            })
            st.session_state.phase = "round2"
            st.rerun()
    else:
        st.session_state.phase = "round2"
        st.rerun()


# ─── PHASE: ROUND 2 — Self Research Task ─────────────────────────────────────
elif st.session_state.phase == "round2":
    analysis = st.session_state.analysis
    task = analysis.get("self_research_task", "")

    st.markdown(f"""
    <div class="analysis-card">
        <div class="step-badge">📊 Tóm tắt vấn đề</div>
        <p style="margin:0.5rem 0 0;color:#334;line-height:1.6">{analysis.get('summary', '')}</p>
    </div>
    """, unsafe_allow_html=True)

    if task:
        st.markdown(f"""
        <div class="research-card">
            <div class="step-badge" style="background:linear-gradient(135deg,#FF9800,#F44336)">
                🔍 Nhiệm vụ tự nghiên cứu
            </div>
            <p style="margin:0.5rem 0 0;color:#5d3a00;font-weight:500;line-height:1.6">{task}</p>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("""
        <div class="chat-bubble">
            Hãy thực hiện nhiệm vụ trên, sau đó quay lại và nhập kết quả bên dưới.
            Hoặc bỏ qua để nhận giải pháp lý thuyết.
        </div>
        """, unsafe_allow_html=True)

        findings = st.text_area(
            "📝 Kết quả nghiên cứu của bạn",
            value=st.session_state.research_findings,
            height=150,
            placeholder="Nhập kết quả bạn tìm được (dữ liệu, quan sát, ví dụ cụ thể...)"
        )

        col1, col2 = st.columns(2)
        with col1:
            if st.button("✅ Nộp kết quả nghiên cứu", type="primary", use_container_width=True):
                if not findings or not findings.strip():
                    st.warning("Vui lòng nhập kết quả nghiên cứu.")
                else:
                    st.session_state.research_findings = findings.strip()
                    st.session_state.skipped_research = False
                    st.session_state.phase = "generating"
                    save_session(st.session_state.session_id, {
                        "answers": st.session_state.answers,
                        "analysis": analysis,
                        "followup_answers": st.session_state.followup_answers,
                        "research_findings": st.session_state.research_findings,
                        "solutions": "",
                        "skipped_research": False,
                    })
                    st.rerun()

        with col2:
            if st.button("⏭️ Bỏ qua (lý thuyết)", use_container_width=True):
                st.session_state.research_findings = ""
                st.session_state.skipped_research = True
                st.session_state.phase = "generating"
                save_session(st.session_state.session_id, {
                    "answers": st.session_state.answers,
                    "analysis": analysis,
                    "followup_answers": st.session_state.followup_answers,
                    "research_findings": "",
                    "solutions": "",
                    "skipped_research": True,
                })
                st.rerun()
    else:
        st.session_state.phase = "generating"
        st.rerun()


# ─── PHASE: GENERATING Solutions ─────────────────────────────────────────────
elif st.session_state.phase == "generating":
    with st.spinner("🚀 TVT đang tổng hợp giải pháp..."):
        try:
            model = st.session_state.model
            analysis = st.session_state.analysis
            additional = " | ".join(st.session_state.followup_answers.values())

            if st.session_state.skipped_research:
                template = model.get("quick_solution_prompt", model["solution_generation_prompt"])
                prompt = template.format(
                    problem_summary=analysis.get("summary", ""),
                    additional_answers=additional
                )
            else:
                template = model["solution_generation_prompt"]
                prompt = template.format(
                    problem_summary=analysis.get("summary", ""),
                    user_research_findings=st.session_state.research_findings,
                    additional_answers=additional
                )

            solutions = call_llm(prompt)
            st.session_state.solutions = solutions
            save_session(
                st.session_state.session_id,
                {
                    "answers": st.session_state.answers,
                    "analysis": analysis,
                    "followup_answers": st.session_state.followup_answers,
                    "research_findings": st.session_state.research_findings,
                    "solutions": solutions,
                    "skipped_research": st.session_state.skipped_research,
                },
                status="completed"
            )
            st.session_state.phase = "done"
            st.rerun()
        except Exception as e:
            st.session_state.error = str(e)
            st.rerun()


# ─── PHASE: DONE ─────────────────────────────────────────────────────────────
elif st.session_state.phase == "done":
    analysis = st.session_state.analysis

    st.success(f"✅ Phiên hoàn thành · ID: `{st.session_state.session_id}`")

    if st.session_state.skipped_research:
        st.warning("⚠️ Giải pháp mang tính lý thuyết vì đã bỏ qua bước tự nghiên cứu.")

    # Summary
    st.markdown(f"""
    <div class="analysis-card">
        <div class="step-badge">📊 Tóm tắt vấn đề</div>
        <p style="margin:0.5rem 0 0;color:#334;line-height:1.6">{analysis.get('summary', '')}</p>
    </div>
    """, unsafe_allow_html=True)

    # Solutions
    st.markdown('<div class="solution-box">', unsafe_allow_html=True)
    st.markdown("### 🚀 Giải pháp TVT đề xuất")
    st.markdown(st.session_state.solutions)
    st.markdown("</div>", unsafe_allow_html=True)

    # Export
    st.markdown("---")
    col1, col2 = st.columns(2)
    with col1:
        json_data = export_session_json(st.session_state.session_id)
        if json_data:
            st.download_button(
                "💾 Tải xuống JSON",
                data=json_data,
                file_name=f"tvt_session_{st.session_state.session_id}.json",
                mime="application/json",
                use_container_width=True,
            )
    with col2:
        md_export = f"""# TVT Session — {st.session_state.session_id}

## Tóm tắt
{analysis.get('summary', '')}

## Giải pháp
{st.session_state.solutions}
"""
        st.download_button(
            "📄 Tải xuống Markdown",
            data=md_export,
            file_name=f"tvt_session_{st.session_state.session_id}.md",
            mime="text/markdown",
            use_container_width=True,
        )
