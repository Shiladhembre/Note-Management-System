const { body, validationResult } = require('express-validator');

exports.registerRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name 2-80 chars'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
];

exports.loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

exports.noteRules = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title required (max 200)'),
  body('content').optional().isLength({ max: 50000 }),
  body('color').optional().isHexColor(),
];

exports.handle = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  if (req.path.startsWith('/api/')) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  req.flash('error', errors.array().map((e) => e.msg).join(' • '));
  return res.redirect('back');
};
