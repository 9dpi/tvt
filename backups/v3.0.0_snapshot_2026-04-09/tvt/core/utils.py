"""
TVT - Tesla Visual Thinking
Utility functions: word count, validation, formatting
"""
import re
from typing import Optional
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.table import Table
from rich import box


console = Console()


def count_words(text: str) -> int:
    """Đếm số từ trong câu trả lời (hỗ trợ tiếng Việt)."""
    text = text.strip()
    if not text:
        return 0
    # Tách theo khoảng trắng hoặc dấu câu
    words = re.split(r"[\s\u00a0]+", text)
    return len([w for w in words if w])


def validate_answer(answer: str, min_words: int) -> tuple[bool, str]:
    """
    Kiểm tra câu trả lời có đủ từ không.
    Trả về (is_valid, message).
    """
    wc = count_words(answer)
    if wc < min_words:
        return False, f"Câu trả lời quá ngắn ({wc} từ). Cần ít nhất {min_words} từ."
    return True, ""


def print_welcome() -> None:
    """In màn hình chào."""
    console.print()
    console.print(Panel.fit(
        "[bold cyan]⚡ TVT — Tesla Visual Thinking[/bold cyan]\n"
        "[dim]Hệ thống tư duy có cấu trúc · Phong cách Tesla[/dim]",
        border_style="cyan",
        padding=(1, 4)
    ))
    console.print()


def print_question(index: int, total: int, question_text: str, hint: Optional[str] = None) -> None:
    """Hiển thị câu hỏi được đánh số."""
    console.print(f"\n[bold yellow]📌 Câu {index}/{total}[/bold yellow]")
    console.print(f"[bold white]{question_text}[/bold white]")
    if hint:
        console.print(f"[dim italic]💡 Gợi ý: {hint}[/dim italic]")


def print_analysis_result(analysis: dict) -> None:
    """Hiển thị kết quả phân tích LLM."""
    console.print()
    console.print(Panel(
        f"[bold green]{analysis.get('summary', 'N/A')}[/bold green]",
        title="📊 Tóm tắt vấn đề",
        border_style="green"
    ))

    ambiguities = analysis.get("ambiguities", [])
    if ambiguities:
        console.print("\n[bold orange1]⚠️  Điểm cần làm rõ:[/bold orange1]")
        for i, a in enumerate(ambiguities, 1):
            console.print(f"  {i}. {a}")

    follow_ups = analysis.get("follow_up_questions", [])
    if follow_ups:
        console.print("\n[bold cyan]❓ Câu hỏi bổ sung:[/bold cyan]")
        for i, q in enumerate(follow_ups, 1):
            console.print(f"  {i}. {q}")

    task = analysis.get("self_research_task", "")
    if task:
        console.print()
        console.print(Panel(
            f"[bold magenta]{task}[/bold magenta]",
            title="🔍 Nhiệm vụ tự tìm kiếm",
            border_style="magenta"
        ))


def print_solutions(markdown_text: str) -> None:
    """Hiển thị giải pháp từ LLM."""
    from rich.markdown import Markdown
    console.print()
    console.print(Panel(
        Markdown(markdown_text),
        title="🚀 Giải pháp đề xuất từ TVT",
        border_style="bright_blue",
        padding=(1, 2)
    ))


def print_sessions_table(sessions: list[dict]) -> None:
    """Hiển thị bảng danh sách session."""
    if not sessions:
        console.print("[dim]Chưa có phiên nào được lưu.[/dim]")
        return

    table = Table(box=box.ROUNDED, border_style="dim")
    table.add_column("ID", style="cyan", no_wrap=True)
    table.add_column("Model", style="green")
    table.add_column("Trạng thái", style="yellow")
    table.add_column("Cập nhật", style="dim")

    for s in sessions:
        status_icon = "✅" if s["status"] == "completed" else "🟡"
        table.add_row(
            s["id"],
            s["model_name"],
            f"{status_icon} {s['status']}",
            s["updated_at"][:16].replace("T", " ")
        )

    console.print(table)
