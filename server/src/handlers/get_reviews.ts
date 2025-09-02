import { db } from '../db';
import { reviewsTable } from '../db/schema';
import { type Review } from '../schema';
import { eq } from 'drizzle-orm';

export async function getReviews(): Promise<Review[]> {
  try {
    const results = await db.select()
      .from(reviewsTable)
      .execute();

    return results.map(review => ({
      ...review,
      rating: review.rating // rating is already an integer, no conversion needed
    }));
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    throw error;
  }
}

export async function getReviewsByProduct(productId: number): Promise<Review[]> {
  try {
    const results = await db.select()
      .from(reviewsTable)
      .where(eq(reviewsTable.product_id, productId))
      .execute();

    // Filter for approved reviews only for public display
    return results
      .filter(review => review.is_approved)
      .map(review => ({
        ...review,
        rating: review.rating // rating is already an integer, no conversion needed
      }));
  } catch (error) {
    console.error('Failed to fetch reviews by product:', error);
    throw error;
  }
}

export async function getPendingReviews(): Promise<Review[]> {
  try {
    const results = await db.select()
      .from(reviewsTable)
      .where(eq(reviewsTable.is_approved, false))
      .execute();

    return results.map(review => ({
      ...review,
      rating: review.rating // rating is already an integer, no conversion needed
    }));
  } catch (error) {
    console.error('Failed to fetch pending reviews:', error);
    throw error;
  }
}