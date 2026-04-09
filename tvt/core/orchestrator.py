"""
TVT - Tesla Visual Thinking
Orchestrator: điều phối toàn bộ luồng phiên hỏi-đáp
"""
from typing import Optional
from rich.console import Console

from .model_loader import load_model
from .session import create_session, load_session, save_session
from .llm_client import call_llm, parse_json_response
from .utils import (
    validate_answer, print_question, print_analysis_result,
    print_solutions, console
)

MAX_FOLLOWUP_ROUNDS = 3


class TVTOrchestrator:
    """
    Điều phối một phiên TVT đầy đủ:
      Vòng 1 → Phân tích LLM → Vòng 1b (follow-up) → Self-research → Vòng 3 (giải pháp)
    """

    def __init__(self, model_name: str = "5w1h", session_id: Optional[str] = None):
        self.model = load_model(model_name)
        self.model_name = model_name

        if session_id:
            sess = load_session(session_id)
            if sess is None:
                raise ValueError(f"Không tìm thấy session '{session_id}'")
            self.session_id = session_id
            self.data = sess["data"]
        else:
            self.session_id = create_session(model_name)
            self.data = {
                "answers": {},
                "analysis": {},
                "followup_answers": {},
                "research_findings": "",
                "solutions": "",
                "skipped_research": False
            }
            self._save()

    # ─── Internal helpers ────────────────────────────────────────────────────

    def _save(self, status: str = "active") -> None:
        save_session(self.session_id, self.data, status)

    def _ask_question(self, q: dict, index: int, total: int) -> str:
        """Hỏi một câu và validate số từ. Retry tối đa 3 lần."""
        min_words = q.get("min_words", 5)
        hint = q.get("hint")

        for attempt in range(3):
            print_question(index, total, q["text"], hint if attempt == 0 else None)
            answer = console.input("[bold]> [/bold]").strip()

            is_valid, msg = validate_answer(answer, min_words)
            if is_valid:
                return answer
            console.print(f"[red]⚠  {msg}[/red]")

        console.print("[dim]Chấp nhận câu trả lời hiện tại.[/dim]")
        return answer

    # ─── Public flow ─────────────────────────────────────────────────────────

    def run(self) -> None:
        """Chạy toàn bộ phiên TVT."""
        console.print(f"\n[dim]Session ID: [cyan]{self.session_id}[/cyan][/dim]")
        console.print(f"[dim]Model: [green]{self.model['name']}[/green] — {self.model['description']}[/dim]\n")

        # Vòng 1: initial questions
        self._round1()

        # Phân tích LLM
        analysis = self._analyze()
        self.data["analysis"] = analysis
        self._save()
        print_analysis_result(analysis)

        # Vòng 1b: follow-up (nếu có)
        follow_ups = analysis.get("follow_up_questions", [])
        if follow_ups:
            self._round1b(follow_ups)

        # Vòng 2: Self-research task
        skipped = self._round2(analysis.get("self_research_task", ""))
        self.data["skipped_research"] = skipped
        self._save()

        # Vòng 3: Sinh giải pháp
        solutions = self._round3()
        self.data["solutions"] = solutions
        self._save(status="completed")

        print_solutions(solutions)
        console.print(f"\n[bold green]✅ Phiên hoàn thành! ID: {self.session_id}[/bold green]")
        console.print("[dim]Dùng `tvt export <id>` để xuất kết quả ra JSON.[/dim]")

    def _round1(self) -> None:
        """Vòng 1: Hỏi tất cả initial_questions."""
        questions = self.model["initial_questions"]
        total = len(questions)
        console.print("[bold cyan]── VÒNG 1: Thu thập thông tin ──[/bold cyan]")

        for i, q in enumerate(questions, 1):
            qid = q["id"]
            if qid in self.data["answers"]:
                # Resume: câu đã có câu trả lời
                continue
            answer = self._ask_question(q, i, total)
            self.data["answers"][qid] = answer
            self._save()

    def _analyze(self) -> dict:
        """Gửi câu trả lời vòng 1 tới LLM để phân tích."""
        console.print("\n[dim]🤖 Đang phân tích...[/dim]")
        template = self.model["analysis_prompt_template"]
        prompt = template.format(**self.data["answers"])
        raw = call_llm(prompt)
        return parse_json_response(raw)

    def _round1b(self, follow_up_questions: list[str]) -> None:
        """Vòng 1b: Hỏi follow-up nếu LLM thấy mơ hồ."""
        console.print("\n[bold cyan]── VÒNG 1b: Làm rõ thêm ──[/bold cyan]")
        total = len(follow_up_questions)

        for i, question_text in enumerate(follow_up_questions, 1):
            print_question(i, total, question_text)
            answer = console.input("[bold]> [/bold]").strip()
            self.data["followup_answers"][f"followup_{i}"] = answer
            self._save()

    def _round2(self, task: str) -> bool:
        """
        Vòng 2: Yêu cầu user thực hiện self-research task.
        Trả về True nếu user bỏ qua.
        """
        if not task:
            return False

        console.print("\n[bold cyan]── VÒNG 2: Tự nghiên cứu thực tế ──[/bold cyan]")
        console.print(f"\n[bold magenta]📋 Nhiệm vụ:[/bold magenta] {task}")
        console.print(
            "\n[dim]Hãy thực hiện nhiệm vụ trên, sau đó quay lại gõ kết quả.\n"
            "Gõ [bold]'skip'[/bold] để bỏ qua (giải pháp sẽ mang tính lý thuyết hơn).[/dim]"
        )

        findings = console.input("\n[bold]📝 Kết quả nghiên cứu của bạn (hoặc 'skip'): [/bold]").strip()

        if findings.lower() in ("skip", "bỏ qua", ""):
            console.print("[yellow]⚠  Bỏ qua self-research. TVT sẽ dùng giải pháp lý thuyết.[/yellow]")
            self.data["research_findings"] = ""
            return True

        self.data["research_findings"] = findings
        return False

    def _round3(self) -> str:
        """Vòng 3: Sinh 3 giải pháp từ LLM."""
        console.print("\n[dim]🤖 Đang tổng hợp giải pháp...[/dim]")

        skipped = self.data.get("skipped_research", False)
        analysis = self.data.get("analysis", {})
        additional = " | ".join(self.data.get("followup_answers", {}).values())

        if skipped:
            template = self.model.get("quick_solution_prompt", self.model["solution_generation_prompt"])
            prompt = template.format(
                problem_summary=analysis.get("summary", ""),
                additional_answers=additional
            )
        else:
            template = self.model["solution_generation_prompt"]
            prompt = template.format(
                problem_summary=analysis.get("summary", ""),
                user_research_findings=self.data.get("research_findings", ""),
                additional_answers=additional
            )

        return call_llm(prompt)
