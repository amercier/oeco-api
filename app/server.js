const { async: aasync, await: aawait } = require('asyncawait');
const { promisify } = require('bluebird');
const { green } = require('chalk');
const bodyParser = require('body-parser');
const express = require('express');
const { partialRight } = require('lodash');
const { success } = require('./console');
const config = require('./config');
const {
  OK, CREATED, NO_CONTENT, BAD_REQUEST, NOT_FOUND, CONFLICT, INTERNAL_SERVER_ERROR,
} = require('http-status-codes');

function normalizeError(err) {
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
  return { code, message };
}

function promisifier(object, method) {
  return promisify(object[method].bind(object));
}

const validator = partialRight(promisifier, 'validate');
const executor = partialRight(promisifier, 'exec');

function handler(handle) {
  return aasync((request, response) => {
    try {
      handle(request, response);
    } catch (err) {
      const { code, message } = normalizeError(err);
      response.status(code).json({ message });
    }
  });
}

// Express
module.exports = function startExpress(models) {
  return new Promise(resolve => {
    const app = express();

    app.use(bodyParser.json());

    app.get('/', (request, response) => {
      response.send(`Hello World!\n`);
    });

    const { Category } = models;

    app.route('/categories')
      .get(handler((_, response) => {
        const results = aawait(executor(Category.find({}).sort({ name: 1 })));
        const categories = results.map(result => ({ id: result.id, name: result.name }));
        response.status(OK).json(categories);
      }))
      .post(handler(({ body }, response) => {
        const category = aawait(new Category({ id: body.id, name: body.name }));
        aawait(validator(category));
        const result = aawait(category.save());
        response.status(CREATED).json({ id: result.id, name: result.name });
      }));

    app.route('/categories/:id')
      .put(handler(({ params, body }, response) => {
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
      }))
      .delete(handler(({ params }, response) => {
        const category = aawait(executor(Category.findOne({ id: params.id })));
        if (!category) {
          response.status(NOT_FOUND).json();
          return;
        }
        aawait(category.remove());
        response.status(NO_CONTENT).json();
      }));

    const { port } = config;
    const server = app.listen(port, () => {
      success(`Application listening on port ${green(port)}`, 'Express');
      resolve(server);
    });
  });
};
