/**
 * Hybrid auth: supports BOTH session (web) and JWT bearer (API).
 * - attachUser: tries to populate req.user on every request (no redirect).
 * - protect: redirects to /auth/login if no user.
 * - protectApi: 401 JSON if no user.
 */
const User = require('../models/User');
const { verifyJwt } = require('../utils/token');

async function resolveUser(req) {
  // 1. Session
  if (req.session && req.session.userId) {
    return User.findById(req.session.userId);
  }
  // 2. JWT (cookie or Authorization header)
  let token = req.cookies?.token;
  const auth = req.headers.authorization;
  if (!token && auth?.startsWith('Bearer ')) token = auth.slice(7);
  if (token) {
    try {
      const decoded = verifyJwt(token);
      return User.findById(decoded.id);
    } catch (_) {
      return null;
    }
  }
  return null;
}

exports.attachUser = async (req, res, next) => {
  try {
    req.user = await resolveUser(req);
    res.locals.user = req.user || null;
  } catch (_) {
    req.user = null;
  }
  next();
};

exports.protect = (req, res, next) => {
  if (!req.user) {
    if (req.flash) req.flash('error', 'Please log in to continue.');
    return res.redirect('/auth/login');
  }
  next();
};

exports.protectApi = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  next();
};
