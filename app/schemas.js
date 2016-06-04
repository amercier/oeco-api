const { Schema } = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const { Slug } = require('./types');

const Category = new Schema({
  id: { type: Slug, required: true, trim: true, unique: true, index: true },
  name: { type: String, required: true, trim: true, unique: true },
});

Category.plugin(beautifyUnique);

module.exports = { Category };
