"""Structured Logger — pipeline execution logging with configurable levels."""

from __future__ import annotations

import sys
from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime
from enum import IntEnum


class LogLevel(IntEnum):
    """Log levels."""

    DEBUG = 0
    INFO = 1
    WARN = 2
    ERROR = 3
    SILENT = 4


_LEVEL_LABELS = {
    LogLevel.DEBUG: "DEBUG",
    LogLevel.INFO: "INFO",
    LogLevel.WARN: "WARN",
    LogLevel.ERROR: "ERROR",
    LogLevel.SILENT: "SILENT",
}


@dataclass
class LogEntry:
    """A single log entry."""

    level: LogLevel
    timestamp: str
    event: str
    data: dict[str, object] | None = None


@dataclass
class LoggerConfig:
    """Logger configuration."""

    level: LogLevel = LogLevel.INFO
    handler: Callable[[LogEntry], None] | None = None
    timestamps: bool = True


class Logger:
    """Structured logger for pipeline execution."""

    def __init__(self, config: LoggerConfig | None = None) -> None:
        self._config = config or LoggerConfig()
        self._entries: list[LogEntry] = []

    def debug(self, event: str, data: dict[str, object] | None = None) -> None:
        self._log(LogLevel.DEBUG, event, data)

    def info(self, event: str, data: dict[str, object] | None = None) -> None:
        self._log(LogLevel.INFO, event, data)

    def warn(self, event: str, data: dict[str, object] | None = None) -> None:
        self._log(LogLevel.WARN, event, data)

    def error(self, event: str, data: dict[str, object] | None = None) -> None:
        self._log(LogLevel.ERROR, event, data)

    def get_entries(self) -> list[LogEntry]:
        """Get all log entries."""
        return list(self._entries)

    def clear(self) -> None:
        """Clear all log entries."""
        self._entries.clear()

    # Pipeline-specific convenience methods

    def pipeline_start(self, pipeline_name: str, task_id: str) -> None:
        self.info("pipeline.start", {"pipeline": pipeline_name, "task_id": task_id})

    def pipeline_end(
        self, pipeline_name: str, task_id: str, stages_completed: int
    ) -> None:
        self.info(
            "pipeline.end",
            {"pipeline": pipeline_name, "task_id": task_id, "stages_completed": stages_completed},
        )

    def stage_start(self, role: str, action: str, task_id: str) -> None:
        self.debug("stage.start", {"role": role, "action": action, "task_id": task_id})

    def stage_end(
        self, role: str, action: str, task_id: str, duration_ms: float
    ) -> None:
        self.info(
            "stage.end",
            {"role": role, "action": action, "task_id": task_id, "duration_ms": duration_ms},
        )

    def handoff(self, from_role: str, to_role: str, reason: str) -> None:
        self.info("handoff", {"from_role": from_role, "to_role": to_role, "reason": reason})

    def stage_error(self, role: str, action: str, error: str) -> None:
        self.error("stage.error", {"role": role, "action": action, "error": error})

    def _log(
        self, level: LogLevel, event: str, data: dict[str, object] | None = None
    ) -> None:
        if level < self._config.level:
            return

        entry = LogEntry(
            level=level,
            timestamp=(
                datetime.now(UTC).isoformat() if self._config.timestamps else ""
            ),
            event=event,
            data=data,
        )

        self._entries.append(entry)

        if self._config.handler:
            self._config.handler(entry)
        else:
            self._default_handler(entry)

    def _default_handler(self, entry: LogEntry) -> None:
        import json

        label = _LEVEL_LABELS.get(entry.level, "UNKNOWN")
        ts = f"[{entry.timestamp}] " if entry.timestamp else ""
        data_str = f" {json.dumps(entry.data)}" if entry.data else ""
        msg = f"{ts}[{label}] {entry.event}{data_str}"

        if entry.level >= LogLevel.ERROR:
            print(msg, file=sys.stderr)
        else:
            print(msg)
