"""
Central registry for agent metadata and tool selection.

Loads agent definitions from config/agents.yaml so agents, routing, and the
workflow can be constructed dynamically without hardcoding names or tool lists.
"""

from dataclasses import dataclass
from functools import lru_cache
from importlib import import_module
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union

import yaml

from utils.logging import get_logger
from tools.tool_registry import build_agent_tools

logger = get_logger(__name__)


@dataclass(frozen=True)
class AgentConfig:
    name: str
    context_key: str
    prompt_file: str
    tools: List[str]
    keywords: List[Tuple[str, float]]
    description: str = ""
    node: Optional[str] = None  # Optional dotted-path override for agent node
    enabled: bool = True
    exclude_tools: List[str] = None
    partials: List[str] = None
    team: Optional[str] = None
    type: Optional[str] = None


CONFIG_PATH = Path(__file__).resolve().parent.parent / "config" / "agents.yaml"


def _parse_keywords(raw_keywords: List[Union[str, dict]]) -> List[Tuple[str, float]]:
    parsed: List[Tuple[str, float]] = []
    for kw in raw_keywords or []:
        if isinstance(kw, str):
            parsed.append((kw, 1.0))
        elif isinstance(kw, dict):
            term = kw.get("term") or kw.get("keyword")
            weight = float(kw.get("weight", 1.0))
            if term:
                parsed.append((term, weight))
    return parsed


@lru_cache()
def _load_agent_configs() -> Dict[str, AgentConfig]:
    if not CONFIG_PATH.exists():
        raise FileNotFoundError(f"Missing agent config: {CONFIG_PATH}")

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        raw = yaml.safe_load(f) or {}

    configs: Dict[str, AgentConfig] = {}
    for entry in raw.get("agents", []):
        cfg = AgentConfig(
            name=entry["name"],
            context_key=entry.get("context_key", entry["name"]),
            prompt_file=entry.get("prompt_file", f"prompts/{entry['name']}.txt"),
            tools=entry.get("tools", []),
            keywords=_parse_keywords(entry.get("keywords", [])),
            description=entry.get("description", ""),
            node=entry.get("node"),
            enabled=entry.get("enabled", True),
            exclude_tools=entry.get("exclude_tools", []) or [],
            partials=entry.get("partials", []) or [],
            team=entry.get("team"),
            type=entry.get("type"),
        )
        configs[cfg.name] = cfg

    logger.info("Loaded agent configs: %s", list(configs.keys()))
    return configs


def get_agent_config(agent_name: str) -> AgentConfig:
    configs = _load_agent_configs()
    if agent_name not in configs:
        raise KeyError(f"Agent not defined in config: {agent_name}")
    return configs[agent_name]


def list_agent_names() -> List[str]:
    return [name for name, cfg in _load_agent_configs().items() if cfg.enabled]


def get_keyword_map() -> Dict[str, List[str]]:
    return {name: [kw for kw, _ in cfg.keywords] for name, cfg in _load_agent_configs().items() if cfg.enabled}


def get_weighted_keywords() -> Dict[str, List[Tuple[str, float]]]:
    return {name: cfg.keywords for name, cfg in _load_agent_configs().items() if cfg.enabled}


def get_agent_tools(agent_name: str):
    cfg = get_agent_config(agent_name)
    return build_agent_tools(agent_name, cfg.tools, excluded=cfg.exclude_tools)


# ---------------------------------------------------------------------------
# Agent node resolution
# ---------------------------------------------------------------------------

# Built-in node lookup (keeps backwards compatibility while still allowing
# dotted-path overrides from the YAML file for future plug-ins).
BUILTIN_NODES: Dict[str, str] = {
    "task_agent": "agents.task_agent.task_agent_node",
    "task_retriever": "agents.task_retriever.task_retriever_node",
    "task_creator": "agents.task_creator.task_creator_node",
    "task_editor": "agents.task_editor.task_editor_node",
    "task_deleter": "agents.task_deleter.task_deleter_node",
    "task_validator": "agents.task_validator.task_validator_node",
    "event_agent": "agents.event_agent.event_agent_node",
    "event_retriever": "agents.event_retriever.event_retriever_node",
    "event_creator": "agents.event_creator.event_creator_node",
    "event_editor": "agents.event_editor.event_editor_node",
    "event_scheduler": "agents.event_scheduler.event_scheduler_node",
    "event_deleter": "agents.event_deleter.event_deleter_node",
    "event_validator": "agents.event_validator.event_validator_node",
    "reminder_agent": "agents.reminder_agent.reminder_agent_node",
    "reminder_retriever": "agents.reminder_retriever.reminder_retriever_node",
    "reminder_creator": "agents.reminder_creator.reminder_creator_node",
    "reminder_editor": "agents.reminder_editor.reminder_editor_node",
    "reminder_completer": "agents.reminder_completer.reminder_completer_node",
    "reminder_deleter": "agents.reminder_deleter.reminder_deleter_node",
    "reminder_validator": "agents.reminder_validator.reminder_validator_node",
    "knowledge_agent": "agents.knowledge_agent.knowledge_agent_node",
    "knowledge_retriever": "agents.knowledge_retriever.knowledge_retriever_node",
    "knowledge_searcher": "agents.knowledge_searcher.knowledge_searcher_node",
    "knowledge_validator": "agents.knowledge_validator.knowledge_validator_node",
    "note_agent": "agents.note_agent.note_agent_node",
    "note_creator": "agents.note_creator.note_creator_node",
    "note_appender": "agents.note_appender.note_appender_node",
    "recorder_agent": "agents.recorder_agent.recorder_agent_node",
    "analyst_agent": "agents.analyst_agent.analyst_agent_node",
    "task_supervisor": "agents.task_supervisor.task_supervisor_node",
    "event_supervisor": "agents.event_supervisor.event_supervisor_node",
    "reminder_supervisor": "agents.reminder_supervisor.reminder_supervisor_node",
    "knowledge_supervisor": "agents.knowledge_supervisor.knowledge_supervisor_node",
    "logging_supervisor": "agents.logging_supervisor.logging_supervisor_node",
    "table_discovery": "agents.table_discovery.table_discovery_node",
    "schema_inspector": "agents.schema_inspector.schema_inspector_node",
    "db_operation": "agents.db_operation.db_operation_node",
    "logging_validator": "agents.logging_validator.logging_validator_node",
    "analytics_supervisor": "agents.analytics_supervisor.analytics_supervisor_node",
    "task_analyst": "agents.task_analyst.task_analyst_node",
    "event_analyst": "agents.event_analyst.event_analyst_node",
    "life_analyst": "agents.life_analyst.life_analyst_node",
    "reminder_analyst": "agents.reminder_analyst.reminder_analyst_node",
    "integration_supervisor": "agents.integration_supervisor.integration_supervisor_node",
    "todoist_agent": "agents.todoist_agent.todoist_agent_node",
    "google_calendar_agent": "agents.google_calendar_agent.google_calendar_agent_node",
    "integration_health_agent": "agents.integration_health_agent.integration_health_agent_node",
    "sebastian_supervisor": "agents.sebastian_supervisor.sebastian_supervisor_node",
}


@lru_cache()
def get_agent_node(agent_name: str):
    cfg = get_agent_config(agent_name)
    dotted_path = cfg.node or BUILTIN_NODES.get(agent_name)
    if not dotted_path:
        raise KeyError(f"No agent node registered for {agent_name}")

    module_path, attr = dotted_path.rsplit(".", 1)
    module = import_module(module_path)
    node = getattr(module, attr, None)
    if node is None:
        raise ImportError(f"Could not import {dotted_path}")
    return node


def get_agent_prompt_file(agent_name: str) -> str:
    return get_agent_config(agent_name).prompt_file


def get_agent_descriptions() -> Dict[str, str]:
    return {name: cfg.description for name, cfg in _load_agent_configs().items()}
