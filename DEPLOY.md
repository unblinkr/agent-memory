# 🚀 Deployment Guide

## Prerequisites

Before deploying, you need:

1. **GitHub repo created** at `github.com/unblinkr/agent-memory` (public)
2. **Supabase project** with pgvector schema
3. **Coinbase CDP credentials** from [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com/projects)
4. **OpenAI API key**
5. **Base wallet address** to receive payments

---

## Step 1: Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor**
3. Copy the contents of `supabase-schema.sql` and run it
4. Verify the `memories` table was created with the `search_memories` function

---

## Step 2: Push to GitHub

```bash
cd /data/.openclaw/workspace/agent-memory

# Set remote (replace with your GitHub username if different)
git remote add origin https://github.com/unblinkr/agent-memory.git

# Push to GitHub
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### Option A: Via Web UI (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select `unblinkr/agent-memory`
4. Add environment variables:
   - `CDP_API_KEY_ID`
   - `CDP_API_KEY_SECRET`
   - `WALLET_ADDRESS`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (use service role, not anon key!)
   - `OPENAI_API_KEY`
   - `NETWORK` (default: `eip155:8453`)
5. Click **Deploy**

### Option B: Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

When prompted, add the environment variables from `.env.example`.

---

## Step 4: Verify Deployment

### Test Health Endpoint (Free)

```bash
curl https://agent-memory.vercel.app/api/health
```

Expected:
```json
{
  "status": "ok",
  "version": "0.1.0",
  "timestamp": "2026-03-18T..."
}
```

### Test Payment Flow (x402)

```bash
curl -I https://agent-memory.vercel.app/api/remember
```

Expected:
```
HTTP/2 402 Payment Required
x-payment: <base64-encoded-payment-details>
```

If you get `402 Payment Required`, **x402 is working!** 🎉

---

## Step 5: Ship Notice

Post to **#shipping** channel:

```
🚀 Agent Memory API is LIVE!

URL: https://agent-memory.vercel.app
Repo: https://github.com/unblinkr/agent-memory

3 endpoints:
• POST /api/remember ($0.005) — Store memories
• POST /api/recall ($0.001) — Semantic search
• DELETE /api/forget ($0.001) — Delete memories

Payments: x402 protocol (USDC on Base, gasless)
Tech: Next.js + Supabase pgvector + x402
```

---

## Troubleshooting

### Build Fails on Vercel

- Make sure all environment variables are set
- Check that Node version is 18+ (set in `vercel.json`)
- Review build logs for missing dependencies

### 402 Returns 200 Instead

- x402 middleware not matching route (check wildcard patterns)
- Missing CDP credentials
- Check Vercel logs for errors

### Supabase Errors

- Ensure you're using **service role key**, not anon key
- Verify pgvector extension is enabled
- Check that `search_memories` function exists

### Payment Not Verifying

- Ensure `WALLET_ADDRESS` is correct for Base network
- Check CDP credentials are valid
- Verify agent is using correct network (eip155:8453)

---

## Post-Deployment Checklist

- [ ] Health endpoint returns 200
- [ ] Paid endpoints return 402 before payment
- [ ] Supabase connection works
- [ ] Embeddings generation works (OpenAI)
- [ ] Payment verification works (test with agent)
- [ ] Landing page displays correctly
- [ ] README examples are accurate
- [ ] Ship notice posted to #shipping

---

## Optional: Custom Domain

1. In Vercel dashboard, go to **Settings > Domains**
2. Add your custom domain (e.g., `api.agentmemory.com`)
3. Update DNS records as instructed
4. Update all curl examples in README

---

## Monitoring

Monitor via:
- **Vercel Dashboard:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **Supabase Dashboard:** Database activity, API logs
- **OpenAI Usage:** [platform.openai.com/usage](https://platform.openai.com/usage)
- **CDP Dashboard:** Payment tracking

---

## Next Steps (Future Improvements)

- [ ] Add rate limiting (per namespace)
- [ ] Usage dashboard (analytics)
- [ ] Webhook notifications for memory events
- [ ] Batch operations (bulk store/recall)
- [ ] Memory sharing between namespaces
- [ ] Alternative payment methods (Stripe for humans)

---

**Questions?** Open an issue at [github.com/unblinkr/agent-memory/issues](https://github.com/unblinkr/agent-memory/issues)
