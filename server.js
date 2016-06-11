const { assign } = require('lodash');
const { start, stop } = require('.');

const context = {};

process.on('SIGTERM', () => {
  console.log('\ncaught SIGTERM, stopping gracefully');
  stop(context).then(() => {
    process.exit(1);
  });
});

process.on('SIGINT', () => {
  console.log('\ncaught SIGINT, stopping gracefully');
  stop(context).then(() => {
    process.exit(1);
  });
});

start().then(c => assign(context, c));
