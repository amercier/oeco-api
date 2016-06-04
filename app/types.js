const { assign } = require('lodash');
const { Schema, SchemaType } = require('mongoose');
const slug = require('slug');

class Slug extends SchemaType {
  constructor(...args) {
    super(...args, 'Slug');
  }

  cast(value) {
    return slug(`${value}`.toLowerCase());
  }
}

module.exports = { Slug };
assign(Schema.Types, module.exports);
