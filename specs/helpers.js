const { promisify } = require('bluebird');
const { assign, partial } = require('lodash');
// const mongoose = require('mongoose');
const { info } = require('../app/console');
const serve = require('..');

const removeAll = model => promisify(partial(model.remove.bind(model), {}))();

function tearDown(context) {
  return promisify(context.db.close.bind(context.db))()
    .then(() => info('Mongoose disconnected'))
    .then(promisify(context.server.close.bind(context.server))())
    .then(() => info('Express stopped'));
}

function setup() {
  const context = {};

  before(() => serve().then(c => {
    assign(context, c);
  }));

  after(() => tearDown(context));

  return context;
}

module.exports = { removeAll, setup, tearDown };
