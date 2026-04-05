"""Parallel Executor — runs multiple pipeline stages concurrently."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import TYPE_CHECKING

from tcs_bpi_ai_team.types import (
    AgentRole,
    PipelineStage,
    SharedContext,
    Task,
    TaskResult,
)

if TYPE_CHECKING:
    from tcs_bpi_ai_team.agent import Agent


@dataclass
class ParallelGroup:
    """A group of pipeline stages that can run concurrently."""

    stages: list[PipelineStage] = field(default_factory=list)


def identify_parallel_groups(
    stages: list[PipelineStage],
) -> list[PipelineStage | ParallelGroup]:
    """Identify groups of consecutive stages that can run in parallel.

    Stages with a `parallel` attribute set to True that are adjacent form a group.
    """
    result: list[PipelineStage | ParallelGroup] = []
    current_group: list[PipelineStage] = []

    for stage in stages:
        if getattr(stage, "parallel", False):
            current_group.append(stage)
        else:
            if current_group:
                result.append(ParallelGroup(stages=current_group))
                current_group = []
            result.append(stage)

    if current_group:
        result.append(ParallelGroup(stages=current_group))

    return result


def is_parallel_group(item: PipelineStage | ParallelGroup) -> bool:
    """Check if an item is a parallel group."""
    return isinstance(item, ParallelGroup)


async def execute_parallel_group(
    group: ParallelGroup,
    agents: dict[AgentRole, Agent],
    task: Task,
    context: SharedContext,
) -> list[TaskResult]:
    """Execute a group of stages in parallel using asyncio.gather."""

    async def run_stage(stage: PipelineStage) -> TaskResult | None:
        agent = agents.get(stage.role)
        if agent is None:
            if stage.required:
                msg = f'Required agent role "{stage.role}" is not registered.'
                raise ValueError(msg)
            return None
        return await agent.execute(task, context)

    tasks = [run_stage(stage) for stage in group.stages]
    results_raw = await asyncio.gather(*tasks, return_exceptions=True)

    results: list[TaskResult] = []
    errors: list[Exception] = []

    for i, outcome in enumerate(results_raw):
        if isinstance(outcome, BaseException):
            if group.stages[i].required:
                err = outcome if isinstance(outcome, Exception) else Exception(str(outcome))
                errors.append(err)
        elif isinstance(outcome, TaskResult):
            results.append(outcome)

    if errors:
        msg = f"{len(errors)} required parallel stage(s) failed"
        raise ExceptionGroup(msg, errors)

    return results
