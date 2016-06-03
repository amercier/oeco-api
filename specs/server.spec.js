const supertest = require('supertest');
const { serve } = require('../index');

describe('/', () => {
  let server;

  beforeEach(() => {
    server = serve();
  });

  afterEach(() => {
    server.close();
  });

  describe('GET /', () => {
    it('displays "Hello World!"', () => supertest(server)
      .get('/')
      .expect(200, 'Hello World!\n')
    );
  });
});
