const express = require('express');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { create, addItem, getById } = require('../controllers/containerController');

const router = express.Router();

// POST /containers (IMPORTER)
router.post('/', auth, requireRole('IMPORTER'), create);

// POST /containers/:id/items (IMPORTER owner)
router.post('/:id/items', auth, requireRole('IMPORTER'), addItem);

// GET /containers/:id (IMPORTER owner)
router.get('/:id', auth, requireRole('IMPORTER'), getById);

module.exports = router;

