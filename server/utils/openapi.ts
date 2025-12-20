import swaggerJsdoc from 'swagger-jsdoc';
import { join } from 'path';

/**
 * Generates the OpenAPI specification using swagger-jsdoc
 *
 * This scans JSDoc comments in:
 * - View model files (shared/types/**\/*.d.ts) for schema definitions
 * - API handler files (server/api/**\/*.ts) for endpoint definitions
 */
export function generateOpenAPISpec() {
  const config = useRuntimeConfig();

  const options: swaggerJsdoc.Options = {
    definition: {
      openapi: '3.1.0',
      info: {
        title: 'Wodanio Business Operation System API',
        version: '1.0.0',
        description: `
The Wodanio BOS REST API provides endpoints for managing contacts (companies and persons),
users, time tracking activities, and integrations with external systems like PES and Listmonk.

## Authentication

All API endpoints (except /api/ip and /api/country) require authentication using one of the following methods:

1. **Session Cookie** - After logging in via OpenID Connect
2. **Bearer Token** - API token in the Authorization header: \`Authorization: Bearer YOUR_TOKEN\`

## Authorization

Access to endpoints is controlled by user roles and rights. Each endpoint requires specific rights
(e.g., 'contact.all.view', 'user.all.edit'). See the security section of each endpoint for required rights.

## Pagination

List endpoints support pagination via query parameters:
- \`page\` (default: 1) - Page number
- \`take\` (default: 100) - Items per page

## Sorting

List endpoints support sorting via query parameters:
- \`sortBy\` - Field name to sort by
- \`sortOrder\` - 'asc' or 'desc'
        `.trim(),
        contact: {
          name: 'Wodanio Support',
          url: 'https://www.wodanio.com/support'
        }
      },
      servers: [
        {
          url: config.public.siteUrl,
          description: 'Current environment'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'API token authentication. Use a token from /api/user/token'
          },
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'auth.token',
            description: 'Session cookie authentication after OpenID Connect login'
          }
        },
        schemas: {},
        parameters: {
          page: {
            name: 'page',
            in: 'query',
            description: 'Page number for pagination',
            schema: {
              type: 'integer',
              minimum: 1,
              default: 1
            }
          },
          take: {
            name: 'take',
            in: 'query',
            description: 'Number of items per page',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 500,
              default: 100
            }
          },
          sortBy: {
            name: 'sortBy',
            in: 'query',
            description: 'Field name to sort by',
            schema: {
              type: 'string'
            }
          },
          sortOrder: {
            name: 'sortOrder',
            in: 'query',
            description: 'Sort order',
            schema: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'asc'
            }
          },
          search: {
            name: 'search',
            in: 'query',
            description: 'Search query string',
            schema: {
              type: 'string'
            }
          }
        },
        responses: {
          Unauthorized: {
            description: 'Authentication required or invalid',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    statusCode: { type: 'number' },
                    statusMessage: { type: 'string' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          Forbidden: {
            description: 'Insufficient permissions',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    statusCode: { type: 'number' },
                    statusMessage: { type: 'string' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          NotFound: {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    statusCode: { type: 'number' },
                    statusMessage: { type: 'string' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          ValidationError: {
            description: 'Request validation failed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    statusCode: { type: 'number' },
                    statusMessage: { type: 'string' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      },
      tags: [
        { name: 'Users', description: 'User management endpoints' },
        { name: 'User Tokens', description: 'API token management' },
        { name: 'Companies', description: 'Company contact management' },
        { name: 'Persons', description: 'Person contact management' },
        { name: 'Time Tracking', description: 'Time tracking activity management' },
        { name: 'PES', description: 'Payment Enforcement Service proxy' },
        { name: 'Utility', description: 'Utility endpoints (countries, IP info)' },
        { name: 'Integrations', description: 'Third-party integrations (Pascom)' }
      ]
    },
    apis: [
      // Scan view model type definition files for schema definitions
      join(process.cwd(), 'shared/types/**/*.d.ts'),
      // Scan API endpoint files for route definitions
      join(process.cwd(), 'server/api/**/*.ts')
    ]
  };

  return swaggerJsdoc(options);
}
