"""
TALKING WITH NIKOLA - Tesla Visual Thinking
Session Manager: Quản lý danh tính người dùng và phiên làm việc (Offline-first / Local files)
"""
import os
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, List

class TVTSessionManager:
    def __init__(self, user_id: str = None):
        # Đường dẫn mặc định ~/.tvt
        self.tvt_dir = Path.home() / ".tvt"
        self.identity_file = self.tvt_dir / "identity.json"
        
        # 1. Xác định User ID (UUID)
        self.user_id = user_id or self._get_or_create_user_id()
        
        # 2. Cấu trúc thư mục user
        self.user_dir = self.tvt_dir / "users" / self.user_id
        self.sessions_dir = self.user_dir / "sessions"
        
        # Đảm bảo thư mục tồn tại
        self.sessions_dir.mkdir(parents=True, exist_ok=True)

    def _get_or_create_user_id(self) -> str:
        """Đọc hoặc tạo UUID định danh người dùng cục bộ."""
        if self.identity_file.exists():
            try:
                with open(self.identity_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    return data.get("user_id")
            except:
                pass
        
        # Nếu chưa có hoặc lỗi, tạo mới
        self.tvt_dir.mkdir(parents=True, exist_ok=True)
        new_id = str(uuid.uuid4())
        with open(self.identity_file, "w", encoding="utf-8") as f:
            json.dump({"user_id": new_id, "created_at": datetime.now().isoformat()}, f)
        return new_id

    def create_session(self, model_name: str) -> str:
        """Tạo một phiên làm việc mới."""
        session_id = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:4]}"
        session_data = {
            "id": session_id,
            "model_name": model_name,
            "status": "active",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "data": {}
        }
        self.save_session(session_id, session_data)
        return session_id

    def save_session(self, session_id: str, data: dict):
        """Lưu dữ liệu phiên vào file .json."""
        file_path = self.sessions_dir / f"{session_id}.json"
        data["updated_at"] = datetime.now().isoformat()
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def load_session(self, session_id: str) -> Optional[dict]:
        """Tải dữ liệu phiên từ file."""
        file_path = self.sessions_dir / f"{session_id}.json"
        if not file_path.exists():
            return None
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def list_sessions(self, limit: int = 20) -> List[dict]:
        """Liệt kê danh sách các phiên gần nhất."""
        files = list(self.sessions_dir.glob("*.json"))
        sessions = []
        for f in files:
            try:
                with open(f, "r", encoding="utf-8") as f_in:
                    sess = json.load(f_in)
                    # Chỉ lấy metadata cho danh sách
                    sessions.append({
                        "id": sess["id"],
                        "model_name": sess["model_name"],
                        "status": sess["status"],
                        "updated_at": sess["updated_at"]
                    })
            except:
                continue
        
        # Sắp xếp theo thời gian cập nhật mới nhất
        sessions.sort(key=lambda x: x["updated_at"], reverse=True)
        return sessions[:limit]

# Legacy procedural API wrappers to maintain compatibility with existing CLI code
_mgr = TVTSessionManager()

def create_session(model_name: str) -> str:
    return _mgr.create_session(model_name)

def load_session(session_id: str) -> Optional[dict]:
    return _mgr.load_session(session_id)

def save_session(session_id: str, data: dict, status: str = "active") -> None:
    full_data = _mgr.load_session(session_id) or {}
    full_data.update({"data": data, "status": status})
    _mgr.save_session(session_id, full_data)

def list_sessions(limit: int = 20) -> list:
    return _mgr.list_sessions(limit)

def get_user_id() -> str:
    return _mgr.user_id
