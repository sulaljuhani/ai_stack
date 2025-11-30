"""
Document Tools

Tools for document embedding and vault management.

Replaces functionality from n8n workflows:
- 07-watch-vault.json (re-embed changed vault files)
- 15-watch-documents.json (embed general documents)
- 18-scheduled-vault-sync.json (scheduled vault sync)
"""

from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
import hashlib
import asyncio
from datetime import datetime
import time

from langchain_core.tools import tool
from utils.db import get_db_pool
from utils.logging import get_logger
from config import settings
from .validation import validate_count
from utils.metrics import inc_counter, observe_duration, check_rate_limit

logger = get_logger(__name__)

ALLOWED_FILE_TYPES = {"txt", "md", "markdown", "json"}
MAX_FILE_MB = 5
MAX_CHUNKS = 500
EMBED_BATCH_SIZE = 8


# ============================================================================
# Security Functions
# ============================================================================

def validate_file_path(file_path: str, allowed_base_paths: Optional[List[str]] = None) -> bool:
    """
    Validate file path to prevent directory traversal attacks.

    Args:
        file_path: Path to validate
        allowed_base_paths: List of allowed base directories (defaults to vault path from settings)

    Returns:
        True if path is safe, False otherwise

    Security checks:
        - Resolves symlinks and relative paths
        - Ensures path is within allowed directories
        - Prevents access to system files (../../../etc/passwd)
    """
    try:
        # Get allowed base paths
        if allowed_base_paths is None:
            # Default to vault path from settings
            allowed_base_paths = [settings.vault_path] if hasattr(settings, 'vault_path') else []

            # Add common document directories if configured
            if hasattr(settings, 'documents_path'):
                allowed_base_paths.append(settings.documents_path)

        if not allowed_base_paths:
            logger.warning("No allowed base paths configured - rejecting all file access")
            return False

        # Resolve to absolute path (prevents ../ tricks)
        resolved_path = Path(file_path).resolve()

        # Check if path is within any allowed base directory
        for base_path_str in allowed_base_paths:
            base_path = Path(base_path_str).resolve()

            try:
                # Check if resolved_path is relative to base_path
                resolved_path.relative_to(base_path)
                # If we get here, path is within allowed directory
                return True
            except ValueError:
                # Not relative to this base path, try next one
                continue

        # Path not in any allowed directory
        logger.warning(f"Path traversal attempt blocked: {file_path} -> {resolved_path}")
        return False

    except Exception as e:
        logger.error(f"Error validating file path: {e}")
        return False


def _file_type_allowed(file_type: str) -> bool:
    return file_type.lower() in ALLOWED_FILE_TYPES


def _file_size_ok(file_path: Path) -> Tuple[bool, Optional[str]]:
    size_mb = file_path.stat().st_size / (1024 * 1024)
    if size_mb > MAX_FILE_MB:
        return False, f"File too large ({size_mb:.2f} MB). Max allowed is {MAX_FILE_MB} MB"
    return True, None


def _make_point_id(key: str) -> int:
    """
    Generate a deterministic integer point ID from an arbitrary key.

    Qdrant collection defaults can reject arbitrary strings; using a hashed
    integer keeps IDs valid while remaining stable across re-embeds.
    """
    digest = hashlib.sha256(key.encode("utf-8")).digest()
    # Take 8 bytes for a 64-bit positive int
    return int.from_bytes(digest[:8], byteorder="big", signed=False)


# ============================================================================
# Helper Functions
# ============================================================================

def calculate_file_hash(file_path: str) -> str:
    """
    Calculate SHA256 hash of a file.

    SECURITY: Caller must validate file_path with validate_file_path() first.
    """
    sha256_hash = hashlib.sha256()
    try:
        # SECURITY NOTE: Path validation should be done by caller
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except Exception as e:
        logger.error(f"Error calculating hash for {file_path}: {e}")
        return ""


def read_file_content(file_path: str) -> Optional[str]:
    """
    Read file content as text.

    SECURITY: Caller must validate file_path with validate_file_path() first.
    """
    try:
        # SECURITY NOTE: Path validation should be done by caller
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        logger.error(f"Error reading file {file_path}: {e}")
        return None


def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    """
    Split text into overlapping chunks.

    Args:
        text: Text to chunk
        chunk_size: Size of each chunk in characters
        chunk_overlap: Overlap between chunks

    Returns:
        List of text chunks
    """
    if not text:
        return []

    # Adaptive chunking for markdown/code: break on headings/paragraphs first
    if "\n" in text and (text.count("#") > 0 or "```" in text):
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        chunks: List[str] = []
        for para in paragraphs:
            if len(para) <= chunk_size:
                chunks.append(para)
            else:
                start = 0
                while start < len(para):
                    end = start + chunk_size
                    chunks.append(para[start:end])
                    start += chunk_size - chunk_overlap
        return chunks

    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - chunk_overlap

    return chunks


async def generate_embedding(text: str) -> Optional[List[float]]:
    """
    Generate embedding for text using Ollama.

    Args:
        text: Text to embed

    Returns:
        Embedding vector or None if failed
    """
    try:
        import httpx

        ollama_url = f"{settings.ollama_base_url}/api/embeddings"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                ollama_url,
                json={
                    "model": "nomic-embed-text",
                    "prompt": text
                }
            )

            if response.status_code == 200:
                data = response.json()
                return data.get("embedding")
            else:
                logger.error(f"Ollama embedding failed: {response.status_code} - {response.text}")
                return None

    except Exception as e:
        logger.error(f"Error generating embedding: {e}", exc_info=True)
        return None


async def _generate_embeddings_batch(chunks: List[str]) -> List[Optional[List[float]]]:
    """
    Batch-generate embeddings for multiple chunks using a shared client.
    """
    try:
        import httpx
    except Exception as e:
        logger.error(f"Failed to import httpx for batch embeddings: {e}")
        return [None] * len(chunks)

    results: List[Optional[List[float]]] = [None] * len(chunks)

    async def embed_single(idx: int, text: str, client: "httpx.AsyncClient"):
        try:
            resp = await client.post(
                f"{settings.ollama_base_url}/api/embeddings",
                json={"model": "nomic-embed-text", "prompt": text},
                timeout=30.0,
            )
            if resp.status_code == 200:
                data = resp.json()
                results[idx] = data.get("embedding")
            else:
                logger.warning(f"Embedding failed for chunk {idx}: {resp.status_code}")
        except Exception as exc:
            logger.warning(f"Embedding exception for chunk {idx}: {exc}")

    try:
        async with httpx.AsyncClient() as client:
            tasks = []
            for idx, chunk in enumerate(chunks):
                tasks.append(embed_single(idx, chunk, client))
                # Run in limited batches to avoid overwhelming the model
                if len(tasks) >= EMBED_BATCH_SIZE:
                    await asyncio.gather(*tasks)
                    tasks = []
            if tasks:
                await asyncio.gather(*tasks)
    except Exception as exc:
        logger.error(f"Batch embedding failed: {exc}", exc_info=True)

    return results


async def store_in_qdrant(
    collection_name: str,
    point_id: str,
    vector: List[float],
    payload: Dict[str, Any]
) -> bool:
    """
    Store vector and payload in Qdrant.

    Args:
        collection_name: Qdrant collection name
        point_id: Unique point ID
        vector: Embedding vector
        payload: Metadata payload

    Returns:
        True if successful, False otherwise
    """
    try:
        from qdrant_client import QdrantClient
        from qdrant_client.models import PointStruct

        client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)

        # Ensure collection exists
        collections = client.get_collections().collections
        if not any(col.name == collection_name for col in collections):
            from qdrant_client.models import Distance, VectorParams
            client.create_collection(
                collection_name=collection_name,
                vectors_config={
                    "vector": VectorParams(size=len(vector), distance=Distance.COSINE)
                }
            )
            logger.info(f"Created Qdrant collection: {collection_name}")

        # Upsert point
        client.upsert(
            collection_name=collection_name,
            points=[
                PointStruct(
                    id=point_id,
                    vector={"vector": vector},
                    payload=payload
                )
            ]
        )

        return True

    except Exception as e:
        logger.error(f"Error storing in Qdrant: {e}", exc_info=True)
        return False


# ============================================================================
# Document Tools
# ============================================================================

@tool
async def embed_document(
    file_path: str,
    file_type: str,
    collection_name: str = "knowledge_base",
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
    metadata: Optional[Dict[str, Any]] = None,
    skip_if_unchanged: bool = True
) -> Dict[str, Any]:
    """
    Embed a document and store in Qdrant knowledge base.

    Replaces n8n workflow: 15-watch-documents.json

    Args:
        file_path: Absolute path to the document
        file_type: File type (txt, md, pdf, json)
        collection_name: Qdrant collection name
        chunk_size: Size of text chunks
        chunk_overlap: Overlap between chunks
        metadata: Additional metadata

    Returns:
        Dict with embedding results
    """
    try:
        # Rate limit embeds
        allowed, rl_error = check_rate_limit("embed_document", max_calls=20, window_seconds=60)
        if not allowed:
            return {"success": False, "error": rl_error}

        # SECURITY: Validate file path to prevent directory traversal
        if not validate_file_path(file_path):
            return {"success": False, "error": "Invalid file path or access denied"}

        # Validate file exists
        file_path_obj = Path(file_path)
        if not file_path_obj.exists():
            return {"success": False, "error": f"File not found: {file_path}"}

        # Validate file size
        size_ok, size_error = _file_size_ok(file_path_obj)
        if not size_ok:
            return {"success": False, "error": size_error}

        # Read file content
        content = read_file_content(file_path)
        if not content:
            return {"success": False, "error": "Failed to read file content"}

        # Calculate file hash
        file_hash = calculate_file_hash(file_path)

        # Chunk document
        chunks = chunk_text(content, chunk_size, chunk_overlap)

        if not chunks:
            return {"success": False, "error": "No content to embed"}

        # Guard against runaway chunk counts
        if len(chunks) > MAX_CHUNKS:
            return {"success": False, "error": f"Too many chunks ({len(chunks)}). Max allowed is {MAX_CHUNKS}."}

        # Check allowed file types
        if not _file_type_allowed(file_type):
            return {"success": False, "error": f"Unsupported file type '{file_type}'. Allowed: {', '.join(sorted(ALLOWED_FILE_TYPES))}"}

        # Skip if unchanged and already embedded
        if skip_if_unchanged:
            try:
                from qdrant_client import QdrantClient
                from qdrant_client.models import Filter, FieldCondition, MatchValue

                client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)
                count_result = client.count(
                    collection_name=collection_name,
                    count_filter=Filter(
                        must=[FieldCondition(key="file_hash", match=MatchValue(value=file_hash))]
                    ),
                    exact=True,
                )
                if count_result.count >= len(chunks):
                    logger.info(f"Document unchanged, skipping embed: {file_path}")
                    return {
                        "success": True,
                        "skipped": True,
                        "reason": "Document already embedded with same hash",
                        "file_path": file_path,
                        "file_hash": file_hash,
                        "total_chunks": len(chunks),
                        "embedded_chunks": 0,
                        "collection": collection_name,
                    }
            except Exception as exc:
                logger.debug(f"Skip check failed, proceeding with embed: {exc}")

        # Delete old chunks for this file before re-embedding
        try:
            from qdrant_client import QdrantClient
            from qdrant_client.models import Filter, FieldCondition, MatchValue

            client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)
            delete_result = client.delete(
                collection_name=collection_name,
                points_selector=Filter(
                    must=[FieldCondition(key="file_path", match=MatchValue(value=file_path))]
                )
            )
            logger.info(f"Deleted old chunks for {file_path} from {collection_name}")
        except Exception as exc:
            logger.warning(f"Failed to delete old chunks for {file_path}: {exc}")

        # Generate embeddings and store each chunk
        embedded_chunks = []

        start_time = time.time()
        embeddings = await _generate_embeddings_batch(chunks)

        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            if not embedding:
                logger.warning(f"Failed to generate embedding for chunk {i}")
                continue

            # Create deterministic numeric point ID
            point_id = _make_point_id(f"{collection_name}:{file_hash}:{i}")

            # Create payload
            payload = {
                "file_path": file_path,
                "file_type": file_type,
                "file_hash": file_hash,
                "chunk_index": i,
                "chunk_total": len(chunks),
                "content": chunk,
                "embedded_at": datetime.utcnow().isoformat(),
                **(metadata or {})
            }

            # Store in Qdrant
            success = await store_in_qdrant(collection_name, point_id, embedding, payload)

            if success:
                embedded_chunks.append({
                    "chunk_index": i,
                    "point_id": point_id,
                    "content_preview": chunk[:100] + "..." if len(chunk) > 100 else chunk
                })

        # Add a doc-level summary embedding to improve retrieval (optional, best-effort)
        summary_embedding = await generate_embedding(content[:2000])
        if summary_embedding:
            summary_payload = {
                "file_path": file_path,
                "file_type": file_type,
                "file_hash": file_hash,
                "chunk_index": -1,
                "chunk_total": len(chunks),
                "summary": True,
                "content": content[:500],
                "embedded_at": datetime.utcnow().isoformat(),
                **(metadata or {})
            }
            summary_point_id = _make_point_id(f"{collection_name}:{file_hash}:summary")
            summary_stored = await store_in_qdrant(collection_name, summary_point_id, summary_embedding, summary_payload)
            if summary_stored:
                embedded_chunks.append({
                    "chunk_index": -1,
                    "point_id": summary_point_id,
                    "content_preview": summary_payload["content"][:100] + "..." if len(summary_payload["content"]) > 100 else summary_payload["content"],
                    "summary": True
                })

        total_duration = time.time() - start_time
        logger.info(
            f"Embedded document: {file_path} - "
            f"{len(embedded_chunks)}/{len(chunks)} chunks stored"
        )
        inc_counter("documents.embeds")
        observe_duration("documents.embed_duration", total_duration)

        return {
            "success": True,
            "file_path": file_path,
            "file_hash": file_hash,
            "total_chunks": len(chunks),
            "embedded_chunks": len(embedded_chunks),
            "collection": collection_name,
            "chunks": embedded_chunks
        }

    except Exception as e:
        logger.error(f"Error embedding document {file_path}: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


@tool
async def reembed_vault_file(
    file_path: str,
    file_hash: Optional[str] = None,
    force: bool = False,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Re-embed a vault file if it has changed.

    Replaces n8n workflow: 07-watch-vault.json

    Args:
        file_path: Absolute path to the vault file
        file_hash: Optional file hash for change detection
        force: Force re-embedding even if hash unchanged

    Returns:
        Dict with re-embedding results
    """
    try:
        # SECURITY: Validate file path to prevent directory traversal
        if not validate_file_path(file_path):
            return {"success": False, "error": "Invalid file path or access denied"}

        # Validate file exists
        if not Path(file_path).exists():
            return {"success": False, "error": f"File not found: {file_path}"}

        # Calculate current file hash
        current_hash = calculate_file_hash(file_path)

        # Check if file changed
        if not force and file_hash and current_hash == file_hash:
            logger.debug(f"File unchanged, skipping: {file_path}")
            return {
                "success": True,
                "skipped": True,
                "reason": "File unchanged",
                "file_path": file_path,
                "file_hash": current_hash
            }

        # Get file type from extension
        file_ext = Path(file_path).suffix.lower().lstrip('.')
        if file_ext not in ['txt', 'md', 'json']:
            file_ext = 'txt'  # Default to txt

        # Embed document (vault files go to 'vault' collection)
        embed_fn = getattr(embed_document, "coroutine", None) or getattr(embed_document, "func", None) or embed_document

        merged_metadata = {"source": "vault", "previous_hash": file_hash}
        if metadata:
            merged_metadata.update(metadata)

        result = await embed_fn(
            file_path=file_path,
            file_type=file_ext,
            collection_name="vault",
            metadata=merged_metadata,
            skip_if_unchanged=not force
        )

        # Store file record in database (best effort)
        if result.get("success"):
            try:
                pool = await get_db_pool()
                async with pool.acquire() as conn:
                    await conn.execute(
                        """
                        INSERT INTO vault_files (file_path, file_hash, last_embedded, chunk_count)
                        VALUES ($1, $2, NOW(), $3)
                        ON CONFLICT (file_path)
                        DO UPDATE SET
                            file_hash = EXCLUDED.file_hash,
                            last_embedded = EXCLUDED.last_embedded,
                            chunk_count = EXCLUDED.chunk_count
                        """,
                        file_path,
                        current_hash,
                        result.get("embedded_chunks", 0)
                    )
            except Exception:
                logger.warning("vault_files table missing; skipping vault DB persistence")

        logger.info(f"Re-embedded vault file: {file_path}")

        return result

    except Exception as e:
        logger.error(f"Error re-embedding vault file {file_path}: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


@tool
async def search_embedded_documents(
    query: str,
    collection_name: str = "vault",
    limit: int = 10,
    score_threshold: float = 0.5,
    fallback_to_vault: bool = True
) -> Dict[str, Any]:
    """
    Search for similar documents in Qdrant.

    Args:
        query: Search query text
        collection_name: Qdrant collection to search
        limit: Number of results to return
        score_threshold: Minimum similarity score

    Returns:
        List of similar documents with scores
    """
    try:
        allowed, rl_error = check_rate_limit("search_embedded_documents", max_calls=180, window_seconds=60)
        if not allowed:
            return {"success": False, "error": rl_error, "results": []}

        is_valid_limit, limit_error = validate_count(limit, min_val=1, max_val=100)
        if not is_valid_limit:
            return {"success": False, "error": limit_error, "results": []}

        score_threshold = max(0.0, min(score_threshold, 1.0))

        # Generate query embedding
        query_embedding = await generate_embedding(query)

        if not query_embedding:
            return {"success": False, "error": "Failed to generate embedding", "results": []}

        # Search Qdrant
        from qdrant_client import QdrantClient

        client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)

        def _search(target_collection: str):
            return client.search(
                collection_name=target_collection,
                query_vector=("vector", query_embedding),
                limit=limit,
                score_threshold=score_threshold
            )

        try:
            results = _search(collection_name)
            logger.info(f"Qdrant search returned {len(results)} raw results for collection '{collection_name}'")

            # Optional fallback: if nothing found and not already searching vault, try vault too
            if fallback_to_vault and not results and collection_name != "vault":
                results = _search("vault")
                logger.info(f"Fallback vault search returned {len(results)} results")
        except Exception as exc:
            logger.error(f"Qdrant search failed ({collection_name}): {exc}", exc_info=True)
            results = []

        # Aggregate by file to surface best chunk + summary when present
        aggregated: Dict[str, Dict[str, Any]] = {}
        for result in results:
            file_hash = result.payload.get("file_hash") or str(result.id)
            existing = aggregated.get(file_hash)

            record = {
                "id": result.id,
                "score": result.score,
                "file_path": result.payload.get("file_path"),
                "content": result.payload.get("content"),
                "chunk_index": result.payload.get("chunk_index"),
                "metadata": result.payload,
                "summary": bool(result.payload.get("summary", False)),
            }

            if existing is None:
                aggregated[file_hash] = record
                aggregated[file_hash]["best_chunk"] = record
                aggregated[file_hash]["summary_payload"] = record if record["summary"] else None
            else:
                # Track best chunk
                best_chunk = existing.get("best_chunk") or existing
                if not record["summary"] and record["score"] > best_chunk["score"]:
                    aggregated[file_hash]["best_chunk"] = record
                # Track summary if provided
                if record["summary"]:
                    aggregated[file_hash]["summary_payload"] = record

        documents = []
        for agg in aggregated.values():
            best = agg.get("best_chunk") or agg
            summary_payload = agg.get("summary_payload")
            documents.append({
                "id": best["id"],
                "score": best["score"],
                "file_path": best["file_path"],
                "content": best["content"],
                "chunk_index": best["chunk_index"],
                "metadata": best["metadata"],
                "summary_preview": summary_payload["content"] if summary_payload else None,
            })

        logger.info(f"Found {len(documents)} documents for query: {query[:50]}")

        return {"success": True, "count": len(documents), "results": documents}

    except Exception as e:
        logger.error(f"Error searching documents: {e}", exc_info=True)
        # Fallback: naive text search over vault files to avoid empty answers on search failure
        try:
            vault_root = Path(settings.vault_path)
            fallback_hits = []
            q_lower = query.lower()
            for path in vault_root.rglob("*.md"):
                try:
                    content = path.read_text(encoding="utf-8")
                    if q_lower in content.lower():
                        fallback_hits.append({
                            "file_path": str(path),
                            "content": content[:400],
                            "metadata": {"fallback": True}
                        })
                        if len(fallback_hits) >= limit:
                            break
                except Exception:
                    continue
            if fallback_hits:
                return {"success": True, "count": len(fallback_hits), "results": fallback_hits, "fallback": True}
        except Exception as inner_exc:
            logger.error(f"Fallback vault scan failed: {inner_exc}", exc_info=True)

        return {"success": False, "error": "Failed to search documents", "results": []}
