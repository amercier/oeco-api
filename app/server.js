const { promisify } = require('bluebird');
const express = require('express');
const { info } = require('./console');
const config = require('./config');
const setupMongoose = require('./db');

// Express
module.exports = function serve() {
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
};
