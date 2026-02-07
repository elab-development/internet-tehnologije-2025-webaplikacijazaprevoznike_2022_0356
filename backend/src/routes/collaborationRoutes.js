const express = require('express');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { list, listImporters, requestCollaboration, approve, reject } = require('../controllers/collaborationController');

const router = express.Router();

// GET /collaborations (ADMIN: all, SUPPLIER: own, IMPORTER: own)
router.get('/', auth, requireRole('ADMIN', 'SUPPLIER', 'IMPORTER'), list);

// GET /collaborations/importers (SUPPLIER – list importers for request dropdown)
router.get('/importers', auth, requireRole('SUPPLIER'), listImporters);

// POST /collaborations/request (SUPPLIER)
router.post('/request', auth, requireRole('SUPPLIER'), requestCollaboration);

// PATCH /collaborations/:id/approve (IMPORTER – only the importer who received the request)
router.patch('/:id/approve', auth, requireRole('IMPORTER'), approve);

// PATCH /collaborations/:id/reject (IMPORTER – only the importer who received the request)
router.patch('/:id/reject', auth, requireRole('IMPORTER'), reject);

module.exports = router;

