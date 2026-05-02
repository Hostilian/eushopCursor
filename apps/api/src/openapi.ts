/**
 * Minimal OpenAPI 3.1 description for gateways, API portals, and contract tests.
 * tRPC procedures remain the source of truth; this document covers HTTP surfaces only.
 */
export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Eushop API',
    version: '0.1.0',
    description:
      'Hono + tRPC + Better Auth. JSON-RPC style tRPC at /trpc; session cookies on /api/auth/*.',
  },
  servers: [{ url: '/', description: 'Current host' }],
  paths: {
    '/health': {
      get: {
        summary: 'Liveness',
        responses: {
          '200': {
            description: 'OK',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/trpc/{procedure}': {
      post: {
        summary: 'tRPC (HTTP batching supported)',
        parameters: [
          {
            name: 'procedure',
            in: 'path',
            required: true,
            schema: { type: 'string', example: 'listings.near' },
          },
        ],
        responses: {
          '200': { description: 'tRPC envelope' },
          '429': { description: 'Rate limited' },
        },
      },
    },
    '/api/auth/{path}': {
      get: {
        summary: 'Better Auth (GET)',
        parameters: [{ name: 'path', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Auth response' },
          '429': { description: 'Rate limited' },
        },
      },
      post: {
        summary: 'Better Auth (POST)',
        parameters: [{ name: 'path', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Auth response' },
          '429': { description: 'Rate limited' },
        },
      },
    },
    '/api/inngest': {
      get: { summary: 'Inngest sync', responses: { '200': { description: 'Inngest' } } },
      post: { summary: 'Inngest invoke', responses: { '200': { description: 'Inngest' } } },
    },
  },
} as const;
