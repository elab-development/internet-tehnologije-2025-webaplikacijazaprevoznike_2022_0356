const express = require('express');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { list, create, remove } = require('../controllers/categoryController');

const router = express.Router();

// GET /categories (public)
router.get('/', list);

// POST /categories (ADMIN)
router.post('/', auth, requireRole('ADMIN'), create);

// DELETE /categories/:id (ADMIN)
router.delete('/:id', auth, requireRole('ADMIN'), remove);

module.exports = router;

