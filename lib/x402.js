// x402 payment middleware setup
import { webcrypto } from 'crypto';

// Crypto polyfill for x402
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = webcrypto;
}

import { paymentMiddleware, x402ResourceServer } from '@x402/express';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { facilitator } from '@coinbase/x402';
import { createPaywall } from '@x402/paywall';
import { evmPaywall } from '@x402/paywall/evm';

const NETWORK = process.env.NETWORK || 'eip155:8453'; // Base Mainnet
const payTo = process.env.WALLET_ADDRESS;

if (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET || !payTo) {
  console.error('❌ Missing required env vars: CDP_API_KEY_ID, CDP_API_KEY_SECRET, WALLET_ADDRESS');
}

// Initialize x402 clients
const facilitatorClient = new HTTPFacilitatorClient(facilitator);
export const resourceServer = new x402ResourceServer(facilitatorClient)
  .register(NETWORK, new ExactEvmScheme());

export const paywall = createPaywall()
  .withNetwork(evmPaywall)
  .withConfig({
    appName: 'Agent Memory API',
    testnet: false,
  })
  .build();

// Payment routes configuration
export const paymentRoutes = {
  'POST /api/remember/*': {
    accepts: [{
      scheme: 'exact',
      price: '$0.005',
      network: NETWORK,
      payTo
    }],
    description: 'Store a memory with semantic search',
    mimeType: 'application/json',
  },
  'POST /api/recall/*': {
    accepts: [{
      scheme: 'exact',
      price: '$0.001',
      network: NETWORK,
      payTo
    }],
    description: 'Recall memories by semantic search',
    mimeType: 'application/json',
  },
  'DELETE /api/forget/*': {
    accepts: [{
      scheme: 'exact',
      price: '$0.001',
      network: NETWORK,
      payTo
    }],
    description: 'Forget memories by key or tags',
    mimeType: 'application/json',
  },
};

// Create Express-compatible middleware
export function createX402Middleware() {
  return paymentMiddleware(paymentRoutes, resourceServer, undefined, paywall);
}
