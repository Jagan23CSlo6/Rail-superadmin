const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Railway Admin API',
      version: '1.0.0',
      description: 'API documentation for Railway Admin Management System',
      contact: {
        name: 'API Support',
        email: 'support@railway.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server'
      },
      {
        url: 'https://railway.artechnology.pro',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Error details'
            }
          }
        },
        Admin: {
          type: 'object',
          properties: {
            admin_id: {
              type: 'string',
              example: 'ADM001'
            },
            full_name: {
              type: 'string',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              example: 'admin@railway.com'
            },
            mobile_number: {
              type: 'string',
              example: '9876543210'
            },
            role: {
              type: 'string',
              example: 'Admin'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        SuperAdmin: {
          type: 'object',
          properties: {
            super_admin_id: {
              type: 'integer',
              example: 1
            },
            super_admin_name: {
              type: 'string',
              example: 'Super Admin'
            },
            phone_number: {
              type: 'string',
              example: '9876543210'
            },
            email: {
              type: 'string',
              example: 'superadmin@railway.com'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        AdminDetails: {
          type: 'object',
          properties: {
            admin_id: {
              type: 'integer',
              example: 1
            },
            super_admin_id: {
              type: 'integer',
              example: 1
            },
            admin_name: {
              type: 'string',
              example: 'John Doe'
            },
            phone_number: {
              type: 'string',
              example: '9876543210'
            },
            location: {
              type: 'string',
              example: 'Mumbai'
            },
            join_date: {
              type: 'string',
              format: 'date'
            },
            next_payment_date: {
              type: 'string',
              format: 'date'
            },
            login_id: {
              type: 'string',
              example: 'admin001'
            },
            duration: {
              type: 'string',
              example: '12 months'
            },
            amount: {
              type: 'number',
              example: 5000.00
            },
            payment_status: {
              type: 'string',
              example: 'paid'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
