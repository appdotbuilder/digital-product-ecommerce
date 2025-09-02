import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, categoriesTable, productsTable, reviewsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdateReviewInput } from '../schema';
import { updateReview } from '../handlers/update_review';

describe('updateReview', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update review approval status', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'user@example.com',
        password_hash: 'hashedpassword',
        first_name: 'John',
        last_name: 'Doe'
      })
      .returning()
      .execute();

    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category'
      })
      .returning()
      .execute();

    // Create test product
    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        slug: 'test-product',
        price: '29.99',
        category_id: categoryResult[0].id
      })
      .returning()
      .execute();

    // Create test review (initially not approved)
    const reviewResult = await db.insert(reviewsTable)
      .values({
        user_id: userResult[0].id,
        product_id: productResult[0].id,
        rating: 5,
        comment: 'Great product!',
        is_approved: false
      })
      .returning()
      .execute();

    const testInput: UpdateReviewInput = {
      id: reviewResult[0].id,
      is_approved: true
    };

    const result = await updateReview(testInput);

    // Verify the result
    expect(result.id).toEqual(reviewResult[0].id);
    expect(result.is_approved).toBe(true);
    expect(result.user_id).toEqual(userResult[0].id);
    expect(result.product_id).toEqual(productResult[0].id);
    expect(result.rating).toEqual(5);
    expect(result.comment).toEqual('Great product!');
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated review to database', async () => {
    // Create prerequisite data
    const userResult = await db.insert(usersTable)
      .values({
        email: 'user@example.com',
        password_hash: 'hashedpassword',
        first_name: 'John',
        last_name: 'Doe'
      })
      .returning()
      .execute();

    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category'
      })
      .returning()
      .execute();

    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        slug: 'test-product',
        price: '29.99',
        category_id: categoryResult[0].id
      })
      .returning()
      .execute();

    const reviewResult = await db.insert(reviewsTable)
      .values({
        user_id: userResult[0].id,
        product_id: productResult[0].id,
        rating: 4,
        comment: 'Good product',
        is_approved: false
      })
      .returning()
      .execute();

    const testInput: UpdateReviewInput = {
      id: reviewResult[0].id,
      is_approved: true
    };

    await updateReview(testInput);

    // Query the database to verify the update
    const updatedReviews = await db.select()
      .from(reviewsTable)
      .where(eq(reviewsTable.id, reviewResult[0].id))
      .execute();

    expect(updatedReviews).toHaveLength(1);
    expect(updatedReviews[0].is_approved).toBe(true);
    expect(updatedReviews[0].rating).toEqual(4);
    expect(updatedReviews[0].comment).toEqual('Good product');
    expect(updatedReviews[0].updated_at).toBeInstanceOf(Date);
    
    // Verify updated_at changed
    expect(updatedReviews[0].updated_at.getTime()).toBeGreaterThan(
      updatedReviews[0].created_at.getTime()
    );
  });

  it('should handle disapproving a review', async () => {
    // Create prerequisite data
    const userResult = await db.insert(usersTable)
      .values({
        email: 'user@example.com',
        password_hash: 'hashedpassword',
        first_name: 'John',
        last_name: 'Doe'
      })
      .returning()
      .execute();

    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category'
      })
      .returning()
      .execute();

    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        slug: 'test-product',
        price: '29.99',
        category_id: categoryResult[0].id
      })
      .returning()
      .execute();

    // Create approved review
    const reviewResult = await db.insert(reviewsTable)
      .values({
        user_id: userResult[0].id,
        product_id: productResult[0].id,
        rating: 2,
        comment: 'Not great',
        is_approved: true
      })
      .returning()
      .execute();

    const testInput: UpdateReviewInput = {
      id: reviewResult[0].id,
      is_approved: false
    };

    const result = await updateReview(testInput);

    expect(result.is_approved).toBe(false);
    expect(result.rating).toEqual(2);
    expect(result.comment).toEqual('Not great');
  });

  it('should handle review without comment', async () => {
    // Create prerequisite data
    const userResult = await db.insert(usersTable)
      .values({
        email: 'user@example.com',
        password_hash: 'hashedpassword',
        first_name: 'John',
        last_name: 'Doe'
      })
      .returning()
      .execute();

    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category'
      })
      .returning()
      .execute();

    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        slug: 'test-product',
        price: '29.99',
        category_id: categoryResult[0].id
      })
      .returning()
      .execute();

    // Create review without comment
    const reviewResult = await db.insert(reviewsTable)
      .values({
        user_id: userResult[0].id,
        product_id: productResult[0].id,
        rating: 3,
        comment: null,
        is_approved: false
      })
      .returning()
      .execute();

    const testInput: UpdateReviewInput = {
      id: reviewResult[0].id,
      is_approved: true
    };

    const result = await updateReview(testInput);

    expect(result.is_approved).toBe(true);
    expect(result.rating).toEqual(3);
    expect(result.comment).toBeNull();
  });

  it('should throw error for non-existent review', async () => {
    const testInput: UpdateReviewInput = {
      id: 99999,
      is_approved: true
    };

    await expect(updateReview(testInput))
      .rejects
      .toThrow(/Review with id 99999 not found/i);
  });
});