// Pure Next.js API route - Semantic search memories
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: namespace } = req.query;
  const { query, limit = 10 } = req.body;

  if (!query) {
    return res.status(400).json({
      error: 'Missing required field: query'
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

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

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

    return res.status(200).json({ 
      namespace,
      results, 
      count: results.length 
    });
  } catch (error) {
    console.error('Error recalling memories:', error);
    return res.status(500).json({ 
      error: 'Failed to recall memories',
      details: error.message 
    });
  }
}
