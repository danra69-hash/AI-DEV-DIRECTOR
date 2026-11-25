"""Bounded real role probes; no mock verdicts and no global provider state mutation."""
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from core.env_utils import resolve_cli, probe_version
from agents.codex_head import CodexHead
from agents.claude_head import ClaudeHead

PROJECT = Path(os.environ.get('DIRECTOR_SMOKE_PROJECT', ROOT.parent / 'director_smoke'))
REPORT = ROOT / 'data/cli_diagnostics.json'


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    report = {'checked_at': datetime.now(timezone.utc).isoformat(), 'providers': {}}
    for name, domain in [('codex', 'OPENAI'), ('claude', 'ANTHROPIC'), ('agy', 'GOOGLE')]:
        exe = resolve_cli(name)
        report['providers'][domain] = {'executable': exe, 'version': probe_version(exe, 10),
            'state': 'INSTALLED_ONLY' if exe else 'MISSING', 'summary': 'Version check only. Waiting for a real role check.'}
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    goal = ('Design only an offline Python function net_profit(revenue, cost) in src/profit.py. '
            'Return None when either argument is None; otherwise return revenue minus cost. '
            'Reject booleans, negative or non-finite numbers, and nonnumeric values with ValueError. '
            'Add tests/test_profit.py including zero and unknown. Preserve all existing tests. '
            'Only these two paths may change. No external dependencies or network.')
    for domain, cls in [('OPENAI', CodexHead), ('ANTHROPIC', ClaudeHead)]:
        try:
            agent = cls(timeout=180, no_progress_timeout=120)
            order = agent.create_order(goal, {'project_path': str(PROJECT), 'existing_files': ['README.md', 'tests/test_baseline.py']})
            report['providers'][domain].update(state='HEAD_VERIFIED', summary='A real CLI produced a work-order JSON and it passed schema checks. Build and review roles are judged by a separate end-to-end run.',
                evidence={'order': order.model_dump(), 'execution': agent.last_execution_info})
        except Exception as exc:
            report['providers'][domain].update(state='FAILED', summary=str(exc)[-800:])
        REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        print(domain, report['providers'][domain]['state'], flush=True)


if __name__ == '__main__':
    main()
