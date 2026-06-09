const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { cloudinary } = require('../config/cloudinary');

exports.show = (req, res) => res.render('profile/show', { title: 'My profile' });

exports.update = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.name = req.body.name || user.name;
  if (req.file) {
    if (user.avatar?.publicId) {
      try { await cloudinary.uploader.destroy(user.avatar.publicId); } catch (_) {}
    }
    user.avatar = { url: req.file.path, publicId: req.file.filename };
  }
  await user.save();
  req.flash('success', 'Profile updated.');
  res.redirect('/profile');
});

exports.changePassword = catchAsync(async (req, res) => {
  const { current, next } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(current))) {
    throw new AppError('Current password incorrect', 400);
  }
  user.password = next;
  await user.save();
  req.flash('success', 'Password changed.');
  res.redirect('/profile');
});
