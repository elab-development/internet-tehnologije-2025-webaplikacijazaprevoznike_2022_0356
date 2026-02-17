const { prisma } = require('../db');

async function getLocations(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['SUPPLIER', 'IMPORTER'] },
        active: true,
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        latitude: true,
        longitude: true,
      },
    });
    const locations = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      lat: Number(u.latitude),
      lng: Number(u.longitude),
    }));
    return res.json(locations);
  } catch (e) {
    return next(e);
  }
}

module.exports = { getLocations };
