@echo off
TITLE ⚡ TVT - Tesla Visual Thinking Launcher
COLOR 0B

echo ===================================================
echo   ⚡ TESLA VISUAL THINKING (TVT) - KHOI DONG
echo ===================================================
echo.

:: 1. Kiem tra Python
echo [*] Dang kiem tra moi truong Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] LOI: Khong tim thay Python!
    echo     Vui long tai va cai dat Python tai: https://www.python.org/
    echo     Luu y: Nho chon "Add Python to PATH" khi cai dat.
    pause
    exit /b
)
echo [OK] Da tim thay Python.

:: 2. Kiem tra va cai dat Thu vien
echo [*] Dang kiem tra thu vien (requirements.txt)...
pip install -r requirements.txt --quiet
if %errorlevel% neq 0 (
    echo [!] Canh bao: Co loi khi cai dat thu vien. 
    echo     Hay thu chay 'pip install -r requirements.txt' thu cong.
)
echo [OK] Thu vien da san sang.

:: 3. Kiem tra Ollama (Tuy chon)
echo [*] Dang kiem tra Ollama (AI Offline)...
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Luu y: Khong tim thay Ollama.
    echo     De dung AI Offline, hay cai dat tai: https://ollama.com
) else (
    echo [OK] Da tim thay Ollama.
)

:: 4. Kiem tra .env
if not exist .env (
    echo [!] Canh bao: Chua co file .env
    echo     Ban co the copy .env.example thanh .env de cau hinh API Key.
)

:: 5. Khoi dong Server
echo.
echo [!] DANG KHOI DONG TVT TAI: http://localhost:8502
echo.
echo --- HUONG DAN ---
echo - Giu cua so nay de duy tri ung dung.
echo - Mo trinh duyet va truy cap http://localhost:8502
echo - Neu dung Ollama, hay dam bao Ollama dang chay.
echo -----------------
echo.

:: Mo trinh duyet
start http://localhost:8502/

:: Chay server tu thu muc docs de dam bao load dung CSS/JS
python -m http.server 8502 --directory docs

pause
