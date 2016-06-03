const supertest = require('supertest');
const { db, serve } = require('../index');
const { Category } = require('../app/models');

describe('/categories', () => {
  let server;

  beforeEach(() => {
    server = serve();
    return db;
  });

  afterEach(() => {
    server.close();
  });

  describe('GET /categories', () => {
    const categories = new Array(10)
      .fill(null)
      .map((v, k) => ({ name: `Category ${k + 1}` }));

    beforeEach(() => {
      const queries = categories.map(category => new Category(category).save());
      return Promise.all(queries);
    });

    it('return all categories', () => supertest(server)
      .get('/categories')
      .expect(200, categories)
    );
  });
});
