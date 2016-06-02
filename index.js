const express = require('express');

const config = {
  port: 8080,
};

module.exports = function serverFactory() {
  const app = express();
  const { port } = config;

  app.get('/', (request, response) => {
    response.send(`Hello World!\n`);
  });

  const server = app.listen(port, () => {
    console.log(`Application listening on port ${server.address().port}...`);
  });

  return server;
};
