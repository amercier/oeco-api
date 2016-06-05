const { expect } = require('chai');
const { defaults, omit } = require('lodash');
const supertest = require('supertest-as-promised');
const { setup, removeAll } = require('./helpers');

describe('/categories', () => {
  let Category;
  const context = setup();

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
      const queries = categories.map(category => new Category(category).save());
      return Promise.all(queries);
    });

    it('return all categories', () => supertest(context.server)
      .get('/categories')
      .expect(200, categories)
    );
  });

  describe('POST /categories', () => {
    const category = { id: 'test-category', name: 'Test Category' };

    it('creates a new category', () => supertest(context.server)
      .post('/categories')
      .send(category)
      .then(() => Category.findOne({ id: category.id }))
      .then(result => expect(result).to.deep.include(category))
    );

    it('returns the created category', () => supertest(context.server)
      .post('/categories')
      .send(category)
      .expect(201, category)
    );

    // Required fields
    ['id', 'name'].forEach(key => {
      it(`returns 404 Bad Request if ${key} is missing`, () => supertest(context.server)
        .post('/categories')
        .send(omit(category, [key]))
        .expect(400, { error: `missing_${key}` })
      );

      it(`returns 404 Bad Request if ${key} is empty`, () => supertest(context.server)
        .post('/categories')
        .send(defaults({ [key]: '' }, category))
        .expect(400, { error: `missing_${key}` })
      );
    });

    // Unique fields
    describe('when a resource already exists', () => {
      const existingCategory = { id: 'existing-category', name: 'Existing Category' };
      beforeEach(() => new Category(existingCategory).save());

      ['id', 'name'].forEach(key => {
        it(`returns 409 Conflict if ${key} already exists`, () => supertest(context.server)
          .post('/categories')
          .send(defaults({ [key]: existingCategory[key] }, category))
          .expect(409, { error: `existing_${key}` })
        );
      });
    });
  });

  describe('DELETE /categories/:id', () => {
    const category = { id: 'existing-category', name: 'Existing Category' };
    beforeEach(() => new Category(category).save());

    it('deletes the category', () => supertest(context.server)
      .delete(`/categories/${category.id}`)
      .then(() => Category.findOne({ id: category.id }))
      .then(result => expect(result).to.be.null)
    );

    it('returns 204 No Content', () => supertest(context.server)
      .delete(`/categories/${category.id}`)
      .expect(204, '')
    );

    it('returns 404 Not Found if the category doesn\'t exist', () => supertest(context.server)
      .delete('/categories/unexisting-category')
      .expect(404, '')
    );
  });
});
