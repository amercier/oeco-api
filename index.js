const { promisify } = require('bluebird');
const express = require('express');
const { fromPairs, toPairs } = require('lodash');
const mongoose = require('mongoose');
const schemas = require('./app/schemas');
const { info, error } = require('./app/console');

const config = {
  port: process.env.PORT || 8080,
  mongodb: {
    host: 'localhost',
    db: 'oeco-dev',
  },
};

// MongoDB
function setupMongoose() {
  return new Promise((resolve, reject) => {
    const { mongodb } = config;

    const mongoUrl = `mongodb://${mongodb.host}/${mongodb.db}`;
    const db = mongoose.createConnection(mongoUrl);

    const models = fromPairs(
      toPairs(schemas).map(
        ([name, model]) => [name, db.model(name, model)]
      )
    );

    db.once('error', err => {
      error('MongoDB connection error:', err);
      reject(error);
    });

    db.once('open', () => {
      info(`Connected to MongoDB at ${mongoUrl}`);
      resolve({ db, models });
    });
  });
}

// Express
function serve() {
  return setupMongoose().then(({ db, models }) => new Promise(resolve => {
    const app = express();

    app.get('/', (request, response) => {
      response.send(`Hello World!\n`);
    });

    app.get('/categories', (request, response) => {
      const query = models.Category.find({}).sort({ name: 1 });
      promisify(query.exec.bind(query))().then(results => {
        const categories = results.map(result => ({ id: result.id, name: result.name }));
        response.json(categories);
      });
    });

    const { port } = config;
    const server = app.listen(port, () => {
      info(`Application listening on port ${server.address().port}...`);
      resolve({ server, db, models });
    });
  }));
}

module.exports = serve;
