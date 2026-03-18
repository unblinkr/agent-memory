#!/usr/bin/env node
/**
 * Namespace MCP Server
 * Persistent memory for AI agents via Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { config } from 'dotenv';

config();

const API_BASE = process.env.NAMESPACE_API_URL || 'https://agent-memory.vercel.app';
const DEFAULT_NAMESPACE = process.env.NAMESPACE_ID || 'default';

interface RememberArgs {
  key: string;
  value: any;
  tags?: string[];
  ttl_days?: number;
  namespace?: string;
}

interface RecallArgs {
  query: string;
  limit?: number;
  namespace?: string;
}

interface ForgetArgs {
  key?: string;
  tags?: string[];
  namespace?: string;
}

// Create server instance
const server = new Server(
  {
    name: 'namespace-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'remember',
        description: 'Store a memory in your namespace. Survives session restarts and timeouts.',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Unique identifier for this memory',
            },
            value: {
              description: 'The data to store (any JSON value)',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional tags for organizing memories',
            },
            ttl_days: {
              type: 'number',
              description: 'Days until auto-expire (default: 30)',
            },
            namespace: {
              type: 'string',
              description: 'Namespace ID (defaults to NAMESPACE_ID env var)',
            },
          },
          required: ['key', 'value'],
        },
      },
      {
        name: 'recall',
        description: 'Search your namespace memories using natural language. Returns ranked results.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Natural language search query',
            },
            limit: {
              type: 'number',
              description: 'Max results to return (default: 10)',
            },
            namespace: {
              type: 'string',
              description: 'Namespace ID (defaults to NAMESPACE_ID env var)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'forget',
        description: 'Delete memories from your namespace by key or tags.',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Specific key to delete',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Delete all memories with these tags',
            },
            namespace: {
              type: 'string',
              description: 'Namespace ID (defaults to NAMESPACE_ID env var)',
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'remember': {
        const { key, value, tags, ttl_days, namespace } = args as RememberArgs;
        const ns = namespace || DEFAULT_NAMESPACE;
        
        const response = await fetch(`${API_BASE}/api/namespace/${ns}/remember`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value, tags, ttl_days }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return {
          content: [
            {
              type: 'text',
              text: `✓ Memory stored in namespace "${ns}"\nKey: ${key}\nExpires: ${data.expires_at}`,
            },
          ],
        };
      }

      case 'recall': {
        const { query, limit, namespace } = args as RecallArgs;
        const ns = namespace || DEFAULT_NAMESPACE;

        const response = await fetch(`${API_BASE}/api/namespace/${ns}/recall`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, limit }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.count === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No memories found for query: "${query}"`,
              },
            ],
          };
        }

        const results = data.results
          .map((r: any, i: number) => 
            `${i + 1}. [${r.key}] (score: ${r.score.toFixed(2)})\n   ${JSON.stringify(r.value)}\n   Tags: ${r.tags?.join(', ') || 'none'}`
          )
          .join('\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `Found ${data.count} memories in namespace "${ns}":\n\n${results}`,
            },
          ],
        };
      }

      case 'forget': {
        const { key, tags, namespace } = args as ForgetArgs;
        const ns = namespace || DEFAULT_NAMESPACE;

        if (!key && !tags) {
          throw new Error('Must provide either key or tags');
        }

        const response = await fetch(`${API_BASE}/api/namespace/${ns}/forget`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, tags }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return {
          content: [
            {
              type: 'text',
              text: `✓ Deleted ${data.deleted_count} memories from namespace "${ns}"`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Namespace MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
