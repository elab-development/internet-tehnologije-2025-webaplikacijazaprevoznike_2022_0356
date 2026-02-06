const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../db');

async function register(req, res, next) {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({
        message: 'email, password, name and role are required',
        code: 'VALIDATION_ERROR',
      });
    }

    const allowedRoles = ['ADMIN', 'SUPPLIER', 'IMPORTER'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid role',
        code: 'VALIDATION_ERROR',
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        message: 'User with this email already exists',
        code: 'EMAIL_TAKEN',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name, role },
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
  } catch (e) {
    return next(e);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password required',
        code: 'VALIDATION_ERROR',
      });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) {
      return res.status(401).json({
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret || (typeof secret === 'string' && !secret.trim())) {
      console.error('Login failed: JWT_SECRET is not set in environment');
      return res.status(500).json({
        message: 'Server configuration error',
        code: 'SERVER_CONFIG',
      });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      secret,
      { expiresIn: '7d' }
    );
    return res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    });
  } catch (e) {
    return next(e);
  }
}

async function logout(req, res) {
  // JWT je stateless; "logout" je stvar klijenta (brisanje tokena).
  return res.json({
    message: 'Logged out',
    code: 'LOGGED_OUT',
  });
}

module.exports = { register, login, logout };
