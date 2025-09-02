import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, categoriesTable, productsTable, reviewsTable } from '../db/schema';
import { type CreateUserInput, type CreateCategoryInput, type CreateProductInput, type CreateReviewInput } from '../schema';
import { getReviews, getReviewsByProduct, getPendingReviews } from '../handlers/get_reviews';

// Test data setup
const testUser: CreateUserInput = {
  email: 'reviewer@example.com',
  password: 'password123',
  first_name: 'John',
  last_name: 'Reviewer'
};

const testCategory: CreateCategoryInput = {
  name: 'Software',
  slug: 'software'
};

const testProduct: CreateProductInput = {
  name: 'Test Product',
  slug: 'test-product',
  price: 29.99,
  category_id: 1 // Will be set dynamically
};

const testReview: CreateReviewInput = {
  user_id: 1, // Will be set dynamically
  product_id: 1, // Will be set dynamically
  rating: 5,
  comment: 'Great product!'
};

describe('Review Handlers', () => {
  let userId: number;
  let categoryId: number;
  let productId: number;

  beforeEach(async () => {
    await createDB();

    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: testUser.email,
        password_hash: 'hashed_password',
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        is_admin: false
      })
      .returning()
      .execute();
    userId = userResult[0].id;

    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: testCategory.name,
        slug: testCategory.slug,
        is_active: true
      })
      .returning()
      .execute();
    categoryId = categoryResult[0].id;

    // Create test product
    const productResult = await db.insert(productsTable)
      .values({
        name: testProduct.name,
        slug: testProduct.slug,
        price: testProduct.price.toString(),
        category_id: categoryId,
        is_active: true,
        is_featured: false
      })
      .returning()
      .execute();
    productId = productResult[0].id;
  });

  afterEach(resetDB);

  describe('getReviews', () => {
    it('should return empty array when no reviews exist', async () => {
      const result = await getReviews();
      expect(result).toHaveLength(0);
    });

    it('should return all reviews', async () => {
      // Create multiple reviews
      await db.insert(reviewsTable)
        .values([
          {
            user_id: userId,
            product_id: productId,
            rating: 5,
            comment: 'Excellent!',
            is_approved: true
          },
          {
            user_id: userId,
            product_id: productId,
            rating: 3,
            comment: 'Average product',
            is_approved: false
          }
        ])
        .execute();

      const result = await getReviews();

      expect(result).toHaveLength(2);
      expect(result[0].rating).toBe(5);
      expect(result[0].comment).toBe('Excellent!');
      expect(result[0].is_approved).toBe(true);
      expect(result[1].rating).toBe(3);
      expect(result[1].is_approved).toBe(false);
    });

    it('should return reviews with correct data types', async () => {
      await db.insert(reviewsTable)
        .values({
          user_id: userId,
          product_id: productId,
          rating: 4,
          comment: 'Good product',
          is_approved: true
        })
        .execute();

      const result = await getReviews();

      expect(result).toHaveLength(1);
      expect(typeof result[0].id).toBe('number');
      expect(typeof result[0].user_id).toBe('number');
      expect(typeof result[0].product_id).toBe('number');
      expect(typeof result[0].rating).toBe('number');
      expect(typeof result[0].comment).toBe('string');
      expect(typeof result[0].is_approved).toBe('boolean');
      expect(result[0].created_at).toBeInstanceOf(Date);
      expect(result[0].updated_at).toBeInstanceOf(Date);
    });
  });

  describe('getReviewsByProduct', () => {
    it('should return empty array when no reviews exist for product', async () => {
      const result = await getReviewsByProduct(productId);
      expect(result).toHaveLength(0);
    });

    it('should return only approved reviews for specific product', async () => {
      // Create reviews for the product (approved and unapproved)
      await db.insert(reviewsTable)
        .values([
          {
            user_id: userId,
            product_id: productId,
            rating: 5,
            comment: 'Excellent product!',
            is_approved: true
          },
          {
            user_id: userId,
            product_id: productId,
            rating: 2,
            comment: 'Poor quality',
            is_approved: false // Should not be returned
          }
        ])
        .execute();

      const result = await getReviewsByProduct(productId);

      expect(result).toHaveLength(1);
      expect(result[0].rating).toBe(5);
      expect(result[0].comment).toBe('Excellent product!');
      expect(result[0].is_approved).toBe(true);
    });

    it('should return empty array for non-existent product', async () => {
      const result = await getReviewsByProduct(99999);
      expect(result).toHaveLength(0);
    });

    it('should filter reviews by product correctly', async () => {
      // Create second product
      const product2Result = await db.insert(productsTable)
        .values({
          name: 'Product 2',
          slug: 'product-2',
          price: '39.99',
          category_id: categoryId,
          is_active: true,
          is_featured: false
        })
        .returning()
        .execute();
      const product2Id = product2Result[0].id;

      // Create reviews for both products
      await db.insert(reviewsTable)
        .values([
          {
            user_id: userId,
            product_id: productId,
            rating: 5,
            comment: 'Product 1 review',
            is_approved: true
          },
          {
            user_id: userId,
            product_id: product2Id,
            rating: 4,
            comment: 'Product 2 review',
            is_approved: true
          }
        ])
        .execute();

      const product1Reviews = await getReviewsByProduct(productId);
      const product2Reviews = await getReviewsByProduct(product2Id);

      expect(product1Reviews).toHaveLength(1);
      expect(product1Reviews[0].comment).toBe('Product 1 review');
      expect(product1Reviews[0].product_id).toBe(productId);

      expect(product2Reviews).toHaveLength(1);
      expect(product2Reviews[0].comment).toBe('Product 2 review');
      expect(product2Reviews[0].product_id).toBe(product2Id);
    });
  });

  describe('getPendingReviews', () => {
    it('should return empty array when no pending reviews exist', async () => {
      const result = await getPendingReviews();
      expect(result).toHaveLength(0);
    });

    it('should return only unapproved reviews', async () => {
      // Create approved and unapproved reviews
      await db.insert(reviewsTable)
        .values([
          {
            user_id: userId,
            product_id: productId,
            rating: 5,
            comment: 'Approved review',
            is_approved: true // Should not be returned
          },
          {
            user_id: userId,
            product_id: productId,
            rating: 3,
            comment: 'Pending review 1',
            is_approved: false
          },
          {
            user_id: userId,
            product_id: productId,
            rating: 4,
            comment: 'Pending review 2',
            is_approved: false
          }
        ])
        .execute();

      const result = await getPendingReviews();

      expect(result).toHaveLength(2);
      expect(result[0].is_approved).toBe(false);
      expect(result[1].is_approved).toBe(false);
      expect(result.some(r => r.comment === 'Pending review 1')).toBe(true);
      expect(result.some(r => r.comment === 'Pending review 2')).toBe(true);
      expect(result.some(r => r.comment === 'Approved review')).toBe(false);
    });

    it('should return pending reviews with correct structure', async () => {
      await db.insert(reviewsTable)
        .values({
          user_id: userId,
          product_id: productId,
          rating: 3,
          comment: 'Needs approval',
          is_approved: false
        })
        .execute();

      const result = await getPendingReviews();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBeDefined();
      expect(result[0].user_id).toBe(userId);
      expect(result[0].product_id).toBe(productId);
      expect(result[0].rating).toBe(3);
      expect(result[0].comment).toBe('Needs approval');
      expect(result[0].is_approved).toBe(false);
      expect(result[0].created_at).toBeInstanceOf(Date);
      expect(result[0].updated_at).toBeInstanceOf(Date);
    });
  });
});