require('dotenv').config();
const express = require('express');
const healthRoutes = require('./src/routes/healthRoutes');
const { connect } = require('./src/db');

const app = express();

app.use(express.json());
app.use(healthRoutes);

// 404 — consistent JSON
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler — consistent JSON
app.use((err, req, res, next) => {
  const status = err.status ?? err.statusCode ?? 500;
  res.status(status).json({ error: err.message ?? 'Internal server error' });
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
