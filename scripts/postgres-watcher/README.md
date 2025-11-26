# AI Stack - Vault Watcher (Postgres-Aware)

Watches the vault for `.md` changes and re-embeds via the LangGraph API, skipping unchanged files by consulting the `vault_files` table when Postgres creds are provided.

## Quick start
```bash
cd /mnt/user/appdata/ai_stack/scripts/postgres-watcher
POSTGRES_PASSWORD=your_pw \
VAULT_DIR=/mnt/user/data/vault \
LANGGRAPH_API_URL=http://localhost:8000 \
./watch-vault-with-postgres.sh
```

## Environment variables
| Variable | Default | Purpose |
|----------|---------|---------|
| `VAULT_DIR` | `/mnt/user/data/vault` | Vault path to watch |
| `LANGGRAPH_API_URL` | `http://localhost:8000` | LangGraph API base URL |
| `DEBOUNCE_SECONDS` | `5` | Debounce between events for same file |
| `POSTGRES_HOST` | `postgres` | Postgres host |
| `POSTGRES_PORT` | `5432` | Postgres port |
| `POSTGRES_DB` | `aistack` | Database name |
| `POSTGRES_USER` | `aistack_user` | Database user |
| `POSTGRES_PASSWORD` | _(required for hash skip)_ | Database password |

## Notes
- Requires `inotifywait` and `psql` on the host.
- If Postgres variables or `psql` are missing, it still works but will re-embed on every event.
- Targets `/api/vault/reembed` in the LangGraph service; ensure the service is reachable from the host.***
