"""
TVT - Tesla Visual Thinking
LLM Client: abstraction layer cho OpenAI / Gemini / Claude
Chọn provider qua biến môi trường TVT_PROVIDER
"""
import os
import json
from typing import Optional


def get_provider() -> str:
    return os.getenv("TVT_PROVIDER", "gemini").lower()


def call_llm(prompt: str, as_json: bool = False) -> str:
    """
    Gọi LLM theo provider đã cấu hình.
    Trả về chuỗi text (hoặc JSON string nếu as_json=True yêu cầu LLM trả JSON).
    """
    provider = get_provider()

    if provider == "openai":
        return _call_openai(prompt)
    elif provider == "gemini":
        return _call_gemini(prompt)
    elif provider == "claude":
        return _call_claude(prompt)
    else:
        raise ValueError(
            f"Provider '{provider}' không được hỗ trợ. "
            "Chọn: openai, gemini, claude (qua biến TVT_PROVIDER)"
        )


def _call_openai(prompt: str) -> str:
    try:
        from openai import OpenAI
    except ImportError:
        raise ImportError("Cần cài: pip install openai")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError("Thiếu biến môi trường OPENAI_API_KEY")

    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()


def _call_gemini(prompt: str) -> str:
    try:
        import google.generativeai as genai
    except ImportError:
        raise ImportError("Cần cài: pip install google-generativeai")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError("Thiếu biến môi trường GEMINI_API_KEY")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-2.0-flash"))
    response = model.generate_content(prompt)
    return response.text.strip()


def _call_claude(prompt: str) -> str:
    try:
        import anthropic
    except ImportError:
        raise ImportError("Cần cài: pip install anthropic")

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError("Thiếu biến môi trường ANTHROPIC_API_KEY")

    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model=os.getenv("CLAUDE_MODEL", "claude-3-5-haiku-20241022"),
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}]
    )
    return message.content[0].text.strip()


def parse_json_response(text: str) -> dict:
    """
    Trích xuất JSON từ response LLM.
    Xử lý trường hợp LLM bọc JSON trong markdown code block.
    """
    text = text.strip()
    # Loại bỏ markdown code block nếu có
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    # Tìm JSON object đầu tiên
    start = text.find("{")
    end = text.rfind("}") + 1
    if start != -1 and end > start:
        text = text[start:end]

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"LLM trả về JSON không hợp lệ: {e}\n\nRaw:\n{text}")
