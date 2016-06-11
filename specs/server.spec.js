const supertest = require('supertest');
const { setup } = require('./helpers');

describe('/', () => {
  const context = setup();

  describe('GET /', () => {
    it('displays "Hello World!"', () => supertest(context.server)
      .get('/')
      .expect(200, 'Hello World!\n')
    );
  });
});
