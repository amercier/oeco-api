const EventEmitter = require('events');
const { expect } = require('chai');
const { noop } = require('lodash');
const setupMongoose = require('../app/db');

function getMocks() {
  const db = new EventEmitter();
  db.model = noop;

  const mongoose = {
    createConnection() {
      return db;
    },
  };
  return { db, mongoose };
}

describe('setupMongoose', () => {
  it('returns a promise', () => {
    const { mongoose } = getMocks();
    expect(setupMongoose(mongoose))
      .to.have.property('then')
      .that.is.a('function');
  });

  it('resolves the promise when connection emits a "open" event', done => {
    const { db, mongoose } = getMocks();
    setupMongoose(mongoose).then(() => done(), err => done(err || 'Unknown error'));
    db.emit('open');
  });

  it('rejects the promise when connection emits a "error" event', done => {
    const { db, mongoose } = getMocks();

    setupMongoose(mongoose).then(
      () => done('Error: promise should not be resovled'),
      err => {
        expect(err).to.equal('Fake DB connection error');
        done();
      }
    );

    db.emit('error', 'Fake DB connection error');
  });
});
