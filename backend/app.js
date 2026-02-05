require('dotenv').config();
const express = require('express');
const healthRoutes = require('./src/routes/healthRoutes');
const { connect } = require('./src/db');

const app = express();

app.use(express.json());
app.use(healthRoutes);

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
