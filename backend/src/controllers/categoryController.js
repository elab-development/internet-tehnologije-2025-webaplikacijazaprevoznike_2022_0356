const { prisma } = require('../db');

function toCategoryJson(c) {
  return {
    id: c.id,
    name: c.name,
    createdAt: c.createdAt,
  };
}

async function list(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json(categories.map(toCategoryJson));
  } catch (e) {
    return next(e);
  }
}

async function create(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        message: 'name is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const category = await prisma.category.create({
      data: { name: name.trim() },
    });

    return res.status(201).json(toCategoryJson(category));
  } catch (e) {
    // Unique constraint on Category.name
    if (e && e.code === 'P2002') {
      return res.status(409).json({
        message: 'Category with this name already exists',
        code: 'CATEGORY_EXISTS',
      });
    }
    return next(e);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({
        message: 'Invalid id',
        code: 'VALIDATION_ERROR',
      });
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        message: 'Category not found',
        code: 'NOT_FOUND',
      });
    }

    await prisma.category.delete({ where: { id } });
    return res.status(204).send();
  } catch (e) {
    // FK constraint (e.g. products reference this category)
    if (e && e.code === 'P2003') {
      return res.status(409).json({
        message: 'Category is in use and cannot be deleted',
        code: 'CATEGORY_IN_USE',
      });
    }
    return next(e);
  }
}

module.exports = { list, create, remove };

