const express = require('express');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { list, create, update, remove } = require('../controllers/productController');

const router = express.Router();

router.get('/', auth, list);
router.post('/', auth, requireRole('SUPPLIER'), create);
router.patch('/:id', auth, requireRole('SUPPLIER'), update);
router.delete('/:id', auth, requireRole('SUPPLIER'), remove);

module.exports = router;
