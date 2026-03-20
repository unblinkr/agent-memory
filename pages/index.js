import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base
const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function'
  }
];

function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [credits, setCredits] = useState(null);
  
  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address
  });

  useEffect(() => {
    if (address) {
      fetch(`/api/credits/${address}`)
        .then(res => res.json())
        .then(data => setCredits(data.credits))
        .catch(err => console.error('Credits fetch error:', err));
    }
  }, [address]);

  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: connectors[0] })}
        style={{
          background: 'linear-gradient(90deg, #667eea, #764ba2)',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '1rem'
        }}
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <div style={{
        background: 'rgba(102, 126, 234, 0.1)',
        border: '1px solid #667eea',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        fontSize: '0.9rem'
      }}>
        <div style={{ marginBottom: '0.25rem', color: '#666' }}>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
          <span>
            💰 {usdcBalance ? parseFloat(formatUnits(usdcBalance, 6)).toFixed(2) : '0.00'} USDC
          </span>
          <span>
            🎫 {credits ?? '...'} credits
          </span>
        </div>
      </div>
      <button
        onClick={() => disconnect()}
        style={{
          background: 'transparent',
          color: '#666',
          border: '1px solid #ddd',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '0.9rem'
        }}
      >
        Disconnect
      </button>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.6 }}>
      {/* Hero */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '4rem 2rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem'
        }}>
          <WalletButton />
        </div>
        
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '800', 
            marginBottom: '1rem',
            lineHeight: 1.2
          }}>
            Your AI agent is leaking context.<br/>Every. Single. Session.
          </h1>
          <p style={{ fontSize: '1.4rem', opacity: 0.95, marginBottom: '2rem' }}>
            Session expired? Chat restarted? All your context—gone.<br/>
            <strong>Namespace</strong> gives your AI agent permanent memory.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#pricing" style={{
              background: 'white',
              color: '#667eea',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.1rem'
            }}>
              See Pricing →
            </a>
            <a href="#quickstart" style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.1rem',
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
              Quick Start
            </a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem' }}>
        
        {/* What is Context Leak */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>What is "Context Leak"?</h2>
          <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '2rem' }}>
            Every time your AI session ends—timeout, restart, new chat—your agent forgets <em>everything</em>. 
            User preferences. Previous decisions. Work in progress. All gone.
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem',
            marginTop: '2rem'
          }}>
            <div style={{ padding: '1.5rem', background: '#fff3cd', borderRadius: '8px' }}>
              <strong style={{ fontSize: '1.2rem' }}>❌ Without Namespace</strong>
              <p style={{ marginTop: '0.5rem', color: '#666' }}>
                "What was that API key you gave me?"<br/>
                <em>"I don't have access to previous conversations."</em>
              </p>
            </div>
            <div style={{ padding: '1.5rem', background: '#d4edda', borderRadius: '8px' }}>
              <strong style={{ fontSize: '1.2rem' }}>✅ With Namespace</strong>
              <p style={{ marginTop: '0.5rem', color: '#666' }}>
                "What was that API key you gave me?"<br/>
                <em>"Your OpenAI key is sk-proj-..."</em>
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ marginBottom: '4rem', background: '#f8f9fa', padding: '2rem', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧠</div>
              <strong>1. Remember</strong>
              <p style={{ color: '#666', marginTop: '0.5rem' }}>
                Store anything: preferences, facts, decisions, API keys
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
              <strong>2. Recall</strong>
              <p style={{ color: '#666', marginTop: '0.5rem' }}>
                Semantic search in natural language—no exact queries needed
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🗑️</div>
              <strong>3. Forget</strong>
              <p style={{ color: '#666', marginTop: '0.5rem' }}>
                Delete by key or tags when memories expire or change
              </p>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section id="quickstart" style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Quick Start</h2>
          
          <h3 style={{ marginTop: '2rem' }}>Option 1: MCP Server (Claude Desktop)</h3>
          <pre style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            overflow: 'auto',
            fontSize: '0.9rem'
          }}>
{`npm install -g @lobsterbarorg/namespace-mcp-server

# Add to ~/Library/Application Support/Claude/claude_desktop_config.json:
{
  "mcpServers": {
    "namespace": {
      "command": "npx @lobsterbarorg/namespace-mcp-server",
      "env": {
        "NAMESPACE_ID": "your-unique-id"
      }
    }
  }
}`}
          </pre>

          <h3 style={{ marginTop: '2rem' }}>Option 2: Direct API</h3>
          <pre style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            overflow: 'auto',
            fontSize: '0.9rem'
          }}>
{`# Store a memory
curl -X POST https://agent-memory-dun.vercel.app/api/namespace/my-agent/remember \\
  -H "Content-Type: application/json" \\
  -d '{"key": "api-key", "value": "sk-proj-123...", "ttl_days": 30}'

# Recall a memory
curl -X POST https://agent-memory-dun.vercel.app/api/namespace/my-agent/recall \\
  -H "Content-Type: application/json" \\
  -d '{"query": "What is my API key?"}'`}
          </pre>

          <h3 style={{ marginTop: '2rem' }}>Option 3: Connect Wallet & Test Live</h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Connect your wallet above to pre-fund your namespace with USDC on Base.
            Then use the quickstart commands with your wallet address to deduct credits automatically.
          </p>
        </section>

        {/* Pricing */}
        <section id="pricing" style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>Pricing</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '1.5rem'
          }}>
            {[
              { name: 'Free', price: '$0', desc: '1,000 calls/mo', note: 'Wallet = identity', highlight: false },
              { name: 'Pay-as-you-go', price: 'x402', desc: '$0.01 read / $0.05 write', note: 'USDC on Base', highlight: false },
              { name: 'Dev', price: '$12', desc: '50K memories/mo', note: 'Stripe or crypto', highlight: true },
              { name: 'Pro', price: '$49', desc: '500K memories + graph', note: 'Advanced features', highlight: false },
              { name: 'Agent', price: '$8', desc: '100K calls/mo flat', note: 'USDC only', highlight: false },
            ].map(tier => (
              <div key={tier.name} style={{
                border: tier.highlight ? '3px solid #667eea' : '1px solid #ddd',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
                background: tier.highlight ? '#f0f4ff' : 'white',
                position: 'relative'
              }}>
                {tier.highlight && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#667eea',
                    color: 'white',
                    padding: '0.25rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>POPULAR</div>
                )}
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{tier.name}</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#667eea', marginBottom: '0.5rem' }}>
                  {tier.price}
                </div>
                <p style={{ marginBottom: '0.5rem', color: '#555' }}>{tier.desc}</p>
                <p style={{ fontSize: '0.85rem', color: '#888' }}>{tier.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Use Cases</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { icon: '👤', title: 'User Preferences', desc: 'Theme, language, notification settings—never ask twice' },
              { icon: '🔑', title: 'API Keys & Secrets', desc: 'Store securely, recall when needed, auto-expire' },
              { icon: '📝', title: 'Work in Progress', desc: 'Resume tasks across sessions without losing context' },
              { icon: '🎯', title: 'Decision History', desc: 'Remember why you made that choice 3 weeks ago' },
              { icon: '🔗', title: 'Cross-Session Context', desc: 'Build long-term projects without starting over' },
              { icon: '🤖', title: 'Agent Coordination', desc: 'Share memory between multiple AI agents' },
            ].map(useCase => (
              <div key={useCase.title} style={{ 
                display: 'flex', 
                gap: '1rem', 
                padding: '1rem', 
                background: '#f8f9fa', 
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '2rem' }}>{useCase.icon}</div>
                <div>
                  <strong>{useCase.title}</strong>
                  <p style={{ color: '#666', marginTop: '0.25rem' }}>{useCase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{ textAlign: 'center', padding: '2rem 0', borderTop: '1px solid #eee', color: '#888' }}>
          <p>
            <a href="https://github.com/unblinkr/agent-memory" style={{ color: '#667eea', marginRight: '1.5rem' }}>GitHub</a>
            <a href="/api/health" style={{ color: '#667eea', marginRight: '1.5rem' }}>Health Check</a>
            <a href="https://modelcontextprotocol.io" style={{ color: '#667eea' }}>Powered by MCP</a>
          </p>
          <p style={{ marginTop: '1rem' }}>
            Built with x402 protocol • Base network • OpenClaw
          </p>
        </footer>

      </div>
    </div>
  );
}
