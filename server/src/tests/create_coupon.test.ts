import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { couponsTable } from '../db/schema';
import { type CreateCouponInput } from '../schema';
import { createCoupon } from '../handlers/create_coupon';
import { eq } from 'drizzle-orm';

// Test inputs for different coupon types
const percentageCouponInput: CreateCouponInput = {
  code: 'SAVE20',
  discount_type: 'percentage',
  discount_value: 20,
  minimum_amount: 100,
  usage_limit: 50,
  expires_at: new Date('2024-12-31'),
  is_active: true
};

const fixedCouponInput: CreateCouponInput = {
  code: 'FIXED10',
  discount_type: 'fixed',
  discount_value: 10.50,
  minimum_amount: null,
  usage_limit: null,
  expires_at: null,
  is_active: true
};

const minimalCouponInput: CreateCouponInput = {
  code: 'MINIMAL',
  discount_type: 'percentage',
  discount_value: 15
};

describe('createCoupon', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a percentage coupon with all fields', async () => {
    const result = await createCoupon(percentageCouponInput);

    // Basic field validation
    expect(result.code).toEqual('SAVE20');
    expect(result.discount_type).toEqual('percentage');
    expect(result.discount_value).toEqual(20);
    expect(typeof result.discount_value).toBe('number');
    expect(result.minimum_amount).toEqual(100);
    expect(typeof result.minimum_amount).toBe('number');
    expect(result.usage_limit).toEqual(50);
    expect(result.used_count).toEqual(0);
    expect(result.expires_at).toBeInstanceOf(Date);
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a fixed coupon with decimal values', async () => {
    const result = await createCoupon(fixedCouponInput);

    expect(result.code).toEqual('FIXED10');
    expect(result.discount_type).toEqual('fixed');
    expect(result.discount_value).toEqual(10.50);
    expect(typeof result.discount_value).toBe('number');
    expect(result.minimum_amount).toBeNull();
    expect(result.usage_limit).toBeNull();
    expect(result.expires_at).toBeNull();
    expect(result.is_active).toEqual(true);
    expect(result.used_count).toEqual(0);
  });

  it('should create a coupon with minimal fields and apply defaults', async () => {
    const result = await createCoupon(minimalCouponInput);

    expect(result.code).toEqual('MINIMAL');
    expect(result.discount_type).toEqual('percentage');
    expect(result.discount_value).toEqual(15);
    expect(result.minimum_amount).toBeNull();
    expect(result.usage_limit).toBeNull();
    expect(result.expires_at).toBeNull();
    expect(result.is_active).toEqual(true); // Should default to true
    expect(result.used_count).toEqual(0); // Should default to 0
  });

  it('should save coupon to database', async () => {
    const result = await createCoupon(percentageCouponInput);

    // Query using proper drizzle syntax
    const coupons = await db.select()
      .from(couponsTable)
      .where(eq(couponsTable.id, result.id))
      .execute();

    expect(coupons).toHaveLength(1);
    const savedCoupon = coupons[0];
    expect(savedCoupon.code).toEqual('SAVE20');
    expect(savedCoupon.discount_type).toEqual('percentage');
    expect(parseFloat(savedCoupon.discount_value)).toEqual(20);
    expect(parseFloat(savedCoupon.minimum_amount!)).toEqual(100);
    expect(savedCoupon.usage_limit).toEqual(50);
    expect(savedCoupon.used_count).toEqual(0);
    expect(savedCoupon.is_active).toEqual(true);
    expect(savedCoupon.created_at).toBeInstanceOf(Date);
    expect(savedCoupon.updated_at).toBeInstanceOf(Date);
  });

  it('should handle numeric conversion for database storage', async () => {
    const testInput: CreateCouponInput = {
      code: 'NUMERIC',
      discount_type: 'fixed',
      discount_value: 25.75,
      minimum_amount: 99.99
    };

    const result = await createCoupon(testInput);

    // Verify numeric fields are returned as numbers
    expect(typeof result.discount_value).toBe('number');
    expect(result.discount_value).toEqual(25.75);
    expect(typeof result.minimum_amount).toBe('number');
    expect(result.minimum_amount).toEqual(99.99);

    // Verify they're stored correctly in database
    const saved = await db.select()
      .from(couponsTable)
      .where(eq(couponsTable.id, result.id))
      .execute();

    expect(parseFloat(saved[0].discount_value)).toEqual(25.75);
    expect(parseFloat(saved[0].minimum_amount!)).toEqual(99.99);
  });

  it('should reject duplicate coupon codes', async () => {
    // Create first coupon
    await createCoupon(percentageCouponInput);

    // Try to create another coupon with same code
    const duplicateInput: CreateCouponInput = {
      code: 'SAVE20', // Same code
      discount_type: 'fixed',
      discount_value: 10
    };

    // Should throw error due to unique constraint
    expect(async () => {
      await createCoupon(duplicateInput);
    }).toThrow();
  });

  it('should handle null values correctly', async () => {
    const nullValuesInput: CreateCouponInput = {
      code: 'NULLTEST',
      discount_type: 'percentage',
      discount_value: 5,
      minimum_amount: null,
      usage_limit: null,
      expires_at: null,
      is_active: false
    };

    const result = await createCoupon(nullValuesInput);

    expect(result.minimum_amount).toBeNull();
    expect(result.usage_limit).toBeNull();
    expect(result.expires_at).toBeNull();
    expect(result.is_active).toEqual(false);
  });
});