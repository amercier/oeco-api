const { promisify } = require('bluebird');
const { partial } = require('lodash');
const supertest = require('supertest');
const { db, serve } = require('../index');
const { Category } = require('../app/models');

const removeAllCategories = promisify(partial(Category.remove.bind(Category), {}));

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
    const categories = new Array(9)
      .fill(null)
      .map((v, k) => ({ id: `category-${k + 1}`, name: `Category ${k + 1}` }));

    beforeEach(() => {
      const queries = categories.map(category => new Category(category).save());
      return Promise.all(queries);
    });

    afterEach(removeAllCategories);

    it('return all categories', () => supertest(server)
      .get('/categories')
      .expect(200, categories)
    );
  });
});
