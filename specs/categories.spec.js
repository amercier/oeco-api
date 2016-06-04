const supertest = require('supertest');
const { createContext, removeAll } = require('./helpers');

describe('/categories', () => {
  let Category;
  const context = createContext();

  before(() => {
    Category = context.models.Category;
  });

  beforeEach(() => removeAll(Category));
  afterEach(() => removeAll(Category));

  describe('GET /categories', () => {
    const categories = new Array(9)
      .fill(null)
      .map((v, k) => ({ id: `category-${k + 1}`, name: `Category ${k + 1}` }));

    beforeEach(() => {
      const queries = categories.map(category => new context.models.Category(category).save());
      return Promise.all(queries);
    });

    it('return all categories', () => supertest(context.server)
      .get('/categories')
      .expect(200, categories)
    );
  });
});
