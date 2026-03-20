// Pure Next.js API route - Store a memory
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
  const { key, value, tags = [], ttl_days = 30 } = req.body;

  if (!key || !value) {
    return res.status(400).json({
      error: 'Missing required fields: key, value'
    });
  }

  try {
    // Generate embedding
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

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return res.status(200).json({
      id: data.id,
      namespace,
      stored_at: data.created_at,
      expires_at: data.expires_at,
    });
  } catch (error) {
    console.error('Error storing memory:', error);
    return res.status(500).json({ 
      error: 'Failed to store memory',
      details: error.message 
    });
  }
}
