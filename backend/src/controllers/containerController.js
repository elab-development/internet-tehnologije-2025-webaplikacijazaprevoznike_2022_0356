const { prisma } = require('../db');

function productVolumeM3(p) {
  // Product dimensions are stored in cm; convert cm^3 -> m^3 (1 m^3 = 1,000,000 cm^3)
  return (Number(p.length) * Number(p.width) * Number(p.height)) / 1_000_000;
}

function calculateTotals(itemsWithProducts) {
  let totalPrice = 0;
  let totalWeight = 0;
  let totalVolume = 0;

  for (const item of itemsWithProducts) {
    const qty = Number(item.quantity);
    const p = item.product;
    if (!p) continue;
    totalPrice += Number(p.price) * qty;
    totalWeight += Number(p.weight) * qty;
    totalVolume += productVolumeM3(p) * qty;
  }

  return { totalPrice, totalWeight, totalVolume };
}

function toContainerJson(c) {
  return {
    id: c.id,
    importerId: c.importerId,
    name: c.name,
    maxWeight: Number(c.maxWeight),
    maxVolume: Number(c.maxVolume),
    maxPrice: Number(c.maxPrice),
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

async function list(req, res, next) {
  try {
    const containers = await prisma.container.findMany({
      where: { importerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { items: true } } },
    });
    return res.json(
      containers.map((c) => ({
        ...toContainerJson(c),
        itemCount: c._count.items,
      }))
    );
  } catch (e) {
    next(e);
  }
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

    if (!parsedProductId || !Number.isFinite(parsedQty) || parsedQty <= 0 || !Number.isInteger(parsedQty)) {
      return res.status(400).json({
        message: 'productId and quantity (integer > 0) are required',
        code: 'VALIDATION_ERROR',
      });
    }

    const container = await prisma.container.findUnique({
      where: { id: containerId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, supplierId: true, price: true, weight: true, length: true, width: true, height: true },
            },
          },
        },
      },
    });
    if (!container) {
      return res.status(404).json({ message: 'Container not found', code: 'NOT_FOUND' });
    }
    if (container.importerId !== req.user.id) {
      // Avoid leaking existence of other importers' containers
      return res.status(404).json({ message: 'Container not found', code: 'NOT_FOUND' });
    }

    const product = await prisma.product.findUnique({
      where: { id: parsedProductId },
      select: { id: true, supplierId: true, price: true, weight: true, length: true, width: true, height: true },
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

    // Validate container limits using prospective totals after adding items.
    const prospectiveItems = container.items.map((i) => {
      if (i.productId !== parsedProductId) return i;
      return { ...i, quantity: i.quantity + parsedQty };
    });

    const existing = container.items.find((i) => i.productId === parsedProductId);
    const itemsWithProducts = existing
      ? prospectiveItems
      : [...prospectiveItems, { id: 0, containerId, productId: parsedProductId, quantity: parsedQty, product }];

    const totals = calculateTotals(itemsWithProducts);
    const maxPrice = Number(container.maxPrice);

    if (totals.totalWeight > container.maxWeight) {
      return res.status(400).json({
        message: 'Container max weight exceeded',
        code: 'LIMIT_EXCEEDED',
        limit: 'maxWeight',
        max: container.maxWeight,
        attempted: totals.totalWeight,
      });
    }
    if (totals.totalVolume > container.maxVolume) {
      return res.status(400).json({
        message: 'Container max volume exceeded',
        code: 'LIMIT_EXCEEDED',
        limit: 'maxVolume',
        max: container.maxVolume,
        attempted: totals.totalVolume,
      });
    }
    if (Number.isFinite(maxPrice) && totals.totalPrice > maxPrice) {
      return res.status(400).json({
        message: 'Container max price exceeded',
        code: 'LIMIT_EXCEEDED',
        limit: 'maxPrice',
        max: maxPrice,
        attempted: totals.totalPrice,
      });
    }

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
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true, weight: true, length: true, width: true, height: true },
            },
          },
        },
      },
    });

    if (!container) {
      return res.status(404).json({ message: 'Container not found', code: 'NOT_FOUND' });
    }
    if (container.importerId !== req.user.id) {
      // Avoid leaking existence of other importers' containers
      return res.status(404).json({ message: 'Container not found', code: 'NOT_FOUND' });
    }

    const totals = calculateTotals(container.items);

    return res.json({
      ...toContainerJson(container),
      items: container.items.map((i) => {
        const vol = i.product ? (Number(i.product.length) * Number(i.product.width) * Number(i.product.height)) / 1_000_000 : 0;
        return {
          ...toItemJson(i),
          product: i.product ? {
            id: i.product.id,
            name: i.product.name,
            price: Number(i.product.price),
            weight: Number(i.product.weight),
            volume: vol,
          } : null,
        };
      }),
      totalPrice: totals.totalPrice,
      totalWeight: totals.totalWeight,
      totalVolume: totals.totalVolume,
    });
  } catch (e) {
    return next(e);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Invalid id', code: 'VALIDATION_ERROR' });
    }
    const container = await prisma.container.findUnique({ where: { id } });
    if (!container) {
      return res.status(404).json({ message: 'Container not found', code: 'NOT_FOUND' });
    }
    if (container.importerId !== req.user.id) {
      return res.status(404).json({ message: 'Container not found', code: 'NOT_FOUND' });
    }
    await prisma.containerItem.deleteMany({ where: { containerId: id } });
    await prisma.container.delete({ where: { id } });
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
}

async function removeItem(req, res, next) {
  try {
    const containerId = Number(req.params.id);
    const itemId = Number(req.params.itemId);
    if (!containerId || !itemId) {
      return res.status(400).json({ message: 'Invalid container or item id', code: 'VALIDATION_ERROR' });
    }
    const container = await prisma.container.findUnique({ where: { id: containerId } });
    if (!container) {
      return res.status(404).json({ message: 'Container not found', code: 'NOT_FOUND' });
    }
    if (container.importerId !== req.user.id) {
      return res.status(404).json({ message: 'Container not found', code: 'NOT_FOUND' });
    }
    const item = await prisma.containerItem.findFirst({
      where: { id: itemId, containerId },
    });
    if (!item) {
      return res.status(404).json({ message: 'Item not found', code: 'NOT_FOUND' });
    }
    await prisma.containerItem.delete({ where: { id: itemId } });
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = { list, create, addItem, getById, remove, removeItem };

