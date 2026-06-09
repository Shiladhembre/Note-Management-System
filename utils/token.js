const jwt = require('jsonwebtoken');

exports.signJwt = (payload, options = {}) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    ...options,
  });

exports.verifyJwt = (token) => jwt.verify(token, process.env.JWT_SECRET);
