"""
TVT - Tesla Visual Thinking
Session Manager: lưu/tải phiên làm việc bằng SQLite
"""
import sqlite3
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional


DB_PATH = Path(__file__).parent.parent / "storage" / "sessions.db"


def _get_conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Khởi tạo schema nếu chưa có."""
    with _get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                model_name TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'active',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                data TEXT NOT NULL DEFAULT '{}'
            )
        """)
        conn.commit()


def create_session(model_name: str) -> str:
    """Tạo session mới, trả về session_id."""
    init_db()
    session_id = str(uuid.uuid4())[:8]
    now = datetime.now().isoformat()
    with _get_conn() as conn:
        conn.execute(
            "INSERT INTO sessions (id, model_name, status, created_at, updated_at, data) VALUES (?,?,?,?,?,?)",
            (session_id, model_name, "active", now, now, "{}")
        )
        conn.commit()
    return session_id


def load_session(session_id: str) -> Optional[dict]:
    """Tải session theo ID. Trả về None nếu không tồn tại."""
    init_db()
    with _get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM sessions WHERE id = ?", (session_id,)
        ).fetchone()
    if row is None:
        return None
    result = dict(row)
    result["data"] = json.loads(result["data"])
    return result


def save_session(session_id: str, data: dict, status: str = "active") -> None:
    """Cập nhật data + status của session."""
    init_db()
    now = datetime.now().isoformat()
    with _get_conn() as conn:
        conn.execute(
            "UPDATE sessions SET data=?, status=?, updated_at=? WHERE id=?",
            (json.dumps(data, ensure_ascii=False), status, now, session_id)
        )
        conn.commit()


def list_sessions(limit: int = 20) -> list[dict]:
    """Liệt kê session gần nhất."""
    init_db()
    with _get_conn() as conn:
        rows = conn.execute(
            "SELECT id, model_name, status, created_at, updated_at FROM sessions ORDER BY updated_at DESC LIMIT ?",
            (limit,)
        ).fetchall()
    return [dict(r) for r in rows]


def export_session_json(session_id: str) -> Optional[str]:
    """Xuất toàn bộ session ra JSON string."""
    session = load_session(session_id)
    if session is None:
        return None
    return json.dumps(session, ensure_ascii=False, indent=2)
