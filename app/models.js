const mongoose = require('mongoose');

const Category = mongoose.model('Category', {
  name: { type: String, trim: true, unique: true },
});

module.exports = { Category };
