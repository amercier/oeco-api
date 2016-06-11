/* eslint no-console:0 */

const { fromPairs } = require('lodash');

const aliases = {
  debug: 'log',
};

module.exports = fromPairs(['debug', 'info', 'warn', 'error'].map(name =>
  [name, console[aliases[name] || name].bind(console)]
));
