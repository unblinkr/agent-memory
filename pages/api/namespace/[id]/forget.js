// DELETE /api/namespace/{id}/forget - Delete memories (x402-gated)
import { supabase } from '../../../../lib/supabase.js';
import { createExpressHandler } from '../../../../lib/express-adapter.js';

async function forgetHandler(req, res) {
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

    const { data, error, count } = await query;

    if (error) throw error;

    res.status(200).json({
      namespace,
      deleted_count: count || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error forgetting memories:', error);
    res.status(500).json({ error: 'Failed to forget memories' });
  }
}

export default createExpressHandler(forgetHandler);
