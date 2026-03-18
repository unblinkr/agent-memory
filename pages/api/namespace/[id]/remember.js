// POST /api/namespace/{id}/remember - Store a memory (x402-gated)
import { supabase } from '../../../../lib/supabase.js';
import { generateEmbedding } from '../../../../lib/embeddings.js';
import { createExpressHandler } from '../../../../lib/express-adapter.js';

async function rememberHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: namespace } = req.query;
  const { key, value, tags = [], ttl_days = 30 } = req.body;

  if (!key || !value) {
    return res.status(400).json({
      error: 'Missing required fields: key, value'
    });
  }

  try {
    // Generate embedding from value
    const textToEmbed = typeof value === 'string' ? value : JSON.stringify(value);
    const embedding = await generateEmbedding(textToEmbed);

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttl_days);

    // Store in Supabase
    const { data, error } = await supabase
      .from('memories')
      .upsert({
        namespace,
        key,
        value,
        tags,
        embedding,
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'namespace,key'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      id: data.id,
      namespace,
      stored_at: data.created_at,
      expires_at: data.expires_at,
    });
  } catch (error) {
    console.error('Error storing memory:', error);
    res.status(500).json({ error: 'Failed to store memory' });
  }
}

export default createExpressHandler(rememberHandler);
