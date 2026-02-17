const express = require('express');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { getStats } = require('../controllers/statsController');

const router = express.Router();

router.get('/', auth, requireRole('ADMIN'), getStats);

module.exports = router;
