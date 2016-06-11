const { blue, green, grey, magenta, red, yellow } = require('chalk');
const { fromPairs } = require('lodash');
const pad = require('pad');

const { stdout, stderr } = process;

module.exports = fromPairs([
  ['debug', magenta('⚐'), stdout],
  ['info', blue('★'), stdout],
  ['warn', yellow('⚑'), stdout],
  ['error', red('✗'), stderr],
  ['success', green('✓'), stdout],
].map(([name, icon, stream]) => [name, (message, channel) => {
  if (stream.isTTY) {
    const info = `[${pad(channel, 7)}]`;
    stream.write(`${icon} ${grey(info)} ${message}\n`);
  }
}]));
