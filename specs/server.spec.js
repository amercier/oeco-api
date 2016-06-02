const { expect } = require('code');
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
    it('returns 200 OK', () => supertest(server).get('/').expect(200));
    it('returns "Hello World!"', () => supertest(server).get('/').then(res => {
      console.log(`body: ${res.body}`);
      expect(res.body).to.deep.equal('Hello World!');
    }));
  });
});
