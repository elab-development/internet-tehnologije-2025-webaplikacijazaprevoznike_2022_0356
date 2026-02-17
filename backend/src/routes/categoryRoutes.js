const express = require('express');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { list, create, remove } = require('../controllers/categoryController');

const router = express.Router();

router.get('/', list);

router.post('/', auth, requireRole('ADMIN'), create);

router.delete('/:id', auth, requireRole('ADMIN'), remove);

module.exports = router;

