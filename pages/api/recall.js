// POST /api/recall - Semantic search memories (x402-gated)
import { supabase } from '../../lib/supabase.js';
import { generateEmbedding } from '../../lib/embeddings.js';
import { createExpressHandler } from '../../lib/express-adapter.js';

async function recallHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { namespace, query, limit = 10 } = req.body;

  if (!namespace || !query) {
    return res.status(400).json({
      error: 'Missing required fields: namespace, query'
    });
  }

  try {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Perform semantic search using pgvector
    const { data, error } = await supabase.rpc('search_memories', {
      query_namespace: namespace,
      query_embedding: queryEmbedding,
      match_limit: limit,
    });

    if (error) throw error;

    // Filter out expired memories and format results
    const now = new Date();
    const results = (data || [])
      .filter(row => !row.expires_at || new Date(row.expires_at) > now)
      .map(row => ({
        key: row.key,
        value: row.value,
        tags: row.tags,
        score: row.similarity,
        stored_at: row.created_at,
      }));

    res.status(200).json({ results, count: results.length });
  } catch (error) {
    console.error('Error recalling memories:', error);
    res.status(500).json({ error: 'Failed to recall memories' });
  }
}

export default createExpressHandler(recallHandler);
