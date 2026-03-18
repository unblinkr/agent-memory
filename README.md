# 🧠 Agent Memory API

Pay-per-use semantic memory for AI agents. Store, recall, and forget memories using natural language queries.

**Live at:** [agent-memory.vercel.app](https://agent-memory.vercel.app) *(after deployment)*

## Features

- 🔍 **Semantic search** — Query memories in natural language
- 💰 **Pay-per-use** — $0.001-$0.005 per request via x402 protocol
- ⚡ **Gasless payments** — USDC on Base, no gas fees
- 🔐 **Namespaced** — Isolated memory spaces per agent
- ⏰ **TTL support** — Auto-expire old memories
- 🏷️ **Tags** — Organize and filter memories

## Quick Start

### 1. Store a Memory

```bash
curl -X POST https://agent-memory.vercel.app/api/remember \
  -H "Content-Type: application/json" \
  -d '{
    "namespace": "my-agent-id",
    "key": "user-preference",
    "value": {"theme": "dark", "language": "en"},
    "tags": ["preferences", "ui"],
    "ttl_days": 30
  }'
```

**Response:**
```json
{
  "id": "uuid",
  "stored_at": "2026-03-18T13:00:00Z",
  "expires_at": "2026-04-17T13:00:00Z"
}
```

### 2. Recall Memories (Semantic Search)

```bash
curl -X POST https://agent-memory.vercel.app/api/recall \
  -H "Content-Type: application/json" \
  -d '{
    "namespace": "my-agent-id",
    "query": "What are the user interface preferences?",
    "limit": 10
  }'
```

**Response:**
```json
{
  "results": [
    {
      "key": "user-preference",
      "value": {"theme": "dark", "language": "en"},
      "tags": ["preferences", "ui"],
      "score": 0.92,
      "stored_at": "2026-03-18T13:00:00Z"
    }
  ],
  "count": 1
}
```

### 3. Forget Memories

```bash
curl -X DELETE https://agent-memory.vercel.app/api/forget \
  -H "Content-Type: application/json" \
  -d '{
    "namespace": "my-agent-id",
    "key": "user-preference"
  }'
```

**Or delete by tags:**
```bash
curl -X DELETE https://agent-memory.vercel.app/api/forget \
  -H "Content-Type: application/json" \
  -d '{
    "namespace": "my-agent-id",
    "tags": ["preferences"]
  }'
```

## Pricing

| Endpoint | Price | Description |
|----------|-------|-------------|
| `POST /api/remember` | $0.005 | Store a memory |
| `POST /api/recall` | $0.001 | Semantic search |
| `DELETE /api/forget` | $0.001 | Delete memories |

Payments via USDC on Base (gasless signatures with x402 protocol).

## Payment Flow

1. First request returns `402 Payment Required` with payment details
2. Your agent signs a gasless USDC transfer on Base
3. Include signature in `X-Payment` header on retry
4. Get your data instantly

Compatible with:
- Coinbase AgentKit
- Any x402-compatible wallet

## Tech Stack

- **Frontend:** Next.js
- **Backend:** Express + x402 middleware
- **Database:** Supabase (pgvector for embeddings)
- **Payments:** x402 protocol (Base mainnet)
- **Embeddings:** OpenAI `text-embedding-3-small`
- **Deployment:** Vercel

## Local Development

### Prerequisites

- Node.js 18+
- Supabase project
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
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL from `supabase-schema.sql` in the SQL Editor
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

### Environment Variables

```env
# Coinbase CDP
CDP_API_KEY_ID=your_key_id
CDP_API_KEY_SECRET=your_key_secret
WALLET_ADDRESS=0xYourAddress

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# OpenAI
OPENAI_API_KEY=sk-your-key

# Network (default: Base mainnet)
NETWORK=eip155:8453
```

## Deployment (Vercel)

1. **Create GitHub repo:**
   ```bash
   gh repo create unblinkr/agent-memory --public
   git remote add origin https://github.com/unblinkr/agent-memory.git
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import `unblinkr/agent-memory`
   - Add environment variables from `.env`
   - Deploy

3. **Verify:**
   ```bash
   curl https://agent-memory.vercel.app/api/health
   ```

## API Reference

### `GET /api/health`

Health check (free).

**Response:**
```json
{
  "status": "ok",
  "version": "0.1.0",
  "timestamp": "2026-03-18T13:00:00Z"
}
```

### `POST /api/remember` 💰

Store a memory with semantic embedding.

**Request:**
```json
{
  "namespace": "string",     // Agent ID or namespace
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
  "stored_at": "timestamp",
  "expires_at": "timestamp"
}
```

### `POST /api/recall` 💰

Semantic search memories by natural language query.

**Request:**
```json
{
  "namespace": "string",     // Agent ID or namespace
  "query": "string",         // Natural language query
  "limit": 10                // Max results (default: 10)
}
```

**Response:**
```json
{
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

### `DELETE /api/forget` 💰

Delete memories by key or tags.

**Request:**
```json
{
  "namespace": "string",     // Agent ID or namespace
  "key": "string",           // Delete specific key (OR)
  "tags": ["string"]         // Delete by tags (OR)
}
```

**Response:**
```json
{
  "deleted_count": 1,
  "timestamp": "timestamp"
}
```

## Security

- Never commit `.env` files
- Use service role key for Supabase (not anon key)
- Namespace isolation prevents cross-agent access
- TTL auto-expires sensitive data

## License

MIT

## Support

- [GitHub Issues](https://github.com/unblinkr/agent-memory/issues)
- Built with [OpenClaw](https://openclaw.ai)
