const express = require('express');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { compare } = require('../controllers/compareController');

const router = express.Router();

// GET /compare?categoryId=... (IMPORTER only)
router.get('/', auth, requireRole('IMPORTER'), compare);

module.exports = router;

