import { db } from '../db';
import { couponsTable } from '../db/schema';
import { type CreateCouponInput, type Coupon } from '../schema';

export const createCoupon = async (input: CreateCouponInput): Promise<Coupon> => {
  try {
    // Insert coupon record
    const result = await db.insert(couponsTable)
      .values({
        code: input.code,
        discount_type: input.discount_type,
        discount_value: input.discount_value.toString(), // Convert number to string for numeric column
        minimum_amount: input.minimum_amount ? input.minimum_amount.toString() : null,
        usage_limit: input.usage_limit ?? null,
        expires_at: input.expires_at ?? null,
        is_active: input.is_active ?? true
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const coupon = result[0];
    return {
      ...coupon,
      discount_value: parseFloat(coupon.discount_value), // Convert string back to number
      minimum_amount: coupon.minimum_amount ? parseFloat(coupon.minimum_amount) : null
    };
  } catch (error) {
    console.error('Coupon creation failed:', error);
    throw error;
  }
};