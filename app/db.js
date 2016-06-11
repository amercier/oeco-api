const { fromPairs, toPairs } = require('lodash');
const mongoose = require('mongoose');
const schemas = require('./schemas');
const { info, error } = require('./console');
const config = require('./config');

// MongoDB
module.exports = function startMongoose(mongo = mongoose) {
  return new Promise((resolve, reject) => {
    const { mongodb } = config;

    const mongoUrl = `mongodb://${mongodb.host}/${mongodb.db}`;
    const db = mongo.createConnection(mongoUrl);

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
      info(`Connected to MongoDB at ${mongoUrl}`);
      resolve({ db, models });
    });
  });
};
