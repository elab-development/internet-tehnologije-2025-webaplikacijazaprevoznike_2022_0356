const express = require('express');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { compare } = require('../controllers/compareController');

const router = express.Router();

/**
 * @openapi
 * /compare:
 *   get:
 *     summary: Compare products by category across approved suppliers (IMPORTER only)
 *     tags: [Compare]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         required: true
 *         schema: { type: integer }
 *         description: Category id to compare within
 *     responses:
 *       '200':
 *         description: Products grouped by supplier
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/CompareGroup' }
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorBody' }
 *       '401':
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorBody' }
 *       '403':
 *         description: Forbidden (not an IMPORTER)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorBody' }
 */
// GET /compare?categoryId=... (IMPORTER only)
router.get('/', auth, requireRole('IMPORTER'), compare);

module.exports = router;

