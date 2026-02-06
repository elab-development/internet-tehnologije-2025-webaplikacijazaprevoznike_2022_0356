const express = require('express');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { create, addItem, getById } = require('../controllers/containerController');

const router = express.Router();

/**
 * @openapi
 * /containers:
 *   post:
 *     summary: Create a container (IMPORTER only)
 *     tags: [Containers]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ContainerCreateBody' }
 *     responses:
 *       '201':
 *         description: Container created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Container' }
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
 *
 * /containers/{id}:
 *   get:
 *     summary: Get container with items and totals (IMPORTER owner only)
 *     tags: [Containers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: Container details with items and totals
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ContainerWithItems' }
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
 *       '404':
 *         description: Container not found (or not owned by importer)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorBody' }
 *
 * /containers/{id}/items:
 *   post:
 *     summary: Add an item to a container (IMPORTER owner only)
 *     tags: [Containers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ContainerAddItemBody' }
 *     responses:
 *       '201':
 *         description: Item created/updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ContainerItem' }
 *       '400':
 *         description: Validation error or container limits exceeded
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - { $ref: '#/components/schemas/ErrorBody' }
 *                 - { $ref: '#/components/schemas/LimitExceededError' }
 *       '401':
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorBody' }
 *       '403':
 *         description: Forbidden (not an IMPORTER, not approved supplier, or not owner)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorBody' }
 *       '404':
 *         description: Container or product not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorBody' }
 */
// POST /containers (IMPORTER)
router.post('/', auth, requireRole('IMPORTER'), create);

// POST /containers/:id/items (IMPORTER owner)
router.post('/:id/items', auth, requireRole('IMPORTER'), addItem);

// GET /containers/:id (IMPORTER owner)
router.get('/:id', auth, requireRole('IMPORTER'), getById);

module.exports = router;

