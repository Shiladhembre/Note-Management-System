const crypto = require('crypto');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { signJwt } = require('../utils/token');
const { sendMail } = require('../services/mailer');

function setAuthCookies(res, token, remember) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: remember ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24, // 30d / 1d
  });
}

exports.showRegister = (req, res) => res.render('auth/register', { title: 'Register' });
exports.showLogin = (req, res) => res.render('auth/login', { title: 'Login' });
exports.showForgot = (req, res) => res.render('auth/forgot', { title: 'Forgot password' });
exports.showReset = (req, res) =>
  res.render('auth/reset', { title: 'Reset password', token: req.params.token });

exports.register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) {
    req.flash('error', 'Email already registered.');
    return res.redirect('/auth/register');
  }
  const user = await User.create({ name, email, password });
  req.session.userId = user._id;
  const token = signJwt({ id: user._id });
  setAuthCookies(res, token, false);
  req.flash('success', `Welcome, ${user.name}!`);
  res.redirect('/notes');
});

exports.login = catchAsync(async (req, res) => {
  const { email, password, remember } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    req.flash('error', 'Invalid email or password.');
    return res.redirect('/auth/login');
  }
  req.session.userId = user._id;
  if (remember) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
  const token = signJwt({ id: user._id });
  setAuthCookies(res, token, !!remember);
  req.flash('success', 'Logged in.');
  res.redirect('/notes');
});

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sn.sid');
    res.clearCookie('token');
    res.redirect('/auth/login');
  });
};

exports.forgot = catchAsync(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const raw = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const url = `${process.env.APP_URL || 'http://localhost:3000'}/auth/reset/${raw}`;
    await sendMail({
      to: user.email,
      subject: 'Reset your Smart Notes password',
      text: `Reset link (valid 30 min): ${url}`,
      html: `<p>Click to reset (valid 30 min):</p><p><a href="${url}">${url}</a></p>`,
    });
  }
  req.flash('success', 'If that email exists, a reset link was sent.');
  res.redirect('/auth/login');
});

exports.reset = catchAsync(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetToken: hashed,
    resetTokenExpires: { $gt: Date.now() },
  }).select('+password');
  if (!user) {
    req.flash('error', 'Token invalid or expired.');
    return res.redirect('/auth/forgot');
  }
  user.password = req.body.password;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  req.flash('success', 'Password updated. Please log in.');
  res.redirect('/auth/login');
});

/* ---------- API auth (JSON) ---------- */
exports.apiLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid credentials', 401));
  }
  const token = signJwt({ id: user._id });
  res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
});
