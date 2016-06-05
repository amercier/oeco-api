const { Schema } = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const { Slug } = require('./types');

const Category = new Schema({
  id: {
    type: Slug,
    required: [true, 'missing_id'],
    trim: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'missing_name'],
    trim: true,
    unique: true,
  },
});

Category.plugin(uniqueValidator, { message: 'existing_{PATH}' });

module.exports = { Category };
