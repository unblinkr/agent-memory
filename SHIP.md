# 🚀 Shipping Checklist — Namespace

All code is built and ready. Follow these steps to ship:

---

## Step 1: Create GitHub Repo

```bash
# Create repo at github.com/unblinkr/agent-memory (public)
# OR use gh CLI if available:
gh repo create unblinkr/agent-memory --public --source=. --remote=origin

# Push to GitHub
cd /data/.openclaw/workspace/agent-memory
git remote add origin https://github.com/unblinkr/agent-memory.git
git push -u origin main
```

---

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-schema.sql` and run it
4. Verify:
   - `memories` table exists
   - `search_memories` function exists
   - pgvector extension is enabled

5. Get credentials:
   - **Project URL:** Settings → API → Project URL
   - **Service Role Key:** Settings → API → service_role key (not anon!)

---

## Step 3: Get CDP Credentials

1. Go to [portal.cdp.coinbase.com/projects](https://portal.cdp.coinbase.com/projects)
2. Create a new project (or use existing)
3. Generate API credentials:
   - `CDP_API_KEY_ID`
   - `CDP_API_KEY_SECRET`
4. Note your wallet address for Base network

---

## Step 4: Deploy to Vercel

### Via Web UI (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select `unblinkr/agent-memory`
4. **Add environment variables:**
   ```
   CDP_API_KEY_ID=<your-key-id>
   CDP_API_KEY_SECRET=<your-key-secret>
   WALLET_ADDRESS=<your-base-wallet-address>
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   OPENAI_API_KEY=<your-openai-key>
   NETWORK=eip155:8453
   ```
5. Click **Deploy**

### Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Step 5: Verify API Deployment

### Test Health Endpoint

```bash
curl https://agent-memory.vercel.app/api/health
```

Expected:
```json
{
  "status": "ok",
  "version": "0.1.0",
  "timestamp": "..."
}
```

### Test x402 Payment Flow

```bash
curl -I https://agent-memory.vercel.app/api/namespace/test-agent/remember
```

Expected:
```
HTTP/2 402 Payment Required
x-payment: <base64-payment-details>
```

✅ If you get 402, x402 is working!

---

## Step 6: Publish MCP Server to npm

### Prerequisites

- npm account ([npmjs.com](https://npmjs.com))
- Organization `@namespace-ai` (or rename package to `@your-org/mcp-server`)

### Publish

```bash
cd /data/.openclaw/workspace/agent-memory/mcp-server

# Login to npm
npm login

# Publish
npm publish --access public
```

Verify at: [npmjs.com/package/@namespace-ai/mcp-server](https://npmjs.com/package/@namespace-ai/mcp-server)

---

## Step 7: Test MCP Server Locally

```bash
cd /data/.openclaw/workspace/agent-memory/mcp-server

# Set environment
export NAMESPACE_ID=test-agent
export NAMESPACE_API_URL=https://agent-memory.vercel.app

# Run server
npm start
```

Test in Claude Desktop:
1. Add to config: `~/Library/Application Support/Claude/claude_desktop_config.json`
   ```json
   {
     "mcpServers": {
       "namespace": {
         "command": "node",
         "args": ["/data/.openclaw/workspace/agent-memory/mcp-server/dist/index.js"],
         "env": {
           "NAMESPACE_ID": "test-agent",
           "NAMESPACE_API_URL": "https://agent-memory.vercel.app"
         }
       }
     }
   }
   ```
2. Restart Claude Desktop
3. You should see three new tools: `remember`, `recall`, `forget`

---

## Step 8: Post Ship Notice

Post to **<#1475950803914326036>** (shipping channel):

```
🚀 Namespace is LIVE!

**The Problem:** "Context leak" — when your AI agent loses all memory every session.

**The Solution:** Namespace — persistent identity layer for AI agents. Never start from zero again.

🔗 Live: https://agent-memory.vercel.app
📦 Repo: https://github.com/unblinkr/agent-memory
🤖 MCP Server: npm install -g @namespace-ai/mcp-server

**Features:**
• 3 endpoints: /namespace/{id}/remember, /recall, /forget
• Semantic search via pgvector
• x402 payments (USDC on Base, gasless)
• MCP server for Claude Desktop (zero-code integration)

**Pricing:**
• Free: 1K calls/mo (wallet-gated)
• Pay-as-you-go: $0.001 read / $0.005 write
• Dev: $12/mo (50K memories)
• Pro: $49/mo (500K + graph memory)
• Agent: $8/mo USDC (100K calls)

**Tech Stack:**
Next.js + Supabase pgvector + x402 protocol + OpenAI embeddings + MCP

Coining "context leak" and owning the solution. 🧠
```

---

## Step 9: Directory Submissions (Optional but Recommended)

### MCP Directory

1. Go to [modelcontextprotocol.io](https://modelcontextprotocol.io)
2. Find submission form (or GitHub PR process)
3. Submit `@namespace-ai/mcp-server`

### Product Hunt

- Launch as "Namespace — Stop Losing Context"
- Emphasize "context leak" as the coined term

### Hacker News

- "Show HN: Namespace – Persistent Memory for AI Agents"

---

## Troubleshooting

### Build Fails on Vercel

- Check all env vars are set
- Ensure Node version is 18+ (set in `vercel.json`)
- Review build logs

### 402 Returns 200

- x402 middleware not matching route
- Check wildcard patterns in `lib/x402.js`
- Verify CDP credentials

### MCP Server Can't Connect

- Check `NAMESPACE_API_URL` is correct
- Verify API is deployed and returning 200 on /api/health
- Check Claude Desktop config syntax

### Supabase Errors

- Ensure service role key (not anon key)
- Verify pgvector extension enabled
- Check `search_memories` function exists

---

## Post-Ship Tasks

- [ ] Monitor Vercel logs for errors
- [ ] Check Supabase usage/quota
- [ ] Track OpenAI embedding costs
- [ ] Monitor x402 payment success rate
- [ ] Respond to GitHub issues
- [ ] Update docs based on user feedback

---

**You're ready to ship. Let's go! 🚀**
