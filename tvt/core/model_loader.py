"""
TVT - Tesla Visual Thinking
Model loader: đọc và validate các file YAML model
"""
from pathlib import Path
from typing import Optional
import yaml


MODELS_DIR = Path(__file__).parent.parent / "models"


def list_models() -> list[str]:
    """Trả về danh sách tên model có sẵn."""
    return [f.stem for f in MODELS_DIR.glob("*.yaml")]


def load_model(name: str) -> dict:
    """
    Load model YAML theo tên.
    Raises FileNotFoundError nếu không tìm thấy.
    Raises ValueError nếu thiếu field bắt buộc.
    """
    path = MODELS_DIR / f"{name}.yaml"
    if not path.exists():
        available = list_models()
        raise FileNotFoundError(
            f"Model '{name}' không tồn tại. Các model có sẵn: {available}"
        )

    with path.open(encoding="utf-8") as f:
        data = yaml.safe_load(f)

    _validate_model(data, name)
    return data


def _validate_model(data: dict, name: str) -> None:
    """Kiểm tra các field bắt buộc của model YAML."""
    required_fields = [
        "name", "description", "initial_questions",
        "analysis_prompt_template", "solution_generation_prompt"
    ]
    missing = [f for f in required_fields if f not in data]
    if missing:
        raise ValueError(
            f"Model '{name}' thiếu các field bắt buộc: {missing}"
        )

    for q in data.get("initial_questions", []):
        if "id" not in q or "text" not in q:
            raise ValueError(
                f"Model '{name}': mỗi câu hỏi cần có 'id' và 'text'."
            )
