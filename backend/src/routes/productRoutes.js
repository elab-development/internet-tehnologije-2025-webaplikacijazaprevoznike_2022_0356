const express = require('express');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { list, create, update, remove } = require('../controllers/productController');

const router = express.Router();

/**
 * @openapi
 * /products:
 *   get:
 *     summary: List products (ADMIN: all, SUPPLIER: own)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/ProductListItem' }
 *       '401':
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorBody' }
 *       '403':
 *         description: Forbidden (role not allowed)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorBody' }
 *   post:
 *     summary: Create product (SUPPLIER only)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductCreateBody' }
 *     responses:
 *       '201':
 *         description: Product created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
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
 *         description: Forbidden (not a SUPPLIER)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorBody' }
 *       '409':
 *         description: Product code already taken for this supplier
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorBody' }
 *
 * /products/{id}:
 *   patch:
 *     summary: Update product (SUPPLIER owner only)
 *     tags: [Products]
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
 *           schema: { $ref: '#/components/schemas/ProductUpdateBody' }
 *     responses:
 *       '200':
 *         description: Product updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
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
 *         description: Forbidden (not a SUPPLIER)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorBody' }
 *       '404':
 *         description: Product not found (or not owned by supplier)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorBody' }
 *       '409':
 *         description: Product code already taken for this supplier
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorBody' }
 *   delete:
 *     summary: Delete product (SUPPLIER owner only)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '204':
 *         description: Deleted
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
 *         description: Forbidden (not a SUPPLIER)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorBody' }
 *       '404':
 *         description: Product not found (or not owned by supplier)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorBody' }
 */
router.get('/', auth, list);
router.post('/', auth, requireRole('SUPPLIER'), create);
router.patch('/:id', auth, requireRole('SUPPLIER'), update);
router.delete('/:id', auth, requireRole('SUPPLIER'), remove);

module.exports = router;
