const supertest = require('supertest');
const serverFactory = require('../index');

let server;

beforeEach(() => {
  server = serverFactory();
});

afterEach(() => {
  server.close();
});

describe('/', () => {
  describe('GET /', () => {
    it('displays "Hello World!"', () => supertest(server)
      .get('/')
      .expect(200, 'Hello World!\n')
    );
  });
});
