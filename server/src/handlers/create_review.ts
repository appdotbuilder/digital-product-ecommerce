import { db } from '../db';
import { reviewsTable, usersTable, productsTable, ordersTable, orderItemsTable } from '../db/schema';
import { type CreateReviewInput, type Review } from '../schema';
import { eq, and, exists } from 'drizzle-orm';

export const createReview = async (input: CreateReviewInput): Promise<Review> => {
  try {
    // Validate that user exists
    const userExists = await db.select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, input.user_id))
      .limit(1)
      .execute();

    if (userExists.length === 0) {
      throw new Error('User not found');
    }

    // Validate that product exists
    const productExists = await db.select({ id: productsTable.id })
      .from(productsTable)
      .where(eq(productsTable.id, input.product_id))
      .limit(1)
      .execute();

    if (productExists.length === 0) {
      throw new Error('Product not found');
    }

    // Validate that user has purchased this product
    const hasPurchased = await db.select({ id: orderItemsTable.id })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(orderItemsTable.order_id, ordersTable.id))
      .where(
        and(
          eq(ordersTable.user_id, input.user_id),
          eq(orderItemsTable.product_id, input.product_id),
          eq(ordersTable.status, 'completed')
        )
      )
      .limit(1)
      .execute();

    if (hasPurchased.length === 0) {
      throw new Error('User has not purchased this product');
    }

    // Check if user has already reviewed this product
    const existingReview = await db.select({ id: reviewsTable.id })
      .from(reviewsTable)
      .where(
        and(
          eq(reviewsTable.user_id, input.user_id),
          eq(reviewsTable.product_id, input.product_id)
        )
      )
      .limit(1)
      .execute();

    if (existingReview.length > 0) {
      throw new Error('User has already reviewed this product');
    }

    // Insert the review
    const result = await db.insert(reviewsTable)
      .values({
        user_id: input.user_id,
        product_id: input.product_id,
        rating: input.rating,
        comment: input.comment || null,
        is_approved: false // Reviews need approval by default
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Review creation failed:', error);
    throw error;
  }
};