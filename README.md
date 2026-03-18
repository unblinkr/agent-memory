# 🧠 Namespace

**Stop losing context. Your AI agent deserves permanent memory.**

Namespace solves "context leak"—the moment your AI session ends and forgets everything. User preferences? Gone. Previous decisions? Vanished. Work in progress? Lost forever.

Not anymore.

**Live at:** [agent-memory.vercel.app](https://agent-memory.vercel.app)

---

## The Problem: Context Leak

Every time your AI agent's session ends—timeout, restart, new chat—it forgets:
- User preferences & settings
- API keys & credentials
- Previous conversations & decisions
- Work in progress
- Everything you taught it

**This is context leak.** And it's everywhere.

---

## The Solution: Namespace

Namespace is a persistent identity layer for AI agents. Each agent gets a "namespace"—a pocket of memory that survives:

✅ Session timeouts  
✅ Chat restarts  
✅ Application crashes  
✅ Model switches  
✅ Anything  

Your agent writes to it. Reads from it. **Never starts from zero again.**

---

## Features

🔍 **Semantic search** — Query memories in natural language  
💰 **Pay-per-use** — From free tier to $49/mo pro plans  
⚡ **Gasless payments** — USDC on Base via x402 protocol  
🔐 **Namespaced** — Isolated memory per agent  
⏰ **TTL support** — Auto-expire old memories  
🏷️ **Tags** — Organize and filter memories  
🤖 **MCP compatible** — Works with Claude Desktop out of the box  

---

## Quick Start

### Option 1: MCP Server (Claude Desktop)

Install the MCP server:

```bash
npm install -g @namespace-ai/mcp-server
```

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "namespace": {
      "command": "namespace-mcp",
      "env": {
        "NAMESPACE_ID": "your-unique-namespace-id"
      }
    }
  }
}
```

Restart Claude Desktop. You now have three new tools:
- `remember` — Store a memory
- `recall` — Search memories semantically  
- `forget` — Delete memories

### Option 2: Direct API

```bash
# Store a memory
curl -X POST https://agent-memory.vercel.app/api/namespace/my-agent/remember \
  -H "Content-Type: application/json" \
  -d '{
    "key": "user-theme",
    "value": {"theme": "dark", "language": "en"},
    "tags": ["preferences"],
    "ttl_days": 30
  }'

# Recall memories (semantic search)
curl -X POST https://agent-memory.vercel.app/api/namespace/my-agent/recall \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the user interface preferences?",
    "limit": 10
  }'

# Forget a memory
curl -X DELETE https://agent-memory.vercel.app/api/namespace/my-agent/forget \
  -H "Content-Type: application/json" \
  -d '{"key": "user-theme"}'
```

---

## Pricing

| Plan | Price | Includes | Payment |
|------|-------|----------|---------|
| **Free** | $0 | 1,000 calls/mo | Wallet-gated |
| **Pay-as-you-go** | x402 | $0.001 read / $0.005 write | USDC on Base |
| **Dev** | $12/mo | 50K memories | Stripe or crypto |
| **Pro** | $49/mo | 500K memories + graph memory | Stripe or crypto |
| **Agent** | $8/mo | 100K calls/mo flat rate | USDC only |

---

## API Reference

### `POST /api/namespace/{id}/remember`

Store a memory with semantic embedding.

**Request:**
```json
{
  "key": "string",           // Unique key within namespace
  "value": any,              // Any JSON value
  "tags": ["string"],        // Optional tags
  "ttl_days": 30             // Days until auto-delete
}
```

**Response:**
```json
{
  "id": "uuid",
  "namespace": "my-agent",
  "stored_at": "timestamp",
  "expires_at": "timestamp"
}
```

---

### `POST /api/namespace/{id}/recall`

Semantic search memories by natural language query.

**Request:**
```json
{
  "query": "string",         // Natural language query
  "limit": 10                // Max results (default: 10)
}
```

**Response:**
```json
{
  "namespace": "my-agent",
  "results": [
    {
      "key": "string",
      "value": any,
      "tags": ["string"],
      "score": 0.92,          // Similarity score (0-1)
      "stored_at": "timestamp"
    }
  ],
  "count": 1
}
```

---

### `DELETE /api/namespace/{id}/forget`

Delete memories by key or tags.

**Request:**
```json
{
  "key": "string",           // Delete specific key (OR)
  "tags": ["string"]         // Delete by tags (OR)
}
```

**Response:**
```json
{
  "namespace": "my-agent",
  "deleted_count": 1,
  "timestamp": "timestamp"
}
```

---

## Use Cases

- 👤 **User Preferences** — Theme, language, settings
- 🔑 **API Keys** — Store securely, recall when needed
- 📝 **Work in Progress** — Resume tasks across sessions
- 🎯 **Decision History** — Remember why you decided that
- 🔗 **Cross-Session Context** — Build long-term projects
- 🤖 **Agent Coordination** — Share memory between agents

---

## Tech Stack

- **Frontend:** Next.js
- **Backend:** Express + x402 middleware
- **Database:** Supabase (pgvector for embeddings)
- **Payments:** x402 protocol (Base mainnet)
- **Embeddings:** OpenAI `text-embedding-3-small`
- **MCP:** Model Context Protocol server
- **Deployment:** Vercel

---

## Local Development

### Prerequisites

- Node.js 18+
- Supabase project with pgvector
- OpenAI API key
- Coinbase CDP credentials ([portal.cdp.coinbase.com](https://portal.cdp.coinbase.com))
- Wallet address (Base network)

### Setup

1. **Clone and install:**
   ```bash
   git clone https://github.com/unblinkr/agent-memory.git
   cd agent-memory
   npm install
   ```

2. **Set up Supabase:**
   - Create a project at [supabase.com](https://supabase.com)
   - Run `supabase-schema.sql` in the SQL Editor
   - Enable pgvector extension

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Fill in your credentials
   ```

4. **Run dev server:**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000)

5. **Build MCP server:**
   ```bash
   cd mcp-server
   npm install
   npm run build
   npm start
   ```

---

## Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

**Quick version:**

1. Push to GitHub: `github.com/unblinkr/agent-memory`
2. Connect to Vercel
3. Add environment variables
4. Deploy
5. Publish MCP server: `cd mcp-server && npm publish`

---

## Contributing

We're coining "context leak" and owning the solution. Help us spread the word:

- Star this repo ⭐
- Share on X/Twitter
- Submit to MCP directory
- Build integrations

---

## License

MIT

---

## Support

- [GitHub Issues](https://github.com/unblinkr/agent-memory/issues)
- Built with [OpenClaw](https://openclaw.ai)
- Powered by [Model Context Protocol](https://modelcontextprotocol.io)

---

**Stop losing context. Start using Namespace.**
