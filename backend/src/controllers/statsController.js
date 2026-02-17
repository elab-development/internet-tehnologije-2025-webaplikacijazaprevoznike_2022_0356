const { prisma } = require('../db');

async function getStats(req, res, next) {
  try {
    const [collaborationsByStatus, productsByCategory, totals] = await Promise.all([
      prisma.collaboration.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.product.groupBy({
        by: ['categoryId'],
        _count: { id: true },
      }),
      Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.container.count(),
        prisma.collaboration.count(),
      ]),
    ]);

    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
    });
    const categoryById = Object.fromEntries(categories.map((c) => [c.id, c.name]));

    const statusCounts = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
    };
    collaborationsByStatus.forEach((row) => {
      statusCounts[row.status] = row._count.id;
    });

    const productsPerCategory = productsByCategory.map((row) => ({
      categoryName: categoryById[row.categoryId] || 'Unknown',
      count: row._count.id,
    }));

    const [totalUsers, totalProducts, totalContainers, totalCollaborations] = totals;

    return res.json({
      collaborationsByStatus: statusCounts,
      productsByCategory: productsPerCategory,
      totals: {
        users: totalUsers,
        products: totalProducts,
        containers: totalContainers,
        collaborations: totalCollaborations,
      },
    });
  } catch (e) {
    return next(e);
  }
}

module.exports = { getStats };
