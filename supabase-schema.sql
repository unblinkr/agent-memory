-- Agent Memory API - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  tags TEXT[],
  embedding VECTOR(1536),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(namespace, key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_memories_namespace_expires 
  ON memories (namespace, expires_at);

CREATE INDEX IF NOT EXISTS idx_memories_tags 
  ON memories USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_memories_embedding 
  ON memories USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

-- Function for semantic search
CREATE OR REPLACE FUNCTION search_memories(
  query_namespace TEXT,
  query_embedding VECTOR(1536),
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

-- Clean up expired memories (run periodically via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_memories()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM memories
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
