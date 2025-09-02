import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, categoriesTable, productsTable, ordersTable, orderItemsTable, reviewsTable } from '../db/schema';
import { type CreateReviewInput } from '../schema';
import { createReview } from '../handlers/create_review';
import { eq, and } from 'drizzle-orm';

// Test data setup helpers
const createTestUser = async () => {
  const result = await db.insert(usersTable)
    .values({
      email: 'test@example.com',
      password_hash: 'hashed_password',
      first_name: 'John',
      last_name: 'Doe',
      phone: null,
      is_admin: false
    })
    .returning()
    .execute();
  return result[0];
};

const createTestCategory = async () => {
  const result = await db.insert(categoriesTable)
    .values({
      name: 'Test Category',
      slug: 'test-category',
      description: null,
      image_url: null,
      is_active: true
    })
    .returning()
    .execute();
  return result[0];
};

const createTestProduct = async (category_id: number) => {
  const result = await db.insert(productsTable)
    .values({
      name: 'Test Product',
      slug: 'test-product',
      description: 'A test product',
      short_description: null,
      price: '29.99',
      discount_price: null,
      category_id,
      image_url: null,
      download_url: null,
      license_key: null,
      is_active: true,
      is_featured: false
    })
    .returning()
    .execute();
  
  return {
    ...result[0],
    price: parseFloat(result[0].price)
  };
};

const createTestOrder = async (user_id: number) => {
  const result = await db.insert(ordersTable)
    .values({
      user_id,
      order_number: 'ORD-12345',
      status: 'completed',
      subtotal: '29.99',
      tax_amount: '2.40',
      discount_amount: '0.00',
      total_amount: '32.39',
      coupon_id: null,
      payment_method: 'credit_card',
      payment_status: 'completed'
    })
    .returning()
    .execute();
  
  return {
    ...result[0],
    subtotal: parseFloat(result[0].subtotal),
    tax_amount: parseFloat(result[0].tax_amount),
    discount_amount: parseFloat(result[0].discount_amount),
    total_amount: parseFloat(result[0].total_amount)
  };
};

const createTestOrderItem = async (order_id: number, product_id: number) => {
  const result = await db.insert(orderItemsTable)
    .values({
      order_id,
      product_id,
      quantity: 1,
      price: '29.99'
    })
    .returning()
    .execute();
  
  return {
    ...result[0],
    price: parseFloat(result[0].price)
  };
};

describe('createReview', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a review when user has purchased the product', async () => {
    // Setup test data
    const user = await createTestUser();
    const category = await createTestCategory();
    const product = await createTestProduct(category.id);
    const order = await createTestOrder(user.id);
    await createTestOrderItem(order.id, product.id);

    const testInput: CreateReviewInput = {
      user_id: user.id,
      product_id: product.id,
      rating: 5,
      comment: 'Great product!'
    };

    const result = await createReview(testInput);

    // Verify review fields
    expect(result.user_id).toEqual(user.id);
    expect(result.product_id).toEqual(product.id);
    expect(result.rating).toEqual(5);
    expect(result.comment).toEqual('Great product!');
    expect(result.is_approved).toEqual(false); // Reviews need approval by default
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a review with null comment', async () => {
    // Setup test data
    const user = await createTestUser();
    const category = await createTestCategory();
    const product = await createTestProduct(category.id);
    const order = await createTestOrder(user.id);
    await createTestOrderItem(order.id, product.id);

    const testInput: CreateReviewInput = {
      user_id: user.id,
      product_id: product.id,
      rating: 4,
      comment: null
    };

    const result = await createReview(testInput);

    expect(result.rating).toEqual(4);
    expect(result.comment).toBeNull();
    expect(result.is_approved).toEqual(false);
  });

  it('should save review to database', async () => {
    // Setup test data
    const user = await createTestUser();
    const category = await createTestCategory();
    const product = await createTestProduct(category.id);
    const order = await createTestOrder(user.id);
    await createTestOrderItem(order.id, product.id);

    const testInput: CreateReviewInput = {
      user_id: user.id,
      product_id: product.id,
      rating: 3,
      comment: 'Average product'
    };

    const result = await createReview(testInput);

    // Verify review was saved to database
    const savedReviews = await db.select()
      .from(reviewsTable)
      .where(eq(reviewsTable.id, result.id))
      .execute();

    expect(savedReviews).toHaveLength(1);
    expect(savedReviews[0].user_id).toEqual(user.id);
    expect(savedReviews[0].product_id).toEqual(product.id);
    expect(savedReviews[0].rating).toEqual(3);
    expect(savedReviews[0].comment).toEqual('Average product');
    expect(savedReviews[0].is_approved).toEqual(false);
  });

  it('should throw error when user does not exist', async () => {
    const category = await createTestCategory();
    const product = await createTestProduct(category.id);

    const testInput: CreateReviewInput = {
      user_id: 999, // Non-existent user
      product_id: product.id,
      rating: 5,
      comment: 'Great product!'
    };

    expect(createReview(testInput)).rejects.toThrow(/user not found/i);
  });

  it('should throw error when product does not exist', async () => {
    const user = await createTestUser();

    const testInput: CreateReviewInput = {
      user_id: user.id,
      product_id: 999, // Non-existent product
      rating: 5,
      comment: 'Great product!'
    };

    expect(createReview(testInput)).rejects.toThrow(/product not found/i);
  });

  it('should throw error when user has not purchased the product', async () => {
    const user = await createTestUser();
    const category = await createTestCategory();
    const product = await createTestProduct(category.id);

    const testInput: CreateReviewInput = {
      user_id: user.id,
      product_id: product.id,
      rating: 5,
      comment: 'Great product!'
    };

    expect(createReview(testInput)).rejects.toThrow(/user has not purchased this product/i);
  });

  it('should throw error when user has already reviewed the product', async () => {
    // Setup test data
    const user = await createTestUser();
    const category = await createTestCategory();
    const product = await createTestProduct(category.id);
    const order = await createTestOrder(user.id);
    await createTestOrderItem(order.id, product.id);

    // Create first review
    const firstInput: CreateReviewInput = {
      user_id: user.id,
      product_id: product.id,
      rating: 4,
      comment: 'First review'
    };

    await createReview(firstInput);

    // Try to create second review
    const secondInput: CreateReviewInput = {
      user_id: user.id,
      product_id: product.id,
      rating: 5,
      comment: 'Second review'
    };

    expect(createReview(secondInput)).rejects.toThrow(/user has already reviewed this product/i);
  });

  it('should allow different users to review the same product', async () => {
    // Setup test data
    const category = await createTestCategory();
    const product = await createTestProduct(category.id);

    // Create two users and their orders
    const user1 = await createTestUser();
    const user2 = await db.insert(usersTable)
      .values({
        email: 'test2@example.com',
        password_hash: 'hashed_password',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: null,
        is_admin: false
      })
      .returning()
      .execute()
      .then(result => result[0]);

    const order1 = await createTestOrder(user1.id);
    const order2 = await db.insert(ordersTable)
      .values({
        user_id: user2.id,
        order_number: 'ORD-67890',
        status: 'completed',
        subtotal: '29.99',
        tax_amount: '2.40',
        discount_amount: '0.00',
        total_amount: '32.39',
        coupon_id: null,
        payment_method: 'credit_card',
        payment_status: 'completed'
      })
      .returning()
      .execute()
      .then(result => result[0]);

    await createTestOrderItem(order1.id, product.id);
    await createTestOrderItem(order2.id, product.id);

    // Create reviews from both users
    const review1Input: CreateReviewInput = {
      user_id: user1.id,
      product_id: product.id,
      rating: 4,
      comment: 'Good product'
    };

    const review2Input: CreateReviewInput = {
      user_id: user2.id,
      product_id: product.id,
      rating: 5,
      comment: 'Excellent product'
    };

    const review1 = await createReview(review1Input);
    const review2 = await createReview(review2Input);

    expect(review1.user_id).toEqual(user1.id);
    expect(review1.rating).toEqual(4);
    expect(review2.user_id).toEqual(user2.id);
    expect(review2.rating).toEqual(5);

    // Verify both reviews exist in database
    const allReviews = await db.select()
      .from(reviewsTable)
      .where(eq(reviewsTable.product_id, product.id))
      .execute();

    expect(allReviews).toHaveLength(2);
  });

  it('should only allow reviews for completed orders', async () => {
    // Setup test data with pending order
    const user = await createTestUser();
    const category = await createTestCategory();
    const product = await createTestProduct(category.id);
    const order = await db.insert(ordersTable)
      .values({
        user_id: user.id,
        order_number: 'ORD-PENDING',
        status: 'pending', // Not completed
        subtotal: '29.99',
        tax_amount: '2.40',
        discount_amount: '0.00',
        total_amount: '32.39',
        coupon_id: null,
        payment_method: 'credit_card',
        payment_status: 'pending'
      })
      .returning()
      .execute()
      .then(result => result[0]);

    await createTestOrderItem(order.id, product.id);

    const testInput: CreateReviewInput = {
      user_id: user.id,
      product_id: product.id,
      rating: 5,
      comment: 'Great product!'
    };

    expect(createReview(testInput)).rejects.toThrow(/user has not purchased this product/i);
  });
});