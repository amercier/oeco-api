const express = require('express');
const mongoose = require('mongoose');

const config = {
  port: process.env.PORT || 8080,
  mongodb: {
    host: 'localhost',
    db: 'oeco-dev',
  },
};

module.exports = function serverFactory() {
  const app = express();

  const { host, db } = config.mongodb;
  const mongoUrl = `mongodb://${host}/${db}`;
  mongoose.connect(mongoUrl);
  console.log(`Connected to MongoDB at ${mongoUrl}`);

  app.get('/', (request, response) => {
    response.send(`Hello World!\n`);
  });

  const { port } = config;
  const server = app.listen(port, () => {
    console.log(`Application listening on port ${server.address().port}...`);
  });

  return server;
};
