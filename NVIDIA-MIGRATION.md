# NVIDIA Embeddings Migration

**Status:** Migration SQL ready, needs manual execution

**Issue:** Supabase table is configured for 1536-dimension embeddings (OpenAI), but NVIDIA produces 1024-dimension embeddings.

---

## Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **New query**

### Step 2: Run Migration
Copy and paste this SQL:

```sql
-- Migration: Update embeddings from OpenAI (1536) to NVIDIA (1024)

-- Step 1: Drop existing function and index
DROP FUNCTION IF EXISTS search_memories(TEXT, VECTOR(1536), INT);
DROP INDEX IF EXISTS idx_memories_embedding;

-- Step 2: Alter embedding column dimension
ALTER TABLE memories 
  ALTER COLUMN embedding TYPE VECTOR(1024);

-- Step 3: Recreate index with new dimension
CREATE INDEX idx_memories_embedding 
  ON memories USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

-- Step 4: Recreate search function with new dimension
CREATE OR REPLACE FUNCTION search_memories(
  query_namespace TEXT,
  query_embedding VECTOR(1024),
  match_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  namespace TEXT,
  key TEXT,
  value JSONB,
  tags TEXT[],
  similarity FLOAT,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    memories.id,
    memories.namespace,
    memories.key,
    memories.value,
    memories.tags,
    1 - (memories.embedding <=> query_embedding) AS similarity,
    memories.created_at,
    memories.expires_at
  FROM memories
  WHERE memories.namespace = query_namespace
  ORDER BY memories.embedding <=> query_embedding
  LIMIT match_limit;
END;
$$;
```

### Step 3: Click **Run**

You should see: `Success. No rows returned`

### Step 4: Test API
Run this from terminal to verify:

```bash
curl -X POST https://agent-memory-dun.vercel.app/api/namespace/test-001/remember \
  -H "Content-Type: application/json" \
  -d '{"key": "test", "value": "NVIDIA embeddings working", "tags": ["test"]}'
```

Expected response:
```json
{
  "id": "uuid-here",
  "namespace": "test-001",
  "stored_at": "timestamp",
  "expires_at": "timestamp"
}
```

---

## What This Does

- ✅ Updates vector dimension from 1536 → 1024
- ✅ Rebuilds index for efficient search
- ✅ Updates search function signature
- ✅ Preserves existing data (if any)

---

## After Migration

Test all 3 endpoints:

1. **Remember** (store memory)
2. **Recall** (semantic search)
3. **Forget** (delete memory)

See `README.md` for full API documentation.

---

**File:** This migration is also saved as `migration-nvidia-embeddings.sql`
