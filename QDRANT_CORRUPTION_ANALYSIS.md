# Qdrant Collection Corruption - Root Cause Analysis

## What Happened During Debugging

### Timeline of Events:

1. **Initial Problem**: Document embeddings weren't being found
   - Cause: Three separate bugs in the code

2. **Bug #1 - Named vs Unnamed Vectors**
   - `store_in_qdrant()` created collections with **unnamed** vectors
   - `store_in_qdrant()` stored points with **unnamed** vectors
   - `search_embedded_documents()` searched for **named** vectors ("vector")
   - **Result**: Search couldn't find the data because it was looking for the wrong vector name

3. **Bug #2 - Wrong Query Syntax**
   - Search used `{"name": "vector", "vector": embedding}` (dict)
   - Should have used `("vector", embedding)` (tuple)

4. **Bug #3 - Score Threshold Too High**
   - Default threshold was 0.7
   - Actual scores were ~0.65
   - **Result**: Valid results were filtered out

### How Corruption Occurred:

During debugging, we made **manual changes** to fix the issues:

1. **First attempt**: Manually recreated vault collection with named vectors
   - BUT: The code still had the bugs
   - Result: New embeddings were stored with **wrong format**

2. **Second attempt**: Fixed the code bugs
   - BUT: Old data in Qdrant was in **incompatible format**
   - Result: **Mixed data formats** in the same collection

3. **Container restarts**: 
   - Each restart potentially re-ran embeddings
   - Some with old code, some with new code
   - Created **inconsistent vector formats** in Qdrant

### The Actual Corruption:

Qdrant panicked with `OutputTooSmall` error because:
- Collection expected **named vectors** `{"vector": [...]}`
- Some points had **unnamed vectors** `[...]`
- Qdrant couldn't deserialize the incompatible formats
- Internal panic/crash occurred

## How to Prevent This in Production

### 1. Code Quality - The Real Fix

The bugs should **never have existed** in the first place:

```python
# ❌ WRONG - Creates unnamed vectors
client.create_collection(
    collection_name='vault',
    vectors_config=VectorParams(size=768, distance=Distance.COSINE)
)

# ✅ CORRECT - Creates named vectors
client.create_collection(
    collection_name='vault',
    vectors_config={
        "vector": VectorParams(size=768, distance=Distance.COSINE)
    }
)
```

**Prevention**: The code is now fixed. These bugs won't happen in normal operation.

### 2. Migration Strategy for Schema Changes

If you need to change vector configurations:

```python
# Don't do this:
# 1. Change code
# 2. Hope it works with existing data ❌

# Do this:
# 1. Create NEW collection with new config
# 2. Migrate data from old to new
# 3. Delete old collection
# 4. Rename new collection ✅
```

### 3. Qdrant Data Persistence

Check your docker-compose.yml:

```yaml
qdrant:
  volumes:
    - ./qdrant_data:/qdrant/storage  # ✅ Persisted
```

**Without persistence**: Data lost on container restart
**With persistence**: Data survives restarts

### 4. Backup Strategy

```bash
# Backup Qdrant snapshots
docker exec qdrant curl -X POST http://localhost:6333/snapshots

# Backup PostgreSQL
docker exec postgres pg_dump -U aistack_user aistack > backup.sql
```

### 5. Monitoring

Add health checks to detect issues early:

```python
# Check collection integrity
async def check_vault_health():
    try:
        client = QdrantClient(...)
        info = client.get_collection('vault')
        
        # Verify vector config
        if not isinstance(info.config.params.vectors, dict):
            logger.error("Vault collection has unnamed vectors!")
            return False
            
        # Try a test search
        test_result = client.search(
            collection_name='vault',
            query_vector=('vector', [0.0] * 768),
            limit=1
        )
        return True
    except Exception as e:
        logger.error(f"Vault health check failed: {e}")
        return False
```

## Normal Operation - No Corruption Risk

Under normal use, corruption won't happen because:

1. ✅ **Code is now fixed** - Consistent vector format
2. ✅ **Single code path** - All embeddings use same function
3. ✅ **No schema changes** - Collection config is stable
4. ✅ **Atomic operations** - Qdrant handles concurrency

## When You Might See Issues

⚠️ **Only during these scenarios**:

1. **Manual database changes** (what we did during debugging)
2. **Code changes to vector schema** without migration
3. **Qdrant version upgrades** without testing
4. **Disk full** - Qdrant can't write properly
5. **Container killed during write** - Incomplete transactions

## Recommendations

### Immediate Actions:
- ✅ Code is fixed - No action needed
- ✅ Vault collection recreated - No action needed
- ✅ Data re-embedded - No action needed

### Long-term Protection:

1. **Add volume mount for Qdrant** (if not already present):
   ```yaml
   qdrant:
     volumes:
       - /mnt/user/appdata/ai_stack/qdrant_data:/qdrant/storage
   ```

2. **Add automated backups**:
   ```bash
   # Weekly backup script
   0 2 * * 0 docker exec postgres pg_dump -U aistack_user aistack > /backup/aistack_$(date +\%Y\%m\%d).sql
   ```

3. **Monitor disk space**:
   ```bash
   # Alert if < 10% free
   df -h | grep /mnt/user
   ```

4. **Keep Qdrant logs**:
   ```yaml
   qdrant:
     logging:
       driver: "json-file"
       options:
         max-size: "10m"
         max-file: "3"
   ```

## Testing Changes Safely

Before making code changes that affect embeddings:

```python
# 1. Create test collection
client.create_collection('vault_test', ...)

# 2. Test with sample data
# 3. Verify search works
# 4. If successful, apply to production
# 5. Keep old collection as backup for 24h
```

## Conclusion

**This corruption was caused by our debugging process, not by normal system operation.**

The fixed code ensures:
- Consistent vector format (named "vector")
- Proper search syntax (tuple format)
- Reasonable score threshold (0.5)

**Your system is now stable and corruption-free for normal use.** 🎉
