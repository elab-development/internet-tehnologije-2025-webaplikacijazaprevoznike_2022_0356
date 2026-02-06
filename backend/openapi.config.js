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
      LimitExceededError: {
        allOf: [
          { $ref: '#/components/schemas/ErrorBody' },
          {
            type: 'object',
            properties: {
              limit: { type: 'string', enum: ['maxWeight', 'maxVolume', 'maxPrice'] },
              max: { type: 'number' },
              attempted: { type: 'number' },
            },
          },
        ],
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          supplierId: { type: 'integer' },
          categoryId: { type: 'integer' },
          code: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          imageUrl: { type: ['string', 'null'] },
          price: { type: 'number' },
          weight: { type: 'number' },
          length: { type: 'number' },
          width: { type: 'number' },
          height: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ProductListItem: {
        allOf: [
          { $ref: '#/components/schemas/Product' },
          {
            type: 'object',
            properties: {
              categoryName: { type: 'string' },
              supplierEmail: { type: 'string' },
              supplierName: { type: 'string' },
            },
          },
        ],
      },
      ProductCreateBody: {
        type: 'object',
        required: ['code', 'name', 'price', 'weight', 'length', 'width', 'height', 'description', 'categoryId'],
        properties: {
          code: { type: 'string' },
          name: { type: 'string' },
          price: { type: 'number' },
          weight: { type: 'number' },
          length: { type: 'number' },
          width: { type: 'number' },
          height: { type: 'number' },
          description: { type: 'string' },
          imageUrl: { type: 'string', nullable: true },
          categoryId: { type: 'integer' },
        },
      },
      ProductUpdateBody: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          name: { type: 'string' },
          price: { type: 'number' },
          weight: { type: 'number' },
          length: { type: 'number' },
          width: { type: 'number' },
          height: { type: 'number' },
          description: { type: 'string' },
          imageUrl: { type: 'string', nullable: true },
          categoryId: { type: 'integer' },
        },
      },
      Container: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          importerId: { type: 'integer' },
          name: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ContainerCreateBody: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          maxWeight: { type: 'number' },
          maxVolume: { type: 'number' },
          maxPrice: { type: 'number' },
        },
      },
      ContainerItem: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          containerId: { type: 'integer' },
          productId: { type: 'integer' },
          quantity: { type: 'integer' },
        },
      },
      ContainerAddItemBody: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: { type: 'integer' },
          quantity: { type: 'integer', minimum: 1 },
        },
      },
      ContainerWithItems: {
        allOf: [
          { $ref: '#/components/schemas/Container' },
          {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: { $ref: '#/components/schemas/ContainerItem' },
              },
              totalPrice: { type: 'number' },
              totalWeight: { type: 'number' },
              totalVolume: { type: 'number' },
            },
          },
        ],
      },
      SupplierInfo: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string' },
        },
      },
      CompareGroup: {
        type: 'object',
        properties: {
          supplier: { $ref: '#/components/schemas/SupplierInfo' },
          products: {
            type: 'array',
            items: { $ref: '#/components/schemas/Product' },
          },
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
