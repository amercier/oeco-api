const { promisify } = require('bluebird');
const bodyParser = require('body-parser');
const express = require('express');
const { info } = require('./console');
const config = require('./config');
const setupMongoose = require('./db');
const {
  OK,
  CREATED,
  NO_CONTENT,
  BAD_REQUEST,
  NOT_FOUND,
  CONFLICT,
  INTERNAL_SERVER_ERROR,
} = require('http-status-codes');

function errorFormatter(response) {
  return err => {
    let code = err.code || INTERNAL_SERVER_ERROR;
    let message = err.message || `${err}`;
    if (err.name && err.name === 'ValidationError') {
      const firstError = err.errors[Object.keys(err.errors)[0]];
      message = firstError.message;
      if (/^missing_/.test(message)) {
        code = BAD_REQUEST;
      } else if (/^existing_/.test(message)) {
        code = CONFLICT;
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
            response.status(OK).json(categories);
          })
          .catch(errorFormatter(response));
      })
      .post((request, response) => {
        Promise.resolve(request.body)
          .then(payload => new Category({ id: payload.id, name: payload.name }))
          .then(category => promisify(category.validate.bind(category))().then(() => category))
          .then(category => category.save())
          .then(result => response.status(CREATED).json({ id: result.id, name: result.name }))
          .catch(errorFormatter(response));
      });

    app.route('/categories/:id')
      .put((request, response) => {
        Promise.resolve([request.params, request.body])
          .then(([params, payload]) => {
            const query = Category.findOne({ id: params.id });
            return Promise.all([
              promisify(query.exec.bind(query))(),
              payload,
            ]);
          })
          .then(([existingCategory, payload]) => {
            const category = new Category({ id: payload.id, name: payload.name });
            return promisify(category.validate.bind(category))()
              .then(() => ([existingCategory, payload]));
          })
          .then(([category, payload]) => {
            if (!category) {
              return response.status(NOT_FOUND).json();
            }
            const query = Category.update(
              { _id: category._id }, // eslint-disable-line no-underscore-dangle
              { $set: { id: payload.id, name: payload.name } }
            );
            return promisify(query.exec.bind(query))()
              .then(() => {
                const q = Category.findOne({ _id: category._id }); // eslint-disable-line
                return promisify(q.exec.bind(q))();
              })
              .then(result => response.status(OK).json({ id: result.id, name: result.name }));
          })
          .catch(errorFormatter(response));
      })
      .delete((request, response) => {
        Promise.resolve(request.params)
          .then(params => {
            const query = Category.findOne({ id: params.id });
            return promisify(query.exec.bind(query))();
          })
          .then(category => {
            if (!category) {
              return response.status(NOT_FOUND).json();
            }
            return category.remove()
              .then(() => response.status(NO_CONTENT).json());
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
