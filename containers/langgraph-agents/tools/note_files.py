"""
Note file tools for writing and reading user notes in the vault.
"""

from datetime import datetime
from pathlib import Path
import re
from typing import Any, Dict, List, Optional

from langchain_core.tools import tool
from pydantic import BaseModel, Field

from config import settings
from utils.logging import get_logger
from .documents import reembed_vault_file, validate_file_path, read_file_content

logger = get_logger(__name__)


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9-_]+", "-", text.strip().lower())
    slug = re.sub(r"-{2,}", "-", slug).strip("-")
    return slug or "note"


def _ensure_vault_dir() -> Path:
    vault_root = Path(settings.vault_path).expanduser().resolve()
    vault_root.mkdir(parents=True, exist_ok=True)
    return vault_root


def _resolve_note_path(title: str, folder: Optional[str]) -> Path:
    vault_root = _ensure_vault_dir()
    target_dir = vault_root / folder if folder else vault_root
    target_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{_slugify(title)}.md"
    path = (target_dir / filename).resolve()

    try:
        path.relative_to(vault_root)
    except ValueError:
        raise ValueError("Resolved path is outside the configured vault")

    return path


def _build_frontmatter(title: str, tags: Optional[List[str]], created: str, updated: str) -> str:
    lines = ["---", f"title: {title}", f"created: {created}", f"updated: {updated}"]
    if tags:
        tag_list = [t.strip() for t in tags if t.strip()]
        lines.append(f"tags: [{', '.join(tag_list)}]")
    lines.append("---")
    return "\n".join(lines) + "\n\n"


class WriteNoteInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Note title")
    body: str = Field(..., min_length=1, description="Note content (markdown allowed)")
    folder: Optional[str] = Field(None, description="Subfolder under vault (optional)")
    tags: Optional[List[str]] = Field(default=None, description="Tags for frontmatter")
    overwrite: bool = Field(default=False, description="Allow overwriting an existing note")


@tool
async def write_note_file(input: WriteNoteInput) -> Dict[str, Any]:
    """
    Create or overwrite a note file in the vault and embed it.

    Args:
        input.title: Note title (used to generate filename)
        input.body: Note body (markdown allowed)
        input.folder: Optional subfolder inside the vault
        input.tags: Optional list of tags
        input.overwrite: Allow overwrite if file exists
    """
    try:
        note_path = _resolve_note_path(input.title, input.folder)
        is_new = not note_path.exists()

        if note_path.exists() and not input.overwrite:
            return {"success": False, "error": f"Note already exists: {note_path}"}

        timestamp = datetime.utcnow().isoformat()
        frontmatter = _build_frontmatter(
            title=input.title,
            tags=input.tags,
            created=timestamp,
            updated=timestamp,
        )

        content = frontmatter + input.body.strip() + "\n"
        note_path.write_text(content, encoding="utf-8")

        embed_fn = getattr(reembed_vault_file, "coroutine", None) or getattr(reembed_vault_file, "func", None) or reembed_vault_file
        embed_result = await embed_fn(
            file_path=str(note_path),
            metadata={
                "title": input.title,
                "tags": input.tags or [],
                "source": "vault_note_tool",
            },
            force=True,
        )

        return {
            "success": embed_result.get("success", False),
            "path": str(note_path),
            "action": "created" if is_new else "overwritten",
            "embedded": embed_result,
        }

    except Exception as e:
        logger.error(f"Error writing note: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


class AppendNoteInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Note title to append to")
    body: str = Field(..., min_length=1, description="Content to append")
    folder: Optional[str] = Field(None, description="Subfolder under vault (optional)")
    tags: Optional[List[str]] = Field(default=None, description="Tags to include if the note is created")


@tool
async def append_note_file(input: AppendNoteInput) -> Dict[str, Any]:
    """
    Append content to an existing note (or create it if missing) and re-embed.
    """
    try:
        note_path = _resolve_note_path(input.title, input.folder)
        is_new = not note_path.exists()
        timestamp = datetime.utcnow().isoformat()

        if is_new:
            frontmatter = _build_frontmatter(
                title=input.title,
                tags=input.tags,
                created=timestamp,
                updated=timestamp,
            )
            content = frontmatter + input.body.strip() + "\n"
        else:
            existing = note_path.read_text(encoding="utf-8")
            # Update frontmatter updated timestamp if present
            updated_content = re.sub(
                r"(updated:\s*)(.*)",
                rf"\g<1>{timestamp}",
                existing,
                count=1,
            )
            if updated_content == existing:
                updated_content = existing
            content = updated_content.rstrip() + f"\n\n## {timestamp}\n{input.body.strip()}\n"

        note_path.write_text(content, encoding="utf-8")

        embed_fn = getattr(reembed_vault_file, "coroutine", None) or getattr(reembed_vault_file, "func", None) or reembed_vault_file
        embed_result = await embed_fn(
            file_path=str(note_path),
            metadata={
                "title": input.title,
                "tags": input.tags or [],
                "source": "vault_note_tool",
            },
            force=True,
        )

        return {
            "success": embed_result.get("success", False),
            "path": str(note_path),
            "action": "created" if is_new else "appended",
            "embedded": embed_result,
        }

    except Exception as e:
        logger.error(f"Error appending note: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


@tool
async def list_notes(limit: int = 50) -> Dict[str, Any]:
    """
    List recent notes in the vault (sorted by modified time).
    """
    try:
        vault_root = _ensure_vault_dir()
        notes: List[Dict[str, Any]] = []

        for path in vault_root.rglob("*.md"):
            try:
                mtime = path.stat().st_mtime
                notes.append({
                    "path": str(path),
                    "modified": datetime.utcfromtimestamp(mtime).isoformat(),
                })
            except OSError:
                continue

        notes = sorted(notes, key=lambda n: n["modified"], reverse=True)[:limit]
        return {"success": True, "notes": notes}

    except Exception as e:
        logger.error(f"Error listing notes: {e}", exc_info=True)
        return {"success": False, "error": str(e), "notes": []}


class ReadNoteInput(BaseModel):
    path: str = Field(..., description="Absolute path to note within vault")
    preview: bool = Field(default=False, description="Return first 400 chars if True")


@tool
async def read_note_file(input: ReadNoteInput) -> Dict[str, Any]:
    """
    Read a note file (with path safety validation).
    """
    try:
        if not validate_file_path(input.path, [settings.vault_path]):
            return {"success": False, "error": "Access denied for this path"}

        content = read_file_content(input.path)
        if content is None:
            return {"success": False, "error": "Unable to read note"}

        if input.preview:
            return {"success": True, "path": input.path, "preview": content[:400]}

        return {"success": True, "path": input.path, "content": content}

    except Exception as e:
        logger.error(f"Error reading note: {e}", exc_info=True)
        return {"success": False, "error": str(e)}
