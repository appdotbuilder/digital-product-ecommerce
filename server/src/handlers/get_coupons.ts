import { db } from '../db';
import { couponsTable } from '../db/schema';
import { type Coupon } from '../schema';
import { eq, and, gt, or, isNull, desc } from 'drizzle-orm';

export async function getCoupons(): Promise<Coupon[]> {
  try {
    // Query all coupons ordered by creation date (newest first)
    const result = await db.select()
      .from(couponsTable)
      .orderBy(desc(couponsTable.created_at))
      .execute();

    // Convert numeric fields back to numbers before returning
    return result.map(coupon => ({
      ...coupon,
      discount_value: parseFloat(coupon.discount_value),
      minimum_amount: coupon.minimum_amount ? parseFloat(coupon.minimum_amount) : null
    }));
  } catch (error) {
    console.error('Failed to fetch coupons:', error);
    throw error;
  }
}

export async function validateCoupon(code: string): Promise<Coupon | null> {
  try {
    const now = new Date();
    
    // Query coupon with validation conditions
    const result = await db.select()
      .from(couponsTable)
      .where(
        and(
          eq(couponsTable.code, code),
          eq(couponsTable.is_active, true),
          // Either no expiry date or expiry date is in the future
          or(
            isNull(couponsTable.expires_at),
            gt(couponsTable.expires_at, now)
          )
        )
      )
      .limit(1)
      .execute();

    if (result.length === 0) {
      return null;
    }

    const coupon = result[0];

    // Check usage limit if set
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return null;
    }

    // Convert numeric fields back to numbers before returning
    return {
      ...coupon,
      discount_value: parseFloat(coupon.discount_value),
      minimum_amount: coupon.minimum_amount ? parseFloat(coupon.minimum_amount) : null
    };
  } catch (error) {
    console.error('Failed to validate coupon:', error);
    throw error;
  }
}