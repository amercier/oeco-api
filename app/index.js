const { async: aasync, await: aawait } = require('asyncawait');
const { promisify } = require('bluebird');
const { partial } = require('lodash');
const { info } = require('../app/console');
const startMongoose = require('./db');
const startExpress = require('./server');

const start = () => startMongoose().then(
  ({ db, models }) => startExpress(models).then(
    server => ({ db, models, server })
  )
);

const close = aasync((name, obj) => {
  aawait(promisify(obj.close.bind(obj)));
  info(`${name} disconnected`);
});

const stopMongoose = partial(close, 'Mongoose');
const stopExpress = partial(close, 'Express');

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
