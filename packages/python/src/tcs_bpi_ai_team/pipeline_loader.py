"""YAML Pipeline Loader — loads pipeline definitions from YAML files."""

from __future__ import annotations

from pathlib import Path

from tcs_bpi_ai_team.types import AgentRole, Pipeline, PipelineStage, TaskType


def _validate_role(role: str) -> AgentRole:
    """Validate that a string is a valid AgentRole."""
    valid = {r.value: r for r in AgentRole}
    if role not in valid:
        msg = f'Invalid agent role: "{role}". Valid: {", ".join(valid)}'
        raise ValueError(msg)
    return valid[role]


def _validate_task_type(task_type: str) -> TaskType:
    """Validate that a string is a valid TaskType."""
    valid = {t.value: t for t in TaskType}
    if task_type not in valid:
        msg = f'Invalid task type: "{task_type}". Valid: {", ".join(valid)}'
        raise ValueError(msg)
    return valid[task_type]


def _parse_value(value: str) -> str | int | float | bool:
    """Parse a YAML scalar value."""
    trimmed = value.strip()
    if trimmed == "true":
        return True
    if trimmed == "false":
        return False
    if trimmed.isdigit():
        return int(trimmed)
    try:
        return float(trimmed)
    except ValueError:
        pass
    if (trimmed.startswith('"') and trimmed.endswith('"')) or (
        trimmed.startswith("'") and trimmed.endswith("'")
    ):
        return trimmed[1:-1]
    return trimmed


def _parse_simple_yaml(content: str) -> dict[str, object]:
    """Minimal YAML parser for pipeline definitions.

    Only supports the pipeline schema — not a general-purpose YAML parser.
    """
    lines = content.split("\n")
    result: dict[str, object] = {}
    current_array: list[dict[str, object]] | None = None
    current_array_key = ""
    current_item: dict[str, object] | None = None

    for raw_line in lines:
        line = raw_line.rstrip()
        stripped = line.strip()

        if not stripped or stripped.startswith("#"):
            continue

        # Array item start: "  - key: value"
        import re

        array_item_match = re.match(r"^(\s*)- (\w+):\s*(.+)$", line)
        if array_item_match and current_array is not None:
            current_item = {array_item_match.group(2): _parse_value(array_item_match.group(3))}
            current_array.append(current_item)
            continue

        # Array item continuation: "    key: value"
        array_cont_match = re.match(r"^\s{4,}(\w+):\s*(.+)$", line)
        if array_cont_match and current_item is not None:
            current_item[array_cont_match.group(1)] = _parse_value(array_cont_match.group(2))
            continue

        # Top-level key with value: "key: value"
        kv_match = re.match(r"^(\w[\w_]*):\s*(.+)$", line)
        if kv_match:
            current_array = None
            current_item = None
            result[kv_match.group(1)] = _parse_value(kv_match.group(2))
            continue

        # Top-level key without value (start of array): "key:"
        key_only_match = re.match(r"^(\w[\w_]*):\s*$", line)
        if key_only_match:
            current_array = []
            current_array_key = key_only_match.group(1)
            current_item = None
            result[current_array_key] = current_array
            continue

    return result


def parse_pipeline_yaml(content: str) -> Pipeline:
    """Parse a YAML pipeline definition string into a Pipeline object."""
    raw = _parse_simple_yaml(content)

    if "name" not in raw or "task_type" not in raw or "stages" not in raw:
        msg = "Pipeline YAML must have 'name', 'task_type', and 'stages' fields."
        raise ValueError(msg)

    task_type = _validate_task_type(str(raw["task_type"]))
    raw_stages = raw["stages"]
    if not isinstance(raw_stages, list):
        msg = "'stages' must be a list."
        raise ValueError(msg)

    stages: list[PipelineStage] = []
    for i, s in enumerate(raw_stages):
        if not isinstance(s, dict) or "role" not in s or "action" not in s:
            msg = f"Stage {i} must have 'role' and 'action' fields."
            raise ValueError(msg)
        stages.append(
            PipelineStage(
                role=_validate_role(str(s["role"])),
                action=str(s["action"]),
                required=s.get("required", True) is not False,
            )
        )

    return Pipeline(
        name=str(raw["name"]),
        task_type=task_type,
        stages=stages,
    )


def load_pipelines_from_directory(directory: str | Path) -> list[Pipeline]:
    """Load all pipeline YAML files from a directory."""
    dir_path = Path(directory)
    if not dir_path.exists():
        return []

    pipelines: list[Pipeline] = []
    for file in sorted(dir_path.iterdir()):
        if file.suffix in (".yml", ".yaml"):
            content = file.read_text(encoding="utf-8")
            try:
                pipelines.append(parse_pipeline_yaml(content))
            except ValueError as err:
                msg = f"Error loading pipeline from {file.name}: {err}"
                raise ValueError(msg) from err
    return pipelines
