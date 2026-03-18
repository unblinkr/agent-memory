// Adapter to run Express middleware in Next.js API routes
import express from 'express';
import { createX402Middleware } from './x402.js';

export function createExpressHandler(handler) {
  const app = express();
  app.use(express.json());
  
  // Apply x402 payment middleware
  app.use(createX402Middleware());
  
  // Add the business logic handler
  app.use(handler);
  
  return async (req, res) => {
    // Adapt Next.js req/res to Express
    return new Promise((resolve, reject) => {
      app(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };
}
