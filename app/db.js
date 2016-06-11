const { green, red } = require('chalk');
const { fromPairs, toPairs } = require('lodash');
const mongoose = require('mongoose');
const schemas = require('./schemas');
const { error, success } = require('./console');
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
      error(`MongoDB connection error: ${red(err)}`, 'MongoDB');
      reject(err);
    });

    db.once('open', () => {
      success(`Connected to MongoDB at ${green(config.db)}`, 'MongoDB');
      resolve({ db, models });
    });
  });
};
