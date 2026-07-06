import { z } from 'zod';
import { API_BASE_URL, APP_VERSION } from './constants';
import { ERROR_CODES } from './envelope';
import { buildQuerySchema } from '../sources/query';
import { listSources } from '../sources/registry';
import type { DataSource } from '../sources/types';

// Generator choice (task 4.1, recorded 2026-07-06): zod v4's native
// z.toJSONSchema() emits JSON Schema draft 2020-12 — the dialect OpenAPI 3.1
// is built on — so the registry-driven document needs no extra dependency and
// no OpenAPIHono route rewrite. Query params use io:'input' so coercions and
// transforms document what the client actually sends. Revisit only if we need
// features this can't express (request bodies land with tasks 6/8).

type JsonObject = Record<string, unknown>;

function toSchema(schema: z.ZodType): JsonObject {
  const generated = z.toJSONSchema(schema, { io: 'input' }) as JsonObject;
  delete generated.$schema; // fragment inside the document, not a standalone schema
  return generated;
}

const errorEnvelopeSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.enum(ERROR_CODES),
    message: z.string(),
    docs_url: z.string(),
    details: z.unknown().optional(),
  }),
});

function successEnvelope(data: z.ZodType, meta?: z.ZodType): JsonObject {
  return toSchema(
    z.object({
      ok: z.literal(true),
      data,
      ...(meta ? { meta } : {}),
    }),
  );
}

function jsonResponse(description: string, schema: JsonObject): JsonObject {
  return { description, content: { 'application/json': { schema } } };
}

function errorResponse(description: string): JsonObject {
  return jsonResponse(description, { $ref: '#/components/schemas/ErrorEnvelope' });
}

function queryParameters(source: DataSource): JsonObject[] {
  return Object.entries(buildQuerySchema(source).shape).map(([name, field]) => ({
    name,
    in: 'query',
    required: false,
    schema: toSchema(field as z.ZodType),
  }));
}

const paginationMeta = z.object({
  source: z.string(),
  page: z.int(),
  per_page: z.int(),
  total: z.int(),
  last_refreshed_at: z.string().nullable(),
});

function sourcePathItem(source: DataSource): JsonObject {
  return {
    get: {
      operationId: `query_${source.slug.replaceAll('-', '_')}`,
      summary: source.title,
      description: source.description,
      tags: ['data'],
      security: [{ bearerAuth: [] }],
      parameters: queryParameters(source),
      responses: {
        '200': jsonResponse(
          `Matching ${source.title} records`,
          successEnvelope(z.array(source.recordSchema), paginationMeta),
        ),
        '400': errorResponse('Invalid query parameters (see error.details)'),
        '401': errorResponse('Missing, unknown, or revoked API key'),
        '402': errorResponse('Monthly credit quota exhausted (code: quota_exceeded)'),
        '429': errorResponse('Rate limit exceeded (see Retry-After header)'),
        '503': errorResponse('Source temporarily unavailable, retry later'),
      },
    },
  };
}

const issuedKeySchema = z.object({
  id: z.string(),
  key: z.string(),
  plan: z.string(),
  credits: z.number(),
  message: z.string(),
});

const billingPaths: JsonObject = {
  '/v1/billing/checkout': {
    post: {
      operationId: 'create_checkout',
      summary: 'Create a Stripe Checkout session for a paid plan',
      tags: ['platform'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: toSchema(z.object({ plan: z.string() })) },
        },
      },
      responses: {
        '200': jsonResponse(
          'Checkout session created',
          successEnvelope(z.object({ url: z.string().nullable(), plan: z.string() })),
        ),
        '400': errorResponse('Unknown plan'),
        '401': errorResponse('Missing, unknown, or revoked API key'),
        '503': errorResponse('Billing not configured'),
      },
    },
  },
  '/v1/billing/portal': {
    get: {
      operationId: 'billing_portal',
      summary: 'Get a Stripe customer-portal link (manage/cancel subscription)',
      tags: ['platform'],
      security: [{ bearerAuth: [] }],
      responses: {
        '200': jsonResponse('Portal link', successEnvelope(z.object({ url: z.string() }))),
        '401': errorResponse('Missing, unknown, or revoked API key'),
        '404': errorResponse('No billing account for this key'),
        '503': errorResponse('Billing not configured'),
      },
    },
  },
};

const waitlistPath: JsonObject = {
  '/v1/waitlist': {
    post: {
      operationId: 'join_waitlist',
      summary: 'Join the launch waitlist (email only, GDPR-minimal)',
      tags: ['platform'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: toSchema(z.object({ email: z.email(), source: z.string().optional() })),
          },
        },
      },
      responses: {
        '200': jsonResponse(
          'Subscribed (idempotent)',
          successEnvelope(z.object({ subscribed: z.boolean() })),
        ),
        '400': errorResponse('Invalid request body'),
        '429': errorResponse('Rate limit exceeded'),
      },
    },
  },
};

const usagePath: JsonObject = {
  '/v1/usage': {
    get: {
      operationId: 'get_usage',
      summary: 'Current-period credit usage for the presented key (free to call)',
      tags: ['platform'],
      security: [{ bearerAuth: [] }],
      responses: {
        '200': jsonResponse(
          'Usage summary',
          successEnvelope(
            z.object({
              plan: z.string(),
              period: z.string(),
              used: z.number(),
              granted: z.number(),
              remaining: z.number(),
              alerts: z.array(z.string()),
            }),
          ),
        ),
        '401': errorResponse('Missing, unknown, or revoked API key'),
      },
    },
  },
};

const keysPaths: JsonObject = {
  '/v1/keys': {
    post: {
      operationId: 'create_key',
      summary: 'Issue a free-tier API key (shown once, store it immediately)',
      tags: ['platform'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: toSchema(
              z.object({ email: z.email(), name: z.string().max(100).optional() }),
            ),
          },
        },
      },
      responses: {
        '201': jsonResponse('Key issued — the raw key is never shown again', successEnvelope(issuedKeySchema)),
        '400': errorResponse('Invalid request body'),
        '429': errorResponse('Too many keys issued from this IP'),
      },
    },
    delete: {
      operationId: 'revoke_key',
      summary: 'Revoke the presented API key (self-serve)',
      tags: ['platform'],
      security: [{ bearerAuth: [] }],
      responses: {
        '200': jsonResponse('Key revoked', successEnvelope(z.object({ revoked: z.boolean() }))),
        '401': errorResponse('Missing, unknown, or revoked API key'),
      },
    },
  },
};

const sourceListingSchema = z.array(
  z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    supported_params: z.array(z.string()),
    refresh_cron: z.string(),
    credit_cost: z.number(),
  }),
);

function buildDocument(): JsonObject {
  const sourcePaths = Object.fromEntries(
    listSources().map((source) => [`/v1/data/${source.slug}`, sourcePathItem(source)]),
  );

  return {
    openapi: '3.1.0',
    info: {
      title: 'faceless-api',
      version: APP_VERSION,
      description:
        'Normalized UK planning and procurement open data as clean JSON, for developers and AI agents. Blind Mode: no personal data is stored or served.',
    },
    servers: [{ url: API_BASE_URL, description: 'Production (placeholder domain)' }],
    tags: [
      { name: 'platform', description: 'Health and discovery' },
      { name: 'data', description: 'Dataset query endpoints' },
    ],
    paths: {
      '/v1/health': {
        get: {
          operationId: 'health',
          summary: 'Liveness check',
          tags: ['platform'],
          responses: {
            '200': jsonResponse(
              'Service is up',
              successEnvelope(z.object({ status: z.string(), version: z.string() })),
            ),
          },
        },
      },
      '/v1/data': {
        get: {
          operationId: 'list_sources',
          summary: 'List available data sources',
          tags: ['platform'],
          responses: {
            '200': jsonResponse('Registered sources', successEnvelope(sourceListingSchema)),
          },
        },
      },
      ...keysPaths,
      ...usagePath,
      ...billingPaths,
      ...waitlistPath,
      ...sourcePaths,
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'API key issued via /v1/keys, sent as a bearer token.',
        },
      },
      schemas: {
        ErrorEnvelope: toSchema(errorEnvelopeSchema),
      },
    },
  };
}

let cachedDocument: JsonObject | undefined;

/** The registry is static per deployment, so the document is built once. */
export function getOpenApiDocument(): JsonObject {
  cachedDocument ??= buildDocument();
  return cachedDocument;
}
