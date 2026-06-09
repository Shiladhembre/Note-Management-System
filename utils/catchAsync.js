// Wraps async route handlers so we don't repeat try/catch.
module.exports = (fn) => (req, res, next) => fn(req, res, next).catch(next);
