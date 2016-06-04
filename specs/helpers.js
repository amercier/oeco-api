const { promisify } = require('bluebird');
const { assign, partial } = require('lodash');
const mongoose = require('mongoose');
const { info } = require('../app/console');
const serve = require('..');

const removeAll = model => promisify(partial(model.remove.bind(model), {}))();

function createContext() {
  const context = {};

  before(() => serve().then(c => {
    assign(context, c);
  }));

  after(done => {
    mongoose.connection.close(() => {
      info('Mongoose disconnected');

      context.server.close();
      info('Express stopped');
      done();
    });
  });

  return context;
}

module.exports = { removeAll, createContext };
