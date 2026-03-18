# Namespace MCP Server

Model Context Protocol server for **Namespace** — persistent memory for AI agents.

Stop losing context every time your session restarts. With Namespace, your AI agent remembers across sessions, timeouts, and new chats.

## Installation

```bash
npm install -g @namespace-ai/mcp-server
```

## Usage with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "namespace": {
      "command": "namespace-mcp",
      "env": {
        "NAMESPACE_ID": "your-unique-namespace-id",
        "NAMESPACE_API_URL": "https://agent-memory.vercel.app"
      }
    }
  }
}
```

Then restart Claude Desktop. You'll see three new tools:
- `remember` — Store a memory
- `recall` — Search memories semantically
- `forget` — Delete memories

## Environment Variables

- `NAMESPACE_ID` — Your unique namespace identifier (required)
- `NAMESPACE_API_URL` — API endpoint (default: `https://agent-memory.vercel.app`)

## Tools

### `remember`

Store a memory that survives session restarts.

```typescript
{
  key: "user-preference",
  value: { theme: "dark", language: "en" },
  tags: ["preferences", "ui"],
  ttl_days: 30
}
```

### `recall`

Search memories using natural language.

```typescript
{
  query: "What are the user's UI preferences?",
  limit: 10
}
```

### `forget`

Delete memories by key or tags.

```typescript
// Delete by key
{ key: "user-preference" }

// Delete by tags
{ tags: ["preferences"] }
```

## Pricing

- **Free tier:** 1,000 calls/month (wallet-gated)
- **Pay-as-you-go:** $0.001/read, $0.005/write (x402 protocol)
- **Dev plan:** $12/mo (50K memories)
- **Pro plan:** $49/mo (500K memories + graph memory)
- **Agent plan:** $8/mo USDC (100K calls)

See [namespace.ai](https://agent-memory.vercel.app) for details.

## Development

```bash
# Clone repo
git clone https://github.com/unblinkr/agent-memory.git
cd agent-memory/mcp-server

# Install deps
npm install

# Build
npm run build

# Run locally
npm start
```

## License

MIT
