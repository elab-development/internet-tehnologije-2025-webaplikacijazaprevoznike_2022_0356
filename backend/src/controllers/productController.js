const { prisma } = require('../db');

function toProductJson(p) {
  return {
    id: p.id,
    supplierId: p.supplierId,
    categoryId: p.categoryId,
    name: p.name,
    price: Number(p.price),
    weight: p.weight,
    length: p.length,
    width: p.width,
    height: p.height,
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
    return res.status(403).json({ error: 'Forbidden' });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const { name, price, weight, length, width, height, categoryId } = req.body;
    if (!name || price == null || weight == null || length == null || width == null || height == null || !categoryId) {
      return res.status(400).json({ error: 'Missing required fields: name, price, weight, length, width, height, categoryId' });
    }
    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        weight: Number(weight),
        length: Number(length),
        width: Number(width),
        height: Number(height),
        categoryId: Number(categoryId),
        supplierId: req.user.id,
      },
      include: { category: { select: { name: true } } },
    });
    res.status(201).json(toProductJson(product));
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.supplierId !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own products' });
    }
    const allowed = ['name', 'price', 'weight', 'length', 'width', 'height', 'categoryId'];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = key === 'name' ? req.body[key] : Number(req.body[key]);
    }
    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { category: { select: { name: true } } },
    });
    res.json(toProductJson(updated));
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.supplierId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own products' });
    }
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = { list, create, update, remove };
