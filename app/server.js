const { async: aasync, await: aawait } = require('asyncawait');
const { promisify } = require('bluebird');
const bodyParser = require('body-parser');
const express = require('express');
const { partialRight } = require('lodash');
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

function promisifier(object, method) {
  return promisify(object[method].bind(object));
}

const validator = partialRight(promisifier, 'validate');
const executor = partialRight(promisifier, 'exec');

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
      .get(aasync((_, response) => {
        try {
          const results = aawait(executor(Category.find({}).sort({ name: 1 })));
          const categories = results.map(result => ({ id: result.id, name: result.name }));
          response.status(OK).json(categories);
        } catch (err) {
          errorFormatter(response)(err);
        }
      }))
      .post(aasync(({ body }, response) => {
        try {
          const category = aawait(new Category({ id: body.id, name: body.name }));
          aawait(validator(category));
          const result = aawait(category.save());
          response.status(CREATED).json({ id: result.id, name: result.name });
        } catch (err) {
          errorFormatter(response)(err);
        }
      }));

    app.route('/categories/:id')
      .put(aasync(({ params, body }, response) => {
        try {
          // Validate query
          const $set = { id: body.id, name: body.name };
          aawait(validator(new Category($set)));

          // Look for existing document
          const category = aawait(executor(Category.findOne({ id: params.id })));
          if (!category) {
            response.status(NOT_FOUND).json();
            return;
          }

          // Update document
          aawait(executor(Category.update({ _id: category._id }, { $set }))); // eslint-disable-line

          // Retreive updated document
          const result = aawait(executor(Category.findOne({ _id: category._id }))); // eslint-disable-line

          response.status(OK).json({ id: result.id, name: result.name });
        } catch (err) {
          errorFormatter(response)(err);
        }
      }))
      .delete(aasync(({ params }, response) => {
        try {
          const category = aawait(executor(Category.findOne({ id: params.id })));
          if (!category) {
            response.status(NOT_FOUND).json();
            return;
          }
          aawait(category.remove());
          response.status(NO_CONTENT).json();
        } catch (err) {
          errorFormatter(response)(err);
        }
      }));

    const { port } = config;
    const server = app.listen(port, () => {
      info(`Application listening on port ${server.address().port}...`);
      resolve({ server, db, models });
    });
  }));
};
