const { Schema } = require('mongoose');
const { Slug } = require('./types');

const Category = new Schema({
  id: { type: Slug, trim: true, unique: true, index: true },
  name: { type: String, trim: true, unique: true },
});

module.exports = { Category };
