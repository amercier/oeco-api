const { fromPairs, toPairs } = require('lodash');
const mongoose = require('mongoose');
const schemas = require('./schemas');
const { info, error } = require('./console');
const config = require('./config');

// MongoDB
module.exports = function startMongoose(mongo = mongoose) {
  return new Promise((resolve, reject) => {
    const db = mongo.createConnection(config.db);

    const models = fromPairs(
      toPairs(schemas).map(
        ([name, model]) => [name, db.model(name, model)]
      )
    );

    db.once('error', err => {
      error('MongoDB connection error:', err);
      reject(err);
    });

    db.once('open', () => {
      info(`Connected to MongoDB at ${config.db}`);
      resolve({ db, models });
    });
  });
};
