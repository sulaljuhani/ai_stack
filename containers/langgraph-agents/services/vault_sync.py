"""
Vault Sync Service

Scheduled job for syncing vault files.

Replaces n8n workflow:
- 18-scheduled-vault-sync.json (every 12 hours)
"""

from datetime import datetime
from typing import Dict, Any
from pathlib import Path
import os
import time

from tools.documents import reembed_vault_file, calculate_file_hash
from utils.db import get_db_pool
from utils.logging import get_logger
from utils.redis_client import get_redis_client
from config import settings

logger = get_logger(__name__)


# ============================================================================
# Scheduled Vault Sync (Workflow 18)
# Schedule: Every 12 hours
# ============================================================================

async def scheduled_vault_sync() -> Dict[str, Any]:
    """
    Sync all vault files - fallback for files missed by realtime watcher.

    Replaces n8n workflow: 18-scheduled-vault-sync.json

    Logic:
    1. List all files in vault directory
    2. For each file:
       - Check file_hash against database
       - If changed or not in database, trigger reembed
    3. Return sync statistics

    Returns:
        Dict with sync statistics
    """
    try:
        # Get vault path from settings (default: /mnt/user/data/vault)
        vault_path = settings.vault_path

        if not os.path.exists(vault_path):
            logger.warning(f"Vault path does not exist: {vault_path}")
            return {
                "success": False,
                "error": f"Vault path not found: {vault_path}",
                "timestamp": datetime.now().isoformat()
            }

        logger.info(f"Starting vault sync for: {vault_path}")

        pool = await get_db_pool()

        stats = {
            "files_scanned": 0,
            "files_unchanged": 0,
            "files_embedded": 0,
            "files_failed": 0,
            "errors": [],
            "timestamp": datetime.now().isoformat()
        }

        # Get all markdown files in vault
        vault_files = []
        for root, dirs, files in os.walk(vault_path):
            # Skip hidden directories and .obsidian
            dirs[:] = [d for d in dirs if not d.startswith('.')]

            for file in files:
                # Only process text files
                if file.endswith(('.md', '.txt', '.json')):
                    file_path = os.path.join(root, file)
                    vault_files.append(file_path)

        stats["files_scanned"] = len(vault_files)

        logger.info(f"Found {len(vault_files)} files in vault")

        # Process each file
        for file_path in vault_files:
            try:
                # Calculate current file hash
                current_hash = calculate_file_hash(file_path)

                # Get stored hash from database
                async with pool.acquire() as conn:
                    stored_record = await conn.fetchrow(
                        "SELECT file_hash FROM vault_files WHERE file_path = $1",
                        file_path
                    )

                stored_hash = stored_record["file_hash"] if stored_record else None

                # Check if file changed or is new
                if current_hash != stored_hash:
                    logger.info(f"File changed or new: {file_path}")

                    # Re-embed file
                    result = await reembed_vault_file(
                        file_path=file_path,
                        file_hash=stored_hash,
                        force=False
                    )

                    if result.get("success") and not result.get("skipped"):
                        stats["files_embedded"] += 1
                    elif result.get("skipped"):
                        stats["files_unchanged"] += 1
                    else:
                        stats["files_failed"] += 1
                        stats["errors"].append({
                            "file": file_path,
                            "error": result.get("error", "Unknown error")
                        })
                else:
                    stats["files_unchanged"] += 1

            except Exception as e:
                logger.error(f"Error processing file {file_path}: {e}")
                stats["files_failed"] += 1
                stats["errors"].append({
                    "file": file_path,
                    "error": str(e)
                })

        logger.info(
            f"Vault sync completed: {stats['files_scanned']} scanned, "
            f"{stats['files_embedded']} embedded, "
            f"{stats['files_unchanged']} unchanged, "
            f"{stats['files_failed']} failed"
        )

        return stats

    except Exception as e:
        logger.error(f"Error during vault sync: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


# ============================================================================
# Incremental Vault Watcher
# Schedule: Frequent (e.g., every minute) to pick up file edits quickly
# ============================================================================

async def watch_vault_changes() -> Dict[str, Any]:
    """
    Incrementally scan the vault for changed/new files and re-embed them.
    """
    stats = {
        "files_scanned": 0,
        "files_embedded": 0,
        "files_skipped": 0,
        "errors": [],
        "timestamp": datetime.now().isoformat(),
    }

    try:
        vault_path = settings.vault_path
        if not os.path.exists(vault_path):
            return {
                "success": False,
                "error": f"Vault path not found: {vault_path}",
                **stats,
            }

        redis = await get_redis_client()
        last_run_key = "vault_watch:last_run"
        last_run_raw = await redis.get(last_run_key)
        last_run = float(last_run_raw) if last_run_raw else None
        now = time.time()

        changed_files = []
        for root, dirs, files in os.walk(vault_path):
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            for file in files:
                if not file.endswith(('.md', '.txt', '.json')):
                    continue
                file_path = os.path.join(root, file)
                try:
                    mtime = os.path.getmtime(file_path)
                except OSError:
                    continue
                if last_run is None or mtime >= last_run - 1:
                    changed_files.append(file_path)

        stats["files_scanned"] = len(changed_files)

        logger.info(f"Vault watch: found {len(changed_files)} changed files since last run")
        if len(changed_files) > 0:
            logger.info(f"Vault watch: changed files: {[os.path.basename(f) for f in changed_files[:10]]}")

        # Cap to avoid overload
        MAX_PER_RUN = 200
        if len(changed_files) > MAX_PER_RUN:
            logger.warning(f"Vault watch: limiting to {MAX_PER_RUN} files (found {len(changed_files)})")
            changed_files = changed_files[:MAX_PER_RUN]

        for file_path in changed_files:
            try:
                logger.info(f"Vault watch: processing {file_path}")
                # reembed_vault_file is a LangChain tool, need to call it properly
                result = await reembed_vault_file.ainvoke({"file_path": file_path, "force": False})
                logger.info(f"Vault watch: result for {file_path}: {result}")
                if result.get("success") and not result.get("skipped"):
                    stats["files_embedded"] += 1
                    logger.info(f"Vault watch: embedded {file_path}")
                else:
                    stats["files_skipped"] += 1
                    logger.info(f"Vault watch: skipped {file_path} - {result.get('reason', 'unknown')}")
            except Exception as exc:
                logger.error(f"Vault watch: error processing {file_path}: {exc}", exc_info=True)
                stats["errors"].append({"file": file_path, "error": str(exc)})

        await redis.set(last_run_key, now)

        stats["success"] = True
        return stats

    except Exception as e:
        logger.error(f"Error watching vault changes: {e}", exc_info=True)
        stats["success"] = False
        stats["error"] = str(e)
        return stats
