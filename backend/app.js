const express = require('express');
const healthRoutes = require('./src/routes/healthRoutes');

const app = express();

app.use(express.json());
app.use(healthRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('Backend running on port', PORT);
});
