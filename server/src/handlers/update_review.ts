import { db } from '../db';
import { reviewsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdateReviewInput, type Review } from '../schema';

export async function updateReview(input: UpdateReviewInput): Promise<Review> {
  try {
    // Update the review with new approval status and updated timestamp
    const result = await db.update(reviewsTable)
      .set({
        is_approved: input.is_approved,
        updated_at: new Date()
      })
      .where(eq(reviewsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Review with id ${input.id} not found`);
    }

    // Convert numeric fields back to numbers before returning
    const review = result[0];
    return {
      ...review,
      // No numeric conversions needed for reviews table
      // All fields are already in correct types
    };
  } catch (error) {
    console.error('Review update failed:', error);
    throw error;
  }
}