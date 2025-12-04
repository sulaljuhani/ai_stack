"""
Phase 5: dual-mode routing smoke tests.

These tests exercise the routing node to ensure keyword-based team
selection sends requests to the appropriate team supervisor without
requiring the full agent execution path.
"""

from __future__ import annotations

import unittest

from graph.state import create_initial_state
from graph.workflow import create_routing_node


class HierarchicalRoutingTests(unittest.IsolatedAsyncioTestCase):
    async def _route(self, message: str):
        state = create_initial_state(
            user_id="test-user",
            workspace="default",
            session_id="test-session",
            initial_message=message,
        )
        routing_node = create_routing_node()
        return await routing_node(state)

    async def test_task_routes_to_task_supervisor(self):
        result = await self._route("Create a task to buy groceries")
        self.assertEqual(result["current_team"], "task_management")
        self.assertEqual(result["current_agent"], "task_supervisor")

    async def test_event_routes_to_event_supervisor(self):
        result = await self._route("Schedule an event tomorrow at 3pm")
        self.assertEqual(result["current_team"], "event_management")
        self.assertEqual(result["current_agent"], "event_supervisor")

    async def test_reminder_routes_to_reminder_supervisor(self):
        result = await self._route("Reminder alert: call mom tomorrow")
        self.assertEqual(result["current_team"], "reminder_management")
        self.assertEqual(result["current_agent"], "reminder_supervisor")

    async def test_knowledge_routes_to_knowledge_supervisor(self):
        result = await self._route("Search my notes and documents for python examples")
        self.assertEqual(result["current_team"], "knowledge_management")
        self.assertEqual(result["current_agent"], "knowledge_supervisor")

    async def test_logging_routes_to_logging_supervisor(self):
        result = await self._route("Log and track my lunch with calories")
        self.assertEqual(result["current_team"], "life_logging")
        self.assertEqual(result["current_agent"], "logging_supervisor")

    async def test_analytics_routes_to_analytics_supervisor(self):
        result = await self._route("Analyze and report task completion statistics")
        self.assertEqual(result["current_team"], "analytics")
        self.assertEqual(result["current_agent"], "analytics_supervisor")

    async def test_integration_routes_to_integration_supervisor(self):
        result = await self._route("Sync Google Calendar with Todoist")
        self.assertEqual(result["current_team"], "integrations")
        self.assertEqual(result["current_agent"], "integration_supervisor")


if __name__ == "__main__":
    unittest.main()
