const express = require('express');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { listForImporter } = require('../controllers/productController');

const router = express.Router();

// GET /importer/products (IMPORTER only)
router.get('/products', auth, requireRole('IMPORTER'), listForImporter);

module.exports = router;

