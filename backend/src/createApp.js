const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const collaborationRoutes = require('./routes/collaborationRoutes');
const productRoutes = require('./routes/productRoutes');
const importerRoutes = require('./routes/importerRoutes');
const containerRoutes = require('./routes/containerRoutes');
const compareRoutes = require('./routes/compareRoutes');
const mapRoutes = require('./routes/mapRoutes');
const statsRoutes = require('./routes/statsRoutes');
const countriesRoutes = require('./routes/countriesRoutes');
const openapiConfig = require('../openapi.config.js');
const { sanitizeBody } = require('./middlewares/sanitizeBody');
const { csrfProtection } = require('./middlewares/csrf');

function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
  app.use(express.json());
  app.use(sanitizeBody);
  app.use(csrfProtection);

  app.use(healthRoutes);
  app.use('/auth', authRoutes);
  app.use('/categories', categoryRoutes);
  app.use('/collaborations', collaborationRoutes);
  app.use('/products', productRoutes);
  app.use('/importer', importerRoutes);
  app.use('/containers', containerRoutes);
  app.use('/compare', compareRoutes);
  app.use('/api/map', mapRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/countries', countriesRoutes);

  const swaggerSpec = swaggerJsdoc({
    definition: openapiConfig,
    apis: [path.join(__dirname, 'routes/*.js')],
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use((req, res) => {
    res.status(404).json({ message: 'Not found', code: 'NOT_FOUND' });
  });

  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    const status = err.status ?? err.statusCode ?? 500;
    const message = err.message ?? 'Internal server error';
    const code = err.code ?? 'INTERNAL_ERROR';
    res.status(status).json({ message, code });
  });

  return app;
}

module.exports = { createApp };

