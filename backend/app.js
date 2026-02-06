require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const healthRoutes = require('./src/routes/healthRoutes');
const authRoutes = require('./src/routes/authRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const collaborationRoutes = require('./src/routes/collaborationRoutes');
const productRoutes = require('./src/routes/productRoutes');
const importerRoutes = require('./src/routes/importerRoutes');
const containerRoutes = require('./src/routes/containerRoutes');
const compareRoutes = require('./src/routes/compareRoutes');
const openapiConfig = require('./openapi.config.js');
const { connect } = require('./src/db');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(healthRoutes);
app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/collaborations', collaborationRoutes);
app.use('/products', productRoutes);
app.use('/importer', importerRoutes);
app.use('/containers', containerRoutes);
app.use('/compare', compareRoutes);

const swaggerSpec = swaggerJsdoc({
  definition: openapiConfig,
  apis: [path.join(__dirname, 'src/routes/*.js')],
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 — consistent JSON
app.use((req, res) => {
  res.status(404).json({ message: 'Not found', code: 'NOT_FOUND' });
});

// Global error handler — consistent JSON
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message ?? 'Internal server error';
  const code = err.code ?? 'INTERNAL_ERROR';
  res.status(status).json({ message, code });
});

const PORT = process.env.PORT || 4000;

connect()
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log('Backend running on port', PORT);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
