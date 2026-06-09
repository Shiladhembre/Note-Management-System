const Note = require('../models/Note');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { toTxt, toPdfStream } = require('../services/exportService');

function emitToUser(req, event, payload) {
  const io = req.app.get('io');
  if (io && req.user) io.to(`user:${req.user._id}`).emit(event, payload);
}

/* ---------- Web ---------- */
exports.list = catchAsync(async (req, res) => {
  const { q, label, sort = 'newest', filter = 'active', page = 1 } = req.query;
  const limit = 12;
  const skip = (Number(page) - 1) * limit;

  const where = { user: req.user._id };
  if (filter === 'trash') where.deletedAt = { $ne: null };
  else where.deletedAt = null;
  if (filter === 'archived') where.archived = true;
  else if (filter === 'favorites') where.favorite = true;
  else if (filter === 'active') where.archived = false;

  if (label) where.labels = label.toLowerCase();
  if (q) where.$text = { $search: q };

  const sortMap = {
    newest: { pinned: -1, createdAt: -1 },
    oldest: { pinned: -1, createdAt: 1 },
    updated: { pinned: -1, updatedAt: -1 },
  };

  const [notes, total, allLabels] = await Promise.all([
    Note.find(where).sort(sortMap[sort] || sortMap.newest).skip(skip).limit(limit),
    Note.countDocuments(where),
    Note.distinct('labels', { user: req.user._id, deletedAt: null }),
  ]);

  res.render('notes/index', {
    title: 'My Notes',
    notes,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit) || 1,
    q: q || '',
    label: label || '',
    sort,
    filter,
    allLabels,
  });
});

exports.showNew = (req, res) => res.render('notes/new', { title: 'New note' });

exports.create = catchAsync(async (req, res) => {
  const { title, content, color, labels } = req.body;
  const note = await Note.create({
    user: req.user._id,
    title,
    content,
    color,
    labels: parseLabels(labels),
  });
  emitToUser(req, 'note:created', note);
  req.flash('success', 'Note created.');
  res.redirect('/notes');
});

exports.showEdit = catchAsync(async (req, res) => {
  const note = await ownedNote(req);
  res.render('notes/edit', { title: 'Edit note', note });
});

exports.update = catchAsync(async (req, res) => {
  const note = await ownedNote(req);
  const { title, content, color, labels } = req.body;
  Object.assign(note, { title, content, color, labels: parseLabels(labels) });
  await note.save();
  emitToUser(req, 'note:updated', note);
  req.flash('success', 'Note updated.');
  res.redirect('/notes');
});

exports.softDelete = catchAsync(async (req, res) => {
  const note = await ownedNote(req);
  note.deletedAt = new Date();
  await note.save();
  emitToUser(req, 'note:trashed', { id: note._id });
  req.flash('success', 'Moved to trash.');
  res.redirect('back');
});

exports.restore = catchAsync(async (req, res) => {
  const note = await ownedNote(req, true);
  note.deletedAt = null;
  await note.save();
  req.flash('success', 'Note restored.');
  res.redirect('back');
});

exports.destroy = catchAsync(async (req, res) => {
  const note = await ownedNote(req, true);
  await note.deleteOne();
  req.flash('success', 'Note permanently deleted.');
  res.redirect('back');
});

exports.togglePin = catchAsync(async (req, res) => toggle(req, res, 'pinned', 'pinned'));
exports.toggleArchive = catchAsync(async (req, res) =>
  toggle(req, res, 'archived', 'archive state changed')
);
exports.toggleFavorite = catchAsync(async (req, res) =>
  toggle(req, res, 'favorite', 'favorite toggled')
);

exports.exportNote = catchAsync(async (req, res) => {
  const note = await ownedNote(req);
  const format = (req.query.format || 'txt').toLowerCase();
  if (format === 'pdf') return toPdfStream(note, res);
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="${note._id}.txt"`);
  res.send(toTxt(note));
});

/* ---------- REST API ---------- */
exports.apiList = catchAsync(async (req, res) => {
  const notes = await Note.find({ user: req.user._id, deletedAt: null }).sort({ createdAt: -1 });
  res.json({ success: true, data: notes });
});
exports.apiGet = catchAsync(async (req, res) => {
  const note = await ownedNote(req);
  res.json({ success: true, data: note });
});
exports.apiCreate = catchAsync(async (req, res) => {
  const note = await Note.create({ ...req.body, user: req.user._id });
  emitToUser(req, 'note:created', note);
  res.status(201).json({ success: true, data: note });
});
exports.apiUpdate = catchAsync(async (req, res) => {
  const note = await ownedNote(req);
  Object.assign(note, req.body);
  await note.save();
  emitToUser(req, 'note:updated', note);
  res.json({ success: true, data: note });
});
exports.apiDelete = catchAsync(async (req, res) => {
  const note = await ownedNote(req);
  note.deletedAt = new Date();
  await note.save();
  res.json({ success: true });
});

/* ---------- helpers ---------- */
async function ownedNote(req, includeDeleted = false) {
  const where = { _id: req.params.id, user: req.user._id };
  if (!includeDeleted) where.deletedAt = null;
  const note = await Note.findOne(where);
  if (!note) throw new AppError('Note not found', 404);
  return note;
}
async function toggle(req, res, field, msg) {
  const note = await ownedNote(req);
  note[field] = !note[field];
  await note.save();
  emitToUser(req, 'note:updated', note);
  if (req.path.startsWith('/api/')) return res.json({ success: true, data: note });
  req.flash('success', msg);
  res.redirect('back');
}
function parseLabels(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return String(raw)
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}
