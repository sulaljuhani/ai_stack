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
    "food_agent": "agents.food_agent.food_agent_node",
    "task_agent": "agents.task_agent.task_agent_node",
    "event_agent": "agents.event_agent.event_agent_node",
    "reminder_agent": "agents.reminder_agent.reminder_agent_node",
    "knowledge_agent": "agents.knowledge_agent.knowledge_agent_node",
    "note_agent": "agents.note_agent.note_agent_node",
    "recorder_agent": "agents.recorder_agent.recorder_agent_node",
    "analyst_agent": "agents.analyst_agent.analyst_agent_node",
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
