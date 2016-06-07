const { async: aasync, await: aawait } = require('asyncawait');
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

function validate(document) {
  return promisify(document.validate.bind(document))();
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
      .get(aasync((_, response) => {
        try {
          const query = Category.find({}).sort({ name: 1 });
          const results = aawait(promisify(query.exec.bind(query))());
          const categories = results.map(result => ({ id: result.id, name: result.name }));
          response.status(OK).json(categories);
        } catch (err) {
          errorFormatter(response)(err);
        }
      }))
      .post(aasync(({ body }, response) => {
        try {
          const category = aawait(new Category({ id: body.id, name: body.name }));
          aawait(validate(category));
          const result = aawait(category.save());
          response.status(CREATED).json({ id: result.id, name: result.name });
        } catch (err) {
          errorFormatter(response)(err);
        }
      }));

    app.route('/categories/:id')
      .put(aasync(({ params, body }, response) => {
        try {
          // Look for existing document
          const findOneQuery = Category.findOne({ id: params.id });
          const category = aawait(promisify(findOneQuery.exec.bind(findOneQuery))());
          if (!category) {
            response.status(NOT_FOUND).json();
            return;
          }

          const $set = { id: body.id, name: body.name };
          aawait(validate(new Category($set)));

          // Update document
          const updateQuery = Category.update({ _id: category._id }, { $set }); // eslint-disable-line
          aawait(promisify(updateQuery.exec.bind(updateQuery))());

          // Retreive updated document
          const updatedDocumentQuery = Category.findOne({ _id: category._id }); // eslint-disable-line
          const result = aawait(promisify(updatedDocumentQuery.exec.bind(updatedDocumentQuery))());

          response.status(OK).json({ id: result.id, name: result.name });
        } catch (err) {
          errorFormatter(response)(err);
        }
      }))
      .delete(aasync(({ params }, response) => {
        try {
          const query = Category.findOne({ id: params.id });
          const category = aawait(promisify(query.exec.bind(query))());
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
