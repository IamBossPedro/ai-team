"""Context Summarizer — compresses large context histories to prevent token overflow."""

from __future__ import annotations

import json
from dataclasses import dataclass

from tcs_bpi_ai_team.types import ContextEntry, SharedContext


@dataclass
class SummarizerConfig:
    """Configuration for context summarization."""

    max_full_entries: int = 3
    """Maximum number of full entries to keep (most recent)."""

    max_summary_length: int = 200
    """Maximum summary length for compressed entries."""

    trigger_threshold: int = 5
    """Maximum total context entries before summarization triggers."""


def _compress_entry(entry: ContextEntry, max_length: int) -> ContextEntry:
    """Summarize a context entry by truncating its summary."""
    summary = entry.summary
    if len(summary) > max_length:
        summary = summary[:max_length] + "..."

    return ContextEntry(
        role=entry.role,
        action=f"[Summarized] {entry.action}",
        summary=summary,
        timestamp=entry.timestamp,
        files_changed=entry.files_changed,
    )


def summarize_context(
    context: SharedContext,
    config: SummarizerConfig | None = None,
) -> SharedContext:
    """Summarize the shared context history to reduce token usage.

    Keeps the most recent entries in full and compresses older ones.
    """
    cfg = config or SummarizerConfig()

    if len(context.history) <= cfg.trigger_threshold:
        return context

    full_entries = context.history[-cfg.max_full_entries:]
    older_entries = context.history[: len(context.history) - cfg.max_full_entries]

    compressed = [_compress_entry(e, cfg.max_summary_length) for e in older_entries]

    return SharedContext(
        task_id=context.task_id,
        history=[*compressed, *full_entries],
        files=dict(context.files),
        metadata=dict(context.metadata),
    )


def estimate_context_tokens(context: SharedContext) -> int:
    """Estimate the token count for a context.

    Uses a rough heuristic of ~4 characters per token.
    """
    chars = 0
    for entry in context.history:
        chars += len(entry.role)
        chars += len(entry.action)
        chars += len(entry.summary)
        chars += len(entry.timestamp)
        if entry.files_changed:
            chars += len(",".join(entry.files_changed))

    for path, content in context.files.items():
        chars += len(path) + len(content)

    chars += len(json.dumps(context.metadata))
    return (chars + 3) // 4  # ceil division
