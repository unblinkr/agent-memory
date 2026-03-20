import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Wallet address required' });
  }

  try {
    // Get or create wallet credits
    const { data: wallet, error } = await supabase
      .from('wallet_credits')
      .select('credits')
      .eq('wallet_address', address.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!wallet) {
      // Create new wallet entry
      await supabase
        .from('wallet_credits')
        .insert({ wallet_address: address.toLowerCase(), credits: 0 });
      
      return res.json({ credits: 0, wallet_address: address });
    }

    return res.json({ credits: wallet.credits, wallet_address: address });
  } catch (error) {
    console.error('Credits fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch credits' });
  }
}
