"""
Fixed circular dependency detection using proper graph algorithms.

This file contains the improved circular dependency checker to replace
the incomplete one in task_dependencies.py line 51-60.
"""

from typing import Set, List, Dict
import asyncpg


async def has_circular_dependency(
    conn: asyncpg.Connection,
    task_id: str,
    new_dependency_id: str
) -> bool:
    """
    Check if adding a dependency would create a circular dependency.

    Uses depth-first search to detect cycles in the dependency graph.

    Args:
        conn: Database connection
        task_id: Task that will depend on new_dependency_id
        new_dependency_id: Task that task_id wants to depend on

    Returns:
        True if circular dependency would be created, False otherwise

    Example circular dependencies this catches:
        - Direct: A depends on B, B depends on A
        - Indirect: A depends on B, B depends on C, C depends on A
        - Long chain: A→B→C→D→E→A
    """
    async def get_dependencies(tid: str) -> List[str]:
        """Get all dependencies for a task."""
        result = await conn.fetchval(
            "SELECT depends_on FROM tasks WHERE id = $1",
            tid
        )
        return result if result else []

    async def has_path(from_id: str, to_id: str, visited: Set[str]) -> bool:
        """Check if there's a path from from_id to to_id using DFS."""
        if from_id == to_id:
            return True

        if from_id in visited:
            return False

        visited.add(from_id)

        # Get all tasks that from_id depends on
        dependencies = await get_dependencies(from_id)

        for dep_id in dependencies:
            if await has_path(dep_id, to_id, visited):
                return True

        return False

    # If new_dependency has a path back to task_id, it's circular
    # Example: task_id=A wants to depend on B
    # Check if B has a path to A (B→...→A)
    # If yes, adding A→B would create a cycle
    return await has_path(new_dependency_id, task_id, set())


# Example usage in add_task_dependency:
"""
Replace lines 51-60 in task_dependencies.py with:

    # Check for circular dependencies using proper graph traversal
    if await has_circular_dependency(conn, task_id, depends_on_task_id):
        return {
            "success": False,
            "error": "Circular dependency detected: adding this dependency would create a cycle"
        }
"""
