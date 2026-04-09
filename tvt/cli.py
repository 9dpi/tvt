"""
TVT - Tesla Visual Thinking
CLI entry point (Typer-based)
Usage:
  tvt ask                     # chạy với model mặc định (5w1h)
  tvt ask --model swot        # chọn model
  tvt ask --resume <id>       # tiếp tục session
  tvt models                  # liệt kê model có sẵn
  tvt sessions                # xem lịch sử
  tvt export <session_id>     # xuất session ra JSON
"""
import typer
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load .env nếu có
load_dotenv()

from tvt.core.utils import print_welcome, print_sessions_table, console
from tvt.core.model_loader import list_models
from tvt.core.session import list_sessions, export_session_json
from tvt.core.orchestrator import TVTOrchestrator

app = typer.Typer(
    name="tvt",
    help="⚡ TVT — Tesla Visual Thinking · Hệ thống tư duy có cấu trúc",
    rich_markup_mode="rich",
    no_args_is_help=True,
)


@app.command()
def ask(
    model: str = typer.Option("5w1h", "--model", "-m", help="Tên model tư duy (5w1h, swot, ...)"),
    resume: Optional[str] = typer.Option(None, "--resume", "-r", help="ID phiên cần tiếp tục"),
):
    """🚀 Bắt đầu một phiên tư duy TVT mới hoặc tiếp tục phiên cũ."""
    print_welcome()

    try:
        orchestrator = TVTOrchestrator(model_name=model, session_id=resume)
        orchestrator.run()
    except FileNotFoundError as e:
        console.print(f"[red]❌ {e}[/red]")
        raise typer.Exit(1)
    except EnvironmentError as e:
        console.print(f"[red]❌ Lỗi cấu hình: {e}[/red]")
        console.print("[dim]Kiểm tra file .env hoặc biến môi trường TVT_PROVIDER, *_API_KEY[/dim]")
        raise typer.Exit(1)
    except Exception as e:
        console.print(f"[red]❌ Lỗi không xác định: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def models():
    """📋 Liệt kê tất cả model tư duy có sẵn."""
    from tvt.core.model_loader import load_model
    available = list_models()
    if not available:
        console.print("[dim]Không có model nào trong thư mục models/[/dim]")
        return

    console.print("\n[bold cyan]📚 Các model TVT có sẵn:[/bold cyan]\n")
    for name in available:
        try:
            m = load_model(name)
            console.print(f"  [bold green]{name}[/bold green] — {m['description']}")
            console.print(f"    [dim]Phiên bản: {m.get('version', 'N/A')} | "
                          f"Áp dụng cho: {', '.join(m.get('applicable_for', []))}[/dim]")
        except Exception as e:
            console.print(f"  [red]{name}[/red] — Lỗi: {e}")
    console.print()


@app.command()
def sessions():
    """📂 Xem lịch sử các phiên làm việc."""
    console.print("\n[bold cyan]📂 Lịch sử phiên TVT:[/bold cyan]\n")
    sess_list = list_sessions(20)
    print_sessions_table(sess_list)
    console.print()


@app.command()
def export(
    session_id: str = typer.Argument(..., help="ID phiên cần xuất"),
    out: Optional[Path] = typer.Option(None, "--out", "-o", help="File đầu ra (mặc định: in ra màn hình)"),
):
    """💾 Xuất kết quả phiên ra file JSON."""
    json_str = export_session_json(session_id)
    if json_str is None:
        console.print(f"[red]❌ Không tìm thấy session '{session_id}'[/red]")
        raise typer.Exit(1)

    if out:
        out.write_text(json_str, encoding="utf-8")
        console.print(f"[green]✅ Đã xuất ra: {out}[/green]")
    else:
        console.print(json_str)


def main():
    app()


if __name__ == "__main__":
    main()
