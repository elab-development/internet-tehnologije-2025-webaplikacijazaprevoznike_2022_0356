const { prisma } = require('../db');

function toComparableProduct(p) {
  return {
    id: p.id,
    supplierId: p.supplierId,
    categoryId: p.categoryId,
    code: p.code,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl ?? null,
    price: Number(p.price),
    weight: p.weight,
    length: p.length,
    width: p.width,
    height: p.height,
    createdAt: p.createdAt,
  };
}

async function compare(req, res, next) {
  try {
    const categoryId = Number(req.query.categoryId);
    if (!categoryId) {
      return res.status(400).json({
        message: 'categoryId query param is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const approved = await prisma.collaboration.findMany({
      where: { importerId: req.user.id, status: 'APPROVED' },
      select: {
        supplierId: true,
        supplier: { select: { id: true, name: true, email: true } },
      },
    });

    if (approved.length === 0) {
      return res.json([]);
    }

    const supplierIds = approved.map((c) => c.supplierId);

    const products = await prisma.product.findMany({
      where: { categoryId, supplierId: { in: supplierIds } },
      orderBy: [{ supplierId: 'asc' }, { createdAt: 'desc' }],
    });

    const supplierMap = new Map();
    for (const c of approved) {
      supplierMap.set(c.supplierId, {
        supplier: c.supplier,
        products: [],
      });
    }

    for (const p of products) {
      const bucket = supplierMap.get(p.supplierId);
      if (!bucket) continue;
      bucket.products.push(toComparableProduct(p));
    }

    // Return grouped list, omit suppliers that have no products in the category.
    const out = [];
    for (const [, group] of supplierMap) {
      if (group.products.length > 0) out.push(group);
    }

    return res.json(out);
  } catch (e) {
    return next(e);
  }
}

module.exports = { compare };

