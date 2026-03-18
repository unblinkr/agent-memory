// Landing page
export default function Home() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🧠 Agent Memory API</h1>
      <p style={{ fontSize: '1.2rem', color: '#666' }}>
        Pay-per-use semantic memory for AI agents. Store, recall, and forget memories using natural language.
        Powered by pgvector + x402 protocol.
      </p>

      <div style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginTop: '2rem' }}>
        <h2>💰 Pricing</h2>
        <ul>
          <li><strong>$0.005 per write</strong> — Store a memory</li>
          <li><strong>$0.001 per read</strong> — Semantic search</li>
          <li><strong>$0.001 per delete</strong> — Forget memories</li>
        </ul>
        <p style={{ fontSize: '0.9rem', color: '#888' }}>
          Paid in USDC on Base (gasless signatures via x402 protocol)
        </p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>📖 Quick Start</h2>
        
        <h3>1. Store a memory</h3>
        <pre style={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`curl -X POST https://agent-memory.vercel.app/api/remember \\
  -H "Content-Type: application/json" \\
  -d '{
    "namespace": "my-agent-id",
    "key": "user-preference",
    "value": {"theme": "dark", "language": "en"},
    "tags": ["preferences", "ui"],
    "ttl_days": 30
  }'`}
        </pre>

        <h3>2. Recall memories (semantic search)</h3>
        <pre style={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`curl -X POST https://agent-memory.vercel.app/api/recall \\
  -H "Content-Type: application/json" \\
  -d '{
    "namespace": "my-agent-id",
    "query": "What are the user interface preferences?",
    "limit": 10
  }'`}
        </pre>

        <h3>3. Forget memories</h3>
        <pre style={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`curl -X DELETE https://agent-memory.vercel.app/api/forget \\
  -H "Content-Type: application/json" \\
  -d '{
    "namespace": "my-agent-id",
    "key": "user-preference"
  }'`}
        </pre>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
        <h3>⚡ How Payment Works</h3>
        <ol>
          <li>Your first request returns <code>402 Payment Required</code></li>
          <li>Your agent signs a gasless USDC transfer on Base</li>
          <li>Include the signature in the <code>X-Payment</code> header</li>
          <li>Get your data instantly</li>
        </ol>
        <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
          Compatible with Coinbase AgentKit and any x402-compatible wallet.
        </p>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center', color: '#888' }}>
        <p>
          <a href="https://github.com/unblinkr/agent-memory" style={{ color: '#0070f3' }}>GitHub</a> 
          {' • '}
          <a href="/api/health" style={{ color: '#0070f3' }}>Health Check</a>
          {' • '}
          Built with x402 protocol
        </p>
      </div>
    </div>
  );
}
