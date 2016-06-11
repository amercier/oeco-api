const { async: aasync, await: aawait } = require('asyncawait');
const { promisify } = require('bluebird');
const { info } = require('../app/console');
const startMongoose = require('./db');
const startExpress = require('./server');

const start = () => startMongoose().then(
  ({ db, models }) => startExpress(models).then(
    server => ({ db, models, server })
  )
);

const stopMongoose = aasync(db => {
  aawait(promisify(db.close.bind(db)));
  info('Mongoose disconnected');
});

const stopExpress = aasync(server => {
  aawait(promisify(server.close.bind(server)));
  info('Express stopped');
});

const stop = aasync((db, server) => {
  aawait(stopMongoose(db));
  aawait(stopExpress(server));
});

module.exports = {
  startMongoose,
  startExpress,
  start,
  stopMongoose,
  stopExpress,
  stop,
};
