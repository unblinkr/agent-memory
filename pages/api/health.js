// Health check endpoint (free)
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  res.status(200).json({
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
}
