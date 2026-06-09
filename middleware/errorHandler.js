module.exports = (err, req, res, next) => {
  console.error('🔥', err.message);
  const status = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Something went wrong';

  // JSON for API
  if (req.path.startsWith('/api/')) {
    return res.status(status).json({ success: false, message });
  }

  if (req.flash) req.flash('error', message);
  res.status(status).render('error', {
    title: 'Error',
    status,
    message,
  });
};
