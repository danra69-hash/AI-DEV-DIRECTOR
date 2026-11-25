"""
Dashboard presentation language. The working language is English. Internal enums, audit keys, DB values and API
fields stay as their English codes; only what the user sees is mapped here.
"""
import re
from typing import Dict, Tuple, List, Optional

LANG = "en"

UI_TEXT: Dict[str, str] = {
    "app_subtitle": "AI development orchestration",
    "system_mode": "System status",
    "project": "Project",
    "last_run": "Latest task",
    "current_run": "Current task",
    "head_chat": "HEAD chat",
    "recovery": "Recovery",
    "results": "Results",
    "pending_actions": "Waiting for approval",
    "details": "Details",
    "inspect": "Inspect",
    "new_chat": "New chat",
    "view_changes": "View changes",
    "test_results": "Test results",
    "open_worktree": "Open the work copy",
    "open_project": "Open the project folder",
    "apply_verify": "Apply and verify",
    "discard": "Discard result",
    "refresh_providers": "Refresh AI status",
    "approve_resume": "Approve and continue",
    "reject": "Reject",
    "cancel": "Cancel",
    "close": "Close",
    "change": "Change",
    "select_project": "Choose a project",
    "no_project": "No project selected",
    "director_core": "AI DEV DIRECTOR CORE",
    "core_sub": "Directs three AI cores",
    "my_todo": "What you need to do",
    "nothing_todo": "Nothing",
    "head_ready": "Ask HEAD for a task.",
    "director_ready": "AI DEV DIRECTOR is ready",
    "safe": "Safe",
    "human_required": "Needs you",
    "human_required_sub": "Check the following before this task can continue.",
    "human_approval_required": "Your approval is required.",
    "not_approvable": "Safety issue that cannot be approved",
    "not_approvable_sub": "Approval cannot bypass this issue.",
    "reason": "Reason",
    "file": "File",
    "why": "Why",
    "stage": "Stage",
    "builder": "Builder",
    "technical_reason": "Technical reason",
    "safe_no_action": "Safe · nothing to do",
    "result_ready": "The result is ready.",
    "result_applied": "Applied to the project ✓",
    "result_discarded": "The result was discarded.",
    "apply_blocked": "This result cannot be applied.",
    "apply_rolled_back": "Apply failed, so the project was restored.",
    "changed_files": "Changed files",
    "tests": "Tests",
    "review": "Review",
    "safety": "Safety check",
    "pass": "passed",
    "fail": "failed",
    "apply_confirm_title": "Apply this result to the project?",
    "apply_confirm_body": "Tests run again after it is applied.\nNothing is committed or pushed automatically.\nIf something goes wrong, the project is restored automatically.",
    "apply_confirm_ok": "Apply and verify",
    "discard_confirm_title": "Discard this result?",
    "discard_confirm_body": "- The original project is not changed.\n- The work record and verification evidence are kept.\n- The work copy may be deleted.",
    "discard_confirm_ok": "Discard",
    "head_working": "HEAD is working…",
    "head_busy_other": "HEAD is handling another request…",
    "send": "Send",
    "input_placeholder": "Enter to send, Shift+Enter for a new line",
    "run_id": "Task ID",
    "elapsed": "Elapsed",
    "started": "Started",
    "next_step": "Next step",
    "state": "State",
    "role": "Role",
    "latency": "Latest task",
    "version": "CLI version",
    "last_error": "Latest error",
    "quota": "Usage",
    "worktree": "Work copy",
    "result_state": "Result",
    "view_result": "View result",
    "run_pass_ready": "The task is done · the result is ready",
}

STATUS_TEXT: Dict[str, str] = {
    "HEALTHY": "Available", "RECOVERING": "Recovering", "DEGRADED": "Limited", "STOP": "Stopped", "NORMAL": "Available",
    "QUOTA_EXHAUSTED": "Quota exhausted", "QUOTA_LOW": "Quota low", "AUTH_FAILED": "Sign-in failed", "TIMEOUT": "No response",
    "UNAVAILABLE": "Unavailable", "CONFIG_ERROR": "Configuration error", "UNKNOWN": "Unknown",
}

STATE_TEXT: Dict[str, str] = {
    "IDLE": "Waiting", "PLANNING": "Reading the request", "ORDER_READY": "Ready to build", "BUILDING": "Writing code",
    "VERIFYING": "Running tests", "REVIEWING": "Reviewing code", "DECIDING": "Making the final call", "PASS": "Done",
    "FAIL": "Failed", "FAILED": "Failed", "RECOVERED": "Recovered", "TIMEOUT": "Timed out", "HUMAN_REQUIRED": "Needs you", "NONE": "No task",
}

RESULT_TEXT: Dict[str, str] = {
    "READY": "Ready to apply", "APPLIED": "Applied", "DISCARDED": "Discarded", "APPLY_BLOCKED": "Cannot apply",
    "APPLY_FAILED_ROLLED_BACK": "Apply failed · restored", "APPLY_VERIFY_FAILED_ROLLED_BACK": "Verification failed · restored",
}

ROLE_TEXT: Dict[str, str] = {"HEAD": "directs the work", "BUILDER": "writes code", "REVIEWER": "reviews code", "BACKUP": "standby", "NONE": "no role"}

STAGE_TEXT: Dict[str, str] = {"HEAD": "Reading the request", "BUILD": "Writing code", "VERIFY": "Tests and safety checks", "REVIEW": "Code review", "DECIDE": "Final decision"}

PROVIDER_LABEL: Dict[str, Tuple[str, str, str]] = {
    "OPENAI": ("CODEX", "OpenAI", "Codex"), "GOOGLE": ("ANTIGRAVITY", "Google", "Antigravity"), "ANTHROPIC": ("CLAUDE", "Anthropic", "Claude"),
}

REASON_TEXT: Dict[str, Tuple[str, str]] = {
    "SENSITIVE_FILE_IN_SCOPE": ("Approval needed to change dependency or environment files", "A file that can affect the runtime or dependencies is in scope. Confirm it before it is changed."),
    "DEPENDENCY_CONFIGURATION_MODIFIED": ("Dependency configuration changed", "A dependency configuration file was actually changed. Approving this file lets verification continue."),
    "AMBIGUOUS_SCOPE": ("The scope is unclear", "The allowed paths are empty or cover the whole project. Confirm the scope and approve."),
    "HIGH_RISK": ("High-risk task", "HEAD marked this task high risk. A person has to approve it before it runs."),
    "EXPLICIT_HUMAN_APPROVAL_REQUESTED": ("HEAD asked for approval", "HEAD explicitly asked for your approval before running."),
    "DESTRUCTIVE_CHANGE": ("This task deletes files", "A task that deletes files cannot be bypassed by approval."),
    "PROTECTED_PATH_IN_SCOPE": ("A protected path is in scope", "The AI cannot modify a protected path, and approval cannot bypass that."),
    "PROTECTED_PATH_INSIDE_ALLOWED": ("A protected path sits inside the allowed scope", "A protected path is under an allowed path. Approval cannot bypass that."),
    "GIT_INTERNALS_IN_SCOPE": ("Git internals are in scope.", "Git internals (.git) manage the project's Git state, so the AI cannot modify them."),
    "CONTROL_PLANE_IN_SCOPE": ("An AI DEV DIRECTOR protected file is in scope", "The AI cannot modify AI DEV DIRECTOR protected settings."),
    "CONTROL_PLANE_MODIFIED": ("A protected settings file changed", "A change to an AI DEV DIRECTOR protected settings file was detected."),
    "INVALID_PATH": ("Invalid path", "The scope includes a path form that is not allowed."),
    "CANONICAL_CONTAINMENT": ("A path may leave the work folder", "Stopped because a path may resolve outside the work folder."),
    "ORDER_PATH_VIOLATION": ("Path outside the work folder", "Stopped because a path is outside the work folder."),
    "REGRESSION": ("Existing tests got worse", "Stopped because the results are worse than the existing tests."),
    "BASELINE_MISSING": ("No baseline test record", "There is no baseline from before the task, so the results cannot be compared safely."),
    "BASELINE_FAILED": ("Baseline tests failed", "Did not start because the tests were already failing before the task."),
    "WORKTREE_EVIDENCE_MISSING": ("Work copy could not be checked", "The work copy needed for a safe check could not be confirmed."),
    "EVIDENCE_MISSING": ("No verification evidence", "Did not finish automatically because verification evidence is missing."),
    "REVIEWER_FAIL_CLOSED": ("The review cannot be trusted", "Did not finish automatically because the code review cannot be trusted."),
    "REVIEWER_EXCEPTION": ("Code review failed", "The code-review AI call failed."),
    "FINAL_GATE": ("Final safety check is incomplete", "Did not finish because the final safety check is missing evidence."),
    "SCOPE_VIOLATION": ("Scope violation", "A change outside the allowed scope was detected."),
    "PROVIDER_STOP": ("Not enough AIs", "Automatic work stopped because too few AIs are available."),
    "PROJECT_SELECTION_REQUIRED": ("No project selected", "Choose a project before a task can run."),
    "BASE_COMMIT_MISMATCH": ("The original project changed", "The original project changed after this task started. Start a new task, or tidy the project first."),
    "WORKING_TREE_DIRTY": ("The original project has uncommitted changes", "Tidy the original project's changes before the result can be applied safely."),
    "UNTRACKED_COLLISION": ("A file with the same name already exists", "Did not overwrite a project file that already has the same name as a result file."),
    "UNKNOWN": ("Could not decide automatically", "Something could not be decided automatically. Check the details."),
}

REASON_RECOMMENDATION: Dict[str, str] = {
    "GIT_INTERNALS_IN_SCOPE": "Ask HEAD to plan again without the .git area.",
    "CONTROL_PLANE_IN_SCOPE": "Ask HEAD to plan again without AI DEV DIRECTOR protected files.",
    "CONTROL_PLANE_MODIFIED": "Ask HEAD to plan again without the protected settings files.",
    "PROTECTED_PATH_IN_SCOPE": "Ask HEAD to plan again without the protected paths.",
    "PROTECTED_PATH_INSIDE_ALLOWED": "Ask HEAD to plan again without the protected paths.",
    "CANONICAL_CONTAINMENT": "Ask HEAD to plan again using only paths inside the work folder.",
    "ORDER_PATH_VIOLATION": "Ask HEAD to plan again using only paths inside the work folder.",
    "INVALID_PATH": "Ask HEAD to plan again with project-relative paths.",
    "DESTRUCTIVE_CHANGE": "Ask HEAD to plan again without deleting files.",
    "SCOPE_VIOLATION": "Ask HEAD to work only inside the allowed scope.",
    "AMBIGUOUS_SCOPE": "Ask HEAD to name the allowed paths and plan again.",
    "REGRESSION": "Ask HEAD to try again without breaking the existing tests.",
    "WORKTREE_EVIDENCE_MISSING": "Try again, or check the AI DEV DIRECTOR log.",
    "REVIEWER_FAIL_CLOSED": "Try again, or check the code-review log.",
    "REVIEWER_EXCEPTION": "Try again, or check the code-review log.",
    "FINAL_GATE": "Try again, or check the verification log.",
    "BASELINE_MISSING": "Check that the project has tests, then try again.",
    "BASELINE_FAILED": "Get the project's existing tests passing, then try again.",
    "EVIDENCE_MISSING": "Try again.",
    "PROVIDER_STOP": "Try again after the AIs recover.",
    "PROJECT_SELECTION_REQUIRED": "Choose a project first.",
}
_DEFAULT_RECOMMENDATION = "Ask HEAD again, or check the details."

_RETRY_TEMPLATES: Dict[str, str] = {
    "GIT_INTERNALS_IN_SCOPE": "Do not modify {file}. Leave Git internals out of scope and plan the original request again.",
    "CONTROL_PLANE_IN_SCOPE": "Do not modify {file}. Leave AI DEV DIRECTOR protected files out of scope and plan the original request again.",
    "CONTROL_PLANE_MODIFIED": "Do not modify {file}. Leave AI DEV DIRECTOR protected files out of scope and plan the original request again.",
    "PROTECTED_PATH_IN_SCOPE": "Do not modify {file}. Leave protected paths out of scope and plan the original request again.",
    "PROTECTED_PATH_INSIDE_ALLOWED": "Do not modify {file}. Leave protected paths out of scope and plan the original request again.",
    "CANONICAL_CONTAINMENT": "Plan the original request again so every path stays inside the work folder.",
    "ORDER_PATH_VIOLATION": "Plan the original request again using only paths inside the work folder.",
    "INVALID_PATH": "Plan the original request again with project-relative paths.",
    "DESTRUCTIVE_CHANGE": "Plan the original request again without deleting files.",
    "SCOPE_VIOLATION": "Plan the original request again and change only the allowed scope.",
    "AMBIGUOUS_SCOPE": "Plan the original request again with specific allowed paths.",
}


def reason_recommendation(code: str) -> str:
    return REASON_RECOMMENDATION.get(str(code or "").upper(), _DEFAULT_RECOMMENDATION)


def retry_prompt(code: str, file: str = "") -> str:
    """English draft for the 'Ask HEAD again' button. Never sent automatically; the user reviews it and presses Send."""
    code = str(code or "").upper()
    tmpl = _RETRY_TEMPLATES.get(code)
    if tmpl:
        return tmpl.format(file=(file or {"GIT_INTERNALS_IN_SCOPE": ".git", "CONTROL_PLANE_IN_SCOPE": "the AI DEV DIRECTOR settings",
                                           "CONTROL_PLANE_MODIFIED": "the AI DEV DIRECTOR settings"}.get(code, "that path")))
    title, _why = reason_ko(code)
    loc = f" ({file})" if file else ""
    return f"Resolve the {title}{loc} problem and plan the original request again."


HELP_TEXT: Dict[str, str] = {
    "DEGRADED": "Some AIs are unavailable, but work can continue.",
    "STOP": "Too few AIs are available, so automatic work cannot start.",
    "RECOVERING": "The AI program is present, but usage is not confirmed yet. One real call will verify it.",
    "worktree": "A separate work copy, so the original project stays protected.",
    "REVIEWER": "Reviews the Builder's code independently.",
    "HEAD": "Reads the request, writes the work plan (ORDER), and makes the final call.",
    "BUILDER": "Writes code only inside the allowed scope.",
}

_REASON_PATTERNS: List[Tuple[str, str]] = [
    (r"APPROVAL_REQUIRED:\s*([A-Z_]+)", None),
    (r"Dependency configuration modified", "DEPENDENCY_CONFIGURATION_MODIFIED"),
    (r"Control plane modified", "CONTROL_PLANE_MODIFIED"),
    (r"CANONICAL_CONTAINMENT|resolves outside worktree|escapes worktree", "CANONICAL_CONTAINMENT"),
    (r"ORDER_PATH_VIOLATION", "ORDER_PATH_VIOLATION"),
    (r"REGRESSION|decreased from", "REGRESSION"),
    (r"WORKTREE_EVIDENCE_MISSING", "WORKTREE_EVIDENCE_MISSING"),
    (r"BASELINE_MISSING", "BASELINE_MISSING"),
    (r"BASELINE_FAILED", "BASELINE_FAILED"),
    (r"EVIDENCE_MISSING", "EVIDENCE_MISSING"),
    (r"REVIEWER_EXCEPTION|Reviewer .*unparseable|review .*fail", "REVIEWER_FAIL_CLOSED"),
    (r"FINAL_GATE", "FINAL_GATE"),
    (r"Scope violation", "SCOPE_VIOLATION"),
    (r"PROVIDER_FAILURE|PROVIDER_STOP|SYSTEM STOP", "PROVIDER_STOP"),
    (r"PROJECT_SELECTION_REQUIRED", "PROJECT_SELECTION_REQUIRED"),
    (r"Main project changed", "BASE_COMMIT_MISMATCH"),
    (r"not clean", "WORKING_TREE_DIRTY"),
    (r"collides", "UNTRACKED_COLLISION"),
]


def t(key: str, default: Optional[str] = None) -> str:
    return UI_TEXT.get(key, default if default is not None else key)


def status_ko(raw: str) -> str:
    return STATUS_TEXT.get(str(raw or "").upper(), str(raw or ""))


def state_ko(raw: str) -> str:
    return STATE_TEXT.get(str(raw or "").upper(), str(raw or ""))


def result_ko(raw: str) -> str:
    return RESULT_TEXT.get(str(raw or "").upper(), str(raw or ""))


def role_ko(roles: str) -> str:
    """'HEAD, REVIEWER' -> 'HEAD · REVIEWER (directs the work · reviews code)'"""
    parts = [r.strip().upper() for r in str(roles or "").replace("·", ",").split(",") if r.strip()]
    if not parts:
        return ""
    return " · ".join(parts) + " (" + " · ".join(ROLE_TEXT.get(p, p) for p in parts) + ")"


def reason_code(text: str) -> str:
    """Best-effort technical code for a free-text halt reason."""
    s = str(text or "")
    for pat, code in _REASON_PATTERNS:
        m = re.search(pat, s)
        if m:
            return code or m.group(1)
    return "UNKNOWN"


def reason_ko(code: str) -> Tuple[str, str]:
    return REASON_TEXT.get(str(code or "").upper(), REASON_TEXT["UNKNOWN"])


def explain_reason(text: str) -> Dict[str, str]:
    code = reason_code(text)
    title, why = reason_ko(code)
    return {"code": code, "title": title, "why": why, "raw": str(text or "")}


def mode_sentence(mode: str, statuses: Dict[str, str]) -> str:
    """'Claude standby is recovering. Codex and Antigravity are available.'"""
    names = {d: PROVIDER_LABEL[d][2] for d in PROVIDER_LABEL}
    ok = [names[d] for d in ("OPENAI", "GOOGLE", "ANTHROPIC") if statuses.get(d) == "HEALTHY"]
    bad = []
    for d in ("OPENAI", "GOOGLE", "ANTHROPIC"):
        st = statuses.get(d)
        if st and st != "HEALTHY":
            who = names[d] + (" standby" if d == "ANTHROPIC" else "")
            bad.append(f"{who} is {status_ko(st).lower()}")
    if mode == "NORMAL":
        return "All 3 AIs are available."
    sentence = ". ".join(bad)
    if sentence:
        sentence += "."
    if ok:
        sentence += " " + " and ".join(ok) + (" is" if len(ok) == 1 else " are") + " available."
    return sentence.strip()


def stage_sentence(state: str, roles: Dict[str, str], elapsed: str = "") -> str:
    """'Antigravity is writing code · 42s'. roles: domain -> current_role string."""
    def who(role):
        for d, r in roles.items():
            if role in [x.strip().upper() for x in str(r or "").replace("·", ",").split(",")]:
                return PROVIDER_LABEL.get(d, (d, d, d))[2]
        return {"HEAD": "Codex", "REVIEWER": "Codex", "BUILDER": "Antigravity"}.get(role, "The AI")
    s = (state or "").upper()
    txt = {
        "PLANNING": f"{who('HEAD')} is reading the request",
        "ORDER_READY": "Preparing a work copy and running the baseline tests",
        "BUILDING": f"{who('BUILDER')} is writing code",
        "VERIFYING": "Running tests and safety checks",
        "REVIEWING": f"{who('REVIEWER')} is reviewing the changes",
        "DECIDING": f"{who('HEAD')} is making the final call",
        "PASS": "The task is done",
        "RECOVERED": "Recovered the failed task and verified the original project",
        "FAIL": "The task failed",
        "TIMEOUT": "The task stopped because it ran out of time",
        "HUMAN_REQUIRED": "Your confirmation is needed",
        "IDLE": "Waiting",
        "NONE": t("head_ready"),
    }.get(s, s)
    return txt + (f" · {elapsed}" if elapsed and s in ("PLANNING", "ORDER_READY", "BUILDING", "VERIFYING", "REVIEWING", "DECIDING") else "")


NEXT_STEP: Dict[str, str] = {
    "PLANNING": "Prepare the work copy and baseline tests", "ORDER_READY": "Write the code", "BUILDING": "Tests and safety checks",
    "VERIFYING": "Code review", "REVIEWING": "Final decision", "DECIDING": "Final safety check", "RECOVERED": "Recovery result checked",
}


_EVENT_RULES: List[Tuple[str, str, str]] = [
    (r"finished: PASS", "✓ The task is done.", "ev-ok"),
    (r"finished: HUMAN_REQUIRED", "⚠ Stopped because your confirmation is needed.", "ev-bad"),
    (r"finished: (FAIL|TIMEOUT)", "✗ The task failed.", "ev-bad"),
    (r"Starting background run", "● Started the task.", "ev-info"),
    (r"HUMAN_APPROVED\(ENTRY\)|HUMAN_APPROVED:", "✓ You approved the scope.", "ev-ok"),
    (r"HUMAN_APPROVED\(POST_BUILD\)", "✓ You approved the changes. Verification continues.", "ev-ok"),
    (r"HUMAN_REJECTED", "✗ You rejected it. The task will not run.", "ev-bad"),
    (r"RECOVERY TRIAL", "● Verifying a recovering AI with one real call.", "ev-info"),
    (r"SYSTEM STOP", "✗ Cannot run because too few AIs are available.", "ev-bad"),
    (r"PROJECT_SELECTED", "✓ Project selected.", "ev-ok"),
    (r"PROJECT_SELECTION_REJECTED|PROJECT_SELECTION_REQUIRED", "✗ That project selection is not valid.", "ev-bad"),
    (r"NEW_CHAT", "✓ Started a new chat.", "ev-ok"),
    (r"RESULT_APPLIED", "✓ The result was applied to the project.", "ev-ok"),
    (r"RESULT_ROLLED_BACK", "✗ Apply failed, so the project was restored.", "ev-bad"),
    (r"RESULT_BLOCKED", "⚠ The result cannot be applied.", "ev-bad"),
    (r"RESULT_DISCARDED", "○ The result was discarded.", "ev-info"),
    (r"HUMAN_REQUIRED|APPROVAL_REQUIRED", "⚠ Your confirmation is needed.", "ev-bad"),
    (r"BUSY", "⚠ Another task is already running.", "ev-bad"),
    (r"HEAD Error|Error|failed", "✗ An error occurred.", "ev-bad"),
]


def event_ko(raw: str) -> Tuple[str, str]:
    for pat, text, kind in _EVENT_RULES:
        if re.search(pat, str(raw or "")):
            return text, kind
    return "· System notice", "ev-info"


def i18n_bundle() -> Dict[str, object]:
    """Everything the page script needs to render English labels client-side."""
    return {
        "lang": LANG, "ui": UI_TEXT, "status": STATUS_TEXT, "state": STATE_TEXT, "result": RESULT_TEXT, "role": ROLE_TEXT,
        "stage": STAGE_TEXT, "help": HELP_TEXT, "next": NEXT_STEP,
        "provider": {d: {"name": v[0], "vendor": v[1], "subject": v[2]} for d, v in PROVIDER_LABEL.items()},
        "events": [[p, txt, k] for p, txt, k in _EVENT_RULES],
        "reasons": {k: {"title": v[0], "why": v[1], "recommendation": REASON_RECOMMENDATION.get(k, _DEFAULT_RECOMMENDATION)} for k, v in REASON_TEXT.items()},
    }
