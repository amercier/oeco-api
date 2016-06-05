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
      const firstError = err.errors[Object.keys(err.errors)[0]];
      message = firstError.message;
      if (/^missing_/.test(message)) {
        code = 400;
      } else if (/^existing_/.test(message)) {
        code = 409;
      }
    }
    response.status(code).send({ error: message });
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
          .then(payload => new Category({ id: payload.id, name: payload.name }))
          .then(category => promisify(category.validate.bind(category))().then(() => category))
          .then(category => category.save())
          .then(result => response.status(201).json({ id: result.id, name: result.name }))
          .catch(errorFormatter(response));
      });

    app.route('/categories/:id')
      .delete((request, response) => {
        Promise.resolve(request.params)
          .then(params => {
            const query = Category.findOne({ id: params.id });
            return promisify(query.exec.bind(query))();
          })
          .then(category => {
            if (!category) {
              return response.status(404).json();
            }
            return category.remove()
              .then(() => response.status(204).json());
          })
          .catch(errorFormatter(response));
      });

    const { port } = config;
    const server = app.listen(port, () => {
      info(`Application listening on port ${server.address().port}...`);
      resolve({ server, db, models });
    });
  }));
};
