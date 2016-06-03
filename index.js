const express = require('express');
const mongoose = require('mongoose');

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
console.log(`Connected to MongoDB at ${mongoUrl}`);

// Express
module.exports = function serverFactory() {
  const app = express();

  app.get('/', (request, response) => {
    response.send(`Hello World!\n`);
  });

  const { port } = config;
  const server = app.listen(port, () => {
    console.log(`Application listening on port ${server.address().port}...`);
  });

  return server;
};
