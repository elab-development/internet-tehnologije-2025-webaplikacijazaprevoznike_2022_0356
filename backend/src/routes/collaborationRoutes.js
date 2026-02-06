const express = require('express');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { requestCollaboration, approve, reject } = require('../controllers/collaborationController');

const router = express.Router();

// POST /collaborations/request (SUPPLIER)
router.post('/request', auth, requireRole('SUPPLIER'), requestCollaboration);

// PATCH /collaborations/:id/approve (ADMIN)
router.patch('/:id/approve', auth, requireRole('ADMIN'), approve);

// PATCH /collaborations/:id/reject (ADMIN)
router.patch('/:id/reject', auth, requireRole('ADMIN'), reject);

module.exports = router;

