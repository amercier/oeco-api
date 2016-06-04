const express = require('express');
const mongoose = require('mongoose');
const { Category } = require('./app/models');

const config = {
  port: process.env.PORT || 8080,
  mongodb: {
    host: 'localhost',
    db: 'oeco-dev',
  },
};

// MongoDB
const { mongodb } = config;
const mongoUrl = `mongodb://${mongodb.host}/${mongodb.db}`;
mongoose.connect(mongoUrl);

const db = new Promise((resolve, reject) => {
  const { connection } = mongoose;

  connection.once('error', error => {
    console.error('MongoDB connection error:', error);
    reject(error);
  });

  connection.once('open', () => {
    console.log(`Connected to MongoDB at ${mongoUrl}`);
    resolve(connection);
  });
});

// Express
module.exports = {
  db,
  serve() {
    const app = express();

    app.get('/', (request, response) => {
      response.send(`Hello World!\n`);
    });

    app.get('/categories', (request, response) => {
      Category.find({}).sort({ name: 1 }).exec((err, results) => {
        if (err) {
          throw err;
        }
        const categories = results.map(result => ({ id: result.id, name: result.name }));
        response.json(categories);
      });
    });

    const { port } = config;
    const server = app.listen(port, () => {
      console.log(`Application listening on port ${server.address().port}...`);
    });

    return server;
  },
};
