// Pure Next.js API route - Delete memories
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: namespace } = req.query;
  const { key, tags } = req.body;

  if (!key && !tags) {
    return res.status(400).json({
      error: 'Missing required field: key OR tags'
    });
  }

  try {
    let query = supabase.from('memories').delete().eq('namespace', namespace);

    if (key) {
      query = query.eq('key', key);
    } else if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    const { error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return res.status(200).json({
      namespace,
      deleted_count: count || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error forgetting memories:', error);
    return res.status(500).json({ 
      error: 'Failed to forget memories',
      details: error.message 
    });
  }
}
