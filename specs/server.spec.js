const supertest = require('supertest');
const { createContext } = require('./helpers');

describe('/', () => {
  const context = createContext();

  describe('GET /', () => {
    it('displays "Hello World!"', () => supertest(context.server)
      .get('/')
      .expect(200, 'Hello World!\n')
    );
  });
});
