/**
 * OpenAPI 3 configuration for the backend API.
 * Served at GET /api-docs via swagger-ui-express.
 */
module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'B2B Platform API',
    version: '1.0.0',
    description: 'Auth and protected endpoints. Use Bearer JWT for protected routes.',
  },
  servers: [
    { url: 'http://localhost:4000', description: 'Local / Docker backend' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT from POST /auth/login',
      },
    },
    schemas: {
      RegisterBody: {
        type: 'object',
        required: ['email', 'password', 'name', 'role'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 1 },
          name: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'SUPPLIER', 'IMPORTER'] },
        },
      },
      LoginBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      RegisterSuccess: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          email: { type: 'string' },
          role: { type: 'string' },
          name: { type: 'string' },
        },
      },
      LoginSuccess: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'JWT for Authorization: Bearer' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              email: { type: 'string' },
              role: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
      },
      LogoutSuccess: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Logged out' },
          code: { type: 'string', example: 'LOGGED_OUT' },
        },
      },
      ErrorBody: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          code: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterBody' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterSuccess' },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } },
            },
          },
          '409': {
            description: 'Email already taken',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login and get JWT',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginBody' },
            },
          },
        },
        responses: {
          '200': {
            description: 'JWT token and user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginSuccess' },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } },
            },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Logout (client should discard token)',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Success message',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LogoutSuccess' },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } },
            },
          },
        },
      },
    },
  },
};
