const mongoose = require('mongoose');
const { Slug } = require('./types');

const Category = mongoose.model('Category', {
  id: { type: Slug, trim: true, unique: true, index: true },
  name: { type: String, trim: true, unique: true },
});

module.exports = { Category };
