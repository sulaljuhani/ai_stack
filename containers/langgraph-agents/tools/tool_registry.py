"""
Central tool registry with lightweight metadata and wrapping.

Agents request toolkits by tag or name instead of importing long lists.
"""

from dataclasses import dataclass, field
from typing import Any, Callable, Dict, Iterable, List, Set
import time

from langchain_core.tools import BaseTool, tool as lc_tool

from utils.logging import get_logger
from utils.metrics import inc_counter, observe_duration
from utils.event_bus import publish_event
from tools.models import wrap_response

# Import tool callables directly to avoid circular imports through tools.__init__
from . import database
from . import vector
from . import hybrid
from . import documents
from . import memory
from . import task_dependencies
from . import task_checklists
from . import bulk_operations
from . import advanced_search
from . import event_bulk_operations
from . import event_recurring
from . import event_advanced_search
from . import event_scheduling
from . import reminders
from . import reminder_bulk_operations
from . import quick_wins
from . import analytics
from . import integrations
from . import note_files
from . import life_logging
from . import reporting
from . import todoist_mirror
from . import google_calendar

logger = get_logger(__name__)


@dataclass(frozen=True)
class ToolMeta:
    name: str
    func: Any
    tags: List[str] = field(default_factory=list)
    description: str | None = None


TOOL_REGISTRY: Dict[str, ToolMeta] = {}


def register_tool(name: str, func: Any, tags: Iterable[str], description: str | None = None) -> None:
    TOOL_REGISTRY[name] = ToolMeta(name=name, func=func, tags=list(tags), description=description)


def _base_tool_name(tool: Any, fallback: str) -> str:
    if hasattr(tool, "name"):
        return getattr(tool, "name")
    if hasattr(tool, "__name__"):
        return tool.__name__
    return fallback


class ToolRunner:
    """
    Wraps tools with basic metrics + event emission while preserving
    LangChain BaseTool signatures.
    """

    def __init__(self, meta: ToolMeta, agent_name: str | None = None):
        self.meta = meta
        self.agent_name = agent_name

    def _wrap_structured_tool(self, base_tool: BaseTool) -> BaseTool:
        """
        Re-wrap a BaseTool so we can emit metrics/events without losing schemas.
        """
        name = _base_tool_name(base_tool, self.meta.name)
        description = self.meta.description or getattr(base_tool, "description", "") or ""
        args_schema = getattr(base_tool, "args_schema", None)

        if hasattr(base_tool, "ainvoke"):

            @lc_tool
            async def _wrapped(**kwargs):
                """Wrapped tool with metrics and event tracking."""
                start = time.time()
                publish_event(
                    "tool.called",
                    {"tool": name, "agent": self.agent_name, "tags": self.meta.tags},
                )
                try:
                    result = await base_tool.ainvoke(kwargs)
                    result = wrap_response(result)
                    publish_event(
                        "tool.succeeded",
                        {"tool": name, "agent": self.agent_name},
                    )
                    return result
                except Exception as exc:
                    publish_event(
                        "tool.failed",
                        {
                            "tool": name,
                            "agent": self.agent_name,
                            "error": str(exc),
                        },
                    )
                    raise
                finally:
                    observe_duration(f"tool.duration.{name}", time.time() - start)
                    inc_counter(f"tool.calls.{name}")

        else:

            @lc_tool
            def _wrapped(**kwargs):
                """Wrapped tool with metrics and event tracking."""
                start = time.time()
                publish_event(
                    "tool.called",
                    {"tool": name, "agent": self.agent_name, "tags": self.meta.tags},
                )
                try:
                    result = base_tool.invoke(kwargs) if hasattr(base_tool, "invoke") else base_tool(**kwargs)
                    result = wrap_response(result)
                    publish_event(
                        "tool.succeeded",
                        {"tool": name, "agent": self.agent_name},
                    )
                    return result
                except Exception as exc:
                    publish_event(
                        "tool.failed",
                        {
                            "tool": name,
                            "agent": self.agent_name,
                            "error": str(exc),
                        },
                    )
                    raise
                finally:
                    observe_duration(f"tool.duration.{name}", time.time() - start)
                    inc_counter(f"tool.calls.{name}")

        # Set tool metadata attributes
        _wrapped.name = name
        _wrapped.description = description
        if args_schema:
            _wrapped.args_schema = args_schema

        return _wrapped

    def wrap(self) -> Any:
        base_tool = self.meta.func

        # If already a LangChain BaseTool, wrap for metrics; otherwise return as-is
        if isinstance(base_tool, BaseTool):
            return self._wrap_structured_tool(base_tool)

        return base_tool


def _register_all_tools() -> None:
    # Food
    register_tool("search_food_log", database.search_food_log, ["food_core", "food", "db"])
    register_tool("log_food_entry", database.log_food_entry, ["food_core", "food", "db"])
    register_tool("update_food_entry", database.update_food_entry, ["food_core", "food", "db"])
    register_tool("get_food_by_rating", database.get_food_by_rating, ["food_core", "food", "db"])
    register_tool("analyze_food_patterns", database.analyze_food_patterns, ["food_core", "food"])
    register_tool("vector_search_foods", vector.vector_search_foods, ["food_vector", "food", "vector"])
    register_tool("get_food_recommendations", hybrid.get_food_recommendations, ["food_recommendations", "food", "hybrid"])

    # Tasks
    register_tool("search_tasks", database.search_tasks, ["tasks_core", "tasks", "db"])
    register_tool("create_task", database.create_task, ["tasks_core", "tasks", "db"])
    register_tool("update_task", database.update_task, ["tasks_core", "tasks", "db"])
    register_tool("get_tasks_by_priority", database.get_tasks_by_priority, ["tasks_core", "tasks", "db"])
    register_tool("get_tasks_due_soon", database.get_tasks_due_soon, ["tasks_core", "tasks", "db"])

    # Todoist Integration (NLP + Mirror)
    register_tool("add_task_with_nlp", todoist_mirror.add_task_with_nlp, ["tasks_core", "tasks", "todoist", "nlp"])
    register_tool("add_subtask", todoist_mirror.add_subtask, ["tasks_core", "tasks", "todoist"])
    register_tool("get_todoist_project_tree", todoist_mirror.get_todoist_project_tree, ["tasks_todoist", "todoist", "tasks"])
    register_tool("get_todoist_labels", todoist_mirror.get_todoist_labels, ["tasks_todoist", "todoist", "tasks"])
    register_tool("get_todoist_task_tree", todoist_mirror.get_todoist_task_tree, ["tasks_todoist", "todoist", "tasks"])
    register_tool("add_task_dependency", task_dependencies.add_task_dependency, ["tasks_dependencies", "tasks"])
    register_tool("get_task_dependencies", task_dependencies.get_task_dependencies, ["tasks_dependencies", "tasks"])
    register_tool("get_available_tasks", task_dependencies.get_available_tasks, ["tasks_dependencies", "tasks"])
    register_tool("complete_task_with_unblock", task_dependencies.complete_task_with_unblock, ["tasks_dependencies", "tasks"])
    register_tool("add_checklist_item", task_checklists.add_checklist_item, ["tasks_checklists", "tasks"])
    register_tool("check_checklist_item", task_checklists.check_checklist_item, ["tasks_checklists", "tasks"])
    register_tool("get_task_with_checklist", task_checklists.get_task_with_checklist, ["tasks_checklists", "tasks"])
    register_tool("get_tasks_with_incomplete_checklists", task_checklists.get_tasks_with_incomplete_checklists, ["tasks_checklists", "tasks"])
    register_tool("bulk_create_tasks", bulk_operations.bulk_create_tasks, ["tasks_bulk", "tasks"])
    register_tool("bulk_update_task_status", bulk_operations.bulk_update_task_status, ["tasks_bulk", "tasks"])
    register_tool("bulk_add_tags", bulk_operations.bulk_add_tags, ["tasks_bulk", "tasks"])
    register_tool("bulk_set_priority", bulk_operations.bulk_set_priority, ["tasks_bulk", "tasks"])
    register_tool("bulk_delete_tasks", bulk_operations.bulk_delete_tasks, ["tasks_bulk", "tasks"])
    register_tool("bulk_move_to_project", bulk_operations.bulk_move_to_project, ["tasks_bulk", "tasks"])
    register_tool("unified_search", advanced_search.unified_search, ["tasks_search", "search_shared"])
    register_tool("search_by_tags", advanced_search.search_by_tags, ["tasks_search", "tasks"])
    register_tool("advanced_task_filter", advanced_search.advanced_task_filter, ["tasks_search", "tasks"])
    register_tool("get_task_statistics", advanced_search.get_task_statistics, ["tasks_search", "tasks"])
    register_tool("get_task_summary", quick_wins.get_task_summary, ["tasks_quick_wins", "tasks"])
    register_tool("suggest_next_task", quick_wins.suggest_next_task, ["tasks_quick_wins", "tasks"])
    register_tool("time_block_planning", quick_wins.time_block_planning, ["tasks_quick_wins", "tasks"])
    register_tool("task_insights", analytics.task_insights, ["tasks_analytics", "tasks"])

    # Events
    register_tool("search_events", database.search_events, ["events_core", "events", "db"])
    register_tool("create_event", database.create_event, ["events_core", "events", "db"])
    register_tool("get_events_today", database.get_events_today, ["events_core", "events"])
    register_tool("get_events_week", database.get_events_week, ["events_core", "events"])
    register_tool("check_time_conflicts", database.check_time_conflicts, ["events_core", "events"])
    register_tool("bulk_create_events", event_bulk_operations.bulk_create_events, ["events_bulk", "events"])
    register_tool("bulk_update_event_status", event_bulk_operations.bulk_update_event_status, ["events_bulk", "events"])
    register_tool("bulk_reschedule_events", event_bulk_operations.bulk_reschedule_events, ["events_bulk", "events"])
    register_tool("bulk_add_attendees", event_bulk_operations.bulk_add_attendees, ["events_bulk", "events"])
    register_tool("bulk_delete_events", event_bulk_operations.bulk_delete_events, ["events_bulk", "events"])
    register_tool("undo_last_event_action", event_bulk_operations.undo_last_event_action, ["events_bulk", "events"])
    register_tool("create_recurring_event", event_recurring.create_recurring_event, ["events_recurring", "events"])
    register_tool("update_recurring_series", event_recurring.update_recurring_series, ["events_recurring", "events"])
    register_tool("skip_recurring_instance", event_recurring.skip_recurring_instance, ["events_recurring", "events"])
    register_tool("delete_recurring_series", event_recurring.delete_recurring_series, ["events_recurring", "events"])
    register_tool("get_recurring_series", event_recurring.get_recurring_series, ["events_recurring", "events"])
    register_tool("search_by_attendees", event_advanced_search.search_by_attendees, ["events_search", "events"])
    register_tool("search_by_location", event_advanced_search.search_by_location, ["events_search", "events"])
    register_tool("advanced_event_filter", event_advanced_search.advanced_event_filter, ["events_search", "events"])
    register_tool("get_event_statistics", event_advanced_search.get_event_statistics, ["events_search", "events"])
    register_tool("find_available_slots", event_scheduling.find_available_slots, ["events_schedule", "events"])
    register_tool("suggest_meeting_times", event_scheduling.suggest_meeting_times, ["events_schedule", "events"])
    register_tool("bulk_check_conflicts", event_scheduling.bulk_check_conflicts, ["events_schedule", "events"])
    register_tool("get_busy_free_times", event_scheduling.get_busy_free_times, ["events_schedule", "events"])
    register_tool("smart_schedule_day", event_scheduling.smart_schedule_day, ["events_schedule", "events"])
    register_tool("event_insights", analytics.event_insights, ["events_analytics", "events"])

    # Reminders
    register_tool("search_reminders", reminders.search_reminders, ["reminders_core", "reminders"])
    register_tool("create_reminder", reminders.create_reminder, ["reminders_core", "reminders"])
    register_tool("update_reminder", reminders.update_reminder, ["reminders_core", "reminders"])
    register_tool("complete_reminder", reminders.complete_reminder, ["reminders_core", "reminders"])
    register_tool("get_reminders_today", reminders.get_reminders_today, ["reminders_core", "reminders"])
    register_tool("get_reminders_due_soon", reminders.get_reminders_due_soon, ["reminders_core", "reminders"])
    register_tool("bulk_update_reminder_status", reminder_bulk_operations.bulk_update_reminder_status, ["reminders_bulk", "reminders"])
    register_tool("bulk_snooze_reminders", reminder_bulk_operations.bulk_snooze_reminders, ["reminders_bulk", "reminders"])
    register_tool("bulk_delete_reminders", reminder_bulk_operations.bulk_delete_reminders, ["reminders_bulk", "reminders"])
    register_tool("undo_last_reminder_action", reminder_bulk_operations.undo_last_reminder_action, ["reminders_bulk", "reminders"])
    register_tool("reminder_insights", analytics.reminder_insights, ["reminders_analytics", "reminders"])

    # Memory + documents
    register_tool("search_memories", memory.search_memories, ["memory_core", "memory_context"])
    register_tool("store_chat_turn", memory.store_chat_turn, ["memory_core", "memory_context"])
    register_tool("memory_health", memory.memory_health, ["memory_core", "memory_context"])
    register_tool("find_duplicate_memories", memory.find_duplicate_memories, ["memory_core", "memory_context"])
    register_tool("embed_document", documents.embed_document, ["documents", "memory_context"])
    register_tool("reembed_vault_file", documents.reembed_vault_file, ["documents", "memory_context"])
    register_tool("search_embedded_documents", documents.search_embedded_documents, ["documents", "memory_context"])
    register_tool("vector_search_memories", vector.vector_search_memories, ["memory_vector", "memory_context", "vector"])

    # Notes / vault
    register_tool("write_note_file", note_files.write_note_file, ["notes_core", "notes", "vault"])
    register_tool("append_note_file", note_files.append_note_file, ["notes_core", "notes", "vault"])
    register_tool("list_notes", note_files.list_notes, ["notes_support", "notes", "vault"])
    register_tool("read_note_file", note_files.read_note_file, ["notes_support", "notes", "vault"])

    # Shared / integration
    register_tool("integration_status", integrations.integration_status, ["integrations"])

    # Life Logging (Recorder)
    register_tool("log_menstrual_cycle", life_logging.log_menstrual_cycle, ["life_logging", "recorder"])
    register_tool("log_intimate_activity", life_logging.log_intimate_activity, ["life_logging", "recorder"])
    register_tool("log_misc_event", life_logging.log_misc_event, ["life_logging", "recorder"])

    # Reporting (Analyst)
    register_tool("run_read_only_sql", reporting.run_read_only_sql, ["reporting", "analyst"])
    register_tool("get_table_schema", reporting.get_table_schema, ["reporting", "analyst"])

    # Google Calendar Integration
    register_tool("create_calendar_event", google_calendar.create_calendar_event, ["calendar", "scheduler", "tasks_core"])
    register_tool("get_upcoming_events", google_calendar.get_upcoming_events, ["calendar", "scheduler"])
    register_tool("find_free_time", google_calendar.find_free_time, ["calendar", "scheduler"])



_register_all_tools()


def _match_tag(tag: str, tool_meta: ToolMeta) -> bool:
    return tag in tool_meta.tags


def build_agent_tools(agent_name: str, selectors: Iterable[str], excluded: Iterable[str] | None = None) -> List[Any]:
    """
    Resolve selectors (tool names or tag:xxx) into wrapped tool objects.
    """
    selected: List[Any] = []
    seen: Set[str] = set()
    excluded_set = set(excluded or [])

    for selector in selectors:
        if selector in excluded_set:
            continue
        if selector.startswith("tag:"):
            tag = selector.split(":", 1)[1]
            for meta in TOOL_REGISTRY.values():
                if meta.name in seen:
                    continue
                if _match_tag(tag, meta):
                    if meta.name in excluded_set:
                        continue
                    selected.append(ToolRunner(meta, agent_name=agent_name).wrap())
                    seen.add(meta.name)
        else:
            meta = TOOL_REGISTRY.get(selector)
            if not meta:
                logger.warning("Unknown tool selector '%s' for agent '%s'", selector, agent_name)
                continue
            if meta.name in seen:
                continue
            if meta.name in excluded_set:
                continue
            selected.append(ToolRunner(meta, agent_name=agent_name).wrap())
            seen.add(meta.name)

    logger.info("Resolved %d tools for %s", len(selected), agent_name)
    return selected


def get_tool_metadata() -> Dict[str, ToolMeta]:
    return TOOL_REGISTRY
