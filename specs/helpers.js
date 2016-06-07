const { async: aasync, await: aawait } = require('asyncawait');
const { promisify } = require('bluebird');
const { assign, partial } = require('lodash');
// const mongoose = require('mongoose');
const { info } = require('../app/console');
const serve = require('..');

const removeAll = model => promisify(partial(model.remove.bind(model), {}))();

const tearDown = aasync(context => {
  aawait(promisify(context.db.close.bind(context.db)));
  info('Mongoose disconnected');

  aawait(promisify(context.server.close.bind(context.server)));
  info('Express stopped');
});

function setup() {
  const context = {};

  before(() => serve().then(c => {
    assign(context, c);
  }));

  after(() => tearDown(context));

  return context;
}

module.exports = { removeAll, setup, tearDown };
