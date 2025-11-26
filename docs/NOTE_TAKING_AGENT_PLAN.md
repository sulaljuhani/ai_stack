# Note-Taking Agent Implementation Plan

Goal: add a LangGraph agent that can write structured notes into `/mnt/user/data/vault`, and ensure those notes are embedded into OpenMemory/Qdrant whenever files are created or updated.

## 1) Requirements & Scope
- Create/append/update notes on request (text + optional metadata like tags).
- File writes target `/mnt/user/data/vault` (not the existing appdata vault).
- All new/changed files must be embedded into OpenMemory/Qdrant automatically or via a job.
- Keep single-user assumptions (hardcoded user UUID).
- No cloud dependencies; keep everything local.

## 2) Storage & Mounts
- Add a new docker-compose volume bind for `/mnt/user/data/vault` into `langgraph-agents` and any embedding/file-watcher service that needs direct FS access.
- Introduce `VAULT_PATH` env var (default `/mnt/user/data/vault`) in `.env` and feed through `containers/langgraph-agents/config.py`.
- Validate directory exists at startup; create if missing with correct permissions.

## 3) Agent Design (LangGraph)
- Create `note_agent.py` (or extend `knowledge` if preferred) under `containers/langgraph-agents/agents/`.
- Add to `config/agents.yaml` with routing keywords (`note`, `journal`, `write`, `log`, `append`, `summary`) and enable flag.
- System prompt: concise note-taking persona; instructions to avoid tool noise; enforce markdown output.
- Tools:
  - `write_note`/`append_note`: writes to vault path, creates directories as needed, returns file path + short summary.
  - `list_notes`/`read_note`: optional read/search helpers.
  - Reuse existing search tools (vector + metadata) for retrieval responses.
- Update router/workflow to include the new agent and ensure state pruning rules apply.

## 4) Tooling Implementation
- Create `tools/note_files.py` with safe FS helpers:
  - Validate paths stay within `VAULT_PATH`.
  - Accept `title`, `body`, `tags`, `folder` (default root or `daily/`), `append` flag.
  - Normalize filenames (slug + date), ensure `.md` extension.
  - Return structured envelope `{success, data: {path, action, size}, error}`.
- Update `tools/tool_registry.py` to expose the new tools and include in the agent tool list via tags.

## 5) Embedding & OpenMemory/Qdrant Flow
- Decide ingestion path:
  - Option A: lightweight file watcher (Python) inside `langgraph-agents` to detect FS changes under `VAULT_PATH` and call existing embedding pipeline.
  - Option B: scheduled APScheduler job (e.g., every minute) to diff mtimes and embed changed files.
- Reuse existing embedding utilities (nomic-embed-text) and Qdrant client; add OpenMemory push if available.
- Store last-processed timestamps in Redis or a small state file; avoid re-embedding unchanged files.
- Ensure attachments/binary files are skipped or handled separately.

## 6) API/Router Surface (optional)
- Add REST endpoints under `/api/notes/*` to allow external creation/list/search if desired by UI or tests.
- Pydantic models for request/response validation.

## 7) OpenWebUI Wiring
- Expose the new agent via the existing OpenWebUI adapter/pipe (no change needed if router uses agent keywords).
- Provide example prompts in docs: “Create a note titled ‘Gym Log’ with today’s workout.”

## 8) Configuration & Docs
- Update `.env.example` with `VAULT_PATH`.
- Document in `README.md`/`containers/langgraph-agents/ARCHITECTURE.md` the new agent, tools, and ingestion flow.
- Add a short how-to in `vault/README.md` pointing to the `/mnt/user/data/vault` location for this agent.

## 9) Testing Plan
- Unit-test file path safety and write/append behaviors.
- Integration test: agent call creates note file and returns path; file appears on host.
- Embedding test: modify a note, confirm embedding job pushes vector into Qdrant (check collection counts).
- Regression: ensure existing agents unaffected; run smoke chat via OpenWebUI adapter with sample prompts.

## 10) Rollout Steps
1. Add env/config + compose volume mounts.
2. Implement tools and agent; register in YAML/router.
3. Add ingestion job/watcher for embeddings.
4. Write docs and sample prompts.
5. Run tests + manual chat smoke.

## Status (in progress)
- Vault path added to config/env/compose and bound to `/mnt/user/data/vault`.
- Note tools + Note agent registered; routing/handoff updated.
- Fast vault watcher scheduled every minute; embeds on note writes.
