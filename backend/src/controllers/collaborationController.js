const { prisma } = require('../db');

function toCollaborationJson(c) {
  return {
    id: c.id,
    supplierId: c.supplierId,
    importerId: c.importerId,
    status: c.status,
    createdAt: c.createdAt,
  };
}

async function list(req, res, next) {
  try {
    if (req.user.role === 'ADMIN') {
      const collaborations = await prisma.collaboration.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: { select: { id: true, email: true, name: true } },
          importer: { select: { id: true, email: true, name: true } },
        },
      });
      return res.json(
        collaborations.map((c) => ({
          ...toCollaborationJson(c),
          supplierName: c.supplier?.name,
          supplierEmail: c.supplier?.email,
          importerName: c.importer?.name,
          importerEmail: c.importer?.email,
        }))
      );
    }
    if (req.user.role === 'SUPPLIER') {
      const collaborations = await prisma.collaboration.findMany({
        where: { supplierId: req.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          importer: { select: { id: true, email: true, name: true } },
        },
      });
      return res.json(
        collaborations.map((c) => ({
          ...toCollaborationJson(c),
          importerName: c.importer?.name,
          importerEmail: c.importer?.email,
        }))
      );
    }
    if (req.user.role === 'IMPORTER') {
      const collaborations = await prisma.collaboration.findMany({
        where: { importerId: req.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: { select: { id: true, email: true, name: true } },
        },
      });
      return res.json(
        collaborations.map((c) => ({
          ...toCollaborationJson(c),
          supplierName: c.supplier?.name,
          supplierEmail: c.supplier?.email,
        }))
      );
    }
    return res.status(403).json({ message: 'Forbidden', code: 'FORBIDDEN' });
  } catch (e) {
    return next(e);
  }
}

async function listImporters(req, res, next) {
  try {
    if (req.user.role !== 'SUPPLIER') {
      return res.status(403).json({ message: 'Forbidden', code: 'FORBIDDEN' });
    }
    const importers = await prisma.user.findMany({
      where: { role: 'IMPORTER', active: true },
      select: { id: true, email: true, name: true },
      orderBy: { name: 'asc' },
    });
    return res.json(importers);
  } catch (e) {
    return next(e);
  }
}

async function requestCollaboration(req, res, next) {
  try {
    const { importerId } = req.body;
    const parsedImporterId = Number(importerId);

    if (!parsedImporterId) {
      return res.status(400).json({
        message: 'importerId is required',
        code: 'VALIDATION_ERROR',
      });
    }

    if (parsedImporterId === req.user.id) {
      return res.status(400).json({
        message: 'You cannot request collaboration with yourself',
        code: 'VALIDATION_ERROR',
      });
    }

    const importer = await prisma.user.findUnique({
      where: { id: parsedImporterId },
      select: { id: true, role: true, active: true },
    });

    if (!importer || !importer.active) {
      return res.status(404).json({
        message: 'Importer not found',
        code: 'NOT_FOUND',
      });
    }

    if (importer.role !== 'IMPORTER') {
      return res.status(400).json({
        message: 'Target user must be an IMPORTER',
        code: 'VALIDATION_ERROR',
      });
    }

    const collaboration = await prisma.collaboration.create({
      data: {
        supplierId: req.user.id,
        importerId: parsedImporterId,
        status: 'PENDING',
      },
    });

    return res.status(201).json(toCollaborationJson(collaboration));
  } catch (e) {
    // Unique constraint on (supplierId, importerId)
    if (e && e.code === 'P2002') {
      return res.status(409).json({
        message: 'Collaboration request already exists',
        code: 'COLLABORATION_EXISTS',
      });
    }
    return next(e);
  }
}

async function approve(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({
        message: 'Invalid id',
        code: 'VALIDATION_ERROR',
      });
    }

    const existing = await prisma.collaboration.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        message: 'Collaboration not found',
        code: 'NOT_FOUND',
      });
    }

    if (existing.importerId !== req.user.id) {
      return res.status(403).json({
        message: 'Only the importer who received the request can approve it',
        code: 'FORBIDDEN',
      });
    }

    if (existing.status !== 'PENDING') {
      return res.status(409).json({
        message: 'Only PENDING collaborations can be approved',
        code: 'INVALID_STATE',
      });
    }

    const updated = await prisma.collaboration.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    return res.json(toCollaborationJson(updated));
  } catch (e) {
    return next(e);
  }
}

async function reject(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({
        message: 'Invalid id',
        code: 'VALIDATION_ERROR',
      });
    }

    const existing = await prisma.collaboration.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        message: 'Collaboration not found',
        code: 'NOT_FOUND',
      });
    }

    if (existing.importerId !== req.user.id) {
      return res.status(403).json({
        message: 'Only the importer who received the request can reject it',
        code: 'FORBIDDEN',
      });
    }

    if (existing.status !== 'PENDING') {
      return res.status(409).json({
        message: 'Only PENDING collaborations can be rejected',
        code: 'INVALID_STATE',
      });
    }

    const updated = await prisma.collaboration.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    return res.json(toCollaborationJson(updated));
  } catch (e) {
    return next(e);
  }
}

module.exports = {
  list,
  listImporters,
  requestCollaboration,
  approve,
  reject,
};

