const { promisify } = require('bluebird');
const { assign, partial } = require('lodash');
const { start, stop } = require('..');

const removeAll = model => promisify(partial(model.remove.bind(model), {}))();

function setup() {
  const context = {};
  before(() => start().then(c => assign(context, c)));
  after(() => stop(context.db, context.server));
  return context;
}

module.exports = { removeAll, setup };
