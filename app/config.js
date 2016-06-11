const env = process.env.NODE_ENV || 'development';

module.exports = {
  env,
  port: process.env.PORT || {
    development: 8080,
    test: 8081,
  }[env],
  db: process.env.DB || {
    development: 'mongodb://localhost/oeco-dev',
    test: 'mongodb://localhost/oeco-test',
  }[env],
};
