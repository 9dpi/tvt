import os
import locale
import yaml
from pathlib import Path

def detect_language():
    """Trả về mã ngôn ngữ (vd: 'vi', 'en', 'zh'...) dựa trên hệ thống."""
    # Ưu tiên biến môi trường TVT_LANG
    lang = os.environ.get("TVT_LANG")
    if lang:
        return lang
    
    # Lấy locale hiện tại
    try:
        lang_code, _ = locale.getdefaultlocale()
        if lang_code:
            # 'vi_VN' -> 'vi', 'en_US' -> 'en'
            return lang_code.split('_')[0].lower()
    except:
        pass
    
    # Fallback: đọc từ LANG (Linux/Mac)
    lang = os.environ.get("LANG", "en")
    return lang.split('.')[0].split('_')[0].lower()

class I18n:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(I18n, cls).__new__(cls)
        return cls._instance

    def __init__(self, lang_code: str = None):
        if not hasattr(self, 'initialized'):
            self.lang = lang_code or detect_language()
            self.translations = self._load_translations()
            self.initialized = True
    
    def _load_translations(self):
        # Handle project root based on file location
        base_dir = Path(__file__).parent.parent
        lang_file = base_dir / "i18n" / f"{self.lang}.yaml"
        
        if not lang_file.exists():
            # Fallback to English
            lang_file = base_dir / "i18n" / "en.yaml"
            
        if not lang_file.exists():
            return {} # Safety fallback if en.yaml is missing

        with open(lang_file, "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    
    def get(self, key: str, **kwargs):
        """Lấy chuỗi dựa trên key. Hỗ trợ nested như 'messages.min_words_warning'"""
        keys = key.split('.')
        value = self.translations
        for k in keys:
            if isinstance(value, dict):
                value = value.get(k, {})
            else:
                value = key # Fallback if not found
                break
        
        if isinstance(value, str):
            try:
                return value.format(**kwargs)
            except KeyError:
                return value # Ignore format errors if missing kwargs
        elif value == {}:
            return key # Return key if translation is missing

        return value
