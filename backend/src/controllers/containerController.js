const { prisma } = require('../db');

function toContainerJson(c) {
  return {
    id: c.id,
    importerId: c.importerId,
    name: c.name,
    createdAt: c.createdAt,
  };
}

function toItemJson(i) {
  return {
    id: i.id,
    containerId: i.containerId,
    productId: i.productId,
    quantity: i.quantity,
  };
}

async function create(req, res, next) {
  try {
    const { name, maxWeight, maxVolume, maxPrice } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'name is required', code: 'VALIDATION_ERROR' });
    }

    // NOTE: schema currently requires these fields; default generously if not provided.
    const container = await prisma.container.create({
      data: {
        name: name.trim(),
        importerId: req.user.id,
        maxWeight: maxWeight == null ? 1e9 : Number(maxWeight),
        maxVolume: maxVolume == null ? 1e9 : Number(maxVolume),
        maxPrice: maxPrice == null ? 99999999.99 : Number(maxPrice),
      },
    });

    return res.status(201).json(toContainerJson(container));
  } catch (e) {
    return next(e);
  }
}

async function addItem(req, res, next) {
  try {
    const containerId = Number(req.params.id);
    if (!containerId) {
      return res.status(400).json({ message: 'Invalid container id', code: 'VALIDATION_ERROR' });
    }

    const { productId, quantity } = req.body;
    const parsedProductId = Number(productId);
    const parsedQty = Number(quantity);

    if (!parsedProductId || !Number.isFinite(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({
        message: 'productId and quantity (> 0) are required',
        code: 'VALIDATION_ERROR',
      });
    }

    const container = await prisma.container.findUnique({ where: { id: containerId } });
    if (!container) {
      return res.status(404).json({ message: 'Container not found', code: 'NOT_FOUND' });
    }
    if (container.importerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden', code: 'FORBIDDEN' });
    }

    const product = await prisma.product.findUnique({
      where: { id: parsedProductId },
      select: { id: true, supplierId: true },
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found', code: 'NOT_FOUND' });
    }

    // Only allow products from suppliers with APPROVED collaboration for this importer
    const approved = await prisma.collaboration.findUnique({
      where: { supplierId_importerId: { supplierId: product.supplierId, importerId: req.user.id } },
      select: { status: true },
    });
    if (!approved || approved.status !== 'APPROVED') {
      return res.status(403).json({
        message: 'You can only add products from approved suppliers',
        code: 'FORBIDDEN',
      });
    }

    const existing = await prisma.containerItem.findFirst({
      where: { containerId, productId: parsedProductId },
    });

    const item = existing
      ? await prisma.containerItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + parsedQty },
        })
      : await prisma.containerItem.create({
          data: {
            containerId,
            productId: parsedProductId,
            quantity: parsedQty,
          },
        });

    return res.status(201).json(toItemJson(item));
  } catch (e) {
    return next(e);
  }
}

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Invalid id', code: 'VALIDATION_ERROR' });
    }

    const container = await prisma.container.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!container) {
      return res.status(404).json({ message: 'Container not found', code: 'NOT_FOUND' });
    }
    if (container.importerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden', code: 'FORBIDDEN' });
    }

    return res.json({
      ...toContainerJson(container),
      items: container.items.map(toItemJson),
    });
  } catch (e) {
    return next(e);
  }
}

module.exports = { create, addItem, getById };

