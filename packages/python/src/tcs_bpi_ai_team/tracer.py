"""Execution Tracer — structured tracing for pipeline execution."""

from __future__ import annotations

import json
import time
import uuid
from dataclasses import dataclass, field

from tcs_bpi_ai_team.types import AgentRole


@dataclass
class Span:
    """A single execution span within a trace."""

    id: str
    trace_id: str
    name: str
    start_time: float
    parent_id: str | None = None
    role: AgentRole | None = None
    action: str | None = None
    end_time: float | None = None
    duration_ms: float | None = None
    status: str = "running"  # "running" | "completed" | "failed"
    metadata: dict[str, object] = field(default_factory=dict)


@dataclass
class Trace:
    """A full execution trace for a pipeline run."""

    id: str
    task_id: str
    pipeline_name: str
    start_time: float
    end_time: float | None = None
    duration_ms: float | None = None
    spans: list[Span] = field(default_factory=list)
    metadata: dict[str, object] = field(default_factory=dict)


class Tracer:
    """Execution tracer for pipeline operations."""

    def __init__(self) -> None:
        self._traces: dict[str, Trace] = {}

    def start_trace(self, task_id: str, pipeline_name: str) -> Trace:
        """Start a new trace for a pipeline execution."""
        trace = Trace(
            id=str(uuid.uuid4()),
            task_id=task_id,
            pipeline_name=pipeline_name,
            start_time=time.time() * 1000,
        )
        self._traces[trace.id] = trace
        return trace

    def end_trace(self, trace_id: str) -> Trace | None:
        """End a trace."""
        trace = self._traces.get(trace_id)
        if trace:
            trace.end_time = time.time() * 1000
            trace.duration_ms = trace.end_time - trace.start_time
        return trace

    def start_span(
        self,
        trace_id: str,
        name: str,
        *,
        role: AgentRole | None = None,
        action: str | None = None,
        parent_id: str | None = None,
    ) -> Span:
        """Start a new span within a trace."""
        span = Span(
            id=str(uuid.uuid4()),
            trace_id=trace_id,
            name=name,
            start_time=time.time() * 1000,
            role=role,
            action=action,
            parent_id=parent_id,
        )
        trace = self._traces.get(trace_id)
        if trace:
            trace.spans.append(span)
        return span

    def end_span(self, span: Span, status: str = "completed") -> None:
        """End a span."""
        span.end_time = time.time() * 1000
        span.duration_ms = span.end_time - span.start_time
        span.status = status

    def get_trace(self, trace_id: str) -> Trace | None:
        """Get a trace by ID."""
        return self._traces.get(trace_id)

    def get_all_traces(self) -> list[Trace]:
        """Get all traces."""
        return list(self._traces.values())

    def export_trace_json(self, trace_id: str) -> str | None:
        """Export a trace as JSON."""
        trace = self._traces.get(trace_id)
        if trace is None:
            return None

        def _serialize(obj: object) -> object:
            if isinstance(obj, Span | Trace):
                return {k: v for k, v in obj.__dict__.items()}
            return str(obj)

        return json.dumps(trace.__dict__, default=_serialize, indent=2)

    def print_trace_summary(self, trace_id: str) -> None:
        """Print a human-readable trace summary."""
        trace = self._traces.get(trace_id)
        if trace is None:
            print(f"Trace not found: {trace_id}")
            return

        duration = f"{trace.duration_ms:.0f}ms" if trace.duration_ms else "running"
        print(f"\n📊 Trace: {trace.pipeline_name} ({trace.task_id})")
        print(f"   ID: {trace.id}")
        print(f"   Duration: {duration}")
        print(f"   Spans: {len(trace.spans)}\n")

        for span in trace.spans:
            icon = {"completed": "✅", "failed": "❌"}.get(span.status, "⏳")
            dur = f"{span.duration_ms:.0f}ms" if span.duration_ms else "..."
            role_str = f" [{span.role}]" if span.role else ""
            print(f"   {icon} {span.name}{role_str} — {dur}")

        print()

    def clear(self) -> None:
        """Clear all traces."""
        self._traces.clear()
