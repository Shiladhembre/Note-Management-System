const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, default: '' }, // markdown supported
    color: { type: String, default: '#ffffff' },
    labels: [{ type: String, trim: true, lowercase: true }],
    pinned: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false, index: true },
    favorite: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null, index: true }, // soft delete
    attachments: [{ url: String, publicId: String, name: String }],
  },
  { timestamps: true }
);

noteSchema.index({ title: 'text', content: 'text', labels: 'text' });

module.exports = mongoose.model('Note', noteSchema);
