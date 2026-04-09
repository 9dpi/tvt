"""
TVT Tests: Unit tests cho core modules
"""
import pytest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))


class TestWordCount:
    def test_basic_english(self):
        from tvt.core.utils import count_words
        assert count_words("hello world how are you") == 5

    def test_vietnamese(self):
        from tvt.core.utils import count_words
        assert count_words("Vấn đề cụ thể của tôi là cần tìm giải pháp") >= 8

    def test_empty(self):
        from tvt.core.utils import count_words
        assert count_words("") == 0

    def test_single_word(self):
        from tvt.core.utils import count_words
        assert count_words("hello") == 1


class TestValidateAnswer:
    def test_valid(self):
        from tvt.core.utils import validate_answer
        is_valid, msg = validate_answer("a b c d e f g h i j", 5)
        assert is_valid is True

    def test_too_short(self):
        from tvt.core.utils import validate_answer
        is_valid, msg = validate_answer("short", 10)
        assert is_valid is False
        assert "10" in msg

    def test_exact_minimum(self):
        from tvt.core.utils import validate_answer
        text = " ".join(["word"] * 10)
        is_valid, _ = validate_answer(text, 10)
        assert is_valid is True


class TestModelLoader:
    def test_load_5w1h(self):
        from tvt.core.model_loader import load_model
        model = load_model("5w1h")
        assert model["name"] == "5W1H"
        assert len(model["initial_questions"]) == 6

    def test_load_swot(self):
        from tvt.core.model_loader import load_model
        model = load_model("swot")
        assert model["name"] == "SWOT"

    def test_list_models(self):
        from tvt.core.model_loader import list_models
        models = list_models()
        assert "5w1h" in models
        assert "swot" in models

    def test_model_not_found(self):
        from tvt.core.model_loader import load_model
        with pytest.raises(FileNotFoundError):
            load_model("nonexistent_model")


class TestSession:
    def test_create_and_load(self, tmp_path, monkeypatch):
        from tvt.core import session as sess_module
        # Redirect DB to tmp
        monkeypatch.setattr(sess_module, "DB_PATH", tmp_path / "test.db")

        from tvt.core.session import create_session, load_session, save_session
        sid = create_session("5w1h")
        assert len(sid) > 0

        loaded = load_session(sid)
        assert loaded is not None
        assert loaded["model_name"] == "5w1h"
        assert loaded["status"] == "active"

    def test_save_and_reload(self, tmp_path, monkeypatch):
        from tvt.core import session as sess_module
        monkeypatch.setattr(sess_module, "DB_PATH", tmp_path / "test.db")

        from tvt.core.session import create_session, save_session, load_session
        sid = create_session("swot")
        data = {"answers": {"context": "Test context for SWOT analysis"}}
        save_session(sid, data, status="completed")

        loaded = load_session(sid)
        assert loaded["status"] == "completed"
        assert loaded["data"]["answers"]["context"] == "Test context for SWOT analysis"

    def test_load_nonexistent(self, tmp_path, monkeypatch):
        from tvt.core import session as sess_module
        monkeypatch.setattr(sess_module, "DB_PATH", tmp_path / "test.db")
        from tvt.core.session import load_session
        assert load_session("nonexistent") is None


class TestLLMClientParsing:
    def test_parse_clean_json(self):
        from tvt.core.llm_client import parse_json_response
        raw = '{"summary": "Test", "ambiguities": [], "follow_up_questions": [], "self_research_task": ""}'
        result = parse_json_response(raw)
        assert result["summary"] == "Test"

    def test_parse_json_in_markdown(self):
        from tvt.core.llm_client import parse_json_response
        raw = '```json\n{"summary": "Hello", "ambiguities": []}\n```'
        result = parse_json_response(raw)
        assert result["summary"] == "Hello"

    def test_parse_invalid_json_raises(self):
        from tvt.core.llm_client import parse_json_response
        with pytest.raises(ValueError):
            parse_json_response("not json at all")
