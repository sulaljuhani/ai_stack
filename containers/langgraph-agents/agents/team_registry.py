"""
Team registry for hierarchical agent structure.

Phase 2: load team configuration (names, supervisors, keywords) and
map agents to teams from config/agents.yaml.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import yaml

# Module-level cache to avoid re-reading config repeatedly
_TEAMS: Dict[str, "TeamConfig"] = {}


@dataclass
class TeamConfig:
    name: str
    display_name: str
    supervisor: str
    description: str
    keywords: List[Tuple[str, float]]
    agent_names: List[str]


def _config_path() -> Path:
    """Return absolute path to agents.yaml."""
    return Path(__file__).resolve().parent.parent / "config" / "agents.yaml"


def load_teams(force_reload: bool = False) -> None:
    """
    Load team definitions and agent mappings from agents.yaml.

    Args:
        force_reload: Clear cache and reload from disk.
    """
    if _TEAMS and not force_reload:
        return

    _TEAMS.clear()
    with _config_path().open("r", encoding="utf-8") as f:
        config = yaml.safe_load(f) or {}

    teams_config = config.get("teams", [])
    agents_config = config.get("agents", [])

    for team_def in teams_config:
        keywords: List[Tuple[str, float]] = []
        for kw in team_def.get("keywords", []):
            if isinstance(kw, dict):
                term = kw.get("term")
                if term:
                    keywords.append((term, float(kw.get("weight", 1.0))))
            else:
                keywords.append((str(kw), 1.0))

        agent_names = [
            agent.get("name")
            for agent in agents_config
            if agent.get("team") == team_def.get("name")
            and agent.get("type") != "supervisor"
            and agent.get("enabled", True)
        ]

        team_config = TeamConfig(
            name=team_def.get("name"),
            display_name=team_def.get("display_name", team_def.get("name", "")),
            supervisor=team_def.get("supervisor", ""),
            description=team_def.get("description", ""),
            keywords=keywords,
            agent_names=[a for a in agent_names if a],
        )
        _TEAMS[team_config.name] = team_config


def get_team_config(team_name: str) -> Optional[TeamConfig]:
    """Get configuration for a specific team."""
    if not _TEAMS:
        load_teams()
    return _TEAMS.get(team_name)


def list_teams() -> List[str]:
    """List all configured team names."""
    if not _TEAMS:
        load_teams()
    return list(_TEAMS.keys())


def get_team_keywords() -> Dict[str, List[Tuple[str, float]]]:
    """Return keywords per team for routing."""
    if not _TEAMS:
        load_teams()
    return {name: team.keywords for name, team in _TEAMS.items()}
