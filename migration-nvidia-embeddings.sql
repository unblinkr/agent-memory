-- Migration: Update embeddings from OpenAI (1536) to NVIDIA (1024)
-- Run this in your Supabase SQL Editor

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

-- Verify migration
SELECT 
  table_name,
  column_name,
  udt_name,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'memories' AND column_name = 'embedding';
