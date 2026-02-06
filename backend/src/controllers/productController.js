const { prisma } = require('../db');

function toProductJson(p) {
  return {
    id: p.id,
    supplierId: p.supplierId,
    categoryId: p.categoryId,
    code: p.code,
    name: p.name,
    price: Number(p.price),
    weight: p.weight,
    length: p.length,
    width: p.width,
    height: p.height,
    description: p.description,
    imageUrl: p.imageUrl ?? null,
    createdAt: p.createdAt,
  };
}

function toListProduct(p) {
  const out = toProductJson(p);
  if (p.category) out.categoryName = p.category.name;
  if (p.supplier) {
    out.supplierEmail = p.supplier.email;
    out.supplierName = p.supplier.name;
  }
  return out;
}

async function list(req, res, next) {
  try {
    if (req.user.role === 'ADMIN') {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { name: true } }, supplier: { select: { email: true, name: true } } },
      });
      return res.json(products.map(toListProduct));
    }
    if (req.user.role === 'SUPPLIER') {
      const products = await prisma.product.findMany({
        where: { supplierId: req.user.id },
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { name: true } } },
      });
      return res.json(products.map(toListProduct));
    }
    return res.status(403).json({ message: 'Forbidden', code: 'FORBIDDEN' });
  } catch (e) {
    next(e);
  }
}

async function listForImporter(req, res, next) {
  try {
    const approved = await prisma.collaboration.findMany({
      where: { importerId: req.user.id, status: 'APPROVED' },
      select: { supplierId: true },
    });

    const supplierIds = approved.map((c) => c.supplierId);
    if (supplierIds.length === 0) {
      return res.json([]);
    }

    const products = await prisma.product.findMany({
      where: { supplierId: { in: supplierIds } },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        supplier: { select: { email: true, name: true } },
      },
    });

    return res.json(products.map(toListProduct));
  } catch (e) {
    return next(e);
  }
}

async function create(req, res, next) {
  try {
    const { code, name, price, weight, length, width, height, categoryId, description, imageUrl } = req.body;
    if (!code || !name || price == null || weight == null || length == null || width == null || height == null || !categoryId || description == null) {
      return res.status(400).json({
        message:
          'Missing required fields: code, name, price, weight, length, width, height, description, categoryId',
        code: 'VALIDATION_ERROR',
      });
    }

    if (typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ message: 'code must be a non-empty string', code: 'VALIDATION_ERROR' });
    }

    if (typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ message: 'description must be a non-empty string', code: 'VALIDATION_ERROR' });
    }
    const product = await prisma.product.create({
      data: {
        code: code.trim(),
        name,
        price: Number(price),
        weight: Number(weight),
        length: Number(length),
        width: Number(width),
        height: Number(height),
        description: description.trim(),
        imageUrl: imageUrl == null || imageUrl === '' ? null : String(imageUrl),
        categoryId: Number(categoryId),
        supplierId: req.user.id,
      },
      include: { category: { select: { name: true } } },
    });
    res.status(201).json(toProductJson(product));
  } catch (e) {
    if (e && e.code === 'P2002') {
      return res.status(409).json({
        message: 'Product code must be unique per supplier',
        code: 'PRODUCT_CODE_TAKEN',
      });
    }
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id', code: 'VALIDATION_ERROR' });
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ message: 'Product not found', code: 'NOT_FOUND' });
    if (product.supplierId !== req.user.id) {
      // Avoid leaking existence of other suppliers' products
      return res.status(404).json({ message: 'Product not found', code: 'NOT_FOUND' });
    }
    const allowed = ['code', 'name', 'price', 'weight', 'length', 'width', 'height', 'description', 'imageUrl', 'categoryId'];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] === undefined) continue;
      if (key === 'name') data[key] = req.body[key];
      else if (key === 'code') data[key] = String(req.body[key]).trim();
      else if (key === 'description') data[key] = String(req.body[key]).trim();
      else if (key === 'imageUrl') data[key] = req.body[key] == null || req.body[key] === '' ? null : String(req.body[key]);
      else data[key] = Number(req.body[key]);
    }
    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { category: { select: { name: true } } },
    });
    res.json(toProductJson(updated));
  } catch (e) {
    if (e && e.code === 'P2002') {
      return res.status(409).json({
        message: 'Product code must be unique per supplier',
        code: 'PRODUCT_CODE_TAKEN',
      });
    }
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid id', code: 'VALIDATION_ERROR' });
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ message: 'Product not found', code: 'NOT_FOUND' });
    if (product.supplierId !== req.user.id) {
      // Avoid leaking existence of other suppliers' products
      return res.status(404).json({ message: 'Product not found', code: 'NOT_FOUND' });
    }
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = { list, listForImporter, create, update, remove };
