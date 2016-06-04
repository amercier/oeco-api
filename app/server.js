const { promisify } = require('bluebird');
const bodyParser = require('body-parser');
const express = require('express');
const { info } = require('./console');
const config = require('./config');
const setupMongoose = require('./db');

function errorFormatter(response) {
  return err => {
    let code = err.code || 500;
    let message = err.message || `${err}`;
    if (err.name && err.name === 'ValidationError') {
      code = 400;
      message = err.errors[Object.keys(err.errors)[0]].message;
    }
    response.status(code).send({ message });
  };
}

// Express
module.exports = function serve() {
  return setupMongoose().then(({ db, models }) => new Promise(resolve => {
    const app = express();

    app.use(bodyParser.json());

    app.get('/', (request, response) => {
      response.send(`Hello World!\n`);
    });

    const { Category } = models;

    app.route('/categories')
      .get((request, response) => {
        Promise.resolve()
          .then(() => {
            const query = Category.find({}).sort({ name: 1 });
            return promisify(query.exec.bind(query))();
          })
          .then(results => {
            const categories = results.map(result => ({ id: result.id, name: result.name }));
            response.json(categories);
          })
          .catch(errorFormatter(response));
      })
      .post((request, response) => {
        Promise.resolve(request.body)
          .then(payload => new Category({ id: payload.id, name: payload.name }).save())
          .then(result => response.json({ id: result.id, name: result.name }))
          .catch(errorFormatter(response));
      });

    const { port } = config;
    const server = app.listen(port, () => {
      info(`Application listening on port ${server.address().port}...`);
      resolve({ server, db, models });
    });
  }));
};
